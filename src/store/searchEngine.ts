import { defineStore } from 'pinia';
import { SearchPlugin } from '@/types';
import api from '@/Api';

export const useSearchEngineStore = defineStore('searchEngine', {
  state: () => ({
    searchPlugins: [] as SearchPlugin[] | undefined | null,
    isPluginManagerOpen: false,
  }),
  getters: {
    allSearchPlugins(state): SearchPlugin[] | undefined | null {
      return state.searchPlugins;
    },
  },
  actions: {
    setSearchPlugins(plugins: SearchPlugin[] | undefined | null) {
      this.searchPlugins = plugins;
    },
    openPluginManager() {
      this.isPluginManagerOpen = true;
    },
    closePluginManager() {
      this.isPluginManagerOpen = false;
    },
    async fetchSearchPlugins() {
      await this.getSearchPluginsRequest();
    },
    async getSearchPluginsRequest() {
      try {
        const searchPlugins = await api.getSearchPlugins();

        this.getSearchPluginRequestSuccess(searchPlugins);
      } catch {
        this.getSearchPluginsRequestFailure();
      }
    },
    getSearchPluginRequestSuccess(searchPlugins: SearchPlugin[]) {
      this.setSearchPlugins(undefined);

      this.setSearchPlugins(searchPlugins);
    },
    getSearchPluginsRequestFailure() {
      this.setSearchPlugins(null);
    },
    async togglePluginAvailability(plugin: SearchPlugin) {
      await this.togglePluginEnableRequest(plugin);
    },
    async togglePluginEnableRequest(plugin: SearchPlugin) {
      try {
        await api.enablePlugin(plugin, !plugin.enabled);

        this.enablePluginRequestSuccess();
      } catch {
        // Do nothing
      }
    },
    enablePluginRequestSuccess() {
      this.fetchSearchPlugins();
    },
    async updatePluginsRequest() {
      try {
        await api.updateSearchPlugins();

        this.updatePluginsRequestSuccess();
      } catch {
        this.updatePluginsRequestFailure();
      }
    },
    async updatePluginsRequestSuccess() {
      await this.getSearchPluginsRequest();
    },
    updatePluginsRequestFailure() {
      // Do nothing
    },
  },
});
