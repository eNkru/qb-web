# Pinia Migration Plan — Vuex Compat → Direct Pinia

This plan documents every `this.$store` reference across the codebase and shows
the exact changes needed to use Pinia stores directly instead of going through
the Vuex compatibility layer in `src/store/index.ts`.

---

## Overview

**Remove** the Vuex compat layer in `src/store/index.ts` (the `createVuexCompatStore`, `getCompatStore`, `useStore`, `useMutations`, `useState` functions) after all components have been migrated.

**6 Pinia stores** to use directly:

| Store | Import |
|-------|--------|
| `useMainStore` | `@/store/index` |
| `useConfigStore` | `@/store/config` |
| `useDialogStore` | `@/store/dialog` |
| `useSnackBarStore` | `@/store/snackBar` |
| `useAddFormStore` | `@/store/addForm` |
| `useSearchEngineStore` | `@/store/searchEngine` |

---

## Phase 1 — Simple standalone components

### 1. `PluginsManager.vue`

**File:** `src/components/dialogs/searchDialog/PluginsManager.vue`

**Current imports:**
```typescript
// No store imports currently
```

**Target imports:**
```typescript
import { useSearchEngineStore } from '@/store/searchEngine';
```

**Current code — getters:**
```typescript
get searchPlugins() {
    return this.$store.state.searchPlugins;
}
get isPluginManagerOpen(): boolean {
    return this.$store.state.isPluginManagerOpen ?? false;
}
```

**Target code — getters:**
```typescript
searchEngineStore = useSearchEngineStore()

get searchPlugins() {
    return this.searchEngineStore.searchPlugins;
}
get isPluginManagerOpen(): boolean {
    return this.searchEngineStore.isPluginManagerOpen ?? false;
}
```

**Current code — methods:**
```typescript
closePluginManager() {
    this.$store.commit('closePluginManager');
}
onDialogUpdate(val: boolean) {
    if (!val) { this.closePluginManager(); }
}
togglePluginAvailabilityAction(plugin: SearchPlugin) {
    return this.$store.dispatch('togglePluginAvailability', plugin);
}
updatePluginsRequest() {
    return this.$store.dispatch('updatePluginsRequest');
}
```

**Target code — methods (call Pinia actions directly):**
```typescript
closePluginManager() {
    this.searchEngineStore.closePluginManager();
}
onDialogUpdate(val: boolean) {
    if (!val) { this.closePluginManager(); }
}
togglePluginAvailabilityAction(plugin: SearchPlugin) {
    return this.searchEngineStore.togglePluginAvailability(plugin);
}
updatePluginsRequest() {
    return this.searchEngineStore.updatePluginsRequest();
}
```

---

### 2. `MainToolbar.vue`

**File:** `src/components/MainToolbar.vue`

**Target imports:**
```typescript
import { useMainStore } from '@/store/index';
```

**Add class field:**
```typescript
mainStore = useMainStore()
```

**Replace:**
```typescript
// Old:
this.$store.commit('setQuery', value);
// New:
this.mainStore.setQuery(value);

// Old:
return this.$store.state.query;
// New:
return this.mainStore.query;
```

---

### 3. `FilterGroup.vue`

**File:** `src/components/drawer/FilterGroup.vue`

**Target imports:**
```typescript
import { useConfigStore } from '@/store/config';
```

**Add class field:**
```typescript
configStore = useConfigStore()
```

**Replace:**
```typescript
// Old:
const s = this.$store.getters.config.filter[this.group.select];
// New:
const s = this.configStore.config.filter[this.group.select];

// Old:
this.$store.commit('updateConfig', { key: 'filter', value: { [this.group.select]: this.selected } });
// New:
this.configStore.updateConfig({ key: 'filter', value: { [this.group.select]: this.selected } });
```

---

### 4. `GlobalSnackBar.vue`

**File:** `src/components/GlobalSnackBar.vue`

**Current imports:**
```typescript
import { useMutations, useState } from '@/store';
```

**Target imports:**
```typescript
import { useSnackBarStore } from '@/store/snackBar';
```

**Replace the `setup()` function:**
```typescript
export default {
  setup() {
    const snackBarStore = useSnackBarStore();

    const config = computed(() => snackBarStore.config);

    const snackbarVisible = computed({
      get: () => !!config.value,
      set: (v) => { if (!v) snackBarStore.closeSnackBar(); },
    });

    function clickBtn() {
      const cb = config.value.callback;
      snackBarStore.closeSnackBar();
      if (cb) { cb(); }
    }

    return { config, snackbarVisible, clickBtn };
  },
};
```

---

### 5. `GlobalDialog.vue`

**File:** `src/components/GlobalDialog.vue`

**Current imports:**
```typescript
import { useMutations, useState } from '@/store';
```

**Target imports:**
```typescript
import { useDialogStore } from '@/store/dialog';
```

**Replace the `setup()` function:**
```typescript
export default {
  setup() {
    const display = useDisplay() as any;
    const dialogStore = useDialogStore();

    const config = computed(() => {
      if (!dialogStore.config) { return null; }
      const o = Object.assign({dialog: {}}, dialogStore.config) as DialogConfig;
      if (!('width' in o.dialog)) {
        o.dialog.width = display.smAndDown ? null : DefaultDialogWidth;
      }
      return o;
    });

    const value = ref<boolean>();
    const input = ref<string>();

    const isInput = computed(() => {
      const type = config.value!.type;
      return type === DialogType.Input;
    });

    async function clickBtn(btnValue: any) {
      const cb = config.value!.callback;
      if (cb) {
        if (isInput.value) {
          cb(btnValue ? input.value : undefined);
        } else {
          cb(btnValue);
        }
      }
      dialogStore.closeDialog();
    }

    watch(config, (v) => {
      value.value = !!v;
      if (!v) { input.value = undefined; }
      else { input.value = v.value; }
    });

    watch(value, (v) => {
      if (v || !config.value) { return; }
      clickBtn(null);
    });

    const btns = computed(() => {
      const c = config.value;
      const dialogType = (c && c.type) ? c.type : DialogType.Alert;
      if (dialogType === DialogType.Custom) { return c!.buttons; }
      return BUTTONS[dialogType];
    });

    return { config, value, input, isInput, btns, clickBtn };
  },
};
```

---

## Phase 2 — Medium-effort components

### 6. `LoginForm.vue`

**File:** `src/components/LoginForm.vue`

**Current imports:**
```typescript
import { useStore } from '@/store';
```

**Target imports:**
```typescript
import { useConfigStore } from '@/store/config';
import { useMainStore } from '@/store/index';
```

**Replace `useStore()`:**
```typescript
// Old:
const store = useStore();
// + later:
baseUrl: store.getters.config.baseUrl || location.href,
// + later:
store.commit('updateConfig', { key: 'baseUrl', value: data.baseUrl });
store.commit('updateNeedAuth', false);

// New:
const configStore = useConfigStore();
const mainStore = useMainStore();
// + later:
baseUrl: configStore.config.baseUrl || location.href,
// + later:
configStore.updateConfig({ key: 'baseUrl', value: data.baseUrl });
mainStore.updateNeedAuth(false);
```

---

### 7. `AddForm.vue`

**File:** `src/components/AddForm.vue`

**Target imports:**
```typescript
import { useMainStore } from '@/store/index';
import { useAddFormStore } from '@/store/addForm';
```

**Add class fields:**
```typescript
mainStore = useMainStore()
addFormStore = useAddFormStore()
```

**Replace getters:**
```typescript
// Old:
return this.$store.state.addFormDownloadItem ?? null;
// New:
return this.addFormStore.downloadItem ?? null;

// Old:
return this.$store.state.pasteUrl;
// New:
return this.mainStore.pasteUrl;

// Old:
return this.$store.state.preferences;
// New:
return this.mainStore.preferences;

// Old:
return this.$store.getters.allCategories;
// New:
return this.mainStore.allCategories;
```

**Replace methods (the dialog handlers already use local `dialogOpen`):**
```typescript
// openAddForm and closeAddForm already use local dialogOpen, no change needed.
```

---

### 8. `SearchDialog.vue`

**File:** `src/components/dialogs/searchDialog/SearchDialog.vue`

**Target imports:**
```typescript
import { useMainStore } from '@/store/index';
import { useAddFormStore } from '@/store/addForm';
import { useSearchEngineStore } from '@/store/searchEngine';
```

**Add class fields:**
```typescript
mainStore = useMainStore()
addFormStore = useAddFormStore()
searchEngineStore = useSearchEngineStore()
```

**Replace getters:**
```typescript
// Old:
return this.$store.getters.allCategories;
// New:
return this.mainStore.allCategories;

// Old:
return this.$store.getters.preferences;
// New:
return this.mainStore.preferences;
```

**Replace methods:**
```typescript
// Old:
this.$store.commit('setPasteUrl', data);
// New:
this.mainStore.setPasteUrl(data.url);

// Old:
this.$store.commit('openAddForm');
// New:
this.addFormStore.openAddForm();

// Old:
this.$store.commit('addFormDownloadItem', data);
// New:
this.addFormStore.addFormDownloadItem(data);

// Old:
return this.$store.dispatch('fetchSearchPlugins');
// New:
return this.searchEngineStore.fetchSearchPlugins();

// Old:
this.$store.commit('openPluginManager');
// New:
this.searchEngineStore.openPluginManager();
```

---

## Phase 3 — Heaviest components

### 9. `App.vue`

**File:** `src/App.vue`

**Target imports:**
```typescript
import { useMainStore } from '@/store/index';
import { useConfigStore } from '@/store/config';
```

**Add class fields:**
```typescript
mainStore = useMainStore()
configStore = useConfigStore()
```

**Replace all getters:**
```typescript
// Old:
return this.$store.state.mainData;
// New:
return this.mainStore.mainData;

// Old:
return this.$store.state.rid;
// New:
return this.mainStore.rid;

// Old:
return this.$store.state.preferences;
// New:
return this.mainStore.preferences;

// Old:
return this.$store.state.needAuth;
// New:
return this.mainStore.needAuth;

// Old:
return this.$store.getters.config;
// New:
return this.configStore.config;
```

**Replace all commits:**
```typescript
// Old:
this.$store.commit('updateMainData', data);
// New:
this.mainStore.updateMainData(data);

// Old:
this.$store.commit('updatePreferences', data);
// New:
this.mainStore.updatePreferences(data);

// Old:
this.$store.commit('setPasteUrl', data);
// New:
this.mainStore.setPasteUrl(data.url);

// Old:
this.$store.commit('updateNeedAuth', value);
// New:
this.mainStore.updateNeedAuth(value);

// Old:
this.$store.commit('updateConfig', { key, value });
// New:
this.configStore.updateConfig({ key, value });
```

---

### 10. `Torrents.vue`

**File:** `src/components/Torrents.vue`

**Target imports:**
```typescript
import { useMainStore } from '@/store/index';
import { useConfigStore } from '@/store/config';
import { useDialogStore } from '@/store/dialog';
import { useSnackBarStore } from '@/store/snackBar';
```

**Add class fields:**
```typescript
mainStore = useMainStore()
configStore = useConfigStore()
dialogStore = useDialogStore()
snackBarStore = useSnackBarStore()
```

**Replace ALL getters — here is a full mapping:**
```typescript
// Old                              → New
this.$store.getters.config          → this.configStore.config
this.$store.getters.isDataReady     → this.mainStore.isDataReady
this.$store.getters.allTorrents     → this.mainStore.allTorrents
this.$store.getters.allCategories  → this.mainStore.allCategories
this.$store.getters.allTags        → this.mainStore.allTags
this.$store.getters.torrentGroupByCategory → this.mainStore.torrentGroupByCategory
this.$store.getters.torrentGroupByTag      → this.mainStore.torrentGroupByTag
this.$store.getters.torrentGroupBySite     → this.mainStore.torrentGroupBySite
this.$store.getters.torrentGroupByState    → this.mainStore.torrentGroupByState
this.$store.state.query             → this.mainStore.query
```

**Replace ALL commits/dispatches:**
```typescript
// Old:
this.$store.commit('updateConfig', payload);
// New:
this.configStore.updateConfig(payload);

// Old:
this.$store.commit('showSnackBar', config);
// New:
this.snackBarStore.showSnackBar(config);

// Old:
return this.$store.dispatch('asyncShowDialog', config);
// New:
return this.dialogStore.asyncShowDialog(config);
```

---

### 11. `Drawer.vue`

**File:** `src/components/Drawer.vue`

**Target imports:**
```typescript
import { useMainStore } from '@/store/index';
```

**Add class field:**
```typescript
mainStore = useMainStore()
```

**Replace getters:**
```typescript
// 8 getters — all follow the same pattern:
this.$store.getters.xxx → this.mainStore.xxx
```

Full mapping:
```typescript
this.$store.getters.isDataReady          → this.mainStore.isDataReady
this.$store.getters.allTorrents          → this.mainStore.allTorrents
this.$store.getters.allCategories       → this.mainStore.allCategories
this.$store.getters.allTags             → this.mainStore.allTags
this.$store.getters.torrentGroupByCategory → this.mainStore.torrentGroupByCategory
this.$store.getters.torrentGroupByTag      → this.mainStore.torrentGroupByTag
this.$store.getters.torrentGroupBySite     → this.mainStore.torrentGroupBySite
this.$store.getters.torrentGroupByState    → this.mainStore.torrentGroupByState
```

---

### 12. `Footer.vue`

**File:** `src/components/Footer.vue`

**Target imports:**
```typescript
import { useMainStore } from '@/store/index';
```

**Add class field:**
```typescript
mainStore = useMainStore()
```

**Replace:**
```typescript
// Old:
return this.isDataReady ? (this.$store.state as any).mainData?.server_state ?? null : null;
// New:
return this.isDataReady ? this.mainStore.mainData?.server_state ?? null : null;

// Old:
return this.$store.getters.isDataReady;
// New:
return this.mainStore.isDataReady;

// Old:
return this.$store.getters.allTorrents;
// New:
return this.mainStore.allTorrents;
```

---

### 13. `DrawerFooter.vue`

**File:** `src/components/drawer/DrawerFooter.vue`

**Target imports:**
```typescript
import { useConfigStore } from '@/store/config';
import { useDialogStore } from '@/store/dialog';
import { useSnackBarStore } from '@/store/snackBar';
```

**Add class fields:**
```typescript
configStore = useConfigStore()
dialogStore = useDialogStore()
snackBarStore = useSnackBarStore()
```

**Replace getters (5 references):**
```typescript
// Old:
this.$store.getters.config
// New:
this.configStore.config

// Also replace every `this.$store.getters.config.xxx` with `this.configStore.config.xxx`
```

**Replace methods:**
```typescript
// Old:
return this.$store.dispatch('asyncShowDialog', config);
// New:
return this.dialogStore.asyncShowDialog(config);

// Old:
this.$store.commit('showSnackBar', config);
// New:
this.snackBarStore.showSnackBar(config);

// Old:
this.$store.commit('updateConfig', payload);
// New:
this.configStore.updateConfig(payload);
```

---

### 14. `SettingsDialog.vue`

**File:** `src/components/dialogs/settingsDialog/SettingsDialog.vue`

**Target imports:**
```typescript
import { useConfigStore } from '@/store/config';
import { useMainStore } from '@/store/index';
```

**Add class fields:**
```typescript
configStore = useConfigStore()
mainStore = useMainStore()
```

**Replace getters:**
```typescript
// Old:
return this.$store.getters.config;
// New:
return this.configStore.config;

// Old:
return this.$store.getters.allPreferences;
// New:
return this.mainStore.allPreferences;
```

---

### 15. `WebUISettings.vue`

**File:** `src/components/dialogs/settingsDialog/WebUISettings.vue`

**Target imports:**
```typescript
import { useConfigStore } from '@/store/config';
import { useMainStore } from '@/store/index';
```

**Add class fields:**
```typescript
configStore = useConfigStore()
mainStore = useMainStore()
```

**Replace getters:**
```typescript
// Old:
return this.$store.getters.config;
// New:
return this.configStore.config;

// Old:
return this.$store.getters.allPreferences;
// New:
return this.mainStore.allPreferences;
```

**Replace methods:**
```typescript
// Old:
this.$store.commit('updateConfig', payload);
// New:
this.configStore.updateConfig(payload);

// Old:
return this.$store.dispatch('updatePreferencesRequest', data);
// New:
return this.mainStore.updatePreferencesRequest(data);
```

---

### 16. `SpeedSettings.vue`

**File:** `src/components/dialogs/settingsDialog/SpeedSettings.vue`

**Target imports:**
```typescript
import { useMainStore } from '@/store/index';
```

**Add class field:**
```typescript
mainStore = useMainStore()
```

**Replace:**
```typescript
// Old:
return this.$store.getters.allPreferences;
// New:
return this.mainStore.allPreferences;

// Old:
return this.$store.dispatch('updatePreferencesRequest', data);
// New:
return this.mainStore.updatePreferencesRequest(data);
```

---

### 17. `RssSettings.vue`

**File:** `src/components/dialogs/settingsDialog/RssSettings.vue`

**Target imports:**
```typescript
import { useMainStore } from '@/store/index';
```

**Add class field:**
```typescript
mainStore = useMainStore()
```

**Replace:**
```typescript
// Old:
return this.$store.getters.allPreferences;
// New:
return this.mainStore.allPreferences;

// Old:
return this.$store.dispatch('updatePreferencesRequest', data);
// New:
return this.mainStore.updatePreferencesRequest(data);
```

---

### 18. `DownloadSettings.vue`

**File:** `src/components/dialogs/settingsDialog/DownloadSettings.vue`

**Target imports:**
```typescript
import { useMainStore } from '@/store/index';
```

**Add class field:**
```typescript
mainStore = useMainStore()
```

**Replace:**
```typescript
// Old:
return this.$store.getters.allPreferences;
// New:
return this.mainStore.allPreferences;

// Old:
return this.$store.dispatch('updatePreferencesRequest', data);
// New:
return this.mainStore.updatePreferencesRequest(data);
```

---

### 19. `ConfirmDeleteDialog.vue`

**File:** `src/components/dialogs/ConfirmDeleteDialog.vue`

**Target imports:**
```typescript
import { useMainStore } from '@/store/index';
```

**Add class field:**
```typescript
mainStore = useMainStore()
```

**Replace:**
```typescript
// Old:
return this.$store.getters.allTorrents;
// New:
return this.mainStore.allTorrents;
```

---

### 20. `ConfirmSetCategoryDialog.vue`

**File:** `src/components/dialogs/ConfirmSetCategoryDialog.vue`

**Target imports:**
```typescript
import { useMainStore } from '@/store/index';
```

**Add class field:**
```typescript
mainStore = useMainStore()
```

**Replace:**
```typescript
// Old:
return this.$store.getters.allTorrents;
// New:
return this.mainStore.allTorrents;
```

---

### 21. `EditTrackerDialog.vue`

**File:** `src/components/dialogs/EditTrackerDialog.vue`

**Target imports:**
```typescript
import { useMainStore } from '@/store/index';
```

**Add class field:**
```typescript
mainStore = useMainStore()
```

**Replace:**
```typescript
// Old:
return this.$store.getters.allTorrents;
// New:
return this.mainStore.allTorrents;
```

---

### 22. `RssDialog.vue`

**File:** `src/components/dialogs/RssDialog.vue`

**Target imports:**
```typescript
import { useMainStore } from '@/store/index';
import { useDialogStore } from '@/store/dialog';
import { useSnackBarStore } from '@/store/snackBar';
```

**Add class fields:**
```typescript
mainStore = useMainStore()
dialogStore = useDialogStore()
snackBarStore = useSnackBarStore()
```

**Replace:**
```typescript
// Old:
return this.$store.state.preferences;
// New:
return this.mainStore.preferences;

// Old:
return this.$store.dispatch('asyncShowDialog', config);
// New:
return this.dialogStore.asyncShowDialog(config);

// Old:
this.$store.commit('showSnackBar', config);
// New:
this.snackBarStore.showSnackBar(config);

// Old:
this.$store.commit('closeSnackBar');
// New:
this.snackBarStore.closeSnackBar();
```

---

### 23. `RssRulesDialog.vue`

**File:** `src/components/dialogs/RssRulesDialog.vue`

**Target imports:**
```typescript
import { useMainStore } from '@/store/index';
import { useDialogStore } from '@/store/dialog';
import { useSnackBarStore } from '@/store/snackBar';
```

**Add class fields:**
```typescript
mainStore = useMainStore()
dialogStore = useDialogStore()
snackBarStore = useSnackBarStore()
```

**Replace:**
```typescript
// Old:
return this.$store.getters.allCategories;
// New:
return this.mainStore.allCategories;

// Old:
return this.$store.dispatch('asyncShowDialog', config);
// New:
return this.dialogStore.asyncShowDialog(config);

// Old:
this.$store.commit('showSnackBar', config);
// New:
this.snackBarStore.showSnackBar(config);

// Old:
this.$store.commit('closeSnackBar');
// New:
this.snackBarStore.closeSnackBar();
```

---

### 24. `SearchDialogForm.vue`

**File:** `src/components/dialogs/searchDialog/SearchDialogForm.vue`

**Target imports:**
```typescript
import { useSearchEngineStore } from '@/store/searchEngine';
```

**Add class field:**
```typescript
searchEngineStore = useSearchEngineStore()
```

**Replace:**
```typescript
// Old:
return this.$store.getters.allSearchPlugins;
// New:
return this.searchEngineStore.allSearchPlugins;
```

---

## Final step — Remove the Vuex compat layer

After all components have been migrated:

1. **Delete** the `createVuexCompatStore()`, `getCompatStore()` functions in `src/store/index.ts`
2. **Delete** the `store` proxy, `useStore()`, `useMutations()`, `useState()` exports
3. **Remove** `app.config.globalProperties.$store = store;` from `src/main.ts`
4. **Remove** the `$store: any` declaration from `src/shims-vue.d.ts`
5. **Run** `yarn typecheck` and fix any remaining issues

---

## Migration order (recommended)

```
Phase 1 (1 component at a time, 5 components):
  PluginsManager → MainToolbar → FilterGroup → GlobalSnackBar → GlobalDialog

Phase 2 (1-2 components at a time, 3 components):
  LoginForm → AddForm → SearchDialog

Phase 3 (1 component at a time, heaviest):
  ConfirmDeleteDialog → ConfirmSetCategoryDialog → EditTrackerDialog
  → RssRulesDialog → RssDialog → SearchDialogForm
  → SettingsDialog → WebUISettings → SpeedSettings → RssSettings → DownloadSettings
  → DrawerFooter → Footer → Drawer → Torrents → App.vue

Final:
  Remove Vuex compat layer + cleanup
```

Each step should be followed by `yarn typecheck` to verify no type errors.
