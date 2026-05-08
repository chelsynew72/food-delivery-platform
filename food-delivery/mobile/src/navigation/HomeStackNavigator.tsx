import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HomeStackParamList, OrdersStackParamList, ProfileStackParamList } from './types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { RestaurantDetailScreen } from '../screens/restaurant/RestaurantDetailScreen';
import { CartScreen } from '../screens/cart/CartScreen';
import { CheckoutScreen } from '../screens/cart/CheckoutScreen';
import { OrderConfirmationScreen } from '../screens/orders/OrderConfirmationScreen';
import { OrdersListScreen } from '../screens/orders/OrdersListScreen';
import { OrderDetailScreen } from '../screens/orders/OrderDetailScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { Colors } from '../theme';

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const OrdersStack = createNativeStackNavigator<OrdersStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const sharedHeaderOptions = {
  headerStyle: { backgroundColor: Colors.surface },
  headerTintColor: Colors.text,
  headerTitleStyle: { fontWeight: '600' as const },
};

export function HomeStackNavigator(): React.JSX.Element {
  return (
    <HomeStack.Navigator screenOptions={sharedHeaderOptions}>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen
        name="RestaurantDetail"
        component={RestaurantDetailScreen}
        options={{ title: 'Restaurant' }}
      />
      <HomeStack.Screen name="Cart" component={CartScreen} options={{ title: 'My Cart' }} />
      <HomeStack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
      <HomeStack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
        options={{ title: 'Order Confirmed', headerLeft: () => null }}
      />
    </HomeStack.Navigator>
  );
}

export function OrdersStackNavigator(): React.JSX.Element {
  return (
    <OrdersStack.Navigator screenOptions={sharedHeaderOptions}>
      <OrdersStack.Screen
        name="OrdersList"
        component={OrdersListScreen}
        options={{ title: 'My Orders' }}
      />
      <OrdersStack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Order Details' }}
      />
    </OrdersStack.Navigator>
  );
}

export function ProfileStackNavigator(): React.JSX.Element {
  return (
    <ProfileStack.Navigator screenOptions={sharedHeaderOptions}>
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'My Profile' }}
      />
    </ProfileStack.Navigator>
  );
}
