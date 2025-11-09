import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { lightColors, darkColors, ColorScheme } from "../theme/colors";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: ColorScheme;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // For testing: temporarily set to "dark" to force dark mode
  // Change back to "system" for automatic detection
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  
  // Initialize with current system color scheme, defaulting to light if null
  const getInitialColorScheme = (): ColorSchemeName => {
    const scheme = Appearance.getColorScheme();
    return scheme || "light";
  };
  
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    getInitialColorScheme()
  );

  useEffect(() => {
    // Update immediately with current scheme
    const updateColorScheme = () => {
      const currentScheme = Appearance.getColorScheme();
      if (currentScheme) {
        setSystemColorScheme(currentScheme);
      } else {
        setSystemColorScheme("light"); // Default to light if null
      }
    };
    
    updateColorScheme();

    // Listen for changes - React Native Appearance API
    const subscription = Appearance.addChangeListener((preferences: any) => {
      // Handle different API formats
      let colorScheme: ColorSchemeName | null = null;
      
      if (typeof preferences === "string") {
        colorScheme = preferences as ColorSchemeName;
      } else if (preferences && typeof preferences === "object" && preferences.colorScheme) {
        colorScheme = preferences.colorScheme;
      } else if (preferences && (preferences === "dark" || preferences === "light")) {
        colorScheme = preferences as ColorSchemeName;
      }
      
      if (colorScheme) {
        setSystemColorScheme(colorScheme);
      } else {
        // Fallback: get current scheme directly
        updateColorScheme();
      }
    });

    // Cleanup
    return () => {
      if (subscription) {
        if (typeof subscription.remove === "function") {
          subscription.remove();
        } else if (typeof subscription === "function") {
          subscription();
        }
      }
    };
  }, []);

  const isDark = useMemo(() => {
    if (themeMode === "dark") return true;
    if (themeMode === "light") return false;
    // system mode
    return systemColorScheme === "dark";
  }, [themeMode, systemColorScheme]);

  const theme: ColorScheme = useMemo(() => {
    return isDark ? darkColors : lightColors;
  }, [isDark]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, isDark, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

