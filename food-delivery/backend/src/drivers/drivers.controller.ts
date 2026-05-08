import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import {
  CreateDriverProfileDto,
  UpdateDriverProfileDto,
  UpdateDriverStatusDto,
  UpdateDriverLocationDto,
} from './dto/driver.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser, Roles } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums';

@ApiTags('Drivers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post('profile')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DRIVER)
  @ApiOperation({ summary: 'Create driver profile' })
  createProfile(@CurrentUser() user: User, @Body() dto: CreateDriverProfileDto) {
    return this.driversService.createProfile(user.id, dto);
  }

  @Get('profile')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DRIVER)
  @ApiOperation({ summary: 'Get my driver profile' })
  getProfile(@CurrentUser() user: User) {
    return this.driversService.findByUserId(user.id);
  }

  @Patch('profile')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DRIVER)
  @ApiOperation({ summary: 'Update driver profile' })
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateDriverProfileDto) {
    return this.driversService.updateProfile(user.id, dto);
  }

  @Patch('status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DRIVER)
  @ApiOperation({ summary: 'Update driver availability status' })
  updateStatus(@CurrentUser() user: User, @Body() dto: UpdateDriverStatusDto) {
    return this.driversService.updateStatus(user.id, dto);
  }

  @Patch('location')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DRIVER)
  @ApiOperation({ summary: 'Update driver GPS location' })
  updateLocation(
    @CurrentUser() user: User,
    @Body() dto: UpdateDriverLocationDto,
  ) {
    return this.driversService.updateLocation(user.id, dto);
  }

  @Get('available')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Get available drivers' })
  getAvailable() {
    return this.driversService.findAvailable();
  }

  @Patch(':id/verify')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Verify a driver (admin only)' })
  verify(@Param('id', ParseUUIDPipe) id: string) {
    return this.driversService.verify(id);
  }
}
