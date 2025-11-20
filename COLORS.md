# Color Reference Guide

This document catalogs all colors used in the Frontend Mobile App and their intended purposes. This palette is designed for a minimal, modern, and professional aesthetic inspired by iOS and current UI/UX best practices.

---

## Primary Colors

Located in: `frontend/src/theme/colors.ts`

| Color          | Hex       | Usage                                   | Light Mode | Dark Mode |
| -------------- | --------- | --------------------------------------- | ---------- | --------- |
| `primary`      | `#B17A50` | Main brand color, primary UI elements   | ✓          | ✓         |
| `primaryDark`  | `#96623F` | Darker variant for hover/pressed states | ✓          | ✓         |
| `primaryLight` | `#C99383` | Lighter variant for subtle highlights   | ✓          | ✓         |

### Secondary Colors

| Color            | Hex       | Usage                               | Light Mode | Dark Mode |
| ---------------- | --------- | ----------------------------------- | ---------- | --------- |
| `secondary`      | `#FFC93C` | Secondary accent color, highlights  | ✓          | ✓         |
| `secondaryDark`  | `#E6B437` | Darker variant for hover states     | ✓          | ✓         |
| `secondaryLight` | `#FFE79A` | Lighter variant for subtle elements | ✓          | ✓         |

### Gradient Colors

| Color           | Hex       | Usage                         | Light Mode | Dark Mode |
| --------------- | --------- | ----------------------------- | ---------- | --------- |
| `gradientStart` | `#B17A50` | Start of gradient backgrounds | ✓          | ✓         |
| `gradientEnd`   | `#FFC93C` | End of gradient backgrounds   | ✓          | ✓         |

**Usage:** Header backgrounds, promotional banners, action cards

### Accent Colors

| Color          | Hex       | Usage                                 | Light Mode | Dark Mode |
| -------------- | --------- | ------------------------------------- | ---------- | --------- |
| `accentGold`   | `#FFC93C` | Golden highlight, secondary buttons   | ✓          | ✓         |
| `accentGreen`  | `#ADf7B6` | Soft mint green, category indicator   | ✓          | ✓         |
| `accentOrange` | `#FFB970` | Mild orange for category or highlight | ✓          | ✓         |
| `accentPurple` | `#C6C2E9` | Lavender purple for category UI       | ✓          | ✓         |
| `accentPink`   | `#F4C1C1` | Rose pink (optional category color)   | ✓          | ✓         |

### Status Colors

| Color     | Hex       | Usage                               | Light Mode | Dark Mode |
| --------- | --------- | ----------------------------------- | ---------- | --------- |
| `success` | `#27AE60` | Success messages, positive actions  | ✓          | ✓         |
| `warning` | `#F1C40F` | Warning messages, caution states    | ✓          | ✓         |
| `error`   | `#E74C3C` | Error messages, destructive actions | ✓          | ✓         |
| `info`    | `#3498DB` | Informational messages, info badges | ✓          | ✓         |

### Background Colors

#### Light Mode

| Color              | Hex       | Usage                        |
| ------------------ | --------- | ---------------------------- |
| `background`       | `#F9F9F9` | Main app background          |
| `surface`          | `#FFFFFF` | Card and surface backgrounds |
| `surfaceSecondary` | `#F0EFEB` | Secondary surface areas      |
| `card`             | `#FFFFFF` | Card components              |
| `actionCard`       | `#E2E2E2` | Action tiles for contrast    |

#### Dark Mode

| Color              | Hex       | Usage                        |
| ------------------ | --------- | ---------------------------- |
| `background`       | `#121212` | Main app background          |
| `surface`          | `#1E1E1E` | Card and surface backgrounds |
| `surfaceSecondary` | `#2A2A2D` | Secondary surface areas      |
| `card`             | `#1E1E1E` | Card components              |
| `actionCard`       | `#2C2C2E` | Action tiles for contrast    |

### Text Colors

#### Light Mode

| Color           | Hex       | Usage                    |
| --------------- | --------- | ------------------------ |
| `text`          | `#1A1A1A` | Primary text             |
| `textSecondary` | `#555555` | Secondary text, labels   |
| `textTertiary`  | `#888888` | Tertiary text, hints     |
| `textInverse`   | `#FFFFFF` | Text on dark backgrounds |

#### Dark Mode

| Color           | Hex       | Usage                     |
| --------------- | --------- | ------------------------- |
| `text`          | `#FFFFFF` | Primary text              |
| `textSecondary` | `#CCCCCC` | Secondary text, labels    |
| `textTertiary`  | `#999999` | Tertiary text, hints      |
| `textInverse`   | `#000000` | Text on light backgrounds |

### Border Colors

#### Light Mode

| Color          | Hex       | Usage                   |
| -------------- | --------- | ----------------------- |
| `border`       | `#D1D1D1` | Standard borders        |
| `borderLight`  | `#E5E5E5` | Light borders, dividers |
| `borderMedium` | `#C0C0C0` | Medium-weight borders   |

#### Dark Mode

| Color          | Hex       | Usage                   |
| -------------- | --------- | ----------------------- |
| `border`       | `#38383A` | Standard borders        |
| `borderLight`  | `#2C2C2E` | Light borders, dividers |
| `borderMedium` | `#3A3A3C` | Medium-weight borders   |

### Input Colors

| Color                | Hex                   | Usage                   | Light Mode       | Dark Mode       |
| -------------------- | --------------------- | ----------------------- | ---------------- | --------------- |
| `inputBackground`    | `#F0EFEB` / `#2C2C2E` | Input field backgrounds | Light: `#F0EFEB` | Dark: `#2C2C2E` |
| `inputBorder`        | `#B17A50`             | Input border color      | ✓                | ✓               |
| `inputBorderFocused` | `#FFC93C`             | Focused input border    | ✓                | ✓               |
| `inputPlaceholder`   | `#999999` / `#8E8E93` | Placeholder text        | Light: `#999999` | Dark: `#8E8E93` |

### Button Colors

| Color             | Hex       | Usage                       | Light Mode | Dark Mode |
| ----------------- | --------- | --------------------------- | ---------- | --------- |
| `buttonPrimary`   | `#B17A50` | Primary button background   | ✓          | ✓         |
| `buttonSecondary` | `#FFC93C` | Secondary button background | ✓          | ✓         |

### Icon Colors

| Color           | Hex                   | Usage           | Light Mode       | Dark Mode       |
| --------------- | --------------------- | --------------- | ---------------- | --------------- |
| `iconPrimary`   | `#B17A50`             | Primary icons   | ✓                | ✓               |
| `iconSecondary` | `#8E8E93` / `#CCCCCC` | Secondary icons | Light: `#8E8E93` | Dark: `#CCCCCC` |
| `iconTertiary`  | `#666666` / `#999999` | Tertiary icons  | Light: `#666666` | Dark: `#999999` |

### Special UI Colors

#### Promotional Banner Colors

| Color             | Hex                        | Usage                         | Light Mode       | Dark Mode       |
| ----------------- | -------------------------- | ----------------------------- | ---------------- | --------------- |
| `promoBackground` | `rgba(177, 122, 80, 0.18)` | Promotional banner background | ✓                | ✓               |
| `promoText`       | `#B17A50` / `#FFC93C`      | Promotional text              | Light: `#B17A50` | Dark: `#FFC93C` |
| `promoTitle`      | `#96623F` / `#FFD54F`      | Promotional title             | Light: `#96623F` | Dark: `#FFD54F` |
| `promoButton`     | `#FFC93C`                  | Promotional button            | ✓                | ✓               |

#### Tab Bar Colors

##### Light Mode

| Color              | Hex                         | Usage                |
| ------------------ | --------------------------- | -------------------- |
| `tabBarBackground` | `rgba(255, 255, 255, 0.85)` | Tab bar background   |
| `tabBarActive`     | `#B17A50`                   | Active tab indicator |
| `tabBarInactive`   | `#8E8E93`                   | Inactive tab text    |

##### Dark Mode

| Color              | Hex                      | Usage                |
| ------------------ | ------------------------ | -------------------- |
| `tabBarBackground` | `rgba(30, 30, 30, 0.95)` | Tab bar background   |
| `tabBarActive`     | `#FFC93C`                | Active tab indicator |
| `tabBarInactive`   | `#8E8E93`                | Inactive tab text    |

#### Overlay Colors

##### Light Mode

| Color           | Hex                      | Usage           |
| --------------- | ------------------------ | --------------- |
| `overlay`       | `rgba(255,255,255,0.9)`  | Modal overlays  |
| `overlayLight`  | `rgba(255,255,255,0.75)` | Light overlays  |
| `overlayMedium` | `rgba(255,255,255,0.3)`  | Medium overlays |
| `overlayDark`   | `rgba(255,255,255,0.2)`  | Dark overlays   |

##### Dark Mode

| Color           | Hex                      | Usage           |
| --------------- | ------------------------ | --------------- |
| `overlay`       | `rgba(18, 18, 18, 0.9)`  | Modal overlays  |
| `overlayLight`  | `rgba(30, 30, 30, 0.75)` | Light overlays  |
| `overlayMedium` | `rgba(60, 60, 60, 0.3)`  | Medium overlays |
| `overlayDark`   | `rgba(60, 60, 60, 0.2)`  | Dark overlays   |

---

## Insurance Type Colors

Used in: `frontend/src/screens/HomeScreen.tsx`, `frontend/src/screens/MarketplaceScreen.tsx`

| Insurance Type             | Hex       | Icon          | Usage                                    |
| -------------------------- | --------- | ------------- | ---------------------------------------- |
| Health & Life              | `#F44336` | medical       | Health insurance policies and categories |
| Motor                      | `#FF9800` | car           | Vehicle insurance policies               |
| Travel                     | `#4CAF50` | airplane      | Travel insurance policies                |
| Property & Business        | `#9C27B0` | business      | Property and business insurance          |
| Engineering & Construction | `#2196F3` | build         | Engineering insurance                    |
| Marine & Transport         | `#00BCD4` | boat          | Marine insurance                         |
| Energy & Power             | `#FFC107` | flash         | Energy sector insurance                  |
| Financial Lines            | `#607D8B` | card          | Financial insurance products             |
| Cyber & Crime              | `#3F51B5` | shield        | Cyber security insurance                 |
| Special & Fine Art         | `#E91E63` | color-palette | Specialty insurance                      |
| Casualty & Liability       | `#FF5722` | warning       | Liability insurance                      |

---

## File Locations

* **Frontend Colors**: `frontend/src/theme/colors.ts`
* **Frontend Theme Context**: `frontend/src/context/ThemeContext.tsx`

---
