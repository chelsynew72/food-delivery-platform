// ─── Enums ────────────────────────────────────────────────────────────────────

export enum UserRole {
  CUSTOMER = 'customer',
  RESTAURANT_OWNER = 'restaurant_owner',
  DRIVER = 'driver',
  ADMIN = 'admin',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum DriverStatus {
  OFFLINE = 'offline',
  AVAILABLE = 'available',
  ON_DELIVERY = 'on_delivery',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  WALLET = 'wallet',
}

// ─── Models ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  cuisineType?: string;
  logoUrl?: string;
  bannerUrl?: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  rating: number;
  totalRatings: number;
  minOrderAmount: number;
  deliveryFee: number;
  estimatedDeliveryTime: number;
  isOpen: boolean;
  status: string;
  createdAt: string;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId?: string;
  category?: MenuCategory;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  preparationTime: number;
  calories?: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  notes?: string;
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  restaurant: Restaurant;
  driverId?: string;
  driver?: Driver;
  items: OrderItem[];
  status: OrderStatus;
  deliveryStreet: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZip: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  specialInstructions?: string;
  estimatedDeliveryTime?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  createdAt: string;
}

export interface Driver {
  id: string;
  userId: string;
  user: User;
  licenseNumber?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  status: DriverStatus;
  currentLat?: number;
  currentLng?: number;
  rating: number;
  totalDeliveries: number;
  isVerified: boolean;
}

// ─── API shapes ───────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
