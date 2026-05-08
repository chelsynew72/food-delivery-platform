import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  style,
}: ButtonProps): React.JSX.Element {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.textInverse}
          size="small"
        />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`]]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },

  // Variants
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.secondary },
  outline: { backgroundColor: Colors.transparent, borderWidth: 2, borderColor: Colors.primary },
  ghost: { backgroundColor: Colors.transparent },
  danger: { backgroundColor: Colors.error },

  // Sizes
  sm: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  md: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 4 },
  lg: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },

  // Text base
  text: { fontWeight: FontWeight.semibold, textAlign: 'center' },

  // Variant text colors
  primaryText: { color: Colors.textInverse } as TextStyle,
  secondaryText: { color: Colors.textInverse } as TextStyle,
  outlineText: { color: Colors.primary } as TextStyle,
  ghostText: { color: Colors.primary } as TextStyle,
  dangerText: { color: Colors.textInverse } as TextStyle,

  // Size text
  smText: { fontSize: FontSize.sm } as TextStyle,
  mdText: { fontSize: FontSize.md } as TextStyle,
  lgText: { fontSize: FontSize.lg } as TextStyle,
});
