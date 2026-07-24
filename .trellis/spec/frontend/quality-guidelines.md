# Quality Guidelines

> Lint, test, and verification standards for qb-web.

---

## Commands

| Command | Purpose |
|---------|---------|
| `yarn lint` | ESLint fix on `.vue/.js/.ts` |
| `yarn typecheck` | `vue-tsc --noEmit` |
| `yarn test` / `yarn test:unit` | Vitest single run |
| `yarn test:watch` | Vitest watch |
| `yarn build` | Production Vite build → `dist/public/` |
| `yarn dev` | Vite dev server; optional `QB_WEBUI_URL=…` proxy |

After substantive edits, run **lint + typecheck**; run **unit tests** when touching stores, utils, filters, or tested components.

---

## ESLint (highlights)

Config: `eslint.config.js` (flat config).

- Vue: `pluginVue` **flat/strongly-recommended**
- TS: `@typescript-eslint` recommended (with project overrides)
- `vue/multi-word-component-names`: **off** (single-word names exist)
- `vue/no-v-html`: **off**
- `vue/require-default-prop`: **off**
- `comma-dangle`: `always-multiline`
- `no-console` / `no-debugger`: warn in dev, error in production builds
- Tests under `tests/unit/**`: console/debugger off; jest-like globals for historical test style

`lint-staged` runs `eslint --fix` on `*.{js,vue,ts}`.

---

## Testing conventions

- Runner: **Vitest**, `environment: 'jsdom'`, `globals: true`
- Location: `tests/unit/**/*.{test,spec}.{js,ts}`
- Shared mocks: `tests/unit/utils.ts` (`mock`, `mockBaseTorrent`)
- Pinia tests: `createPinia` + `setActivePinia`, then `useXStore()` and `$patch`
- Class components with vue-facing-decorator are awkward to mount; existing tests sometimes re-implement methods on plain objects (`FilterGroup.spec.ts`) — acceptable when UTILS-style extraction is not done yet

Prefer testing:

1. Store getters/actions and merge behavior
2. Pure utils (`torrentIsState`, formatters)
3. Critical component logic when feasible

---

## Forbidden / discouraged patterns

| Avoid | Prefer |
|-------|--------|
| New raw `axios.create` in components | `import api from '@/Api'` |
| Duplicating maindata poll loops | `App.vue` + `useMainStore.updateMainData` |
| Hardcoded English in new UI | `$t` / `tr` + locale files |
| New site icons only in assets | Also update `siteMap.ts` + `sites.ts` (README) |
| Leaving `console.log` debug noise | Remove; `no-console` warns |
| Expanding `alert()` for UX | `useDialogStore` / snackbar (legacy alert remains in one preference failure path — do not copy) |

---

## Accessibility / UX notes (as implemented)

- Login and dialogs use Vuetify dialogs with labels on fields.
- No dedicated a11y test suite; do not claim WCAG compliance in specs.
- Responsive behavior uses Vuetify `useDisplay` / breakpoints (`phone-layout`, footer hidden on `xs`).

---

## Security / API notes

- Cookies: Axios `withCredentials: true` for session auth.
- Dev CORS: Vite proxy via `QB_WEBUI_URL` (see `DEV.md` / `vite.config.ts`).
- Login allows 403 as handled status for wrong credentials (`Api.login`).
- Do not log passwords or full preference dumps in new code.

---

## Pre-merge mental checklist

- [ ] Types updated in `types.ts` if API shape changed
- [ ] Locale keys added for all languages if new UI strings
- [ ] Store vs component responsibility still matches [state-management](./state-management.md)
- [ ] `yarn lint` && `yarn typecheck` && relevant `yarn test`
