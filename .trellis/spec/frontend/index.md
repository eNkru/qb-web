# Frontend Development Guidelines

> Conventions for **qb-web**: Vue 3 alternative Web UI for qBittorrent.

---

## Stack (source of truth)

| Layer | Technology |
|-------|------------|
| Framework | Vue 3.5 + TypeScript (strict) |
| UI | Vuetify 3 |
| State | Pinia |
| HTTP | Axios (`src/Api.ts` singleton) |
| i18n | node-polyglot (`src/locale/`, `src/plugins/i18n.ts`) |
| Build | Vite 6 |
| Test | Vitest + Vue Test Utils |
| Package | Yarn 3 |

Path alias: `@/*` → `src/*` (`tsconfig.json`, `vitest.config.ts`).

---

## Guidelines Index

| Guide | Description | Status |
|-------|-------------|--------|
| [Directory Structure](./directory-structure.md) | `src/` layout, where new files go | Filled |
| [Component Guidelines](./component-guidelines.md) | Class components, dialogs, Vuetify | Filled |
| [Hook Guidelines](./hook-guidelines.md) | Mixins / shared behavior (no hooks dir) | Filled |
| [State Management](./state-management.md) | Pinia stores, config, dialogs | Filled |
| [Type Safety](./type-safety.md) | Types, `any` usage, API shapes | Filled |
| [Quality Guidelines](./quality-guidelines.md) | Lint, test, verify commands | Filled |

---

## Related project docs

- `README.md` — architecture, data flow, common tasks
- `DEV.md` — yarn scripts and dev proxy (`QB_WEBUI_URL`)

**Language**: All Trellis documentation in **English**.
