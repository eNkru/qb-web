import { defineStore } from 'pinia';
import { reactive, computed, type Ref } from 'vue';
import { merge, map, groupBy, sortBy } from 'lodash';
import { AllStateTypes } from '@/consts';
import { torrentIsState } from '@/utils';
import { RootState } from './types';
import stateMerge from '@/utils/vue-object-merge';
import api from '@/Api';
import { Torrent } from '@/types';
import { useConfigStore } from './config';
import { useDialogStore } from './dialog';
import { useSnackBarStore } from './snackBar';
import { useAddFormStore } from './addForm';
import { useSearchEngineStore } from './searchEngine';

export const useMainStore = defineStore('main', {
  state: (): RootState => ({
    rid: 0,
    mainData: undefined,
    preferences: null,
    pasteUrl: null,
    needAuth: false,
    query: null,
  }),
  getters: {
    allPreferences(state) {
      return state.preferences;
    },
    savePath(state) {
      return state.preferences?.['save_path'];
    },
    isDataReady(state) {
      return !!state.mainData;
    },
    allTorrents(state) {
      if (!state.mainData) {
        return [];
      }

      return map(state.mainData.torrents, (value, key) => merge({}, value, { hash: key }));
    },
    allCategories(state) {
      if (!state.mainData) {
        return [];
      }

      const categories = map(state.mainData.categories,
        (value, key) => merge({}, value, { key }));
      return sortBy(categories, 'name');
    },
    allTags(state) {
      if (!state.mainData) {
        return [];
      }

      const finalTags: any[] = [];
      const tags = state.mainData.tags ?? [];
      for (const tag of tags) {
        finalTags.push({
          key: tag,
          name: tag,
        });
      }
      return sortBy(finalTags, 'name');
    },
    torrentGroupByCategory(): Record<string, Torrent[]> {
      return groupBy(this.allTorrents, torrent => torrent.category);
    },
    torrentGroupByTag(): Record<string, Torrent[]> {
      const result: Record<string, Torrent[]> = {};
      for (const torrent of this.allTorrents) {
        if (!torrent.tags) {
          continue;
        }

        const tags: string[] = torrent.tags.split(', ');
        tags.forEach(tag => {
          let list: Torrent[] = result[tag];
          if (!list) {
            list = [];
            result[tag] = list;
          }
          list.push(torrent);
        });
      }
      return result;
    },
    torrentGroupBySite(): Record<string, Torrent[]> {
      return groupBy(this.allTorrents, (torrent) => {
        if (!torrent.tracker) {
          return '';
        }

        const url = new URL(torrent.tracker);
        return url.hostname;
      });
    },
    torrentGroupByState(): Record<string, Torrent[]> {
      const result: any = {};
      const put = (stateKey: any, torrent: any) => {
        let list: any[] = result[stateKey];
        if (!list) {
          list = [];
          result[stateKey] = list;
        }
        list.push(torrent);
      };

      for (const torrent of this.allTorrents) {
        for (const type of AllStateTypes) {
          if (torrentIsState(type, torrent.state)) {
            put(type, torrent);
          }
        }
      }

      return result;
    },
  },
  actions: {
    updateMainData(payload: any) {
      this.rid = payload.rid;
      delete payload.rid;
      if (payload.full_update) {
        delete payload.full_update;
        this.mainData = payload;
      } else {
        const mainData = this.mainData!;
        if (payload.torrents_removed) {
          for (const hash of payload.torrents_removed) {
            delete mainData.torrents[hash];
          }
          delete payload.torrents_removed;
        }
        if (payload.categories_removed) {
          for (const key of payload.categories_removed) {
            delete (mainData as any)[key];
          }
          delete payload.categories_removed;
        }
        if (payload.tags_removed) {
          for (const key of payload.tags_removed) {
            delete (mainData as any)[key];
          }
          delete payload.tags_removed;
        }
        stateMerge(mainData, payload);
      }
    },
    updatePreferences(payload: any) {
      this.preferences = payload;
    },
    setPasteUrl(url: string | null) {
      this.pasteUrl = url;
    },
    updateNeedAuth(payload: boolean) {
      this.needAuth = payload;
    },
    setQuery(payload: string | null) {
      this.query = payload;
    },
    async updatePreferencesRequest(preferences: any) {
      try {
        await api.setPreferences(preferences);
        const preferenceRes = await api.getAppPreferences();
        this.updatePreferences(preferenceRes.data);
      } catch {
        this.updatePreferencesRequestFailure();
      }
    },
    updatePreferencesRequestSuccess(preferences: any) {
      this.updatePreferences(preferences);
    },
    updatePreferencesRequestFailure() {
      alert('Preferences failed to update');
    },
  },
});

// ── Vuex-compatible store wrapper ──────────────────────────────────────────
// Components still use this.$store.commit() / this.$store.state / etc.
// This wrapper routes calls to the appropriate Pinia store.
// Lazily initialized because Pinia stores require app.use(pinia) first.

let _compatStore: ReturnType<typeof createVuexCompatStore> | null = null;

function getCompatStore() {
  if (!_compatStore) {
    _compatStore = createVuexCompatStore();
  }
  return _compatStore;
}

function createVuexCompatStore() {
  const mainStore = useMainStore();
  const configStore = useConfigStore();
  const dialogStore = useDialogStore();
  const snackBarStore = useSnackBarStore();
  const addFormStore = useAddFormStore();
  const searchEngineStore = useSearchEngineStore();

  // Build a reactive state tree that mirrors the old Vuex state shape
  // Flat properties — no anonymous wrapper objects, so v-model and direct writes work correctly.
  const state = reactive({
    get rid() { return mainStore.rid; },
    get mainData() { return mainStore.mainData; },
    get preferences() { return mainStore.preferences; },
    get pasteUrl() { return mainStore.pasteUrl; },
    get needAuth() { return mainStore.needAuth; },
    get query() { return mainStore.query; },
    // Flattened from config wrapper: was state.config.userConfig
    get userConfig() { return configStore.userConfig; },
    // Flattened from dialog wrapper: was state.dialog.config
    get dialogConfig() { return dialogStore.config; },
    // Flattened from snackBar wrapper: was state.snackBar.config
    get snackBarConfig() { return snackBarStore.config; },
    // Flattened from addForm wrapper: was state.addForm.isOpen / .downloadItem
    get addFormIsOpen() { return addFormStore.isOpen; },
    get addFormDownloadItem() { return addFormStore.downloadItem; },
    // Flattened from searchEngine wrapper: was state.searchEngine.searchPlugins / .isPluginManagerOpen
    get searchPlugins() { return searchEngineStore.searchPlugins; },
    get isPluginManagerOpen() { return searchEngineStore.isPluginManagerOpen; },
  });

  // Getters – mirrors the old Vuex getters shape
  const getters: Record<string, any> = {};
  Object.defineProperties(getters, {
    allPreferences: { get: () => mainStore.allPreferences, enumerable: true },
    savePath: { get: () => mainStore.savePath, enumerable: true },
    isDataReady: { get: () => mainStore.isDataReady, enumerable: true },
    allTorrents: { get: () => mainStore.allTorrents, enumerable: true },
    allCategories: { get: () => mainStore.allCategories, enumerable: true },
    allTags: { get: () => mainStore.allTags, enumerable: true },
    torrentGroupByCategory: { get: () => mainStore.torrentGroupByCategory, enumerable: true },
    torrentGroupByTag: { get: () => mainStore.torrentGroupByTag, enumerable: true },
    torrentGroupBySite: { get: () => mainStore.torrentGroupBySite, enumerable: true },
    torrentGroupByState: { get: () => mainStore.torrentGroupByState, enumerable: true },
    config: { get: () => configStore.config, enumerable: true },
    allSearchPlugins: { get: () => searchEngineStore.allSearchPlugins, enumerable: true },
    isOpen: { get: () => addFormStore.isOpen, enumerable: true },
  });

  function commit(method: string, payload?: any): any {
    switch (method) {
      case 'updateConfig': return configStore.updateConfig(payload);
      case 'showDialog': return dialogStore.showDialog(payload);
      case 'closeDialog': dialogStore.closeDialog(); return;
      case 'showSnackBar': return snackBarStore.showSnackBar(payload);
      case 'closeSnackBar': snackBarStore.closeSnackBar(); return;
      case 'openAddForm': addFormStore.openAddForm(); return;
      case 'closeAddForm': addFormStore.closeAddForm(); return;
      case 'addFormDownloadItem': addFormStore.addFormDownloadItem(payload); return;
      case 'setSearchPlugins': return searchEngineStore.setSearchPlugins(payload);
      case 'openPluginManager': searchEngineStore.openPluginManager(); return;
      case 'closePluginManager': searchEngineStore.closePluginManager(); return;
      case 'updateMainData': return mainStore.updateMainData(payload);
      case 'updatePreferences': return mainStore.updatePreferences(payload);
      case 'setPasteUrl': {
        const { url } = payload || {};
        return mainStore.setPasteUrl(url);
      }
      case 'updateNeedAuth': return mainStore.updateNeedAuth(payload);
      case 'setQuery': return mainStore.setQuery(payload);
      default:
        console.warn(`[store] Unknown commit: ${method}`);
        return;
    }
  }

  function dispatch(method: string, payload?: any): any {
    switch (method) {
      case 'asyncShowDialog': return dialogStore.asyncShowDialog(payload);
      case 'updatePreferencesRequest': return mainStore.updatePreferencesRequest(payload);
      case 'updatePreferencesRequestSuccess': return mainStore.updatePreferencesRequestSuccess(payload);
      case 'updatePreferencesRequestFailure': return mainStore.updatePreferencesRequestFailure();
      case 'fetchSearchPlugins': return searchEngineStore.fetchSearchPlugins();
      case 'getSearchPluginsRequest': return searchEngineStore.getSearchPluginsRequest();
      case 'getSearchPluginRequestSuccess': return searchEngineStore.getSearchPluginRequestSuccess(payload);
      case 'getSearchPluginsRequestFailure': return searchEngineStore.getSearchPluginsRequestFailure();
      case 'togglePluginAvailability': return searchEngineStore.togglePluginAvailability(payload);
      case 'togglePluginEnableRequest': return searchEngineStore.togglePluginEnableRequest(payload);
      case 'enablePluginRequestSuccess': return searchEngineStore.enablePluginRequestSuccess();
      case 'updatePluginsRequest': return searchEngineStore.updatePluginsRequest();
      case 'updatePluginsRequestSuccess': return searchEngineStore.updatePluginsRequestSuccess();
      case 'updatePluginsRequestFailure': return searchEngineStore.updatePluginsRequestFailure();
      default:
        console.warn(`[store] Unknown dispatch: ${method}`);
        return;
    }
  }

  return { state, getters, commit, dispatch };
}

// Lazily-initialized store proxy — defers Pinia store creation to first access
const store: any = {
  get state() { return getCompatStore().state; },
  get getters() { return getCompatStore().getters; },
  commit(method: string, payload?: any) { return getCompatStore().commit(method, payload); },
  dispatch(method: string, payload?: any) { return getCompatStore().dispatch(method, payload); },
};

export default store;
export { store };

export function useStore() {
  return store;
}

export function useMutations(mutations: string[], namespace?: string) {
  const result: {[key: string]: (...args: any[]) => any} = {};

  mutations.forEach((m) => {
    const method = namespace ? `${namespace}/${m}` : m;
    result[m] = (..._args: any[]) => store.commit(method, ..._args);
  });

  return result;
}

export function useState(keys: string[], namespace?: string) {
  const result: Record<string, Ref<any>> = {};

  keys.forEach((k) => {
    const path = namespace ? `${namespace}/${k}` : k;
    result[k] = computed(() => {
      const parts = path.split('/');
      let s: any = store.state;
      for (const p of parts) {
        if (s == null) {
          return undefined;
        }
        s = s[p];
      }
      return s;
    });
  });

  return result;
}
