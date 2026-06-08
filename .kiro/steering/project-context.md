---
inclusion: auto
---

# Project Context

This workspace contains qb-web, an alternative Web UI for qBittorrent.

For detailed project information, architecture, and development guidelines, refer to:

#[[file:../../README.md]]

When making changes to this project:
- Follow the existing **Vue 3 + TypeScript + Vuetify 3** patterns
- Use **Pinia stores** (not Vuex) for state management — see `src/store/`
- Use `vue-facing-decorator` for class-style component syntax, or Composition API
- Add TypeScript types in `src/types.ts` for API responses
- Update translations in all language files when adding new UI text
- Use the existing API client in `src/Api.ts` for qBittorrent communication
- The project uses **Vite 6** for dev/build and **Vitest 2** for testing
