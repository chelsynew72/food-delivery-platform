import React, { useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import type { RestaurantDetailScreenProps } from '../../navigation/types';
import { restaurantService } from '../../services/restaurant.service';
import { useCartStore } from '../../stores/cart.store';
import { MenuItemCard } from '../../components/restaurant/MenuItemCard';
import type { MenuItem, MenuCategory } from '../../types';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../theme';

export function RestaurantDetailScreen({
  route,
  navigation,
}: RestaurantDetailScreenProps): React.JSX.Element {
  const { restaurantId } = route.params;

  const cartItems = useCartStore((s) => s.items);
  const cartRestaurantId = useCartStore((s) => s.restaurantId);
  const addItem = useCartStore((s) => s.addItem);
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const totalItems = useCartStore((s) => s.totalItems());
  const subtotal = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clearCart);

  const { data: restaurant, isLoading: loadingRestaurant } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: () => restaurantService.getById(restaurantId),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', restaurantId],
    queryFn: () => restaurantService.getCategories(restaurantId),
  });

  const { data: menuItems, isLoading: loadingMenu } = useQuery({
    queryKey: ['menu', restaurantId],
    queryFn: () => restaurantService.getMenuItems(restaurantId),
  });

  const getQuantity = useCallback(
    (itemId: string) => cartItems.find((i) => i.menuItem.id === itemId)?.quantity ?? 0,
    [cartItems],
  );

  const handleAdd = useCallback(
    (item: MenuItem) => {
      if (cartRestaurantId && cartRestaurantId !== restaurantId && cartItems.length > 0) {
        Alert.alert(
          'Start new cart?',
          'Your cart has items from another restaurant. Clear it and start fresh?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Clear & Add',
              style: 'destructive',
              onPress: () => {
                clearCart();
                addItem(restaurantId, restaurant?.name ?? '', item);
              },
            },
          ],
        );
        return;
      }
      addItem(restaurantId, restaurant?.name ?? '', item);
    },
    [cartRestaurantId, restaurantId, cartItems.length, clearCart, addItem, restaurant],
  );

  // Group items by category
  const sections = React.useMemo(() => {
    if (!menuItems) return [];
    const catMap = new Map<string, { title: string; data: MenuItem[] }>();

    menuItems.forEach((item) => {
      const catId = item.categoryId ?? '__uncategorized__';
      const catName =
        categories?.find((c: MenuCategory) => c.id === catId)?.name ?? 'Other';
      if (!catMap.has(catId)) {
        catMap.set(catId, { title: catName, data: [] });
      }
      catMap.get(catId)!.data.push(item);
    });

    return Array.from(catMap.values());
  }, [menuItems, categories]);

  if (loadingRestaurant || !restaurant) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MenuItemCard
            item={item}
            quantity={getQuantity(item.id)}
            onAdd={() => handleAdd(item)}
            onIncrement={() => incrementItem(item.id)}
            onDecrement={() => decrementItem(item.id)}
          />
        )}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        ListHeaderComponent={
          <View>
            {/* Banner */}
            <View style={styles.bannerContainer}>
              {restaurant.bannerUrl ? (
                <Image
                  source={{ uri: restaurant.bannerUrl }}
                  style={styles.banner}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.banner, styles.bannerFallback]}>
                  <Text style={styles.bannerEmoji}>🍽️</Text>
                </View>
              )}
            </View>

            {/* Info */}
            <View style={styles.info}>
              <Text style={styles.name}>{restaurant.name}</Text>
              {restaurant.cuisineType ? (
                <Text style={styles.cuisine}>{restaurant.cuisineType}</Text>
              ) : null}
              {restaurant.description ? (
                <Text style={styles.description}>{restaurant.description}</Text>
              ) : null}

              <View style={styles.badges}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>⭐ {Number(restaurant.rating).toFixed(1)}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>🕐 {restaurant.estimatedDeliveryTime} min</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {Number(restaurant.deliveryFee) === 0
                      ? '🚚 Free delivery'
                      : `🚚 $${Number(restaurant.deliveryFee).toFixed(2)}`}
                  </Text>
                </View>
              </View>
            </View>

            {loadingMenu && (
              <View style={styles.menuLoading}>
                <ActivityIndicator color={Colors.primary} />
              </View>
            )}
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled
      />

      {/* Cart bar */}
      {totalItems > 0 && (
        <SafeAreaView edges={['bottom']} style={styles.cartBarSafe}>
          <TouchableOpacity
            style={styles.cartBar}
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.9}
          >
            <View style={styles.cartCount}>
              <Text style={styles.cartCountText}>{totalItems}</Text>
            </View>
            <Text style={styles.cartBarText}>View Cart</Text>
            <Text style={styles.cartBarPrice}>${subtotal.toFixed(2)}</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bannerContainer: { height: 220 },
  banner: { width: '100%', height: '100%' },
  bannerFallback: { backgroundColor: Colors.surfaceAlt, justifyContent: 'center', alignItems: 'center' },
  bannerEmoji: { fontSize: 72 },
  info: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  name: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text },
  cuisine: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 2 },
  description: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.sm, lineHeight: 20 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md },
  badge: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  badgeText: { fontSize: FontSize.sm, color: Colors.text },
  sectionHeader: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listContent: { paddingBottom: 100 },
  menuLoading: { padding: Spacing.xl, alignItems: 'center' },
  cartBarSafe: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  cartBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.lg,
  },
  cartCount: {
    backgroundColor: Colors.primaryDark,
    borderRadius: Radius.sm,
    minWidth: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginRight: Spacing.md,
  },
  cartCountText: { color: Colors.textInverse, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  cartBarText: { flex: 1, color: Colors.textInverse, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  cartBarPrice: { color: Colors.textInverse, fontSize: FontSize.md, fontWeight: FontWeight.bold },
});
