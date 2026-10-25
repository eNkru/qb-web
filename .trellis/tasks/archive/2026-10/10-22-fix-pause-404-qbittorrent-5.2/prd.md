# Fix qBittorrent 5.2 incompatibilities (pause 404 + full API audit)

## Goal

The Web UI must work fully against qBittorrent 5.2 while keeping the declared
minimum (qBittorrent ≥ v4.2.5, per README) working. This task started from the
user-reported `POST /torrents/pause → 404` and expanded into a repo-wide audit
of every API call, verified against the qBittorrent 5.2.4 source
(`release-5.2.4` tag, `src/webui/api/*`) and the official WebAPI changelog.

## Confirmed facts (audit findings)

All HTTP calls go through `src/Api.ts` (46 distinct endpoints; no stray
axios/fetch elsewhere). Verified per-endpoint against 5.2.4 source.

### Broken on qBittorrent 5.2

1. **`torrents/pause` / `torrents/resume` removed** (user-reported 404).
   Routes `stopAction`/`startAction` exist since Web API 2.8.0 / qBittorrent 4.1.
   - `src/Api.ts:169` `actionTorrents('pause', …)` → 404
   - `src/Api.ts:173` `actionTorrents('resume', …)` → 404
   - Fix: send `stop` / `start`. Works on all supported versions.

2. **Torrent state strings renamed**: `pausedDL`/`pausedUP` → `stoppedDL`/
   `stoppedUP` (since 5.2.0, `serialize_torrent.cpp`); new state `forcedMetaDL`.
   - `src/components/Torrents.vue:481+` `getStateInfo` **throws
     `Error('Unknown state')`** for all three → torrent table render breaks as
     soon as any torrent is stopped (currently masked because stop itself 404s).
   - `src/utils/index.ts:4-7` state lists still use `pausedDL`/`pausedUP`
     (`dlState`, `completeState`).
   - `src/utils/index.ts:27` `StateType.Paused` check `startsWith('paused')`
     → Paused filter empty; Resumed filter wrong.
   - Locale keys `torrent_state.stopped*` / `forcedMetaDL` missing
     (`src/locale/en.ts` etc.).
   - Fix: accept both old and new strings everywhere (4.x support retained).

3. **`torrents/add` param `paused` → `stopped`** (renamed in 5.0).
   - `src/components/AddForm.vue:144,292` sends `paused` → silently ignored
     on 5.x; "add stopped" toggle no-ops.
   - Fix: send both `paused` (≤4.x) and `stopped` (≥5.0); each version reads
     only its own param and ignores the other (verified in 4.2.5 & 5.2.4 source).
   - Note: AddForm's legacy `root_path` param is read by neither 4.2.5 nor
     5.2.4 (pre-existing no-op, out of scope).

4. **`torrents/editTracker` param `origUrl` → `url`** (renamed in 5.2.4 only;
   5.2.0–5.2.3 still require `origUrl`).
   - `src/Api.ts:236` sends `origUrl` → 400 "Missing required parameters: url"
     on 5.2.4.
   - Fix: send both `origUrl` and `url` (each version requires its own param
     present; extras ignored — verified in source).

5. **`auth/login` returns 401 for bad credentials** (was 200 + "Fails.") on
   all 5.2.x.
   - `src/Api.ts:61-74` validateStatus accepts 2xx/403 only → axios rejects →
     `LoginForm.vue` catch shows raw "Request failed with status code 401".
   - Login with valid credentials unaffected (204 fix already merged).
   - Fix: accept 401, return `'Fails.'` (UX-only defect).

6. **`torrents/trackers` new status values `5` (Tracker error) and
   `6` (Unreachable)** (WebAPI 2.13.0, present since 5.2.0).
   - `src/components/dialogs/Trackers.vue:56-65` status map ends at index 4 →
     blank label for 5/6 (cosmetic).
   - New response fields (`next_announce`, `min_announce`, `endpoints`) are
     additive → harmless.
   - Fix: extend the status map.

### Verified unaffected (no action needed)

- `app/version`, `app/webapiVersion`, `app/shutdown`, `app/preferences`,
  `app/setPreferences` (no fields the UI sends were removed; the 2.11.6
  `max_ratio` pair constraint doesn't apply — UI sends none).
- `transfer/info`, `transfer/toggleSpeedLimitsMode` (204 OK — no body expected).
- `sync/maindata` (only additive fields: `share_limit_action`,
  `has_tracker_warning/error/other_announce_error`; `use_subcategories` key
  removed but unused by UI; `rid`/`full_update`/`*_removed` protocol unchanged).
- `sync/torrentPeers` (additive `i2p_dest`).
- `torrents/add` response shapes — already fixed (commits 4005c5f, a6dde3a).
- All other torrent actions: `delete`, `setForceStart`, `toggleSequentialDownload`,
  `reannounce`, `recheck`, `setCategory`, `increasePrio`, `decreasePrio`,
  `topPrio`, `bottomPrio`, `setLocation`, `filePrio`, `properties`,
  `pieceStates`, `files`, `categories`.
- `log/main`; all RSS endpoints (`items`, `addFeed`, `removeItem`,
  `refreshItem`, `moveItem`, `rules`, `setRule`, `removeRule`); all search
  endpoints (`start`, `stop`, `results`, `plugins`, `enablePlugin`,
  `updatePlugins` — status values "Running"/"Stopped" unchanged).
- UI's `POST /torrents/trackers` (read endpoint sent as POST): 5.2 allows both
  GET and POST for all endpoints (`m_allowedMethod` never populated).

## Requirements

1. `pauseTorrents` POSTs `/torrents/stop`; `resumeTorrents` POSTs
   `/torrents/start` (unit-tested).
2. State handling accepts `stoppedDL`/`stoppedUP`/`forcedMetaDL` in addition to
   legacy strings: `getStateInfo`, `torrentIsState`, state lists, i18n keys.
   No `Error('Unknown state')` throw for any state emitted by 4.2.5–5.2.4.
3. `addTorrents` sends `stopped` in addition to `paused` (the add form
   keeps a single `paused` UI state; the API layer mirrors it).
4. `editTracker` sends `url` in addition to `origUrl`.
5. Login treats 401 like 403/"Fails.".
6. Trackers status map covers values 5 and 6.

## Acceptance Criteria

- Unit tests: stop/start URLs asserted; login 401 → 'Fails.'; addTorrents
  includes both `paused` and `stopped` params; editTracker includes both
  `origUrl` and `url`.
- Manual/scripted: torrent with state `stoppedUP` renders with icon, color, and
  translated label; Paused filter matches stopped torrents.
- `npm run test` passes; type-check/lint clean.

## Out of Scope

- Version detection / dual-endpoint fallback schemes (dual-param approach
  covers all supported versions without detection).
- `root_path` legacy no-op param (pre-existing, not 5.2-related).
- Additive response fields (trackers `endpoints`, peers `i2p_dest`, etc.).
- Renaming public method names (`pauseTorrents`/`resumeTorrents`) or UI labels.
- qBittorrent < 4.1 support (below declared minimum).

## Key Decisions

- Dual-param sends (`paused`+`stopped`, `origUrl`+`url`) instead of version
  detection: verified both 4.2.5 and 5.2.4 read their own param and ignore
  extras — simplest cross-version strategy.
- Keep legacy state strings accepted alongside new ones (min supported 4.2.5).

## Open Questions

None. Scope approved by the user: fix all six findings.

## Implementation status (done)

1. `src/Api.ts` — `pause`→`stop`, `resume`→`start`; login 401 → `'Fails.'`;
   `addTorrents` sends `stopped` alongside `paused`; `editTracker` sends `url`
   alongside `origUrl`.
2. `src/utils/index.ts` — state lists accept `stoppedDL`/`stoppedUP`/
   `forcedMetaDL`; `Paused`/`Resumed` filter matches `stopped*`.
3. `src/components/Torrents.vue` — `getStateInfo` handles `stoppedDL`,
   `stoppedUP`, `forcedMetaDL` (no more `Error('Unknown state')`).
4. `src/locale/{en,zh-CN,zh-TW,nl,ru}.ts` — `stoppedDL`, `stoppedUP`,
   `forcedMetaDL` keys added; misnamed `forceDL` corrected to `forcedDL`;
   `properties_widget.trackerError`/`unreachable` added (en, zh-CN).
5. `src/components/dialogs/Trackers.vue` — status map covers `5`/`6`.
6. `tests/unit/{api,utils}.spec.ts` — stop/start URLs, login 401, dual
   `paused`/`stopped`, dual `origUrl`/`url`, stopped-state filtering.

Validation: `npm run test` 70 passed; `eslint` clean on changed files;
`npm run typecheck` reports only the pre-existing `process` typing error in
`src/Api.ts` (present on `main` before these changes).
