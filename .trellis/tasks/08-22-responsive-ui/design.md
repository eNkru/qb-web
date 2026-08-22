# Design: Unified responsive torrent table (one code path, all widths)

## Architecture & boundaries

Everything lives in the existing `src/components/Torrents.vue` plus one small dialog fix. No new components, no store changes, no `v-data-iterator`.

```
Torrents.vue
├─ isNarrow  = display.smAndDown   (new computed)
├─ isCompact = display.xs          (new computed, xs tier)
├─ headers getter: hiddenColumns ∩ breakpoint tiers   (modified)
├─ compact sort bar (v-if="isNarrow") above .table-wrapper
└─ .table-wrapper :class="{ 'narrow-list': isNarrow }"  → drives all narrow CSS
```

## Column tiers

| Tier | Columns | Rule |
|---|---|---|
| Core | select, name, size, progress, dlspeed | visible at every width (subject to `hiddenColumns`) |
| Standard | upspeed, state | hidden below `smAndDown`… **kept at sm**, hidden only at `xs` |
| Secondary | tracker, priority, num_complete, num_incomplete, eta, ratio, added_on | auto-hidden below `smAndDown` |

Effective visibility = `allColumns` − `hiddenColumns` − breakpoint tier. Implementation detail: a per-column `tier` field on `allColumns` entries (`'core' | 'standard' | 'secondary'`) and one filter in the existing `headers` getter — header-click sorting then automatically only offers visible columns.

Width budget check @320px (xs): select ~40 + name flex + size ~64 + progress ~90 + speed cell ~110 ≈ fits with name wrapping. Tune during validation; tiers are data, not structure.

## Item template changes (minimal, structural markup unchanged)

- Add a stable class to every `<td>` (`cell-name`, `cell-size`, `cell-progress`, `cell-dlspeed`, …) so CSS can re-flow cells without touching logic.
- Name cell: allow wrapping when narrow (CSS overrides `.icon-label { white-space: normal }` inside `.narrow-list`); keep ellipsis behavior at md+.
- No new elements except nothing — state icon already lives in the name cell; state text column simply drops out at xs.

## Narrow CSS (`.narrow-list` wrapper class, toggled by `isNarrow`)

- `:deep(thead) { display: none }` (replaces the dead `hide-headers` hook).
- Each `tr.torrent-row`: `display: grid`, card look — surface background, border-radius, margin-bottom, subtle border/shadow matching theme (use theme variables, not hardcoded colors).
- Grid areas re-flow cells: row 1 `checkbox | name`; row 2 `progress` full-width; row 3 `size · dlspeed · upspeed/state-text`. At md+ none of this applies (plain table).
- Keep `white-space: nowrap` off name only; other cells stay single-line.
- Selected-row highlight (`.torrent-row--selected`) works unchanged — same class, restyled background.
- `.progress-cell { min-width: 110px }` → relax to ~90px under `.narrow-list`.

## Compact sort bar (visible only when `isNarrow`)

One slim row directly above `.table-wrapper`:

- select-all checkbox + `isIndeterminate` support (reuse existing handlers),
- torrent count text,
- `v-select` of sortable columns (from `allColumns`, localized titles via existing `tr()` keys),
- asc/desc toggle icon-button.

All write the existing persisted `sortBy` shape `[{ key, order }]`; page/items-per-page remain on the unchanged footer.

## RssRulesDialog fix

Add `useDisplay()` + `:fullscreen="display.xs"` (pattern parity with `SettingsDialog.vue` etc.); width stays `50%` elsewhere.

## Compatibility notes

- No persisted-schema changes; `sortBy`/`itemsPerPage`/`hiddenColumns` semantics unchanged.
- Context menu payload untouched → parent `ContextMenu.vue` needs zero changes.
- Dead code (`resizableColumns.ts`, `columnWidths`, `hide-headers` binding) left as-is except the new CSS replaces reliance on the dead hook.
- i18n: sort bar reuses existing column-title keys; add a key only if no suitable label exists for asc/desc.

## Trade-offs

| Decision | Alternative considered | Why |
|---|---|---|
| Same v-data-table everywhere | All-widths card rewrite | Preserves sorting/column-config/density verbatim (user priority D4/D5) |
| JS-toggled wrapper classes | Pixel media queries | Matches repo convention (R6); logic testable alongside tier filtering |
| Tier data on `allColumns` | Separate narrow header list | Single source of truth; getter stays tiny |

## Risks

- Fighting Vuetify internals with `:deep()` grid CSS on `<tr>/<td>` — mitigated by the fact that the repo already restyles rows heavily this way; validate early at 375px before polishing.
- Vuetify updates could shift internal DOM — acceptable; same risk profile as existing styles.

## Rollback

Two files changed (`Torrents.vue`, `RssRulesDialog.vue`). No migrations. Revert branch to roll back.
