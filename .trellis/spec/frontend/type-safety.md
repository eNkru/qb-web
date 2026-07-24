# Type Safety

> TypeScript conventions as practiced in qb-web.

---

## Compiler settings

From `tsconfig.json`:

- `strict: true`
- `experimentalDecorators: true` (required for vue-facing-decorator)
- `useUnknownInCatchVariables: false` (catch variables are not forced to `unknown`)
- Path alias `@/*` → `src/*`
- `skipLibCheck: true`

Typecheck command: `yarn typecheck` (`vue-tsc --noEmit`).

---

## Where types live

| Kind | File |
|------|------|
| qBittorrent domain models | `src/types.ts` (`BaseTorrent`, `Torrent`, `MainData`, `MainDataUpdate`, `Preferences`, RSS, search, …) |
| Store shapes / dialog enums | `src/store/types.ts` |
| Config interface | exported from `src/store/config.ts` |
| Drawer UI models | `src/components/types.ts` |
| Enums for torrent filters | `src/consts.ts` (`StateType`) |

When adding an API field, extend the interface that matches the WebAPI payload rather than casting at call sites.

---

## API typing

- `Api` methods return `AxiosPromise<T>` or `Promise<T>` after `handleResponse` (returns `resp.data`).
- POST bodies often use `URLSearchParams` or `FormData` (file torrents).
- Some methods still take `params: any` or `extra?: any` — match existing style when extending the same private helpers (`actionTorrent` / `actionTorrents`).

Singleton:

```typescript
import api from '@/Api';
```

---

## Practical typing rules (as enforced)

ESLint (`eslint.config.js`):

- `@typescript-eslint/no-explicit-any`: **off** — `any` appears in stores, API helpers, and preferences blobs.
- `@typescript-eslint/no-non-null-assertion`: **off** — non-null assertions are used.
- Unused vars: warn; allow `_` prefix and names matching `^(Vue|Base|_)`.

**Guidance for new code:** prefer real interfaces for new domain fields; use `any` only where the codebase already models loosely typed JSON (preferences, dialog button maps). Do not tighten the whole preferences object in a drive-by change.

---

## Vue / decorator typing

- Props: `readonly foo!: Type` with `@Prop`.
- Class fields are component state.
- Export pattern often `export default toNative(ClassName)` for Vue 3 compatibility.

`.vue` modules: `src/shims-vue.d.ts` / `env.d.ts` provide module declarations.

---

## Nullability patterns

- `mainData?: MainData` / `preferences: null` until loaded; getters guard with early empty arrays.
- Config fields use `| null` for “unset” vs defaults applied in the `config` getter.
- Torrents in maindata are `Record<string, BaseTorrent>`; UI `Torrent` adds `hash`.

---

## Anti-patterns

- Do not invent parallel type names for the same WebAPI entity (`Torrent` vs local copy) without a clear mapping.
- Do not cast away `MainDataUpdate` partials incorrectly — full vs incremental is handled in `updateMainData`.
- Do not disable `strict` for convenience.

---

## Verification

```bash
yarn typecheck
yarn lint
```
