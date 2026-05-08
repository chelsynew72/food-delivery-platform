import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
  RestaurantQueryDto,
} from './dto/restaurant.dto';
import { PaginationDto, paginate, PaginatedResult } from '../common/dto/pagination.dto';
import { RestaurantStatus, UserRole } from '../common/enums';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
  ) {}

  async create(owner: User, dto: CreateRestaurantDto): Promise<Restaurant> {
    const restaurant = this.restaurantRepo.create({
      ...dto,
      ownerId: owner.id,
      status: RestaurantStatus.PENDING_APPROVAL,
    });
    return this.restaurantRepo.save(restaurant);
  }

  async findAll(
    query: RestaurantQueryDto,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Restaurant>> {
    const where: FindOptionsWhere<Restaurant> = {
      status: RestaurantStatus.ACTIVE,
    };

    if (query.city) where.city = ILike(`%${query.city}%`) as unknown as string;
    if (query.cuisineType) where.cuisineType = query.cuisineType;
    if (query.isOpen !== undefined) where.isOpen = query.isOpen;

    const [items, total] = await this.restaurantRepo.findAndCount({
      where,
      order: { rating: 'DESC', createdAt: 'DESC' },
      skip: pagination.skip,
      take: pagination.limit,
      relations: ['owner'],
    });

    return paginate(items, total, pagination);
  }

  async findOne(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    return restaurant;
  }

  async findByOwner(ownerId: string): Promise<Restaurant[]> {
    return this.restaurantRepo.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    user: User,
    dto: UpdateRestaurantDto,
  ): Promise<Restaurant> {
    const restaurant = await this.findOne(id);
    this.assertOwnerOrAdmin(restaurant, user);
    Object.assign(restaurant, dto);
    return this.restaurantRepo.save(restaurant);
  }

  async remove(id: string, user: User): Promise<void> {
    const restaurant = await this.findOne(id);
    this.assertOwnerOrAdmin(restaurant, user);
    await this.restaurantRepo.remove(restaurant);
  }

  async updateRating(restaurantId: string, newRating: number): Promise<void> {
    const restaurant = await this.findOne(restaurantId);
    const total = restaurant.totalRatings + 1;
    const avg =
      (restaurant.rating * restaurant.totalRatings + newRating) / total;
    await this.restaurantRepo.update(restaurantId, {
      rating: Math.round(avg * 100) / 100,
      totalRatings: total,
    });
  }

  private assertOwnerOrAdmin(restaurant: Restaurant, user: User): void {
    if (user.role === UserRole.ADMIN) return;
    if (restaurant.ownerId !== user.id) throw new ForbiddenException();
  }
}
