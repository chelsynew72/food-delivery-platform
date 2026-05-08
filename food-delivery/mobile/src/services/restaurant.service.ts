import { api } from './api.service';
import type { Restaurant, MenuItem, MenuCategory, PaginatedResult } from '../types';

interface RestaurantQuery {
  city?: string;
  cuisineType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const restaurantService = {
  async getAll(query: RestaurantQuery = {}): Promise<PaginatedResult<Restaurant>> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined) params.append(k, String(v));
    });
    return api.get<PaginatedResult<Restaurant>>(`/restaurants?${params.toString()}`);
  },

  async getById(id: string): Promise<Restaurant> {
    return api.get<Restaurant>(`/restaurants/${id}`);
  },

  async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
    return api.get<MenuItem[]>(`/restaurants/${restaurantId}/items`);
  },

  async getCategories(restaurantId: string): Promise<MenuCategory[]> {
    return api.get<MenuCategory[]>(`/restaurants/${restaurantId}/categories`);
  },

  async getFeaturedItems(restaurantId: string): Promise<MenuItem[]> {
    return api.get<MenuItem[]>(`/restaurants/${restaurantId}/items/featured`);
  },
};
