<template>
  <v-app ref="app">
    <v-navigation-drawer
      app
      :clipped="$vuetify.breakpoint.lgAndUp"
      v-model="drawer"
      v-class:phone-layout="phoneLayout"
      width="300"
    >
      <drawer v-model="drawerOptions" />

      <template #append>
        <DrawerFooter />
      </template>
    </v-navigation-drawer>
    <main-toolbar v-model="drawer" />

    <v-main>
      <torrents />
    </v-main>

    <add-form v-if="preferences" />
    <login-form
      v-if="needAuth"
    />
    <logs-dialog
      v-if="drawerOptions.showLogs"
      v-model="drawerOptions.showLogs"
    />
    <RssDialog
      v-if="drawerOptions.showRss"
      v-model="drawerOptions.showRss"
      @download-torrent="setPasteUrl({url: $event})"
    />
    <SearchDialog
      v-if="drawerOptions.showSearch"
      v-model="drawerOptions.showSearch"
    />

    <SettingsDialog
      v-if="drawerOptions.showSettings"
      v-model="drawerOptions.showSettings"
    />
    <v-footer
      app
      class="elevation-4"
      padless
      v-if="$vuetify.breakpoint.smAndUp"
    >
      <app-footer />
    </v-footer>

    <GlobalDialog />
    <GlobalSnackBar />
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState, mapMutations } from 'vuex';
import { registerProtocolHandler, checkDownloadUrl } from './protocolHandler';

import GlobalDialog from './components/GlobalDialog.vue';
import GlobalSnackBar from './components/GlobalSnackBar.vue';

import AddForm from './components/AddForm.vue';
import Drawer from './components/Drawer.vue';
import LoginForm from './components/LoginForm.vue';
import MainToolbar from './components/MainToolbar.vue';
import Torrents from './components/Torrents.vue';
import AppFooter from './components/Footer.vue';
import LogsDialog from './components/dialogs/LogsDialog.vue';
import RssDialog from './components/dialogs/RssDialog.vue';
import SearchDialog from './components/dialogs/searchDialog/SearchDialog.vue';
import SettingsDialog from './components/dialogs/settingsDialog/SettingsDialog.vue';
import DrawerFooter from './components/drawer/DrawerFooter.vue';


import api from './Api';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import { MainData } from './types';
import { Config } from './store/config';
import Api from './Api';
import {formatSize} from '@/filters'

let appWrapEl: HTMLElement;

@Component({
  components: {
    AddForm,
    Drawer,
    LoginForm,
    Torrents,
    AppFooter,
    LogsDialog,
    MainToolbar,
    GlobalDialog,
    GlobalSnackBar,
    RssDialog,
    SearchDialog,
    DrawerFooter,
    SettingsDialog,
  },
  computed: {
    ...mapState([
      'mainData',
      'rid',
      'preferences',
      'needAuth',
    ]),
    ...mapGetters(['config']),
  },
  methods: {
    ...mapMutations([
      'updateMainData',
      'updatePreferences',
      'setPasteUrl',
      'updateNeedAuth',
    ]),
  },
})
export default class App extends Vue {
  drawer = !this.phoneLayout
  drawerOptions = {
    showLogs: false,
    showRss: false,
    showSettings: false,
  }
  task = 0
  mql?: MediaQueryList

  mainData!: MainData
  rid!: number
  preferences!: any
  config!: Config
  needAuth!: boolean

  updateMainData!: (_: any) => void
  updatePreferences!: (_: any) => void
  setPasteUrl!: (_: any) => void
  updateNeedAuth!: (_: boolean) => void

  get phoneLayout() {
    return this.$vuetify.breakpoint.xsOnly;
  }

  initProtocolHandler() {
    registerProtocolHandler();
    const url = checkDownloadUrl();

    if (url) {
      this.setPasteUrl({
        url,
      });
    }
  }

  async created() {
    this.initProtocolHandler();

    await this.getInitData();
    appWrapEl = (this.$refs.app as any).$el.querySelector('.v-application--wrap');
    appWrapEl.addEventListener('paste', this.onPaste);
  }

  beforeDestroy() {
    if (this.task) {
      clearTimeout(this.task);
    }
    appWrapEl.removeEventListener('paste', this.onPaste);
  }

  async getInitData() {
    const href = location.href;
    if (!this.config.baseUrl) {
      if (href.includes("czbix.github.io") || href.includes("localhost")) {
        this.updateNeedAuth(true);
        return;
      } else {
        Api.changeBaseUrl(href);
      }
    } else {
      Api.changeBaseUrl(this.config.baseUrl);
    }

    try {
      await this.getMainData();
    } catch (e) {
      this.updateNeedAuth(true);
      return;
    }

    await this.getPreferences();
  }

  async getPreferences() {
    const resp = await api.getAppPreferences();

    this.updatePreferences(resp.data);
  }

  async getMainData() {
    const rid = this.rid ? this.rid : undefined;
    const resp = await api.getMainData(rid);
    const mainData = resp.data;

    this.updateMainData(mainData);
    if(this.config.displaySpeedInTitle) {
      const upInfoSpeed = mainData.server_state.up_info_speed
      const dlInfoSpeed = mainData.server_state.dl_info_speed
      let dl = '', up = ''
      if (dlInfoSpeed > 1024) {
        dl = `D ${formatSize(dlInfoSpeed)}/s`
      }
      if (upInfoSpeed > 1024) {
        up = `U ${formatSize(upInfoSpeed)}/s`
      }
      document.title = `[${up} ${dl}] qBittorrent Web UI`
    }
    this.task = setTimeout(this.getMainData, this.config.updateInterval);
  }

  onPaste(e: ClipboardEvent) {
    if ((e.target as HTMLElement).tagName === 'INPUT') {
      return;
    }

    const text = e.clipboardData!.getData('text');
    if (text) {
      this.setPasteUrl({
        url: text,
      });
    }
  }

  @Watch('needAuth')
  onNeedAuth(v: boolean) {
    if (!v) {
      this.getInitData();
    }
  }

  @Watch('config.themeMode', {immediate: true})
  onThemeMode(mode: 'light' | 'dark' | 'grey' | null) {
    const { theme } = this.$vuetify;

    // If user explicitly chose a theme
    if (mode != null) {
      if (this.mql) {
        this.mql.removeListener(null)
        this.mql = undefined
      }
      
      // Apply grey theme (soft light mode)
      if (mode === 'grey') {
        theme.dark = false;
        
        // Apply darker grey color scheme
        theme.themes.light.primary = '#6b8fb5';
        theme.themes.light.secondary = '#757575';
        theme.themes.light.accent = '#90b4d4';
        theme.themes.light.error = '#d32f2f';
        theme.themes.light.info = '#5c9fd6';
        theme.themes.light.success = '#66bb6a';
        theme.themes.light.warning = '#ffa726';
        
        // Add grey theme class
        this.$nextTick(() => {
          const app = (this.$refs.app as any)?.$el;
          if (app) {
            app.classList.add('grey-theme');
          }
        });
      } else {
        // Reset to default colors for light/dark
        theme.themes.light.primary = '#1976d2';
        theme.themes.light.secondary = '#424242';
        theme.themes.light.accent = '#82B1FF';
        theme.themes.light.error = '#FF5252';
        theme.themes.light.info = '#2196F3';
        theme.themes.light.success = '#4CAF50';
        theme.themes.light.warning = '#FFC107';
        
        // Remove grey theme class
        this.$nextTick(() => {
          const app = (this.$refs.app as any)?.$el;
          if (app) {
            app.classList.remove('grey-theme');
          }
        });
        
        // Set dark mode based on selection
        theme.dark = (mode === 'dark');
      }
      return;
    }

    // If mode is null (auto), follow system preference
    this.mql = window.matchMedia('(prefers-color-scheme: dark)');
    this.mql.addListener((e: MediaQueryListEvent) => {
      theme.dark = e.matches
    })
    theme.dark = this.mql.matches
  }

  @Watch('config.fontScale', {immediate: true})
  onFontScale(scale: number | null) {
    const safeScale = typeof scale === 'number' && scale > 0 ? scale : 1;
    document.documentElement.style.setProperty('--app-font-scale', String(safeScale));
  }

  @Watch('config.darkMode')
  onDarkMode(mode: any) {
    // Migration: if darkMode is set but themeMode is not, migrate the setting (only once on load)
    if (mode != null && this.config.themeMode == null) {
      this.$store.commit('updateConfig', {
        key: 'themeMode',
        value: mode ? 'dark' : 'light',
      });
      // Clear the old darkMode setting
      this.$store.commit('updateConfig', {
        key: 'darkMode',
        value: null,
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.v-footer {
  min-height: 36px;
}
</style>

<style lang="scss">
html {
  overflow-y: hidden;
}

html {
  font-size: calc(16px * var(--app-font-scale, 1));
}

// Grey theme background colors
.v-application.theme--light {
  &.grey-theme {
    background-color: #e0e0e0 !important;
    
    .v-main {
      background-color: #e0e0e0 !important;
    }
    
    .v-card {
      background-color: #ececec !important;
    }
    
    .v-sheet:not(.v-toolbar) {
      background-color: #ececec !important;
    }
    
    .v-navigation-drawer {
      background-color: #ececec !important;
    }
    
    .v-app-bar.v-toolbar {
      background-color: #ececec !important;
    }
    
    .v-data-table {
      background-color: #ececec !important;
      
      tbody tr {
        background-color: #ececec !important;
        
        &:hover {
          background-color: #d5d5d5 !important;
        }
      }
      
      tbody tr:nth-child(2n) {
        background-color: #e5e5e5 !important;
      }
      
      thead {
        background-color: #d8d8d8 !important;
        
        th {
          background-color: #d8d8d8 !important;
        }
      }
      
      .v-data-table-header {
        background-color: #d8d8d8 !important;
        
        th {
          background-color: #d8d8d8 !important;
        }
      }
    }
    
    .v-list {
      background-color: #ececec !important;
    }
    
    .v-list-item {
      &:hover {
        background-color: #d5d5d5 !important;
      }
    }
  }
}
</style>
