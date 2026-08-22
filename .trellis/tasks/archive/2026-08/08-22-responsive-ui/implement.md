# Implementation Plan

## Ordered checklist

1. **Tier the columns**: add `tier` field to `allColumns` entries in `Torrents.vue` (`core`: name/size/progress/dlspeed/select; `standard`: upspeed/state; `secondary`: tracker/priority/seeds/peers/eta/ratio/added_on). Extend `headers` getter: filter out tiers not visible at current breakpoint (`isNarrow` drops `secondary`; `isCompact` additionally drops `standard`). Confirm header-click sort menu reflects filtered set.
2. **Cell classes**: add stable `cell-*` classes to each `<td>` in the `#item` slot.
3. **Wrapper + narrow CSS**: bind `.table-wrapper :class="{ 'narrow-list': isNarrow }"`; write `.narrow-list` styles (hide thead, grid-reflow `tr.torrent-row` into cards, wrap name, relax progress min-width, themed card surface). Verify at 375px early before polish.
4. **Compact sort bar**: `v-if="isNarrow"` row above list — select-all checkbox (existing `toggleSelectAll`/`isAllSelected`/`isIndeterminate`), count, column `v-select`, order toggle; writes existing persisted `sortBy`.
5. **Name wrapping**: override `nowrap` for name cell under `.narrow-list` only; confirm md+ density unchanged.
6. **RssRulesDialog**: `useDisplay()` + `:fullscreen="display.xs"`.
7. **i18n**: reuse column-title keys; add missing labels only if needed (`src/locale/`).

## Validation commands

```bash
yarn lint
yarn typecheck
yarn test
yarn dev
```

Manual matrix:
- Widths: 1280 / 960 boundary live-resize / 900 / 768 / 375 / 320.
- md+: header-click sort, hiddenColumns toggle menu, density, footer — byte-for-byte behavior.
- <960: header row gone, card-styled rows, secondary columns absent, standard columns present until xs; no horizontal scroll at any tested width; name wraps.
- Sort bar: appears only <960, sorts asc/desc, persists after reload; select-all + indeterminate + count correct.
- Selection: tap toggles, highlight visible in card mode, bulk actions from context menu work.
- Context menu: right-click at ≥960 AND long-press at mobile width; payload intact (details/delete/category actions).
- Pagination persists across reload/mode switch; phone footer restyle intact.
- `hiddenColumns` × tiers composition (e.g., hide `size` manually → gone at all widths).
- `RssRulesDialog` at 375px fullscreen, no overflow.

## Risky files & rollback points

- `src/components/Torrents.vue` central — steps are additive and independently revertible; the `narrow-list` class gates ALL new visual behavior, so md+ regression risk is limited to the `headers` getter change (step 1), which is trivially revertible.
- `src/components/dialogs/RssRulesDialog.vue` trivial.

## Pre-start checks

- Inline workflow: run `trellis-before-dev` for frontend spec index + component/state guidelines before editing.
- After implementation: create follow-up task for details-dialog sub-tables + search dialog table.
