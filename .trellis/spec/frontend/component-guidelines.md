# Component Guidelines

> Component patterns used in qb-web.

---

## Dominant pattern: class components (`vue-facing-decorator`)

Most SFCs use class-style components:

```typescript
import { Vue, Component, Prop, Watch, Emit, toNative } from 'vue-facing-decorator';

@Component({ components: { Child } })
class MyComponent extends Vue {
  @Prop() readonly value!: string
  local = false

  @Watch('value')
  onValue(v: string) { /* … */ }

  @Emit()
  close() { /* payload optional */ }
}
export default toNative(MyComponent)
// Some files export the class without toNative — match the nearest sibling file.
```

Reference: `src/components/drawer/FilterGroup.vue`, `src/components/Torrents.vue`, `src/App.vue`, `src/components/dialogs/InfoDialog.vue`.

### Decorators in use

| Decorator | Role |
|-----------|------|
| `@Component` | Register options / child components |
| `@Prop` / `@Prop({ type: Boolean })` | Props; often `readonly …!` |
| `@Watch` | Watchers |
| `@Emit` | Event emission helpers |
| `toNative` | Bridge class component to Vue 3 runtime (common on larger components) |

`experimentalDecorators: true` is required (`tsconfig.json`).

---

## Secondary pattern: Composition API (`defineComponent` + `setup`)

A few newer/global UI pieces use Composition API instead of class components:

- `src/components/LoginForm.vue` — `defineComponent` + `setup`, `reactive` / `toRefs`
- `src/components/GlobalDialog.vue` — `setup` + Pinia + `computed` / `ref` / `watch`
- `src/components/GlobalSnackBar.vue` — same style

**Rule for new code:** Match the style of the file you edit. For brand-new top-level feature components, class + decorator remains the majority pattern; Composition API is acceptable for small global widgets already written that way.

Do **not** introduce Options API without decorators as a third style.

---

## UI library

- Use **Vuetify 3** primitives (`v-app`, `v-dialog`, `v-btn`, `v-data-table` patterns in Torrents, etc.).
- Icons: MDI font names (`mdi-…`) or site image icons; font icons detected via `icon.startsWith('mdi-')` (see `FilterGroup`).
- Theming / display: `useTheme()`, `useDisplay()` from `vuetify` inside components when needed (`App.vue`, `GlobalDialog.vue`).

---

## Dialogs

### Feature dialogs

- Live under `src/components/dialogs/` (nested folders for Settings / Search).
- Typically controlled with `v-model` / `v-if` from `App.vue` or parent (`drawerOptions.showRss`, etc.).
- Prefer `@Prop` + `@Emit` for open/close rather than inventing a second global store per dialog.

### Global confirm / input dialog

- Configure via Pinia `useDialogStore` (`showDialog`, `asyncShowDialog`).
- Rendered once as `GlobalDialog` in `App.vue`.
- Types: `DialogType`, `DialogConfig` in `src/store/types.ts`.

### Torrent detail sub-panels

- Shared polling base: `src/components/dialogs/baseTorrentInfo.ts` extends `HasTask`.
- Subclasses implement `fetchInfo()` and honor `isActive` prop.

---

## Templates and i18n

- User-visible strings: `$t('…')` in templates or `tr(…)` from `@/locale` in script (see `GlobalDialog.vue`).
- Add keys to **all** locale files when introducing new copy (`src/locale/*.ts`).

---

## Props / events

- Props: explicit `@Prop` or Composition props; avoid silent optional props without types when the value is required for correctness.
- Events: `@Emit` or `emit` from setup; LoginForm still declares `emits: ['input']` in options.
- `v-model` on dialogs is common (`model-value` / `v-model` with Vuetify 3).

---

## Styles

- Prefer scoped SCSS in the SFC (`<style lang="scss" scoped>`).
- Use Vuetify utility classes (`d-flex`, `text-primary`) where the codebase already does.

---

## Anti-patterns

- Do not add a new HTTP client; call `import api from '@/Api'`.
- Do not put long-lived torrent sync state in a random component; use `useMainStore`.
- Do not invent React-style hooks folders; see [Hook Guidelines](./hook-guidelines.md).
- Avoid mounting every dialog always-on; follow `v-if` gated mounts in `App.vue` for heavy dialogs.
