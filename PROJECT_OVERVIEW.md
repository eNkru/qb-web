# Project Overview (qb-web)

This document summarizes the current architecture and behavior of the qb-web repo to make future changes safer and faster.

## What This Project Is
- A single-page alternative Web UI for qBittorrent.
- Built with Vue 2 + TypeScript + Vuetify.
- Talks to qBittorrent’s Web API (`/api/v2`) via Axios.

## Runtime Entry Points
- `src/main.ts` bootstraps Vue, registers plugins, filters, directives, locale, and mounts `App.vue`.
- `src/App.vue` is the app shell and the main orchestrator for initialization and polling.

## High-Level Architecture
- UI is a single-page Vuetify layout:
  - Navigation drawer + toolbar + main content.
  - Main content is the torrent table (`Torrents.vue`).
  - Dialogs are conditionally rendered for actions (info, search, RSS, settings, etc.).
- State management is centralized in Vuex (`src/store/index.ts`) with module slices.
- API access is wrapped by `src/Api.ts`.

## Data Flow and Polling
- On app creation (`App.vue`):
  - Registers a `magnet:` protocol handler and reads `#download=` hash params.
  - Resolves the base URL (from config or current location).
  - Fetches main data (sync) and preferences.
  - Starts polling `getMainData()` on `config.updateInterval` (default 2000 ms).
- Polling uses the qBittorrent sync endpoint (`/sync/maindata`) and merges partial updates into the Vuex state.

## State (Vuex)
Main root state:
- `rid`: sync revision id used for incremental updates.
- `mainData`: synced torrent + server state.
- `preferences`: qBittorrent preferences payload.
- `pasteUrl`: magnet/url from clipboard.
- `needAuth`: when auth is required before using the API.
- `query`: search string used by the torrents table.

Modules:
- `config` (`src/store/config.ts`):
  - Config is persisted in `localStorage` under `qb-config`.
  - Default config includes `baseUrl`, `updateInterval`, `pageOptions`, filters, locale, and theme settings.
- `dialog`, `snackBar`, `addForm`, `searchEngine` are separate Vuex modules in `src/store`.

## API Layer
- `src/Api.ts` wraps Axios with base URL normalization.
- Uses `api/v2` endpoints for:
  - Auth (`/auth/login`)
  - Sync (`/sync/maindata`, `/sync/torrentPeers`)
  - Torrents (`/torrents/*`)
  - RSS (`/rss/*`)
  - Search plugins and tasks (`/search/*`)
  - App settings (`/app/preferences`, `/app/setPreferences`)
- In development, the base URL remains `api/v2` to leverage the dev-server proxy.

## UI Composition
Core components:
- `App.vue`: layout, polling, global dialogs, theme handling.
- `Torrents.vue`: main table view with actions (pause/resume/delete/recheck/etc).
- `Drawer.vue` + `MainToolbar.vue`: navigation and filters.
- Dialogs in `src/components/dialogs/*` for details, settings, RSS, search, trackers, etc.

## Filters and Directives
- Global filters in `src/filters.ts` for size, duration, timestamps, progress.
- Custom directive `v-class:NAME` toggles a class on an element (used to manage layout classes).

## Localization
- `src/locale/*` holds translation dictionaries.
- `node-polyglot` is used; `tr()` is exposed via the `i18n` plugin.
- Default locale is matched from `navigator.languages`, overridable via config.

## Theme and UI Modes
- Vuetify theme can be `light`, `dark`, or custom `grey`.
- `themeMode` lives in config, and there is a migration from legacy `darkMode`.
- `displaySpeedInTitle` optionally updates the document title with current speeds.

## Build and Dev
- Dev: `yarn run serve`
- Build: `yarn run build`
- Test: `yarn run test:unit`
- Lint: `yarn run lint`

## Notable Conventions and Behaviors
- Incremental sync data is merged into Vuex state using a custom object merge (`src/utils/vue-object-merge.ts`).
- Torrent filtering is based on state, category, tag, and site, plus a free-text query.
- Clipboard paste on the app container triggers "add URL" behavior.

## Where to Look for Changes
- API or qBittorrent compatibility: `src/Api.ts`, `src/types.ts`.
- Polling / update interval / auth flow: `src/App.vue`.
- Torrent table behavior or columns: `src/components/Torrents.vue`.
- Settings UI and config persistence: `src/components/dialogs/settingsDialog/*`, `src/store/config.ts`.
- i18n: `src/locale/*`, `src/plugins/i18n.ts`.

## Known Gaps / Things to Watch
- Router is defined but unused (`src/router.ts` is not imported).
- `dist/` is committed but not used for runtime in dev.

