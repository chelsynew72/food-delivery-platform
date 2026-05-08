import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import type { OrderConfirmationScreenProps } from '../../navigation/types';
import { orderService } from '../../services/order.service';
import { Button } from '../../components/common/Button';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../theme';

export function OrderConfirmationScreen({
  route,
  navigation,
}: OrderConfirmationScreenProps): React.JSX.Element {
  const { orderId } = route.params;
  const scaleAnim = new Animated.Value(0);

  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getById(orderId),
  });

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Success animation */}
        <Animated.View style={[styles.checkCircle, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.checkEmoji}>✅</Text>
        </Animated.View>

        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.subtitle}>
          Your order has been received and is being prepared.
        </Text>

        {order && (
          <View style={styles.card}>
            <Row label="Order ID" value={`#${order.id.slice(0, 8).toUpperCase()}`} />
            <Row label="Restaurant" value={order.restaurant?.name ?? '—'} />
            <Row label="Total" value={`$${Number(order.total).toFixed(2)}`} />
            <Row label="Payment" value={order.paymentMethod.toUpperCase()} />
            {order.estimatedDeliveryTime && (
              <Row
                label="Est. Delivery"
                value={new Date(order.estimatedDeliveryTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              />
            )}
          </View>
        )}

        <View style={styles.steps}>
          {[
            { emoji: '✅', label: 'Order received' },
            { emoji: '👨‍🍳', label: 'Being prepared' },
            { emoji: '🚴', label: 'Out for delivery' },
            { emoji: '🏠', label: 'Delivered' },
          ].map((step, idx) => (
            <View key={idx} style={styles.step}>
              <Text style={styles.stepEmoji}>{step.emoji}</Text>
              <Text style={styles.stepLabel}>{step.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Button
            title="Track Order"
            onPress={() => {
              navigation.navigate('OrderConfirmation', { orderId });
              navigation
                .getParent()
                ?.navigate('OrdersTab', {
                  screen: 'OrderDetail',
                  params: { orderId },
                });
            }}
            fullWidth
            style={styles.btn}
          />
          <Button
            title="Back to Home"
            onPress={() => navigation.popToTop()}
            variant="outline"
            fullWidth
            style={styles.btn}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary },
  value: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  checkEmoji: { fontSize: 56 },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  step: { alignItems: 'center', flex: 1 },
  stepEmoji: { fontSize: FontSize.xl, marginBottom: 4 },
  stepLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  actions: { width: '100%', gap: Spacing.sm, marginTop: 'auto' },
  btn: {},
});
