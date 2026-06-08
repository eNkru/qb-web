# qb-web

[![Tested](https://img.shields.io/badge/Tested-qBittorrent%20%E2%89%A5%20v4.2.5-brightgreen)](#)

A modern, responsive alternative Web UI for qBittorrent. Built as a single-page application with Vue 3, TypeScript, and Vuetify 3.

## Features

- **Modern UI** — Material Design via Vuetify 3 with multiple themes (Light, Dark, Grey, Luxury, Modern Dark, Crypto, Cyberpunk, Natural, Technology)
- **Responsive** — Works on desktop and mobile
- **i18n** — English, 中文 (Simplified & Traditional), Русский, Türkçe, Nederlands
- **RSS** — Full feed and download rule management
- **Search** — Integrated torrent search
- **Real-time sync** — Incremental polling via qBittorrent's sync API

## Installation

### Download a release build

The latest build artifacts are available from the **Actions** tab on GitHub.
1. Go to [Releases](https://github.com/CzBiX/qb-web/releases) and download the latest `qb-web.zip`.
2. Extract all files.
3. In qBittorrent Web UI Options, enable **Use alternative Web UI** and set **Files location** to the extracted folder.

### Build from source
```bash
yarn install
yarn build
# The output will be in the `dist/` folder.
```
Then point qBittorrent's alternative Web UI to the `dist/` folder.

**Recovery:** If something goes wrong, append `/api/v2/app/setPreferences?json=%7B%22alternative_webui_enabled%22:false%7D` to the URL in your browser to disable the alternative Web UI.

## Development

See [DEV.md](DEV.md) for setup and development commands.

To connect the dev server to a running qBittorrent instance:
```bash
QB_WEBUI_URL=http://<your-qbittorrent-ip>:<port> yarn dev
```

This sets a Vite proxy to forward `/api/v2` requests to your qBittorrent instance, avoiding CORS issues during development.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vue 3.5 (TypeScript) |
| UI | Vuetify 3.7 (Material Design) |
| State | Pinia 2 |
| HTTP | Axios |
| i18n | node-polyglot |
| Build | Vite 6 |
| Test | Vitest 2 + Vue Test Utils 2 |
| Package | Yarn 3 |

## Architecture

```
src/
├── Api.ts              # qBittorrent Web API v2 client
├── App.vue             # Root component, layout, polling, themes
├── main.ts             # Entry point
├── types.ts            # TypeScript interfaces (Torrent, MainData, etc.)
├── consts.ts           # StateType enum
├── filters.ts          # Vue filters (size, duration, time)
├── directives.ts       # Custom directives (v-class)
├── router.ts           # Vue Router
├── components/
│   ├── Torrents.vue    # Main torrent table
│   ├── AddForm.vue     # Add torrent dialog
│   ├── Drawer.vue      # Sidebar with filters
│   ├── MainToolbar.vue # Top toolbar
│   ├── dialogs/        # Settings, RSS, Search, Info, Peers, Logs dialogs
│   └── drawer/         # FilterGroup, DrawerFooter
├── store/              # Pinia stores
│   ├── index.ts        # Main store — torrent data, filtering, polling state
│   ├── config.ts       # User preferences (persisted to localStorage)
│   ├── types.ts        # Store-specific type definitions
│   ├── addForm.ts      # Add torrent form state
│   ├── dialog.ts       # Global dialog state
│   ├── snackBar.ts     # Snackbar notifications
│   └── searchEngine.ts # Torrent search state
├── locale/             # Translations (en, zh-CN, zh-TW, ru, tr, nl)
├── plugins/            # Vuetify, i18n
├── utils/              # Helpers (vue-object-merge, siteMap)
├── sites.ts            # Tracker-to-icon mapping
├── protocolHandler.ts  # magnet: protocol handling
└── assets/             # Icons, styles
```

### Data Flow

1. On startup, `App.vue` registers a `magnet:` protocol handler, reads `#download=` hash params, and resolves the base URL.
2. Fetches initial data via `Api.getMainData()` and `Api.getAppPreferences()`.
3. Polls `/sync/maindata` with a `rid` (response ID) for incremental updates at a configurable interval (default 2000ms).
4. Partial updates are merged into Pinia state using `vue-object-merge`.
5. User actions (pause, resume, delete, add) call the corresponding qBittorrent API endpoints.

### Authentication

1. If `baseUrl` is configured, attempt `getMainData()`.
2. On 401/403, show the login form.
3. After login, fetch main data and preferences, then start polling.

### Component Patterns

Components use `vue-facing-decorator` for class-style component syntax:

```typescript
import { Vue, Component, Watch } from 'vue-facing-decorator';

@Component({ components: { ... } })
export default class MyComponent extends Vue {
  // reactive state, computed via getters, methods, lifecycle hooks
}
```

## Adding a New Site Icon

1. Add the tracker domain and display name to `SITE_MAP` in `src/utils/siteMap.ts`:
   ```typescript
   'new-site.com': { en: 'NewSite', zh: '新站点' },
   ```

2. Register the icon mapping in `src/sites.ts`:
   ```typescript
   'new-site.com': { name: 'NewSite', icon: getSiteIcon('nexusphp') },
   ```
   Use `getSiteIcon('filename')` for a specific icon (file must exist in `src/assets/site_icons/`), or `getSiteIcon('nexusphp')` as the default.

Icon resolution order: exact match → suffix match (subdomains) → base domain fallback → `mdi-server` font icon.

## Common Tasks

**Add a language:** Create `src/locale/[code].ts`, import in `src/locale/index.ts`, add to the `translations` object.

**Add a torrent state filter:** Add to `StateType` in `src/consts.ts`, update `AllStateTypes`, add filter logic in `filteredTorrents` getter, add translation key.

**Add an API endpoint:** Add method to `Api` class in `src/Api.ts`, define types in `src/types.ts`, use `this.axios.get/post`.

**Add a dialog:** Create component in `src/components/dialogs/`, add to `App.vue` with `v-if`, add state to `drawerOptions` or a Pinia store.

## Resources

- [qBittorrent Web API](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1))
- [Vue 3 Docs](https://vuejs.org/)
- [Vuetify 3 Docs](https://vuetifyjs.com/)
