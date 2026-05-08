import { Column, Entity, OneToOne, JoinColumn } from 'typeorm';
import { AbstractEntity } from '../../common/entities/abstract.entity';
import { DriverStatus } from '../../common/enums';
import { User } from '../../users/entities/user.entity';

@Entity('drivers')
export class Driver extends AbstractEntity {
  @Column({ name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'license_number', nullable: true })
  licenseNumber?: string;

  @Column({ name: 'vehicle_type', nullable: true })
  vehicleType?: string;

  @Column({ name: 'vehicle_plate', nullable: true })
  vehiclePlate?: string;

  @Column({
    type: 'enum',
    enum: DriverStatus,
    default: DriverStatus.OFFLINE,
  })
  status: DriverStatus;

  @Column({ name: 'current_lat', type: 'decimal', precision: 10, scale: 8, nullable: true })
  currentLat?: number;

  @Column({ name: 'current_lng', type: 'decimal', precision: 11, scale: 8, nullable: true })
  currentLng?: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ name: 'total_deliveries', default: 0 })
  totalDeliveries: number;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;
}
