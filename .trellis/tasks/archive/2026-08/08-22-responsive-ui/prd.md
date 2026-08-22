# Responsive UI for narrow windows and mobile

## Goal

Make the qb-web UI fully usable on narrow windows and mobile devices with **one code path serving all viewport widths**. The torrent list must present essential per-torrent information without horizontal scrolling or clipped content; every function that works today must keep working, and desktop users should notice no behavioral change.

## Background (codebase evidence)

### Torrent list table — root cause
- `src/components/Torrents.vue` renders the torrent list with Vuetify `v-data-table` (line ~198), `fixed-header density="compact"`, custom `#item` slot rendering raw `<tr>/<td>` (lines ~246–330). No virtual scroll.
- 13 data columns in `allColumns` (~lines 485–500) plus a select column (`48px`).
- `:deep(thead th), :deep(tbody td) { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }` (~line 943) and `.progress-cell { min-width: 110px }` (~line 1110) mean the table cannot compress below ~1000px of content width.
- Existing "phone layout" (`phone-layout` class + `isXs`) only restyles the pagination footer (~lines 1016–1034) and hides toolbar buttons (line ~122); the table itself is untouched.
- The `hide-headers` class binding (line ~203) has no corresponding CSS rule — dead hook, safe to ignore or repurpose.

### Interaction & persistence mechanics (must be preserved)
- Selection is `selectedRows: string[]` (hashes); row click toggles selection (`toggleSelection`), right-click / long-press (`onRowContextMenu`) emits `torrent-contextmenu` `{x, y, savePath, hash}`; select-all checkbox in header column; details open via `showInfo()` / window event `show-torrent-details`.
- Sort (`sortBy`), page, items-per-page are `v-data-table` v-models persisted via `configStore` (`sortBy`, `pageOptions.itemsPerPage`); `hiddenColumns` persists per-column visibility.

### Shell & conventions
- Breakpoint convention is `useDisplay()` (mostly `xs`, some `smAndDown`); exactly one CSS media query exists (App.vue ~1537). New responsive behavior should toggle wrapper classes from JS breakpoints rather than adding pixel media queries.
- Known secondary gap: `RssRulesDialog.vue` fixed `width="50%"` with no fullscreen → overflows on mobile. Other dialogs already go fullscreen on xs.
- Trackers/Peers tables inside `InfoDialog.vue` have the same nowrap issue (deferred, see Out of Scope).

## Requirements

- R1: **Single presentation**: the existing `v-data-table` engine and one item template serve ALL widths. Below `smAndDown` (<960px) the list switches to a compact card-styled rendering of the same rows (header row hidden, cells re-flowed via CSS); at md+ the table renders exactly as today.
- R2: **Adaptive columns**: below `lg` (<1280px) a defined secondary tier of columns (tracker, priority, seeds/peers, eta, ratio, added_on) is auto-hidden regardless of `hiddenColumns`; at `xs` (<600px) further compression applies (see design tier table). Name wraps instead of clipping; progress bar stays readable; no horizontal scrolling at ≥320px.
- R3: **Function preservation** at every width: row-click selection + multi-select + select-all, context menu via right-click AND long-press with identical payload, bulk actions, details dialog, pagination with persistence.
- R4: Sorting works at every width: header-click sorting at md+ (unchanged); when the header row is hidden, a compact sort bar (column picker + asc/desc toggle + select-all + torrent count) appears above the list, bound to the same persisted `sortBy`.
- R5: `hiddenColumns` user config keeps working: it filters columns at md+ as today, and additionally intersects with the breakpoint tiers at narrow widths.
- R6: Breakpoint logic uses Vuetify display thresholds (`useDisplay`) toggling wrapper classes; no new ad-hoc pixel media queries; existing phone-layout toolbar/footer/drawer behavior stays intact.
- R7: `RssRulesDialog.vue` goes fullscreen on xs like the other dialogs (no overflow on mobile).

## Key Decisions

- D1 (**supersedes the earlier two-presentation plan**, user pivot): ONE code path serves desktop and mobile — no separate card component, no `v-data-iterator`. Unified responsive table: adaptive columns + CSS card-styled rows when narrow.
- D2: Narrow switch point is **`smAndDown` (<960px)** with further compression at `xs` (<600px). A half-width desktop window (~700–900px) cannot fit 14 nowrap columns either.
- D7 (**amendment during verification**, user-approved): secondary-tier cutoff raised from `smAndDown` to **`lg` (<1280px)** — at ~1200px (half-screen windows) all 13 columns still overflowed and hid upspeed. New behavior: lg+ shows all columns; md (960–1279px) shows the compact set with native header sorting; <960px card mode as before. Column resize/reorder explicitly deferred (Out of Scope).
- D3: **Focused scope**: fix only the torrent list plus the trivial `RssRulesDialog` fullscreen fix. Detail-dialog sub-tables/file tree are deferred.
- D4: **Hard constraint**: all current functions keep working; if a trade-off arises, function preservation wins over visual redesign.
- D5: Architecture resolved by user choice: option (a) unified responsive table — rejected the all-widths card rewrite because it would reshape sorting/column-config functions and reduce desktop density.
- D6: No new touch affordances (e.g., kebab buttons) in this task; long-press already fires `contextmenu` on mobile browsers — parity with current interaction model. Touch discoverability enhancements deferred.

## Acceptance Criteria

- [ ] At md+ (≥960px): table identical to today — header-click sorting, `hiddenColumns` menu, density, footer.
- [ ] At <960px: header row hidden; each row renders as a card-like block (name + state icon leading, progress bar spanning, size/speeds inline) with no horizontal scrolling at 900px, 768px, 375px, or 320px.
- [ ] Secondary-tier columns are auto-hidden below 960px and reappear at md+; additional xs compression per design tiers; name text wraps visibly instead of clipping.
- [ ] At <960px a visible sort control reorders the list and persists after reload; select-all + selected-count available in that control row.
- [ ] Selection: tap toggles selection, select-all works, selected-row highlight visible in both presentations, bulk actions/context menu operate correctly.
- [ ] Context menu opens via right-click (desktop widths) and long-press (mobile); payload unchanged (`{x, y, savePath, hash}`).
- [ ] Pagination works and persists across modes/reloads; phone-layout footer restyle intact.
- [ ] `hiddenColumns` still governs md+ columns and composes correctly with breakpoint tiers.
- [ ] `RssRulesDialog` renders fullscreen on xs with no horizontal overflow.

## Out of Scope

- Desktop (≥ md) visual changes beyond what adaptive CSS requires.
- Column reordering / drag-and-drop persistence.
- Reviving dead code (`src/directives/resizableColumns.ts`, `configStore.columnWidths`).
- Trackers/Peers tables & `TorrentContent.vue` inside details dialog → follow-up task.
- Column resizing / drag-reorder (requested during verification; revisit after living with D7 — resizing doesn't create space under nowrap+ellipsis; dedicated task if still wanted).
- Search dialog results table → follow-up candidate.
- New touch affordances (kebab menus, swipe actions).

## Open Questions

None — architecture (D5), scope (D3), and constraints (D4) all resolved by user.
