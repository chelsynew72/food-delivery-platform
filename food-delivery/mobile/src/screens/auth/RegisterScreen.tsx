import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RegisterScreenProps } from '../../navigation/types';
import { useAuthStore } from '../../stores/auth.store';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Colors, FontSize, FontWeight, Spacing } from '../../theme';

export function RegisterScreen({ navigation }: RegisterScreenProps): React.JSX.Element {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const { register, isLoading } = useAuthStore();

  const update = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const validate = (): boolean => {
    const e: Partial<typeof form> = {};
    if (!form.firstName.trim()) e.firstName = 'First name required';
    if (!form.lastName.trim()) e.lastName = 'Last name required';
    if (!form.email.trim()) e.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      e.password = 'Must contain upper, lower and a number';
    if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async (): Promise<void> => {
    if (!validate()) return;
    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      });
    } catch {
      Alert.alert('Registration Failed', 'This email may already be in use.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.logo}>🍕</Text>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Join us and start ordering</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={styles.half}>
                <Input
                  label="First Name"
                  value={form.firstName}
                  onChangeText={update('firstName')}
                  placeholder="John"
                  error={errors.firstName}
                />
              </View>
              <View style={styles.half}>
                <Input
                  label="Last Name"
                  value={form.lastName}
                  onChangeText={update('lastName')}
                  placeholder="Doe"
                  error={errors.lastName}
                />
              </View>
            </View>

            <Input
              label="Email"
              value={form.email}
              onChangeText={update('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="john@example.com"
              error={errors.email}
            />
            <Input
              label="Phone (optional)"
              value={form.phone}
              onChangeText={update('phone')}
              keyboardType="phone-pad"
              placeholder="+1 234 567 8900"
            />
            <Input
              label="Password"
              value={form.password}
              onChangeText={update('password')}
              isPassword
              placeholder="Min 8 chars"
              error={errors.password}
            />
            <Input
              label="Confirm Password"
              value={form.confirmPassword}
              onChangeText={update('confirmPassword')}
              isPassword
              placeholder="Repeat password"
              error={errors.confirmPassword}
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              isLoading={isLoading}
              fullWidth
              size="lg"
              style={styles.btn}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: Spacing.lg },
  header: { alignItems: 'center', marginVertical: Spacing.xl },
  logo: { fontSize: 56, marginBottom: Spacing.md },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  form: { marginBottom: Spacing.xl },
  row: { flexDirection: 'row', gap: Spacing.sm },
  half: { flex: 1 },
  btn: { marginTop: Spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: Spacing.lg },
  footerText: { fontSize: FontSize.md, color: Colors.textSecondary },
  link: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.semibold },
});
