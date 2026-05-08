import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { OrderDetailScreenProps } from '../../navigation/types';
import { orderService } from '../../services/order.service';
import { OrderStatusBadge } from '../../components/order/OrderStatusBadge';
import { Button } from '../../components/common/Button';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../theme';
import { OrderStatus } from '../../types';

export function OrderDetailScreen({
  route,
}: OrderDetailScreenProps): React.JSX.Element {
  const { orderId } = route.params;
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getById(orderId),
    refetchInterval: 30_000, // poll every 30s for status updates
  });

  const handleCancel = () => {
    Alert.prompt(
      'Cancel Order',
      'Please provide a reason for cancellation (optional):',
      async (reason) => {
        try {
          await orderService.cancel(orderId, reason);
          await queryClient.invalidateQueries({ queryKey: ['order', orderId] });
          await queryClient.invalidateQueries({ queryKey: ['my-orders'] });
        } catch {
          Alert.alert('Error', 'Could not cancel this order.');
        }
      },
      'plain-text',
    );
  };

  if (isLoading || !order) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const canCancel =
    order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status banner */}
        <View style={styles.statusBanner}>
          <Text style={styles.orderId}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
          <OrderStatusBadge status={order.status} />
          <Text style={styles.orderDate}>
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString([], {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Restaurant */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏪 Restaurant</Text>
          <Text style={styles.restaurantName}>{order.restaurant?.name}</Text>
        </View>

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🍽️ Items Ordered</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemQty}>{item.quantity}×</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>${Number(item.subtotal).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Delivery address */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Delivery Address</Text>
          <Text style={styles.address}>
            {order.deliveryStreet},{'\n'}
            {order.deliveryCity}, {order.deliveryState} {order.deliveryZip}
          </Text>
        </View>

        {/* Driver info */}
        {order.driver && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🚴 Your Driver</Text>
            <Text style={styles.driverName}>
              {order.driver.user?.firstName} {order.driver.user?.lastName}
            </Text>
            <Text style={styles.driverMeta}>
              ⭐ {Number(order.driver.rating).toFixed(1)} · {order.driver.totalDeliveries}{' '}
              deliveries
            </Text>
            {order.driver.vehicleType && (
              <Text style={styles.driverMeta}>🚗 {order.driver.vehicleType}</Text>
            )}
          </View>
        )}

        {/* Payment */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💳 Payment</Text>
          <SummaryRow label="Subtotal" value={`$${Number(order.subtotal).toFixed(2)}`} />
          <SummaryRow label="Delivery fee" value={`$${Number(order.deliveryFee).toFixed(2)}`} />
          <SummaryRow label="Tax" value={`$${Number(order.tax).toFixed(2)}`} />
          <SummaryRow label="Payment method" value={order.paymentMethod.toUpperCase()} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${Number(order.total).toFixed(2)}</Text>
          </View>
        </View>

        {/* Special instructions */}
        {order.specialInstructions && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📝 Special Instructions</Text>
            <Text style={styles.instructions}>{order.specialInstructions}</Text>
          </View>
        )}

        {/* Cancel */}
        {canCancel && (
          <Button
            title="Cancel Order"
            onPress={handleCancel}
            variant="danger"
            fullWidth
            style={styles.cancelBtn}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <View style={summaryStyles.row}>
      <Text style={summaryStyles.label}>{label}</Text>
      <Text style={summaryStyles.value}>{value}</Text>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary },
  value: { fontSize: FontSize.sm, color: Colors.text },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  statusBanner: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  orderId: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  orderDate: { fontSize: FontSize.sm, color: Colors.textSecondary },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  restaurantName: { fontSize: FontSize.md, color: Colors.text },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  itemQty: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary, width: 28 },
  itemName: { flex: 1, fontSize: FontSize.sm, color: Colors.text },
  itemPrice: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  address: { fontSize: FontSize.md, color: Colors.text, lineHeight: 22 },
  driverName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  driverMeta: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  totalValue: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  instructions: { fontSize: FontSize.md, color: Colors.text, lineHeight: 22 },
  cancelBtn: { marginTop: Spacing.sm },
});
