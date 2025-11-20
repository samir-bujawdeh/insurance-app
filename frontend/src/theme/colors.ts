export const lightColors = {
  // Primary colors (blue theme)
  primary: "#667eea",
  primaryDark: "#5568d3",
  primaryLight: "#8b9ef2",
  
  // Secondary colors (purple theme)
  secondary: "#764ba2",
  secondaryDark: "#5d3a7f",
  secondaryLight: "#8e5fb8",
  
  // Gradient colors
  gradientStart: "#667eea", // Blue
  gradientEnd: "#764ba2", // Purple
  
  // Accent colors
  accent: "#007AFF", // Keep for iOS-style accent
  accentDark: "#0051D5",
  accentLight: "#4DA3FF",
  accentGold: "#FFC93C",
  accentGreen: "#ADf7B6",
  accentOrange: "#FFB970",
  accentPurple: "#C6C2E9",
  accentPink: "#F4C1C1",
  
  // Status colors
  success: "#27AE60",
  warning: "#F1C40F",
  error: "#E74C3C",
  info: "#3498DB",
  
  // Background colors
  background: "#F9F9F9",
  surface: "#FFFFFF",
  surfaceSecondary: "#F0EFEB",
  card: "#FFFFFF",
  actionCard: "#E2E2E2", // Action tiles for contrast
  
  // Text colors
  text: "#1A1A1A",
  textSecondary: "#555555",
  textTertiary: "#888888",
  textInverse: "#FFFFFF",
  
  // Border colors
  border: "#D1D1D1",
  borderLight: "#E5E5E5",
  borderMedium: "#C0C0C0",
  
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
  iconTertiary: "#666666",
  
  // Special UI colors
  promoBackground: "rgba(25, 118, 210, 0.18)", // Darker blue with opacity
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
  accent: "#007AFF", // Keep for iOS-style accent
  accentDark: "#0051D5",
  accentLight: "#4DA3FF",
  accentGold: "#FFC93C",
  accentGreen: "#ADf7B6",
  accentOrange: "#FFB970",
  accentPurple: "#C6C2E9",
  accentPink: "#F4C1C1",
  
  // Status colors
  success: "#27AE60",
  warning: "#F1C40F",
  error: "#E74C3C",
  info: "#3498DB",
  
  // Background colors
  background: "#121212",
  surface: "#1E1E1E",
  surfaceSecondary: "#2A2A2D",
  card: "#1E1E1E",
  actionCard: "#2C2C2E", // Action tiles for contrast
  
  // Text colors
  text: "#FFFFFF",
  textSecondary: "#CCCCCC",
  textTertiary: "#999999",
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
  iconSecondary: "#CCCCCC",
  iconTertiary: "#999999",
  
  // Special UI colors
  promoBackground: "rgba(25, 118, 210, 0.18)", // Darker blue with opacity
  promoText: "#64B5F6", // Lighter blue for better contrast in dark mode
  promoTitle: "#90CAF9", // Lighter blue for subtitle text
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

