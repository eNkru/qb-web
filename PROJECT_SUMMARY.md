# qb-web Project Summary

**qb-web** is a modern, responsive, and feature-rich alternative Web UI for **qBittorrent**. It is designed to replace the default Web UI with a more polished and efficient interface.

## Core Features
- **Modern UI:** Built with Vuetify (Material Design) for a clean look.
- **Responsive Design:** Works well on both desktop and mobile devices.
- **i18n Support:** Supports multiple languages including English, Chinese, Russian, and Turkish.
- **RSS Management:** Full control over RSS feeds and download rules.
- **Search Engine:** Integrated search functionality for finding torrents directly from the UI.
- **Real-time Updates:** Uses efficient polling to stay synced with the qBittorrent server state.

## Tech Stack
- **Framework:** Vue 2 (TypeScript)
- **UI Library:** Vuetify
- **State Management:** Vuex
- **API Client:** Axios
- **Internationalization:** Polyglot (custom plugin)
- **Build Tool:** Vue CLI

## How It Works
1. **Authentication:** Connects to the qBittorrent Web API (`/api/v2/auth/login`).
2. **State Sync:** Periodically polls the `/sync/maindata` endpoint to fetch global state (torrents, server info, etc.).
3. **Incremental Updates:** Only the changed data is sent and merged into the local state using a custom merge utility.
4. **Action Handling:** User actions (pause, resume, delete, add) are sent as API requests to the corresponding qBittorrent endpoints.
