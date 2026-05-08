import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import type { MenuItem } from '../../types';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../theme';

interface MenuItemCardProps {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function MenuItemCard({
  item,
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
}: MenuItemCardProps): React.JSX.Element {
  return (
    <View style={[styles.card, !item.isAvailable && styles.unavailable]}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        ) : null}
        <View style={styles.footer}>
          <Text style={styles.price}>${Number(item.price).toFixed(2)}</Text>
          {item.calories ? (
            <Text style={styles.calories}>{item.calories} cal</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.right}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imageFallback}>
            <Text style={styles.imageFallbackText}>🍽️</Text>
          </View>
        )}
        {item.isAvailable ? (
          quantity > 0 ? (
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={onDecrement}
                activeOpacity={0.8}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={onIncrement}
                activeOpacity={0.8}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={onAdd}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          )
        ) : (
          <View style={styles.soldOut}>
            <Text style={styles.soldOutText}>Sold out</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  unavailable: { opacity: 0.5 },
  info: { flex: 1, paddingRight: Spacing.md },
  name: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  description: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: Spacing.sm },
  price: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  calories: { fontSize: FontSize.xs, color: Colors.textMuted },
  right: { alignItems: 'center', justifyContent: 'space-between' },
  image: { width: 80, height: 80, borderRadius: Radius.md },
  imageFallback: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageFallbackText: { fontSize: 28 },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    marginTop: Spacing.xs,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  quantityText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginHorizontal: Spacing.xs,
    minWidth: 20,
    textAlign: 'center',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  addButtonText: { color: Colors.textInverse, fontSize: FontSize.xl, fontWeight: FontWeight.bold, lineHeight: 30 },
  soldOut: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAlt,
    marginTop: Spacing.xs,
  },
  soldOutText: { fontSize: FontSize.xs, color: Colors.textMuted },
});
