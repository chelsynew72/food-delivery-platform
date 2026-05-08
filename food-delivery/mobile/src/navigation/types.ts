import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// ─── Auth Stack ───────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export type MainTabParamList = {
  HomeTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

// ─── Home Stack ───────────────────────────────────────────────────────────────

export type HomeStackParamList = {
  Home: undefined;
  RestaurantDetail: { restaurantId: string };
  Cart: undefined;
  Checkout: undefined;
  OrderConfirmation: { orderId: string };
};

// ─── Orders Stack ─────────────────────────────────────────────────────────────

export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetail: { orderId: string };
};

// ─── Profile Stack ────────────────────────────────────────────────────────────

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Addresses: undefined;
};

// ─── Screen Props ─────────────────────────────────────────────────────────────

export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export type HomeScreenProps = NativeStackScreenProps<HomeStackParamList, 'Home'>;
export type RestaurantDetailScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'RestaurantDetail'
>;
export type CartScreenProps = NativeStackScreenProps<HomeStackParamList, 'Cart'>;
export type CheckoutScreenProps = NativeStackScreenProps<HomeStackParamList, 'Checkout'>;
export type OrderConfirmationScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'OrderConfirmation'
>;

export type OrdersListScreenProps = NativeStackScreenProps<OrdersStackParamList, 'OrdersList'>;
export type OrderDetailScreenProps = NativeStackScreenProps<OrdersStackParamList, 'OrderDetail'>;

export type ProfileScreenProps = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;
