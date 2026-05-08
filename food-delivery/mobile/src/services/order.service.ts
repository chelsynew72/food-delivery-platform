import { api } from './api.service';
import type { Order, PaginatedResult, PaymentMethod } from '../types';

interface CreateOrderPayload {
  restaurantId: string;
  items: Array<{ menuItemId: string; quantity: number; notes?: string }>;
  deliveryStreet: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZip: string;
  paymentMethod?: PaymentMethod;
  specialInstructions?: string;
}

export const orderService = {
  async create(payload: CreateOrderPayload): Promise<Order> {
    return api.post<Order>('/orders', payload);
  },

  async getMyOrders(page = 1, limit = 10): Promise<PaginatedResult<Order>> {
    return api.get<PaginatedResult<Order>>(`/orders/my?page=${page}&limit=${limit}`);
  },

  async getById(id: string): Promise<Order> {
    return api.get<Order>(`/orders/${id}`);
  },

  async cancel(id: string, reason?: string): Promise<Order> {
    return api.patch<Order>(`/orders/${id}/status`, {
      status: 'cancelled',
      cancellationReason: reason,
    });
  },
};
