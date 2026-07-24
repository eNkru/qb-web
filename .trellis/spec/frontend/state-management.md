# State Management

> Pinia is the only global state layer.

---

## Store inventory

| Store | File | Responsibility | Persistence |
|-------|------|----------------|-------------|
| `useMainStore` | `store/index.ts` | rid, mainData, preferences, needAuth, pasteUrl, query; torrent grouping getters; preference update API | In-memory (server-backed) |
| `useConfigStore` | `store/config.ts` | UI prefs: baseUrl, interval, filters, columns, theme, drawer, locale, … | `localStorage` key `qb-config` |
| `useDialogStore` | `store/dialog.ts` | Global dialog config + `asyncShowDialog` | In-memory |
| snackbar | `store/snackBar.ts` | Toast config | In-memory |
| add form | `store/addForm.ts` | Add-torrent dialog open + download item | In-memory |
| search engine | `store/searchEngine.ts` | Search plugins / plugin manager open | In-memory |

Types for several of these live in `src/store/types.ts`.

---

## Patterns

### Define a store

```typescript
export const useMainStore = defineStore('main', {
  state: (): RootState => ({ /* … */ }),
  getters: { /* … */ },
  actions: { /* … */ },
});
```

- State factory returns a typed object when types exist (`RootState`, `DialogState`).
- Getters derive lists/groups from `mainData` (e.g. `allTorrents` injects `hash` via `safeMerge`).
- Actions mutate state and call `api` for network I/O.

### Using stores in class components

Assign at field init (Pinia active after `app.use(pinia)` in `main.ts`):

```typescript
configStore = useConfigStore()
// or call inside methods / lifecycle
```

Example: `FilterGroup.vue` uses `configStore = useConfigStore()` and `updateConfig` on select.

### Using stores in Composition API

```typescript
const configStore = useConfigStore();
const mainStore = useMainStore();
```

Example: `LoginForm.vue`, `GlobalDialog.vue`.

### Config updates

Always go through `useConfigStore().updateConfig({ key, value })`:

- Nested plain objects are **merged** with `safeMerge` into existing `userConfig[key]`.
- Scalars replace.
- Every update rewrites full `userConfig` JSON to localStorage.

Defaults live in `defaultConfig` inside `config.ts`; effective config is `safeMerge({}, defaultConfig, userConfig)` getter `config`.

### Main data sync

1. `App.vue` polls `api.getMainData(rid)`.
2. `updateMainData(payload)` applies full replace or partial merge (`stateMerge` / removals).
3. Components read getters (`allTorrents`, group-by-*, preferences), not raw axios responses.

Do not bypass the store by caching maindata only in a component.

### Dialogs / snackbars

- Imperative UI: `dialogStore.showDialog` / `asyncShowDialog` returning a Promise of button id.
- Clone payload with `cloneDeep` on show to avoid caller mutation.

---

## Lodash / merge helpers

- Prefer `lodash-es` imports already used (`map`, `groupBy`, `sortBy`, `cloneDeep`, `isPlainObject`).
- Object merge for untrusted partials: `safeMerge` (`utils/safe-merge.ts`).
- Reactive deep merge for maindata patches: `stateMerge` (`utils/vue-object-merge.ts`).

---

## Anti-patterns

- Do not introduce Vuex or a second global event bus.
- Do not write raw `localStorage` for UI prefs outside `config.ts` (except reading via `loadConfig` already there).
- Do not keep filter selection only in component state if it should survive reload — use `config.filter.*`.
- Prefer store actions for multi-step API + state updates (`updatePreferencesRequest`) over scattering API calls without state refresh.

---

## Tests

- Pinia: `setActivePinia(createPinia())` in `beforeAll` / per test; `$patch` to reset.
- Example: `tests/unit/store/index.spec.ts`, `tests/unit/store/config.spec.ts`.
- Component logic that is hard under vue-facing-decorator may be tested by extracting behavior or plain object doubles (`FilterGroup.spec.ts`).
