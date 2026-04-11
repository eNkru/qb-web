# Site Icon Mapping Specification

This document defines the process for adding and managing site icons and tracker mappings in the qb-web project.

## Core Principles
- **Centralized Configuration**: All site names and icons are managed in dedicated configuration files.
- **Robust Resolution**: The system supports exact matches, suffix matches (subdomains), and top-level domain fallbacks.
- **Consistent Fallbacks**: Sites without specific icons use the `nexusphp` icon as a default, or a font-based server icon if unmapped.

---

## How to Add a New Site

### 1. Register the Site Display Name
Add the tracker domain and its display name to the `SITE_MAP` in `src/utils/siteMap.ts`. This ensures the site name appears correctly in the UI.

*   **File:** `src/utils/siteMap.ts`
*   **Action:** Add an entry to the `SITE_MAP` constant.

```typescript
const SITE_MAP: Record<string, SiteEntry> = {
  // --- Example: Adding a Chinese tracker ---
  'new-site-domain.com': { en: 'NewSite', zh: '新站点' },

  // --- Example: Adding an International tracker (English only) ---
  'intl-site.net': 'IntlSite',
};
```

### 2. Register the Site Icon Mapping
Add the same domain to the `sites` constant in `src/sites.ts` and map it to either a specific icon or the default `nexusphp` icon.

*   **File:** `src/sites.ts`
*   **Action:** Add an entry to the `sites` constant.

```typescript
const sites: {[key: string]: SiteInfo} = {
  // --- Using the default NexusPHP icon ---
  'new-site-domain.com': {
    name: 'NewSite',
    icon: getSiteIcon('nexusphp'),
  },

  // --- Using a specific site icon (if available) ---
  'specific-site.com': {
    name: 'SpecificSite',
    icon: getSiteIcon('specific-site-filename'), // File must exist in src/assets/site_icons/
  },
};
```

---

## Technical Implementation Details

### Icon Resolution Logic
The UI components (`Drawer.vue` and `Torrents.vue`) use the `getSiteByHostname(hostname)` function from `src/sites.ts`. The resolution follows this order:

1.  **Exact Match**: Direct lookup in the `sites` map using the full tracker hostname.
2.  **Suffix Match**: Iterates through registered domains to find if the hostname ends with one (e.g., `tracker.site.com` matches `site.com`). This handles subdomains automatically.
3.  **Domain Fallback**: Checks the last two parts of the hostname (the base domain).
4.  **UI Default**: If no mapping is found, the UI displays the `mdi-server` font icon.

### Asset Location
- **Source Icons**: `src/assets/site_icons/*.png`
- **Dynamic Loading**: Icons are loaded using Webpack's `require` through the `getSiteIcon` helper function.

---

## Maintenance Checklist
- [ ] Added domain to `SITE_MAP` in `src/utils/siteMap.ts`.
- [ ] Added domain to `sites` in `src/sites.ts`.
- [ ] Assigned `getSiteIcon('nexusphp')` (or a specific icon) in `src/sites.ts`.
- [ ] Verified the domain matches the tracker URL used in your torrents.
