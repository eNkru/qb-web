import { defineStore } from 'pinia';
import { merge, map, groupBy, sortBy } from 'lodash-es';
import { AllStateTypes } from '@/consts';
import { torrentIsState } from '@/utils';
import { RootState } from './types';
import stateMerge from '@/utils/vue-object-merge';
import api from '@/Api';
import { Torrent } from '@/types';

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


