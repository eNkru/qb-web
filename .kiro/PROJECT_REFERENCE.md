# qb-web Project Reference

## Project Overview
qb-web is an alternative Web UI for qBittorrent built with Vue 2, TypeScript, and Vuetify 2. It's a Single Page Application (SPA) with features including RSS management, torrent search, responsive design, and internationalization.

**Tested with:** qBittorrent ≥ v4.2.5

## Tech Stack
- **Framework:** Vue 2.7.16 with TypeScript
- **UI Library:** Vuetify 2.7.2 (Material Design)
- **State Management:** Vuex 3.6.2
- **Router:** Vue Router 3.6.5
- **HTTP Client:** Axios 0.27.2
- **i18n:** node-polyglot 2.4.0
- **Build Tool:** Vue CLI 5.0.8
- **Testing:** Jest 27 with Vue Test Utils
- **Package Manager:** Yarn 3.5.0

## Project Structure

### Core Directories
```
src/
├── Api.ts                 # Main API client for qBittorrent Web API
├── App.vue               # Root component with main layout
├── main.ts               # Application entry point
├── router.ts             # Vue Router configuration
├── types.ts              # TypeScript type definitions
├── consts.ts             # Constants (StateType enum)
├── filters.ts            # Vue filters for formatting
├── directives.ts         # Custom Vue directives
├── components/           # Vue components
│   ├── AddForm.vue
│   ├── Drawer.vue
│   ├── Torrents.vue
│   ├── dialogs/         # Dialog components
│   └── drawer/          # Drawer-specific components
├── store/               # Vuex store modules
│   ├── index.ts         # Root store
│   ├── config.ts        # User config persistence
│   ├── addForm.ts
│   ├── dialog.ts
│   ├── snackBar.ts
│   ├── searchEngine.ts
│   └── types.ts
├── locale/              # i18n translations
│   ├── index.ts
│   ├── en.ts
│   ├── zh-CN.ts
│   ├── zh-TW.ts
│   ├── ru.ts
│   ├── tr.ts
│   └── nl.ts
├── plugins/             # Vue plugins
│   ├── vuetify.ts
│   └── i18n.ts
├── utils/               # Utility functions
└── assets/              # Static assets (images, styles)
```

## Key Files

### API Layer (`src/Api.ts`)
- Single API client class wrapping qBittorrent Web API v2
- Uses Axios with credentials and URL-encoded form data
- Handles authentication, torrents, RSS, search, preferences
- Dev proxy configured to avoid CORS issues
- Base URL can be changed dynamically for multi-instance support

**Key Methods:**
- `login()` - Authentication
- `getMainData(rid)` - Sync endpoint for torrents/categories/tags/server state
- `addTorrents()` - Add torrents via URL or file upload
- `getRssItems()`, `getRssRules()` - RSS management
- `startSearch()`, `getSearchResults()` - Search functionality
- `getAppPreferences()`, `setPreferences()` - Settings management

### Type Definitions (`src/types.ts`)
Comprehensive TypeScript interfaces for:
- `Torrent`, `BaseTorrent` - Torrent data structures
- `MainData` - Sync API response (torrents, categories, tags, server_state)
- `ServerState` - Global transfer info
- `Category`, `Tag` - Organization structures
- `RssItem`, `RssNode`, `RssRule` - RSS feed structures
- `Preferences` - qBittorrent settings (100+ fields)
- `SearchPlugin`, `SearchTaskResponse` - Search functionality
- `TorrentProperties` - Detailed torrent info

### State Management (`src/store/`)

**Root Store (`index.ts`):**
- Manages main data sync with qBittorrent
- Torrent filtering (by state, category, tag, search)
- Selection management
- Helper functions: `useStore()`, `useMutations()`, `useState()`

**Config Store (`config.ts`):**
- Persists user preferences to localStorage
- Settings: `baseUrl`, `locale`, `updateInterval`, `darkMode`, `displaySpeedInTitle`
- Functions: `saveConfig()`, `loadConfig()`

**Other Modules:**
- `addForm.ts` - Add torrent form state
- `dialog.ts` - Global dialog management
- `snackBar.ts` - Toast notifications
- `searchEngine.ts` - Search plugin management

### Main App (`src/App.vue`)
- Root component with navigation drawer, toolbar, main content
- Polls `getMainData()` at configured interval (default updates)
- Handles authentication flow
- Protocol handler for magnet links
- Paste detection for adding torrents
- Dark mode support (manual or system preference)
- Responsive layout (phone vs desktop)

### Internationalization (`src/locale/`)
- Uses node-polyglot for translations
- Supported languages: en, zh-CN, zh-TW, ru, tr, nl
- Auto-detects browser language
- User can override in settings
- Export: `tr()` function for translations

## Development Workflow

### Setup
```bash
yarn install
```

### Development Server
```bash
yarn run serve
# Runs on http://localhost:8000
# Proxies /api requests to QB_WEBUI_URL (default: http://127.0.0.1:8080)
```

**Important:** Make sure qBittorrent is running with Web UI enabled before starting the dev server.

If your qBittorrent instance is on a different port or host, set the environment variable:
```bash
# Different port
QB_WEBUI_URL=http://localhost:9090 yarn serve

# Different host
QB_WEBUI_URL=http://192.168.1.100:8080 yarn serve

# Remote instance
QB_WEBUI_URL=https://example.com:8080 yarn serve
```

**Troubleshooting:** If you get `ECONNREFUSED` errors, verify:
1. qBittorrent is running
2. Web UI is enabled (Tools → Options → Web UI)
3. The port matches your QB_WEBUI_URL setting
4. Firewall allows connections to qBittorrent

### Build
```bash
yarn run build
# Output: dist/public/
```

### Testing
```bash
yarn run test:unit
```

### Linting
```bash
yarn run lint
```

## Configuration Files

### `vue.config.js`
- Output directory: `dist/public`
- Public path: `./` (relative for deployment)
- Dev server on port 8000
- Proxy `/api` to qBittorrent instance
- PWA configuration (theme colors, icons)
- Sass deprecation warnings silenced
- Injects `GIT_TAG` environment variable

### `tsconfig.json`
- Target: ESNext
- Strict mode enabled
- Experimental decorators (for vue-class-component)
- Path alias: `@/*` → `src/*`
- Includes: `src/**/*`, `tests/**/*`

### `.eslintrc.js`
- TypeScript ESLint parser
- Vue plugin
- Extends: `@vue/typescript/recommended`, `plugin:vue/essential`

## Component Patterns

### Vue Class Components
Uses `vue-class-component` and `vue-property-decorator`:
```typescript
@Component({
  components: { ... },
  computed: { ...mapState([...]), ...mapGetters([...]) },
  methods: { ...mapMutations([...]) }
})
export default class MyComponent extends Vue {
  // Properties become reactive data
  // Methods are component methods
  // @Watch decorator for watchers
}
```

### Vuex Integration
- Use `mapState`, `mapGetters`, `mapMutations` in component options
- Declare typed properties in class for mapped values
- Helper functions available: `useStore()`, `useMutations()`, `useState()`

### Vuetify Components
- Material Design components (v-app, v-navigation-drawer, v-data-table, etc.)
- Responsive breakpoints: `$vuetify.breakpoint.xsOnly`, `lgAndUp`, etc.
- Theme: `$vuetify.theme.dark` for dark mode

## API Integration

### Authentication Flow
1. Check if `baseUrl` is configured
2. If on GitHub Pages or localhost, show login form
3. Otherwise, attempt `getMainData()`
4. On 401/403, show login form
5. After successful login, fetch main data and preferences

### Data Sync Pattern
- Poll `getMainData(rid)` with response ID for incremental updates
- Server returns only changed data when rid is provided
- Update Vuex store with new data
- Schedule next poll based on `config.updateInterval`

### Error Handling
- API methods use `handleResponse()` to extract data
- Login validates status 200 or 403
- Components should handle promise rejections

## Deployment

### Installation Steps
1. Extract release files
2. In qBittorrent Web UI settings:
   - Enable "Use alternative Web UI"
   - Set "Files location" to extracted folder (without `/public` suffix)

### Recovery
If UI breaks, append to URL:
```
/api/v2/app/setPreferences?json=%7B%22alternative_webui_enabled%22:false%7D
```

## Common Tasks

### Adding a New Language
1. Create `src/locale/[code].ts` with translations object
2. Import in `src/locale/index.ts`
3. Add to `translations` object
4. Type will be inferred automatically

### Adding a New Torrent State Filter
1. Add enum value to `StateType` in `src/consts.ts`
2. Update `AllStateTypes` array
3. Add filter logic in store's `filteredTorrents` getter
4. Add translation key for the state name

### Adding a New API Endpoint
1. Add method to `Api` class in `src/Api.ts`
2. Define TypeScript types in `src/types.ts` if needed
3. Use `this.axios.get/post` with proper params
4. Return promise or use `.then(Api.handleResponse)`

### Adding a New Dialog
1. Create component in `src/components/dialogs/`
2. Add to `App.vue` template with `v-if` condition
3. Add state property to `drawerOptions` or Vuex store
4. Use `v-model` for show/hide control

### Modifying Store State
1. Define state interface in `src/store/types.ts`
2. Add state properties in module
3. Create mutations for state changes
4. Create actions for async operations
5. Create getters for computed values
6. Map in components using `mapState`, `mapMutations`, etc.

## Testing

### Unit Tests Location
```
tests/unit/
├── components/
│   └── FilterGroup.spec.ts
├── store/
│   ├── config.spec.ts
│   └── index.spec.ts
├── filters.spec.ts
└── utils.spec.ts
```

### Test Utilities
- `tests/unit/utils.ts` - Helper functions for tests
- Uses `@vue/test-utils` for component testing
- Jest configuration in `jest.config.js`

## Important Notes

### State Types Typo
There's a typo in `src/consts.ts`:
```typescript
Paused = 'pasued',  // Should be 'paused'
```
This is likely kept for backward compatibility.

### Vuetify 2 Deprecations
Sass deprecation warnings are silenced in `vue.config.js` as they come from Vuetify 2 and are not actionable in this project.

### Protocol Handler
`src/protocolHandler.ts` registers the app to handle magnet links and checks URL for download parameters on startup.

### Build Info
`src/buildInfo.ts` likely contains version/build information (not read in this scan).

## Resources
- [qBittorrent Web API Documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1))
- [Vue 2 Documentation](https://v2.vuejs.org/)
- [Vuetify 2 Documentation](https://v2.vuetifyjs.com/)
- [Project Wiki](https://github.com/CzBiX/qb-web/wiki)
