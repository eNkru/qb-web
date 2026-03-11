---
inclusion: auto
---

# Project Context

This workspace contains qb-web, an alternative Web UI for qBittorrent.

For detailed project information, architecture, and development guidelines, refer to:

#[[file:../.kiro/PROJECT_REFERENCE.md]]

When making changes to this project:
- Follow the existing Vue 2 + TypeScript + Vuetify 2 patterns
- Use vue-class-component decorator style for components
- Add TypeScript types in `src/types.ts` for API responses
- Update translations in all language files when adding new UI text
- Use the existing API client in `src/Api.ts` for qBittorrent communication
- Follow the Vuex store patterns for state management
