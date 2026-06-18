import { defineStore } from 'pinia';
import { merge, map, groupBy, sortBy } from 'lodash-es';
import { AllStateTypes } from '@/consts';
import { torrentIsState } from '@/utils';
import { RootState } from './types';
import stateMerge from '@/utils/vue-object-merge';
import api from '@/Api';
import { MainData, MainDataUpdate, Torrent } from '@/types';

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

        try {
          const url = new URL(torrent.tracker);
          return url.hostname;
        } catch {
          return '';
        }
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
    updateMainData(payload: MainDataUpdate) {
      const {
        rid,
        full_update,
        torrents_removed,
        categories_removed,
        tags_removed,
        ...data
      } = payload;
      this.rid = rid;

      if (full_update) {
        this.mainData = data as MainData;
      } else {
        if (!this.mainData) {
          return;
        }

        const mainData = this.mainData;
        if (torrents_removed) {
          for (const hash of torrents_removed) {
            delete mainData.torrents[hash];
          }
        }
        if (categories_removed) {
          for (const key of categories_removed) {
            delete mainData.categories?.[key];
          }
        }
        if (tags_removed) {
          mainData.tags = mainData.tags.filter(tag => !tags_removed.includes(tag));
        }
        stateMerge(mainData, data);
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
