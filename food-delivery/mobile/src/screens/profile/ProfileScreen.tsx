import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ProfileScreenProps } from '../../navigation/types';
import { useAuthStore } from '../../stores/auth.store';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../theme';

interface MenuRowProps {
  emoji: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

function MenuRow({ emoji, label, onPress, danger = false }: MenuRowProps): React.JSX.Element {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.menuEmoji}>{emoji}</Text>
      <Text style={[styles.menuLabel, danger && styles.dangerLabel]}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export function ProfileScreen({ navigation }: ProfileScreenProps): React.JSX.Element {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  if (!user) return <View />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar & name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.firstName[0]}{user.lastName[0]}
            </Text>
          </View>
          <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
          <Text style={styles.email}>{user.email}</Text>
          {user.phone && <Text style={styles.phone}>{user.phone}</Text>}
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user.role.replace('_', ' ').toUpperCase()}</Text>
          </View>
        </View>

        {/* Account section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <MenuRow
              emoji="✏️"
              label="Edit Profile"
              onPress={() => Alert.alert('Coming soon', 'Edit profile is under development.')}
            />
            <View style={styles.separator} />
            <MenuRow
              emoji="📍"
              label="My Addresses"
              onPress={() => Alert.alert('Coming soon', 'Address management is under development.')}
            />
            <View style={styles.separator} />
            <MenuRow
              emoji="🔔"
              label="Notifications"
              onPress={() => Alert.alert('Coming soon')}
            />
          </View>
        </View>

        {/* Orders section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Orders</Text>
          <View style={styles.card}>
            <MenuRow
              emoji="📦"
              label="Order History"
              onPress={() =>
                navigation
                  .getParent()
                  ?.navigate('OrdersTab', { screen: 'OrdersList' })
              }
            />
            <View style={styles.separator} />
            <MenuRow
              emoji="❤️"
              label="Favourite Restaurants"
              onPress={() => Alert.alert('Coming soon')}
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <MenuRow emoji="❓" label="Help Center" onPress={() => Alert.alert('Coming soon')} />
            <View style={styles.separator} />
            <MenuRow emoji="⭐" label="Rate the App" onPress={() => Alert.alert('Coming soon')} />
            <View style={styles.separator} />
            <MenuRow emoji="📄" label="Privacy Policy" onPress={() => Alert.alert('Coming soon')} />
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <View style={styles.card}>
            <MenuRow emoji="🚪" label="Log Out" onPress={handleLogout} danger />
          </View>
        </View>

        <Text style={styles.version}>Food Delivery v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  avatarSection: { alignItems: 'center', marginBottom: Spacing.xl },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  avatarText: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },
  name: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  email: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  phone: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  roleBadge: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  roleText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.primary },
  section: { marginBottom: Spacing.md },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  menuEmoji: { fontSize: FontSize.lg, marginRight: Spacing.md },
  menuLabel: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  dangerLabel: { color: Colors.error },
  chevron: { fontSize: FontSize.xl, color: Colors.textMuted },
  separator: { height: 1, backgroundColor: Colors.border, marginLeft: Spacing.lg + 28 },
  version: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.lg,
  },
});
