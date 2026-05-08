import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { CheckoutScreenProps } from '../../navigation/types';
import { useCartStore } from '../../stores/cart.store';
import { orderService } from '../../services/order.service';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../theme';
import { PaymentMethod } from '../../types';

const PAYMENT_OPTIONS = [
  { method: PaymentMethod.CASH, label: '💵 Cash on Delivery' },
  { method: PaymentMethod.CARD, label: '💳 Credit / Debit Card' },
  { method: PaymentMethod.WALLET, label: '📱 Digital Wallet' },
];

export function CheckoutScreen({ navigation }: CheckoutScreenProps): React.JSX.Element {
  const { items, restaurantId, subtotal, clearCart } = useCartStore();

  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [instructions, setInstructions] = useState('');
  const [errors, setErrors] = useState<Partial<typeof address>>({});
  const [isLoading, setIsLoading] = useState(false);

  const deliveryFee = 2.99;
  const tax = subtotal() * 0.08;
  const total = subtotal() + deliveryFee + tax;

  const validate = (): boolean => {
    const e: Partial<typeof address> = {};
    if (!address.street.trim()) e.street = 'Street address required';
    if (!address.city.trim()) e.city = 'City required';
    if (!address.state.trim()) e.state = 'State required';
    if (!address.zip.trim()) e.zip = 'ZIP code required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = async (): Promise<void> => {
    if (!validate()) return;
    if (!restaurantId) return;

    setIsLoading(true);
    try {
      const order = await orderService.create({
        restaurantId,
        items: items.map((i) => ({
          menuItemId: i.menuItem.id,
          quantity: i.quantity,
          notes: i.notes,
        })),
        deliveryStreet: address.street.trim(),
        deliveryCity: address.city.trim(),
        deliveryState: address.state.trim(),
        deliveryZip: address.zip.trim(),
        paymentMethod,
        specialInstructions: instructions.trim() || undefined,
      });

      clearCart();
      navigation.replace('OrderConfirmation', { orderId: order.id });
    } catch {
      Alert.alert('Order Failed', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Delivery address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Delivery Address</Text>
            <Input
              label="Street Address"
              value={address.street}
              onChangeText={(v) => setAddress((a) => ({ ...a, street: v }))}
              placeholder="123 Main St, Apt 4B"
              error={errors.street}
            />
            <View style={styles.row}>
              <View style={styles.flex}>
                <Input
                  label="City"
                  value={address.city}
                  onChangeText={(v) => setAddress((a) => ({ ...a, city: v }))}
                  placeholder="New York"
                  error={errors.city}
                />
              </View>
              <View style={styles.half}>
                <Input
                  label="State"
                  value={address.state}
                  onChangeText={(v) => setAddress((a) => ({ ...a, state: v }))}
                  placeholder="NY"
                  autoCapitalize="characters"
                  error={errors.state}
                />
              </View>
            </View>
            <View style={styles.half}>
              <Input
                label="ZIP Code"
                value={address.zip}
                onChangeText={(v) => setAddress((a) => ({ ...a, zip: v }))}
                placeholder="10001"
                keyboardType="number-pad"
                error={errors.zip}
              />
            </View>
          </View>

          {/* Payment method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💳 Payment Method</Text>
            {PAYMENT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.method}
                style={[
                  styles.paymentOption,
                  paymentMethod === opt.method && styles.paymentOptionActive,
                ]}
                onPress={() => setPaymentMethod(opt.method)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.paymentLabel,
                    paymentMethod === opt.method && styles.paymentLabelActive,
                  ]}
                >
                  {opt.label}
                </Text>
                {paymentMethod === opt.method && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Special instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Special Instructions</Text>
            <Input
              value={instructions}
              onChangeText={setInstructions}
              placeholder="Extra napkins, no onions, ring doorbell…"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Order summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧾 Order Summary</Text>
            {items.map((item) => (
              <View key={item.menuItem.id} style={styles.orderLine}>
                <Text style={styles.orderLineLeft}>
                  {item.quantity}× {item.menuItem.name}
                </Text>
                <Text style={styles.orderLineRight}>
                  ${(Number(item.menuItem.price) * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.orderLine}>
              <Text style={styles.orderLineLabel}>Subtotal</Text>
              <Text style={styles.orderLineValue}>${subtotal().toFixed(2)}</Text>
            </View>
            <View style={styles.orderLine}>
              <Text style={styles.orderLineLabel}>Delivery fee</Text>
              <Text style={styles.orderLineValue}>${deliveryFee.toFixed(2)}</Text>
            </View>
            <View style={styles.orderLine}>
              <Text style={styles.orderLineLabel}>Tax</Text>
              <Text style={styles.orderLineValue}>${tax.toFixed(2)}</Text>
            </View>
            <View style={[styles.orderLine, styles.totalLine]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={`Place Order · $${total.toFixed(2)}`}
            onPress={handlePlaceOrder}
            isLoading={isLoading}
            fullWidth
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  row: { flexDirection: 'row', gap: Spacing.sm },
  half: { flex: 0.5 },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surfaceAlt,
  },
  paymentOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '15' },
  paymentLabel: { fontSize: FontSize.md, color: Colors.text },
  paymentLabelActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  checkmark: { fontSize: FontSize.lg, color: Colors.primary, fontWeight: FontWeight.bold },
  orderLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  orderLineLeft: { fontSize: FontSize.sm, color: Colors.text, flex: 1 },
  orderLineRight: { fontSize: FontSize.sm, color: Colors.text },
  orderLineLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  orderLineValue: { fontSize: FontSize.sm, color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  totalLine: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
    marginBottom: 0,
  },
  totalLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  totalValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
