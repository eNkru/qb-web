import { isPlainObject, merge } from 'lodash';
import { Module } from 'vuex';
import { ConfigState, ConfigPayload } from './types';

const configKey = 'qb-config';

export interface Config {
  baseUrl: string | null;
  updateInterval: number;
  pageOptions: any;
  sortBy: any;
  columnWidths: Record<string, number> | null;
  filter: {
    state: string | null;
    category: string | null;
    site: string | null;
  };
  locale: string | null;
  darkMode: string | null;
  themeMode: 'light' | 'dark' | 'grey' | 'luxury' | 'modern-dark' | 'crypto' | 'cyberpunk' | 'natural' | 'technology' | null;
  displaySpeedInTitle: boolean | null;
  fontScale: number | null;
}

const defaultConfig = {
  baseUrl: null,
  updateInterval: 2000,
  pageOptions: {
    itemsPerPage: 50,
  },
  sortBy: [],
  columnWidths: null,
  filter: {
    state: null,
    category: null,
    site: null,
  },
  locale: null,
  darkMode: null,
  themeMode: null,
  displaySpeedInTitle: false,
  fontScale: 1,
};

function saveConfig(obj: any) {
  localStorage.setItem(configKey, JSON.stringify(obj));
}

export function loadConfig(): Partial<Config> {
  const tmp = localStorage.getItem(configKey);
  if (!tmp) {
    return {};
  }

  return JSON.parse(tmp);
}

export const configStore: Module<ConfigState, any> = {
  state() {
    return {
      userConfig: loadConfig(),
    };
  },
  mutations: {
    updateConfig(state, payload: ConfigPayload) {
      const { key, value } = payload;
      if (isPlainObject(value)) {
        state.userConfig[key] = merge({}, state.userConfig[key], value);
      } else {
        state.userConfig[key] = value;
      }

      saveConfig(state.userConfig);
    },
  },
  getters: {
    config(state) {
      return merge({}, defaultConfig, state.userConfig);
    },
  },
};
