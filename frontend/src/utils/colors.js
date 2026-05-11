// Centralized color scheme: Dark Blue & White
export const COLORS = {
  // Primary Colors
  primary: {
    dark: '#1E40AF',      // Dark blue - main brand color
    light: '#DBEAFE',     // Light blue - hover/active states
    lighter: '#EFF6FF',   // Very light blue - backgrounds
  },

  // Backgrounds
  bg: {
    primary: '#FFFFFF',   // White
    secondary: '#F8FAFC', // Very light blue-gray
    tertiary: '#F3F4F6',  // Light gray
    dark: '#0A0A0A',      // Dark (sidebar)
  },

  // Text
  text: {
    primary: '#111827',   // Dark text
    secondary: '#374151', // Medium gray
    tertiary: '#6B7280',  // Light gray
    light: '#9CA3AF',     // Lighter gray
    white: '#FFFFFF',     // White text
  },

  // Borders
  border: {
    light: '#E5E7EB',     // Light gray
    default: '#E2E8F0',   // Medium gray
  },

  // Status Colors (complementary to dark blue)
  status: {
    success: '#22C55E',   // Green
    warning: '#F59E0B',   // Amber
    danger: '#EF4444',    // Red
    info: '#3B82F6',      // Blue
  },

  // Button States
  button: {
    primary: '#1E40AF',
    primaryHover: '#1E3A8A',
    primaryLight: '#DBEAFE',
    secondary: '#F3F4F6',
    secondaryHover: '#E5E7EB',
  },
};

// Preset color mappings for UI components
export const COLOR_VARIANTS = {
  // Badge variants
  badge: {
    primary: { bg: COLORS.primary.lighter, text: COLORS.primary.dark },
    success: { bg: '#DCFCE7', text: '#166534' },
    warning: { bg: '#FEF3C7', text: '#92400E' },
    danger: { bg: '#FEE2E2', text: '#DC2626' },
    gray: { bg: '#F3F4F6', text: '#6B7280' },
  },

  // Button variants
  button: {
    primary: {
      bg: COLORS.primary.dark,
      text: COLORS.text.white,
      hover: COLORS.button.primaryHover,
    },
    secondary: {
      bg: COLORS.bg.secondary,
      text: COLORS.text.primary,
      hover: COLORS.button.secondaryHover,
    },
  },
};
