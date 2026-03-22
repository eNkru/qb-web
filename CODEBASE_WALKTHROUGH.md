# Codebase Walkthrough: qb-web

This guide provides a detailed breakdown of the `qb-web` repository structure and how its components interact.

## Directory Structure

### `/src` - Application Source Code
The heart of the application.
- **`main.ts`**: Entry point. Sets up Vue, Vuetify, Vuex, and global configurations.
- **`App.vue`**: The root component. Handles the main layout, theme switching, and the core polling loop (`getMainData`).
- **`Api.ts`**: A centralized wrapper for all qBittorrent API calls using Axios.
- **`store/`**: Vuex state management. Organized into modules (`addForm`, `config`, `dialog`, `searchEngine`, `snackBar`).
- **`components/`**: UI components.
    - **`Torrents.vue`**: The main torrent list view.
    - **`dialogs/`**: All modal windows (settings, RSS, search, torrent info).
    - **`drawer/`**: Sidebar navigation and filters.
- **`locale/`**: Translation files for internationalization.
- **`plugins/`**: Custom Vue plugins (Vuetify, i18n).
- **`utils/`**: Helper functions (e.g., `vue-object-merge.ts` for state syncing).

### `/tests` - Unit Tests
- Uses Jest and Vue Test Utils to verify core logic (filters, utils, store).

### `/public` - Static Assets
- Contains the base `index.html`, icons, and the web manifest.

### Root Configuration Files
- **`package.json`**: Dependencies and scripts (`serve`, `build`, `lint`).
- **`tsconfig.json`**: TypeScript compiler configuration.
- **`vue.config.js`**: Vue CLI configuration (e.g., devServer proxy).

## Key Workflows

### 1. Data Polling Loop
The app maintains a continuous sync with the qBittorrent server.
- Located in `App.vue`'s `mounted` hook.
- Calls `updateMainData()` which uses `Api.getMainData()`.
- Uses a `rid` (Response ID) to request only changes since the last update.

### 2. State Management
- `src/store/index.ts` holds the `mainData` (all torrents, categories, etc.).
- When `getMainData` returns data, it's merged into the state using `src/utils/vue-object-merge.ts`.

### 3. Adding Torrents
- Handled by `src/components/AddForm.vue`.
- Supports magnet links, URLs, and file uploads.
- Can be triggered by clicking the "Add" button or pasting into the window.

### 4. Customizing UI
- Configuration is stored in `src/store/config.ts` and persisted to `localStorage`.
- Includes themes (light, dark, grey) and update intervals.
