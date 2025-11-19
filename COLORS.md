# Color Reference Guide

This document catalogs all colors used in the Frontend Mobile App and their intended purposes.

---

## Primary Colors
Located in: `frontend/src/theme/colors.ts`

| Color | Hex | Usage | Light Mode | Dark Mode |
|-------|-----|-------|------------|-----------|
| `primary` | `#667eea` | Main brand color, primary UI elements | ✓ | ✓ |
| `primaryDark` | `#5568d3` | Darker variant for hover/pressed states | ✓ | ✓ |
| `primaryLight` | `#8b9ef2` | Lighter variant for subtle highlights | ✓ | ✓ |

### Secondary Colors
| Color | Hex | Usage | Light Mode | Dark Mode |
|-------|-----|-------|------------|-----------|
| `secondary` | `#764ba2` | Secondary brand color, buttons, icons | ✓ | ✓ |
| `secondaryDark` | `#5d3a7f` | Darker variant for hover states | ✓ | ✓ |
| `secondaryLight` | `#8e5fb8` | Lighter variant for subtle elements | ✓ | ✓ |

### Gradient Colors
| Color | Hex | Usage | Light Mode | Dark Mode |
|-------|-----|-------|------------|-----------|
| `gradientStart` | `#667eea` | Start of gradient backgrounds | ✓ | ✓ |
| `gradientEnd` | `#764ba2` | End of gradient backgrounds | ✓ | ✓ |

**Usage:** Header backgrounds, promotional banners, action cards

### Accent Colors
| Color | Hex | Usage | Light Mode | Dark Mode |
|-------|-----|-------|------------|-----------|
| `accent` | `#007AFF` | iOS-style accent, links, secondary buttons | ✓ | ✓ |
| `accentDark` | `#0051D5` | Darker accent for pressed states | ✓ | ✓ |
| `accentLight` | `#4DA3FF` | Lighter accent for highlights | ✓ | ✓ |

### Status Colors
| Color | Hex | Usage | Light Mode | Dark Mode |
|-------|-----|-------|------------|-----------|
| `success` | `#4CAF50` | Success messages, positive actions | ✓ | ✓ |
| `warning` | `#FF9800` / `#F59E0B` | Warning messages, caution states | Light: `#FF9800` | Dark: `#F59E0B` |
| `error` | `#FF3B30` / `#EF4444` | Error messages, destructive actions | Light: `#FF3B30` | Dark: `#EF4444` |
| `info` | `#2196F3` | Informational messages, info badges | ✓ | ✓ |

### Background Colors

#### Light Mode
| Color | Hex | Usage |
|-------|-----|-------|
| `background` | `#F5F7FA` | Main app background |
| `surface` | `#FFFFFF` | Card and surface backgrounds |
| `surfaceSecondary` | `#F8F9FA` | Secondary surface areas |
| `card` | `#FFFFFF` | Card components |
| `actionCard` | `#F8F9FA` | Action tiles for better contrast |

#### Dark Mode
| Color | Hex | Usage |
|-------|-----|-------|
| `background` | `#121212` | Main app background |
| `surface` | `#1E1E1E` | Card and surface backgrounds |
| `surfaceSecondary` | `#2C2C2E` | Secondary surface areas |
| `card` | `#1E1E1E` | Card components |
| `actionCard` | `#2A2A2D` | Action tiles for better contrast |

### Text Colors

#### Light Mode
| Color | Hex | Usage |
|-------|-----|-------|
| `text` | `#1C1C1E` | Primary text |
| `textSecondary` | `#8E8E93` | Secondary text, labels |
| `textTertiary` | `#666` | Tertiary text, hints |
| `textInverse` | `#FFFFFF` | Text on dark backgrounds |

#### Dark Mode
| Color | Hex | Usage |
|-------|-----|-------|
| `text` | `#FFFFFF` | Primary text |
| `textSecondary` | `#AEAEB2` | Secondary text, labels |
| `textTertiary` | `#8E8E93` | Tertiary text, hints |
| `textInverse` | `#000000` | Text on light backgrounds |

### Border Colors

#### Light Mode
| Color | Hex | Usage |
|-------|-----|-------|
| `border` | `#E0E0E0` | Standard borders |
| `borderLight` | `#F0F0F0` | Light borders, dividers |
| `borderMedium` | `#E1E5E9` | Medium-weight borders |

#### Dark Mode
| Color | Hex | Usage |
|-------|-----|-------|
| `border` | `#38383A` | Standard borders |
| `borderLight` | `#2C2C2E` | Light borders, dividers |
| `borderMedium` | `#3A3A3C` | Medium-weight borders |

### Input Colors
| Color | Hex | Usage | Light Mode | Dark Mode |
|-------|-----|-------|------------|-----------|
| `inputBackground` | `#F5F7FA` / `#2C2C2E` | Input field backgrounds | Light: `#F5F7FA` | Dark: `#2C2C2E` |
| `inputBorder` | `#764ba2` | Input border color | ✓ | ✓ |
| `inputBorderFocused` | `#764ba2` | Focused input border | ✓ | ✓ |
| `inputPlaceholder` | `#999` / `#8E8E93` | Placeholder text | Light: `#999` | Dark: `#8E8E93` |

### Button Colors
| Color | Hex | Usage | Light Mode | Dark Mode |
|-------|-----|-------|------------|-----------|
| `buttonPrimary` | `#764ba2` | Primary button background | ✓ | ✓ |
| `buttonSecondary` | `#007AFF` | Secondary button background | ✓ | ✓ |

### Icon Colors
| Color | Hex | Usage | Light Mode | Dark Mode |
|-------|-----|-------|------------|-----------|
| `iconPrimary` | `#764ba2` | Primary icons | ✓ | ✓ |
| `iconSecondary` | `#8E8E93` / `#AEAEB2` | Secondary icons | Light: `#8E8E93` | Dark: `#AEAEB2` |
| `iconTertiary` | `#666` / `#8E8E93` | Tertiary icons | Light: `#666` | Dark: `#8E8E93` |

### Special UI Colors

#### Promotional Banner Colors
| Color | Hex | Usage | Light Mode | Dark Mode |
|-------|-----|-------|------------|-----------|
| `promoBackground` | `rgba(25, 118, 210, 0.18)` | Promotional banner background | ✓ | ✓ |
| `promoText` | `#1565C0` / `#64B5F6` | Promotional text | Light: `#1565C0` | Dark: `#64B5F6` |
| `promoTitle` | `#0D47A1` / `#90CAF9` | Promotional title | Light: `#0D47A1` | Dark: `#90CAF9` |
| `promoButton` | `#1976D2` | Promotional button | ✓ | ✓ |

#### Tab Bar Colors

##### Light Mode
| Color | Hex | Usage |
|-------|-----|-------|
| `tabBarBackground` | `rgba(255, 255, 255, 0.85)` | Tab bar background |
| `tabBarActive` | `#764ba2` | Active tab indicator |
| `tabBarInactive` | `#8E8E93` | Inactive tab text |

##### Dark Mode
| Color | Hex | Usage |
|-------|-----|-------|
| `tabBarBackground` | `rgba(30, 30, 30, 0.95)` | Tab bar background |
| `tabBarActive` | `#764ba2` | Active tab indicator |
| `tabBarInactive` | `#8E8E93` | Inactive tab text |

#### Overlay Colors

##### Light Mode
| Color | Hex | Usage |
|-------|-----|-------|
| `overlay` | `rgba(255,255,255,0.9)` | Modal overlays |
| `overlayLight` | `rgba(255,255,255,0.75)` | Light overlays |
| `overlayMedium` | `rgba(255,255,255,0.3)` | Medium overlays |
| `overlayDark` | `rgba(255,255,255,0.2)` | Dark overlays |

##### Dark Mode
| Color | Hex | Usage |
|-------|-----|-------|
| `overlay` | `rgba(18, 18, 18, 0.9)` | Modal overlays |
| `overlayLight` | `rgba(30, 30, 30, 0.75)` | Light overlays |
| `overlayMedium` | `rgba(60, 60, 60, 0.3)` | Medium overlays |
| `overlayDark` | `rgba(60, 60, 60, 0.2)` | Dark overlays |

---

## Insurance Type Colors

Used in: `frontend/src/screens/HomeScreen.tsx`, `frontend/src/screens/MarketplaceScreen.tsx`

| Insurance Type | Hex | Icon | Usage |
|----------------|-----|------|-------|
| Health & Life | `#F44336` | medical | Health insurance policies and categories |
| Motor | `#FF9800` | car | Vehicle insurance policies |
| Travel | `#4CAF50` | airplane | Travel insurance policies |
| Property & Business | `#9C27B0` | business | Property and business insurance |
| Engineering & Construction | `#2196F3` | build | Engineering insurance |
| Marine & Transport | `#00BCD4` | boat | Marine insurance |
| Energy & Power | `#FFC107` | flash | Energy sector insurance |
| Financial Lines | `#607D8B` | card | Financial insurance products |
| Cyber & Crime | `#3F51B5` | shield | Cyber security insurance |
| Special & Fine Art | `#E91E63` | color-palette | Specialty insurance |
| Casualty & Liability | `#FF5722` | warning | Liability insurance |

---

## Hardcoded Component Colors

### HomeScreen Component Colors
Located in: `frontend/src/screens/HomeScreen.tsx`

#### Promotional Banner Variants
| Variant | Background | Text | Icon | Button |
|---------|------------|------|------|--------|
| Info | `#E3F2FD` | `#1565C0` | `#1976D2` | `#1976D2` |
| Warning | `#FFEBEE` | `#C62828` | `#E53935` | `#E53935` |
| Success | `#E8F5E9` | `#2E7D32` | `#4CAF50` | `#4CAF50` |

#### Quick Action Tiles
| Tile | Background Gradient | Icon Background | Icon Color | Title Color | Subtitle Color |
|------|---------------------|-----------------|------------|-------------|----------------|
| File a Claim | `#E0E7FF` → `#EDE9FE` | `rgba(99, 102, 241, 0.2)` | `#6366F1` | `#6366F1` | `#818CF8` |
| Active Policies | `#ECFDF5` → `#D1FAE5` | `rgba(16, 185, 129, 0.2)` | `#10B981` | `#10B981` | `#34D399` |

#### Help Tile
| Element | Color | Usage |
|---------|-------|-------|
| Background | `#FFF4E6` | Help section background |
| Border | `#FF8C42` | Help section border |
| Icon Background | `#FF8C42` | Help icon background |
| Icon | `#FFFFFF` | Help icon color |
| Title | `#FF8C42` | Help title text |
| Subtitle | `#D2691E` | Help subtitle text |
| Arrow Icon | `#FF8C42` | Navigation arrow |

#### Neumorphic Card Styles
| Element | Light Mode | Dark Mode | Usage |
|---------|------------|-----------|-------|
| Card Background | `#F5F5F5` | `#2A2A2D` | Neumorphic card base |
| Shadow Color | `#000` | `#000` | Card shadows |

#### Pagination Dots
| State | Color | Usage |
|-------|-------|-------|
| Active | Theme `promoButton` | Active page indicator |
| Inactive | `#BDBDBD` | Inactive page indicator |

### NotificationsScreen Component Colors
Located in: `frontend/src/screens/NotificationsScreen.tsx`

| Notification Type | Color | Usage |
|-------------------|-------|-------|
| Success | `#4CAF50` | Success notifications |
| Warning | `#FF9800` | Warning notifications |
| Error | `#F44336` | Error notifications |
| Info | `#2196F3` | Info notifications |

---

## Color Usage Guidelines

- **Primary Brand**: Use `primary` (`#667eea`) and `secondary` (`#764ba2`) for main brand elements
- **Status Indicators**: Use semantic colors (`success`, `warning`, `error`, `info`) for status messages
- **Text Hierarchy**: Use `text` → `textSecondary` → `textTertiary` for information hierarchy
- **Insurance Types**: Use the predefined insurance type colors for category identification

### Best Practices
1. **Always use theme colors** from `colors.ts` instead of hardcoding colors
2. **Respect dark mode** - ensure colors work in both light and dark themes
3. **Maintain contrast** - ensure text is readable on background colors (WCAG AA minimum)
4. **Semantic naming** - use semantic color names (`success`, `error`) rather than color names (`green`, `red`)
5. **Insurance types** - use the predefined insurance type colors for consistency across the app

---

## File Locations

- **Frontend Colors**: `frontend/src/theme/colors.ts`
- **Frontend Theme Context**: `frontend/src/context/ThemeContext.tsx`

---

*Last Updated: Generated automatically from codebase analysis*

