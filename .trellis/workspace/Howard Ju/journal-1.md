# Journal - Howard Ju (Part 1)

> AI development session journal
> Started: 2026-07-24

---



## Session 1: Bootstrap frontend Trellis specs

**Date**: 2026-07-24
**Task**: Bootstrap frontend Trellis specs
**Branch**: `main`

### Summary

Filled .trellis/spec/frontend from codebase (Vue3 class components, Pinia, Api, Vitest); archived 00-bootstrap-guidelines; committed specs and Trellis scaffolding.

### Main Changes

- Detailed change bullets were not supplied; see the summary above.

### Git Commits

| Hash | Message |
|------|---------|
| `2d168ad` | (see git log) |
| `32baf31` | (see git log) |

### Testing

- Validation was not recorded for this session.

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 2: Responsive torrent list: unified single-code-path UI

**Date**: 2026-08-22
**Task**: Responsive torrent list: unified single-code-path UI
**Branch**: `feat/responsive-ui`

### Summary

Made the torrent list fully responsive with one code path (user pivoted away from two-presentation card plan). Adaptive column tiers (core/standard/secondary) via shared isColumnVisible(); table-layout:fixed + width hints so nowrap+ellipsis works and overflow is impossible; card-styled rows below smAndDown with polished spacing/shadows/state chips/sort bar; RssRulesDialog fullscreen on xs; footer margin + stat-row wrap fixes. PR #25. Follow-up candidates: detail-dialog sub-tables, search dialog table, column resize/reorder.

### Main Changes

- Detailed change bullets were not supplied; see the summary above.

### Git Commits

| Hash | Message |
|------|---------|
| `7226df7` | (see git log) |
| `e51c8bc` | (see git log) |
| `29b327d` | (see git log) |
| `14c23eb` | (see git log) |
| `a481f5d` | (see git log) |
| `ebd1e19` | (see git log) |
| `7472825` | (see git log) |

### Testing

- Validation was not recorded for this session.

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 3: Fix security audit vulnerabilities (axios, vitest)

**Date**: 2026-09-15
**Task**: Fix security audit vulnerabilities (axios, vitest)
**Branch**: `fix/security-audit-vulnerabilities`

### Summary

Resolved all yarn npm audit advisories on branch fix/security-audit-vulnerabilities: axios ^1.9.0 -> ^1.18.0 (GHSA-hcpx-6fm6-wx23), vitest ^3.2.6 -> ^4.1.11 (GHSA-82fw-gwwq-j7x9). Added vite ^6.4.3 resolution to prevent vitest 4 from pulling a second vite 8. Verified: audit clean, 52/52 tests pass, build and eslint clean. Pre-existing typecheck error in src/Api.ts (missing 'node' types) left out of scope. PR #26 opened.

### Main Changes

- Detailed change bullets were not supplied; see the summary above.

### Git Commits

| Hash | Message |
|------|---------|
| `945daa3` | (see git log) |

### Testing

- Validation was not recorded for this session.

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 4: Fix qBittorrent 5.2 incompatibilities (pause 404 + full API audit)

**Date**: 2026-10-22
**Task**: fix-pause-404-qbittorrent-5.2
**Branch**: `fix/qbittorrent-5.2-compat`

### Summary

User-reported `POST /torrents/pause` 404 on qBittorrent 5.2 expanded into a repo-wide audit of all 46 endpoints in `src/Api.ts`, verified against the 5.2.4 WebAPI source. Fixed all six findings while keeping the declared minimum (>= 4.2.5) working via dual-param sends instead of version detection. PR #31 merged as `50bda8b`; task archived.

### Main Changes

- `torrents/pause|resume` (removed in 5.2) -> `torrents/stop|start` (valid since 4.1).
- State strings: `pausedDL|pausedUP` -> also accept `stoppedDL|stoppedUP`, plus new `forcedMetaDL`; `getStateInfo` no longer throws `Unknown state`; state lists and Paused/Resumed filters updated; locale keys added (en, zh-CN, zh-TW, nl, ru).
- `torrents/add`: send `stopped` alongside `paused` so "add stopped" is honoured on 5.0+.
- `torrents/editTracker`: send `url` alongside `origUrl` (renamed in 5.2.4 only).
- Login: accept 401 -> return `'Fails.'` (was raw axios error).
- Trackers dialog: label status 5 (error) and 6 (unreachable).
- Corrected misnamed `torrent_state.forceDL` locale key to `forcedDL`.

### Git Commits

| Hash | Message |
|------|---------|
| `2d3a4cf` | fix: support qBittorrent 5.2 API changes |
| `55da12a` | chore(task): record PR for qBittorrent 5.2 compat task |
| `50bda8b` | Merge pull request #31 from eNkru/fix/qbittorrent-5.2-compat |

### Testing

- `npm run test` 70 passed (api.spec: stop/start URLs, login 401, dual `paused`/`stopped`, dual `origUrl`/`url`; utils.spec: stopped-state filtering).
- `eslint` clean on changed files.
- `npm run typecheck`: only the pre-existing `process` typing error in `src/Api.ts` (present on `main` before the change).

### Status

[OK] **Completed**

### Next Steps

- None - task complete, PR #31 merged, task archived to `archive/2026-10/`.
