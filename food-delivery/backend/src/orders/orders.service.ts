import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderItem } from './entities/order.entity';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { MenuService } from '../menu/menu.service';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { PaginationDto, paginate, PaginatedResult } from '../common/dto/pagination.dto';
import { OrderStatus, UserRole, RestaurantStatus } from '../common/enums';
import { User } from '../users/entities/user.entity';
import { OrdersGateway } from './orders.gateway';

const TAX_RATE = 0.08; // 8%

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly itemRepo: Repository<OrderItem>,
    private readonly menuService: MenuService,
    private readonly restaurantsService: RestaurantsService,
    private readonly gateway: OrdersGateway,
  ) {}

  async create(customer: User, dto: CreateOrderDto): Promise<Order> {
    const restaurant = await this.restaurantsService.findOne(dto.restaurantId);

    if (restaurant.status !== RestaurantStatus.ACTIVE || !restaurant.isOpen) {
      throw new BadRequestException('Restaurant is not accepting orders');
    }

    // Build order items and compute totals
    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const line of dto.items) {
      const menuItem = await this.menuService.getItemById(line.menuItemId);

      if (menuItem.restaurantId !== dto.restaurantId) {
        throw new BadRequestException(
          `Item ${menuItem.name} does not belong to this restaurant`,
        );
      }

      if (!menuItem.isAvailable) {
        throw new BadRequestException(`Item ${menuItem.name} is unavailable`);
      }

      const lineSubtotal = Number(menuItem.price) * line.quantity;
      subtotal += lineSubtotal;

      const item = this.itemRepo.create({
        menuItemId: line.menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: line.quantity,
        subtotal: lineSubtotal,
        notes: line.notes,
      });
      orderItems.push(item);
    }

    if (subtotal < Number(restaurant.minOrderAmount)) {
      throw new BadRequestException(
        `Minimum order amount is $${restaurant.minOrderAmount}`,
      );
    }

    const deliveryFee = Number(restaurant.deliveryFee);
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = subtotal + deliveryFee + tax;

    const estimatedDeliveryTime = new Date(
      Date.now() + restaurant.estimatedDeliveryTime * 60 * 1000,
    );

    const order = this.orderRepo.create({
      customerId: customer.id,
      restaurantId: dto.restaurantId,
      items: orderItems,
      status: OrderStatus.PENDING,
      deliveryStreet: dto.deliveryStreet,
      deliveryCity: dto.deliveryCity,
      deliveryState: dto.deliveryState,
      deliveryZip: dto.deliveryZip,
      deliveryLat: dto.deliveryLat,
      deliveryLng: dto.deliveryLng,
      paymentMethod: dto.paymentMethod,
      specialInstructions: dto.specialInstructions,
      subtotal,
      deliveryFee,
      tax,
      total,
      estimatedDeliveryTime,
    });

    const saved = await this.orderRepo.save(order);

    // Notify restaurant via WebSocket
    this.gateway.notifyNewOrder(dto.restaurantId, saved);

    return saved;
  }

  async findByCustomer(
    customerId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Order>> {
    const [items, total] = await this.orderRepo.findAndCount({
      where: { customerId },
      relations: ['restaurant', 'items', 'driver', 'driver.user'],
      order: { createdAt: 'DESC' },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return paginate(items, total, pagination);
  }

  async findByRestaurant(
    restaurantId: string,
    user: User,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Order>> {
    const restaurant = await this.restaurantsService.findOne(restaurantId);
    if (user.role !== UserRole.ADMIN && restaurant.ownerId !== user.id) {
      throw new ForbiddenException();
    }

    const [items, total] = await this.orderRepo.findAndCount({
      where: { restaurantId },
      relations: ['customer', 'items', 'driver', 'driver.user'],
      order: { createdAt: 'DESC' },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return paginate(items, total, pagination);
  }

  async findOne(id: string, user: User): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['customer', 'restaurant', 'items', 'driver', 'driver.user'],
    });
    if (!order) throw new NotFoundException('Order not found');
    this.assertCanView(order, user);
    return order;
  }

  async updateStatus(
    id: string,
    user: User,
    dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['restaurant'],
    });
    if (!order) throw new NotFoundException('Order not found');

    const newStatus = dto.status as OrderStatus;
    this.validateStatusTransition(order.status, newStatus, user);

    order.status = newStatus;

    if (newStatus === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    }
    if (newStatus === OrderStatus.CANCELLED) {
      order.cancelledAt = new Date();
      order.cancellationReason = dto.cancellationReason;
    }

    const saved = await this.orderRepo.save(order);

    // Real-time update to customer
    this.gateway.notifyOrderUpdate(order.customerId, saved);

    return saved;
  }

  async assignDriver(orderId: string, driverId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    order.driverId = driverId;
    order.status = OrderStatus.OUT_FOR_DELIVERY;
    const saved = await this.orderRepo.save(order);

    this.gateway.notifyOrderUpdate(order.customerId, saved);
    return saved;
  }

  private assertCanView(order: Order, user: User): void {
    if (user.role === UserRole.ADMIN) return;
    if (order.customerId === user.id) return;
    throw new ForbiddenException();
  }

  private validateStatusTransition(
    current: OrderStatus,
    next: OrderStatus,
    user: User,
  ): void {
    const allowed: Record<string, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY_FOR_PICKUP],
      [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.OUT_FOR_DELIVERY],
      [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!allowed[current]?.includes(next)) {
      throw new BadRequestException(
        `Cannot transition from ${current} to ${next}`,
      );
    }

    // Customers can only cancel
    if (user.role === UserRole.CUSTOMER && next !== OrderStatus.CANCELLED) {
      throw new ForbiddenException('Customers can only cancel orders');
    }
  }
}
