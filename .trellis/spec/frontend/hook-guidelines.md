# Shared Behavior (Mixins / Composition)

> This project does **not** use a `composables/` or `hooks/` directory. Shared component behavior is mostly class mixins and Pinia stores.

---

## Reality check

| Pattern | Present? | Where |
|---------|----------|--------|
| Vue Composition composables (`useXxx` functions outside Pinia) | Rare / none as shared modules | Inline `setup()` only in a few SFCs |
| Class mixins | Yes | `src/mixins/hasTask.ts` |
| Abstract class components | Yes | `src/components/dialogs/baseTorrentInfo.ts` |
| Pinia stores as shared logic | Yes | `src/store/*` |

When agents look for “hooks”, map the request to **mixin**, **base class**, or **store action**.

---

## Mixin: `HasTask`

File: `src/mixins/hasTask.ts`

Purpose: run an async callback on an interval with cancel on unmount.

- `setTaskAndRun(call, interval?)` — store callback, optional interval (default 2000ms)
- `runTask()` — await callback; if it returns truthy or `destroy`, stop; else `setTimeout` again
- `cancelTask()` / `beforeUnmount` — clear timer and set `destroy`

Used by torrent info panels via `BaseTorrentInfo`.

---

## Base class: `BaseTorrentInfo`

File: `src/components/dialogs/baseTorrentInfo.ts`

- Extends `HasTask`
- `@Prop isActive: boolean`
- Subclasses implement `fetchInfo(): Promise<void>`
- When active: poll every 5000ms; when inactive: `cancelTask()`

**When adding a new torrent detail tab that needs refresh:** extend `BaseTorrentInfo`, implement `fetchInfo`, pass `isActive` from the parent tabs container (see Peers / Trackers / TorrentContent patterns).

---

## Composition API in components

`LoginForm`, `GlobalDialog`, `GlobalSnackBar` keep logic inside `setup()` and call Pinia stores directly. Do not extract a shared composable unless the same block is copied three or more times (see code-reuse guide).

---

## Pinia as the shared “hook”

Cross-component behavior that is not UI markup belongs in stores:

- Auth / maindata / preferences → `useMainStore`
- localStorage UI prefs → `useConfigStore`
- Modal prompts → `useDialogStore`
- Toasts → snackbar store
- Add-torrent form visibility → `useAddFormStore` (`addForm.ts`)
- Search UI → `useSearchEngineStore`

---

## Anti-patterns

- Do not create `src/hooks/` or `src/composables/` for a single-use helper.
- Do not reimplement interval polling with raw `setInterval` in a new dialog if `HasTask` / `BaseTorrentInfo` already fits.
- Do not use Options API mixins arrays (`mixins: []`); this codebase uses class extends.
