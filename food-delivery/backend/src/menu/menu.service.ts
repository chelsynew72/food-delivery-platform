import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuCategory, MenuItem } from './entities/menu.entity';
import {
  CreateMenuCategoryDto,
  UpdateMenuCategoryDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
} from './dto/menu.dto';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuCategory)
    private readonly categoryRepo: Repository<MenuCategory>,
    @InjectRepository(MenuItem)
    private readonly itemRepo: Repository<MenuItem>,
    private readonly restaurantsService: RestaurantsService,
  ) {}

  // ─── Categories ───────────────────────────────────────────────────────────

  async createCategory(
    restaurantId: string,
    user: User,
    dto: CreateMenuCategoryDto,
  ): Promise<MenuCategory> {
    await this.assertRestaurantOwner(restaurantId, user);
    const category = this.categoryRepo.create({ ...dto, restaurantId });
    return this.categoryRepo.save(category);
  }

  async getCategories(restaurantId: string): Promise<MenuCategory[]> {
    return this.categoryRepo.find({
      where: { restaurantId, isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async updateCategory(
    id: string,
    restaurantId: string,
    user: User,
    dto: UpdateMenuCategoryDto,
  ): Promise<MenuCategory> {
    await this.assertRestaurantOwner(restaurantId, user);
    const category = await this.categoryRepo.findOne({
      where: { id, restaurantId },
    });
    if (!category) throw new NotFoundException('Category not found');
    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async deleteCategory(
    id: string,
    restaurantId: string,
    user: User,
  ): Promise<void> {
    await this.assertRestaurantOwner(restaurantId, user);
    const category = await this.categoryRepo.findOne({
      where: { id, restaurantId },
    });
    if (!category) throw new NotFoundException('Category not found');
    await this.categoryRepo.remove(category);
  }

  // ─── Items ─────────────────────────────────────────────────────────────────

  async createItem(
    restaurantId: string,
    user: User,
    dto: CreateMenuItemDto,
  ): Promise<MenuItem> {
    await this.assertRestaurantOwner(restaurantId, user);
    const item = this.itemRepo.create({ ...dto, restaurantId });
    return this.itemRepo.save(item);
  }

  async getItems(restaurantId: string): Promise<MenuItem[]> {
    return this.itemRepo.find({
      where: { restaurantId },
      relations: ['category'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async getItemById(id: string): Promise<MenuItem> {
    const item = await this.itemRepo.findOne({
      where: { id },
      relations: ['category', 'restaurant'],
    });
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }

  async getFeaturedItems(restaurantId: string): Promise<MenuItem[]> {
    return this.itemRepo.find({
      where: { restaurantId, isFeatured: true, isAvailable: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async updateItem(
    id: string,
    restaurantId: string,
    user: User,
    dto: UpdateMenuItemDto,
  ): Promise<MenuItem> {
    await this.assertRestaurantOwner(restaurantId, user);
    const item = await this.itemRepo.findOne({ where: { id, restaurantId } });
    if (!item) throw new NotFoundException('Menu item not found');
    Object.assign(item, dto);
    return this.itemRepo.save(item);
  }

  async deleteItem(
    id: string,
    restaurantId: string,
    user: User,
  ): Promise<void> {
    await this.assertRestaurantOwner(restaurantId, user);
    const item = await this.itemRepo.findOne({ where: { id, restaurantId } });
    if (!item) throw new NotFoundException('Menu item not found');
    await this.itemRepo.remove(item);
  }

  private async assertRestaurantOwner(
    restaurantId: string,
    user: User,
  ): Promise<void> {
    if (user.role === UserRole.ADMIN) return;
    const restaurant = await this.restaurantsService.findOne(restaurantId);
    if (restaurant.ownerId !== user.id) throw new ForbiddenException();
  }
}
