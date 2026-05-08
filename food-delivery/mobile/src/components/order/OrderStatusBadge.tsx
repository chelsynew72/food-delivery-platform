import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OrderStatus } from '../../types';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme';

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; color: string; icon: string }> = {
  [OrderStatus.PENDING]: { label: 'Pending', bg: '#FFF3CD', color: '#856404', icon: '⏳' },
  [OrderStatus.CONFIRMED]: { label: 'Confirmed', bg: '#CCE5FF', color: '#004085', icon: '✅' },
  [OrderStatus.PREPARING]: { label: 'Preparing', bg: '#D4EDDA', color: '#155724', icon: '👨‍🍳' },
  [OrderStatus.READY_FOR_PICKUP]: { label: 'Ready', bg: '#D1ECF1', color: '#0C5460', icon: '📦' },
  [OrderStatus.OUT_FOR_DELIVERY]: { label: 'On the way', bg: '#E8D5FF', color: '#491A7C', icon: '🛵' },
  [OrderStatus.DELIVERED]: { label: 'Delivered', bg: '#D4EDDA', color: '#155724', icon: '🎉' },
  [OrderStatus.CANCELLED]: { label: 'Cancelled', bg: '#F8D7DA', color: '#721C24', icon: '❌' },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  showIcon?: boolean;
}

export function OrderStatusBadge({
  status,
  showIcon = true,
}: OrderStatusBadgeProps): React.JSX.Element {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG[OrderStatus.PENDING];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      {showIcon ? <Text style={styles.icon}>{cfg.icon}</Text> : null}
      <Text style={[styles.label, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    gap: 4,
  },
  icon: { fontSize: FontSize.sm },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
});
