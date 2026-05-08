import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { AbstractEntity } from '../../common/entities/abstract.entity';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Driver } from '../../drivers/entities/driver.entity';

@Entity('order_items')
export class OrderItem extends AbstractEntity {
  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ name: 'menu_item_id' })
  menuItemId: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ nullable: true, type: 'text' })
  notes?: string;
}

@Entity('orders')
export class Order extends AbstractEntity {
  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ name: 'restaurant_id' })
  restaurantId: string;

  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @Column({ name: 'driver_id', nullable: true })
  driverId?: string;

  @ManyToOne(() => Driver, { nullable: true })
  @JoinColumn({ name: 'driver_id' })
  driver?: Driver;

  @OneToMany(() => OrderItem, (item) => item.orderId, { cascade: true })
  items: OrderItem[];

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ name: 'delivery_street' })
  deliveryStreet: string;

  @Column({ name: 'delivery_city' })
  deliveryCity: string;

  @Column({ name: 'delivery_state' })
  deliveryState: string;

  @Column({ name: 'delivery_zip' })
  deliveryZip: string;

  @Column({ name: 'delivery_lat', type: 'decimal', precision: 10, scale: 8, nullable: true })
  deliveryLat?: number;

  @Column({ name: 'delivery_lng', type: 'decimal', precision: 11, scale: 8, nullable: true })
  deliveryLng?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ name: 'delivery_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  deliveryFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  paymentMethod: PaymentMethod;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({ name: 'special_instructions', nullable: true, type: 'text' })
  specialInstructions?: string;

  @Column({ name: 'estimated_delivery_time', nullable: true })
  estimatedDeliveryTime?: Date;

  @Column({ name: 'delivered_at', nullable: true })
  deliveredAt?: Date;

  @Column({ name: 'cancelled_at', nullable: true })
  cancelledAt?: Date;

  @Column({ name: 'cancellation_reason', nullable: true, type: 'text' })
  cancellationReason?: string;
}
