# Grey Theme Implementation

## Overview
Added a third theme option "Grey" alongside Light, Dark, and Auto modes. The Grey theme provides a softer, more comfortable viewing experience with reduced contrast and muted colors.

## Changes Made

### 1. Config Store (`src/store/config.ts`)
- Added `themeMode: 'light' | 'dark' | 'grey' | null` to Config interface
- Added `themeMode: null` to defaultConfig
- Keeps `darkMode` for backward compatibility

### 2. Vuetify Configuration (`src/plugins/vuetify.ts`)
- Added explicit theme configuration with default light theme colors
- Base colors defined (will be overridden for grey mode)

### 3. App Component (`src/App.vue`)
- Replaced `@Watch('config.darkMode')` with `@Watch('config.themeMode')`
- Added grey theme color application logic:
  - `primary: '#7ba7d6'` - Soft blue
  - `secondary: '#9e9e9e'` - Muted grey
  - `accent: '#a5c9e8'` - Very soft blue accent
  - `background: '#f5f5f5'` - Soft grey background
  - `surface: '#fafafa'` - Light grey surface
- Added migration logic for users with old `darkMode` setting

### 4. Drawer Footer (`src/components/drawer/DrawerFooter.vue`)
- Renamed `darkModes` to `themeModes` with 4 options: Light, Dark, Grey, Auto
- Renamed `currentDarkMode` to `currentThemeMode`
- Updated icon getter to include grey mode icon (`mdi-brightness-6`)
- Updated watcher to save `themeMode` instead of `darkMode`

### 5. Translations (All locale files)
Added "grey" translation:
- English: "Grey"
- 中文简体: "灰色"
- 中文繁體: "灰色"
- Русский: "Серый"
- Türkçe: "Gri"
- Nederlands: "Grijs"

## Grey Theme Colors

### Color Palette
```
Primary:    #7ba7d6  (Soft blue - less saturated than default #1976d2)
Secondary:  #9e9e9e  (Muted grey)
Accent:     #a5c9e8  (Very soft blue)
Background: #f5f5f5  (Soft grey - warmer than pure white)
Surface:    #fafafa  (Light grey for cards/surfaces)
```

### Design Philosophy
- Reduced contrast for eye comfort
- Warmer tones compared to stark white
- Softer blues that are less vibrant
- Maintains readability while being gentler

## User Experience

### Theme Selection
1. Click the brightness icon in the drawer footer (bottom-left)
2. Choose from:
   - **Light** - Standard bright theme
   - **Dark** - Dark mode
   - **Grey** - Soft, muted theme (NEW)
   - **Auto** - Follows system preference

### Migration
- Users with existing `darkMode` setting will be automatically migrated to `themeMode`
- No data loss or breaking changes

## Technical Notes

### How It Works
- Grey mode uses Vuetify's light theme as base
- Colors are dynamically applied via `Object.assign(theme.themes.light, {...})`
- When switching away from grey, colors reset to defaults
- Theme preference saved to localStorage via Vuex config store

### Future Enhancements
Could add:
- User-customizable grey theme colors in settings
- Additional theme presets (Sepia, High Contrast, etc.)
- Per-component color overrides
- Theme preview before applying

## Testing
To test the grey theme:
1. Run `yarn serve`
2. Open the app in browser
3. Click brightness icon in drawer
4. Select "Grey" option
5. Verify soft colors are applied
6. Check that switching between themes works correctly
7. Reload page to verify theme persists
