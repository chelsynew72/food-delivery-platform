export const Colors = {
  primary: '#FF6B35',
  primaryDark: '#E55A24',
  primaryLight: '#FF8C5A',
  secondary: '#2D3748',
  accent: '#48BB78',

  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F2F5',

  text: '#1A202C',
  textSecondary: '#718096',
  textMuted: '#A0AEC0',
  textInverse: '#FFFFFF',

  border: '#E2E8F0',
  borderDark: '#CBD5E0',

  success: '#48BB78',
  warning: '#ECC94B',
  error: '#FC8181',
  info: '#63B3ED',

  overlay: 'rgba(0,0,0,0.5)',
  transparent: 'transparent',

  star: '#F6AD55',
  badge: '#E53E3E',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};
