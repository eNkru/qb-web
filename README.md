# qb-web

[![Tested](https://img.shields.io/badge/Tested-qBittorrent%20%E2%89%A5%20v4.2.5-brightgreen)](#)
[![Release](https://img.shields.io/github/v/release/CzBiX/qb-web?include_prereleases)](https://github.com/CzBiX/qb-web/releases/latest)
[![Gitter](https://badges.gitter.im/qb-web/community.svg)](https://gitter.im/qb-web/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![CI](https://github.com/CzBiX/qb-web/workflows/CI/badge.svg)](https://github.com/CzBiX/qb-web/actions)

A modern, responsive alternative Web UI for qBittorrent. Built as a single-page application with Vue 2, TypeScript, and Vuetify.

## Features

- **Modern UI** — Material Design via Vuetify with multiple themes (Light, Dark, Grey, Luxury, Modern Dark, Crypto, Cyberpunk, Natural, Technology)
- **Responsive** — Works on desktop and mobile
- **i18n** — English, 中文, Русский, Türkçe, Nederlands
- **RSS** — Full feed and download rule management
- **Search** — Integrated torrent search
- **Real-time sync** — Incremental polling via qBittorrent's sync API

[TODO board](https://github.com/CzBiX/qb-web/projects/2)

## Screenshots

![Main](./screenshot/main.png)
![Add Torrents](./screenshot/add-torrents.png)
![RSS](./screenshot/rss.png)
![RSS Rule](./screenshot/rss-rule.png)

## Installation

Download the latest release from [GitHub Releases](https://github.com/CzBiX/qb-web/releases/latest).

1. Extract all files.
2. In qBittorrent Web UI Options, enable **Use alternative Web UI** and set **Files location** to the extracted folder (without the `public` suffix).

**Recovery:** If something goes wrong, append `/api/v2/app/setPreferences?json=%7B%22alternative_webui_enabled%22:false%7D` to the URL to disable the alternative Web UI.

See the [Wiki](https://github.com/CzBiX/qb-web/wiki/How-to-use) for more details, including [running multiple Web UIs](https://github.com/CzBiX/qb-web/wiki/Running-multi-WebUI-at-the-same-time).

## Development

See [DEV.md](DEV.md) for setup and development commands.

To connect the dev server to a running qBittorrent instance:
```bash
QB_WEBUI_URL=http://<your-qbittorrent-ip>:<port> yarn serve
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vue 2.7 (TypeScript) |
| UI | Vuetify 2.7 (Material Design) |
| State | Vuex 3 |
| HTTP | Axios |
| i18n | node-polyglot |
| Build | Vue CLI 5 |
| Test | Jest 27 + Vue Test Utils |
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
├── components/
│   ├── Torrents.vue    # Main torrent table
│   ├── AddForm.vue     # Add torrent dialog
│   ├── Drawer.vue      # Sidebar with filters
│   ├── MainToolbar.vue # Top toolbar
│   ├── dialogs/        # Settings, RSS, Search, Info dialogs
│   └── drawer/         # FilterGroup, DrawerFooter
├── store/              # Vuex modules
│   ├── index.ts        # Root store, main data, filtering
│   ├── config.ts       # User preferences (persisted to localStorage)
│   ├── addForm.ts
│   ├── dialog.ts
│   ├── snackBar.ts
│   └── searchEngine.ts
├── locale/             # Translations (en, zh-CN, zh-TW, ru, tr, nl)
├── plugins/            # Vuetify, i18n
├── utils/              # Helpers (vue-object-merge, siteMap)
├── sites.ts            # Tracker-to-icon mapping
└── assets/             # Icons, styles
```

### Data Flow

1. On startup, `App.vue` registers a `magnet:` protocol handler, reads `#download=` hash params, and resolves the base URL.
2. Fetches initial data via `Api.getMainData()` and `Api.getAppPreferences()`.
3. Polls `/sync/maindata` with a `rid` (response ID) for incremental updates at a configurable interval (default 2000ms).
4. Partial updates are merged into Vuex state using `vue-object-merge`.
5. User actions (pause, resume, delete, add) call the corresponding qBittorrent API endpoints.

### Authentication

1. If `baseUrl` is configured, attempt `getMainData()`.
2. On 401/403, show the login form.
3. After login, fetch main data and preferences, then start polling.

### Component Patterns

Components use `vue-class-component` with `vue-property-decorator`:
```typescript
@Component({
  components: { ... },
  computed: { ...mapState([...]), ...mapGetters([...]) },
})
export default class MyComponent extends Vue { }
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

**Add a dialog:** Create component in `src/components/dialogs/`, add to `App.vue` with `v-if`, add state to `drawerOptions` or Vuex.

## Resources

- [qBittorrent Web API](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1))
- [Vue 2 Docs](https://v2.vuejs.org/)
- [Vuetify 2 Docs](https://v2.vuetifyjs.com/)
- [Project Wiki](https://github.com/CzBiX/qb-web/wiki)
