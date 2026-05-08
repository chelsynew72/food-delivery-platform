import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';
import {
  CreateDriverProfileDto,
  UpdateDriverProfileDto,
  UpdateDriverStatusDto,
  UpdateDriverLocationDto,
} from './dto/driver.dto';
import { DriverStatus } from '../common/enums';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepo: Repository<Driver>,
  ) {}

  async createProfile(
    userId: string,
    dto: CreateDriverProfileDto,
  ): Promise<Driver> {
    const existing = await this.driverRepo.findOne({ where: { userId } });
    if (existing) throw new ConflictException('Driver profile already exists');

    const driver = this.driverRepo.create({ ...dto, userId });
    return this.driverRepo.save(driver);
  }

  async findByUserId(userId: string): Promise<Driver> {
    const driver = await this.driverRepo.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!driver) throw new NotFoundException('Driver profile not found');
    return driver;
  }

  async findById(id: string): Promise<Driver> {
    const driver = await this.driverRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!driver) throw new NotFoundException('Driver not found');
    return driver;
  }

  async findAvailable(): Promise<Driver[]> {
    return this.driverRepo.find({
      where: { status: DriverStatus.AVAILABLE, isVerified: true },
      relations: ['user'],
    });
  }

  async updateProfile(
    userId: string,
    dto: UpdateDriverProfileDto,
  ): Promise<Driver> {
    const driver = await this.findByUserId(userId);
    Object.assign(driver, dto);
    return this.driverRepo.save(driver);
  }

  async updateStatus(
    userId: string,
    dto: UpdateDriverStatusDto,
  ): Promise<Driver> {
    const driver = await this.findByUserId(userId);
    driver.status = dto.status;
    return this.driverRepo.save(driver);
  }

  async updateLocation(
    userId: string,
    dto: UpdateDriverLocationDto,
  ): Promise<Driver> {
    const driver = await this.findByUserId(userId);
    driver.currentLat = dto.lat;
    driver.currentLng = dto.lng;
    return this.driverRepo.save(driver);
  }

  async verify(driverId: string): Promise<Driver> {
    const driver = await this.findById(driverId);
    driver.isVerified = true;
    return this.driverRepo.save(driver);
  }

  async incrementDeliveries(driverId: string): Promise<void> {
    await this.driverRepo.increment({ id: driverId }, 'totalDeliveries', 1);
  }
}
