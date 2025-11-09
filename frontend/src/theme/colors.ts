export const lightColors = {
  // Primary colors (blue in light mode, green in dark mode)
  primary: "#667eea",
  primaryDark: "#5568d3",
  primaryLight: "#8b9ef2",
  
  // Secondary colors (purple in light mode, light blue in dark mode)
  secondary: "#764ba2",
  secondaryDark: "#5d3a7f",
  secondaryLight: "#8e5fb8",
  
  // Gradient colors
  gradientStart: "#667eea", // Blue
  gradientEnd: "#764ba2", // Purple
  
  // Accent colors
  accent: "#007AFF",
  accentDark: "#0051D5",
  accentLight: "#4DA3FF",
  
  // Status colors
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#FF3B30",
  info: "#2196F3",
  
  // Background colors
  background: "#F5F7FA",
  surface: "#FFFFFF",
  surfaceSecondary: "#F8F9FA",
  card: "#FFFFFF",
  actionCard: "#F8F9FA", // Lighter grey for action tiles - better contrast
  
  // Text colors
  text: "#1C1C1E",
  textSecondary: "#8E8E93",
  textTertiary: "#666",
  textInverse: "#FFFFFF",
  
  // Border colors
  border: "#E0E0E0",
  borderLight: "#F0F0F0",
  borderMedium: "#E1E5E9",
  
  // Input colors
  inputBackground: "#F5F7FA",
  inputBorder: "#764ba2",
  inputBorderFocused: "#764ba2",
  inputPlaceholder: "#999",
  
  // Button colors
  buttonPrimary: "#764ba2",
  buttonSecondary: "#007AFF",
  
  // Icon colors
  iconPrimary: "#764ba2",
  iconSecondary: "#8E8E93",
  iconTertiary: "#666",
  
  // Special UI colors
  promoBackground: "rgba(25, 118, 210, 0.18)", // Darker blue with opacity - appears same in light mode, better in dark mode
  promoText: "#1565C0",
  promoTitle: "#0D47A1",
  promoButton: "#1976D2",
  
  // Tab bar colors
  tabBarBackground: "rgba(255, 255, 255, 0.85)",
  tabBarActive: "#764ba2",
  tabBarInactive: "#8E8E93",
  
  // Overlay colors
  overlay: "rgba(255,255,255,0.9)",
  overlayLight: "rgba(255,255,255,0.75)",
  overlayMedium: "rgba(255,255,255,0.3)",
  overlayDark: "rgba(255,255,255,0.2)",
};

export const darkColors = {
  // Primary colors (same as light mode)
  primary: "#667eea",
  primaryDark: "#5568d3",
  primaryLight: "#8b9ef2",
  
  // Secondary colors (same as light mode)
  secondary: "#764ba2",
  secondaryDark: "#5d3a7f",
  secondaryLight: "#8e5fb8",
  
  // Gradient colors (same as light mode)
  gradientStart: "#667eea", // Blue
  gradientEnd: "#764ba2", // Purple
  
  // Accent colors (same as light mode)
  accent: "#007AFF",
  accentDark: "#0051D5",
  accentLight: "#4DA3FF",
  
  // Status colors
  success: "#4CAF50",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#2196F3",
  
  // Background colors
  background: "#121212",
  surface: "#1E1E1E",
  surfaceSecondary: "#2C2C2E",
  card: "#1E1E1E",
  actionCard: "#2A2A2D", // Lighter grey for action tiles in dark mode - better contrast
  
  // Text colors
  text: "#FFFFFF",
  textSecondary: "#AEAEB2",
  textTertiary: "#8E8E93",
  textInverse: "#000000",
  
  // Border colors
  border: "#38383A",
  borderLight: "#2C2C2E",
  borderMedium: "#3A3A3C",
  
  // Input colors
  inputBackground: "#2C2C2E",
  inputBorder: "#764ba2",
  inputBorderFocused: "#764ba2",
  inputPlaceholder: "#8E8E93",
  
  // Button colors
  buttonPrimary: "#764ba2",
  buttonSecondary: "#007AFF",
  
  // Icon colors
  iconPrimary: "#764ba2",
  iconSecondary: "#AEAEB2",
  iconTertiary: "#8E8E93",
  
  // Special UI colors (same as light mode for consistency)
  promoBackground: "rgba(25, 118, 210, 0.18)", // Darker blue with opacity - appears same in light mode, better in dark mode
  promoText: "#64B5F6", // Lighter blue for better contrast in dark mode
  promoTitle: "#90CAF9", // Lighter blue for subtitle text - legible in dark mode
  promoButton: "#1976D2",
  
  // Tab bar colors
  tabBarBackground: "rgba(30, 30, 30, 0.95)",
  tabBarActive: "#764ba2",
  tabBarInactive: "#8E8E93",
  
  // Overlay colors
  overlay: "rgba(18, 18, 18, 0.9)",
  overlayLight: "rgba(30, 30, 30, 0.75)",
  overlayMedium: "rgba(60, 60, 60, 0.3)",
  overlayDark: "rgba(60, 60, 60, 0.2)",
};

export type ColorScheme = typeof lightColors;

