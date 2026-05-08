import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import type { MainTabParamList } from './types';
import { HomeStackNavigator } from './HomeStackNavigator';
import { OrdersStackNavigator } from './HomeStackNavigator';
import { ProfileStackNavigator } from './HomeStackNavigator';
import { useCartStore } from '../stores/cart.store';
import { Colors, FontSize } from '../theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }): React.JSX.Element {
  const icons: Record<string, string> = {
    HomeTab: '🏠',
    OrdersTab: '📦',
    ProfileTab: '👤',
  };
  return (
    <Text style={{ fontSize: FontSize.lg, opacity: focused ? 1 : 0.5 }}>
      {icons[label] ?? '●'}
    </Text>
  );
}

export function MainNavigator(): React.JSX.Element {
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          paddingBottom: 8,
          height: 64,
        },
        tabBarLabelStyle: { fontSize: FontSize.xs, marginTop: 2 },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ tabBarLabel: 'Home', tabBarBadge: totalItems > 0 ? totalItems : undefined }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStackNavigator}
        options={{ tabBarLabel: 'Orders' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
