# Directory Structure

> How frontend code is organized in qb-web.

---

## Overview

Single-package SPA. No monorepo packages. Almost all app code lives under `src/`. Unit tests live under `tests/unit/`.

---

## Directory Layout

```
src/
├── main.ts              # createApp, Pinia, router, i18n, Vuetify, filters, directives
├── App.vue              # Shell: drawer, toolbar, torrents, dialogs, polling, auth
├── Api.ts               # qBittorrent WebAPI v2 client (default export singleton)
├── types.ts             # Domain types (Torrent, MainData, Preferences, RSS, search, …)
├── consts.ts            # StateType enum / AllStateTypes
├── filters.ts           # formatSize, formatDuration, etc. + registerFilters
├── directives.ts        # registerDirectives
├── router.ts            # Vue Router (minimal SPA routes)
├── sites.ts             # Tracker domain → site icon mapping
├── protocolHandler.ts   # magnet: / #download= handling
├── buildInfo.ts         # Build metadata side-effect import
├── components/
│   ├── *.vue            # Top-level UI (Torrents, Drawer, LoginForm, …)
│   ├── types.ts         # Component-local types (e.g. drawer Group/Child)
│   ├── dialogs/         # Feature dialogs + baseTorrentInfo mixin class
│   │   ├── settingsDialog/
│   │   └── searchDialog/
│   └── drawer/          # FilterGroup, DrawerFooter
├── store/               # Pinia stores (one concern per file)
├── locale/              # Translation maps (en, zh-CN, zh-TW, ru, tr, nl)
├── plugins/             # vuetify.ts, i18n.ts
├── mixins/              # Class-component mixins (hasTask)
├── utils/               # Pure helpers (torrent state, merge, siteMap)
├── directives/          # Directive implementations (e.g. resizableColumns)
└── assets/              # Icons, styles, site_icons/

tests/unit/
├── components/          # Component-focused unit tests
├── store/               # Store unit tests
├── utils.ts             # Shared mocks (mock, mockBaseTorrent)
└── *.spec.ts            # filters, utils, etc.
```

---

## Module Organization

| Concern | Location | Rule |
|---------|----------|------|
| qBittorrent HTTP | `src/Api.ts` | Add methods on `Api` class; use `URLSearchParams` / `FormData` like existing methods |
| Domain types | `src/types.ts` | Prefer extending existing interfaces over ad-hoc shapes in components |
| Store-only types | `src/store/types.ts` | Dialog/snackbar/root state shapes stay here |
| UI shell / polling | `src/App.vue` | Auth gate, maindata poll loop, global dialog mounts |
| Feature dialogs | `src/components/dialogs/` | One dialog (or subfolder) per feature; wire in `App.vue` with `v-if` |
| User UI prefs | `src/store/config.ts` | Persisted to `localStorage` key `qb-config` |
| Torrent list data | `src/store/index.ts` (`useMainStore`) | Sync/maindata merge lives here |
| i18n strings | `src/locale/<code>.ts` | Register in `src/locale/index.ts` |
| Site icons | `src/utils/siteMap.ts` + `src/sites.ts` + `src/assets/site_icons/` | See README “Adding a New Site Icon” |

### Where to put new work

1. **New API endpoint** → method on `Api` in `src/Api.ts` + types in `src/types.ts`.
2. **New dialog** → `src/components/dialogs/<Name>.vue`, mount from `App.vue` (or parent dialog) with `v-if` / `v-model`.
3. **New filter group / drawer UI** → `src/components/drawer/`.
4. **New global notification** → `useDialogStore` / `useSnackBarStore`, not ad-hoc `alert` (legacy `alert` still exists in main store failure path).
5. **New pure helper** → `src/utils/` (search first).
6. **New torrent state filter** → `StateType` / `AllStateTypes` in `src/consts.ts`, grouping in `useMainStore`, UI + locale keys.

---

## Naming Conventions

| Kind | Convention | Examples |
|------|------------|----------|
| Vue SFCs | PascalCase file names | `LoginForm.vue`, `SettingsDialog.vue` |
| Pinia stores | `useXxxStore` in `store/<name>.ts` | `useMainStore`, `useConfigStore` |
| Mixins / base classes | camelCase file, class name PascalCase | `hasTask.ts` → `HasTask` |
| Utils | camelCase or kebab for multi-word files | `safe-merge.ts`, `siteMap.ts` |
| Tests | `*.spec.ts` under `tests/unit/` mirroring area | `tests/unit/store/index.spec.ts` |
| Locale files | BCP-ish codes | `en.ts`, `zh-CN.ts` |

Import style: prefer `@/…` over relative paths that climb out of a feature folder.

---

## Examples

- Shell + data flow: `src/App.vue`, `README.md` Architecture / Data Flow
- API surface: `src/Api.ts`
- Main list UI: `src/components/Torrents.vue`
- Persisted UI config: `src/store/config.ts`
