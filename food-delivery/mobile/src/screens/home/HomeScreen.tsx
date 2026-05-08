import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import type { HomeScreenProps } from '../../navigation/types';
import { restaurantService } from '../../services/restaurant.service';
import { useAuthStore } from '../../stores/auth.store';
import { RestaurantCard } from '../../components/restaurant/RestaurantCard';
import type { Restaurant } from '../../types';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme';

const CUISINE_FILTERS = ['All', 'Pizza', 'Burgers', 'Sushi', 'Mexican', 'Indian', 'Thai'];

export function HomeScreen({ navigation }: HomeScreenProps): React.JSX.Element {
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['restaurants', selectedCuisine, search],
    queryFn: () =>
      restaurantService.getAll({
        cuisineType: selectedCuisine === 'All' ? undefined : selectedCuisine,
        search: search || undefined,
      }),
  });

  const handleRestaurantPress = useCallback(
    (restaurant: Restaurant) => {
      navigation.navigate('RestaurantDetail', { restaurantId: restaurant.id });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Restaurant }) => (
      <RestaurantCard restaurant={item} onPress={() => handleRestaurantPress(item)} />
    ),
    [handleRestaurantPress],
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.firstName ?? 'there'} 👋</Text>
          <Text style={styles.tagline}>What are you craving today?</Text>
        </View>
        <Text style={styles.cartIcon}>🛒</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Text style={styles.clearBtn} onPress={() => setSearch('')}>✕</Text>
        )}
      </View>

      {/* Cuisine filters */}
      <FlatList
        data={CUISINE_FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filtersContainer}
        renderItem={({ item }) => (
          <Text
            style={[
              styles.filterChip,
              selectedCuisine === item && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCuisine(item)}
          >
            {item}
          </Text>
        )}
        style={styles.filtersList}
      />

      {/* Restaurant list */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyTitle}>No restaurants found</Text>
              <Text style={styles.emptySubtitle}>Try a different search or filter</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  greeting: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  tagline: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  cartIcon: { fontSize: 28 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: { fontSize: FontSize.lg, marginRight: Spacing.sm },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    paddingVertical: Spacing.sm + 4,
  },
  clearBtn: { fontSize: FontSize.md, color: Colors.textMuted, padding: Spacing.xs },
  filtersList: { maxHeight: 48 },
  filtersContainer: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    color: Colors.textInverse,
    borderColor: Colors.primary,
  },
  listContent: { padding: Spacing.lg, paddingTop: Spacing.md },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 56, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text },
  emptySubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
});
