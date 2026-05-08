import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import type { Restaurant } from '../../types';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../theme';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
}

export function RestaurantCard({
  restaurant,
  onPress,
}: RestaurantCardProps): React.JSX.Element {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        {restaurant.bannerUrl ? (
          <Image source={{ uri: restaurant.bannerUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imageFallback}>
            <Text style={styles.imageFallbackText}>🍽️</Text>
          </View>
        )}
        {!restaurant.isOpen && (
          <View style={styles.closedBadge}>
            <Text style={styles.closedText}>Closed</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.rating}>{Number(restaurant.rating).toFixed(1)}</Text>
          </View>
        </View>

        {restaurant.cuisineType ? (
          <Text style={styles.cuisine}>{restaurant.cuisineType}</Text>
        ) : null}

        <View style={styles.meta}>
          <Text style={styles.metaText}>🕐 {restaurant.estimatedDeliveryTime} min</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.metaText}>
            {Number(restaurant.deliveryFee) === 0
              ? 'Free delivery'
              : `$${Number(restaurant.deliveryFee).toFixed(2)} delivery`}
          </Text>
          {Number(restaurant.minOrderAmount) > 0 ? (
            <>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.metaText}>Min ${Number(restaurant.minOrderAmount).toFixed(2)}</Text>
            </>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadow.md,
  },
  imageContainer: { position: 'relative', height: 160 },
  image: { width: '100%', height: '100%' },
  imageFallback: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageFallbackText: { fontSize: 48 },
  closedBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.overlay,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  closedText: { color: Colors.textInverse, fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  body: { padding: Spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, flex: 1 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  star: { fontSize: FontSize.sm },
  rating: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  cuisine: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, flexWrap: 'wrap' },
  metaText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  dot: { color: Colors.textMuted, marginHorizontal: Spacing.xs },
});
