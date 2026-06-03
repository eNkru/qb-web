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
      <torrents @torrent-contextmenu="onTorrentContextMenu" />
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

    <ContextMenu
      v-model="contextMenu.show"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :save-path="contextMenu.savePath"
      @close="contextMenu.show = false"
    />
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
import ContextMenu from './components/ContextMenu.vue';


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
    ContextMenu,
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
  contextMenu = {
    show: false,
    x: 0,
    y: 0,
    savePath: '',
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

  onTorrentContextMenu(payload: { x: number; y: number; savePath: string }) {
    this.contextMenu.show = false;
    this.$nextTick(() => {
      this.contextMenu.x = payload.x;
      this.contextMenu.y = payload.y;
      this.contextMenu.savePath = payload.savePath;
      this.contextMenu.show = true;
    });
  }

  @Watch('needAuth')
  onNeedAuth(v: boolean) {
    if (!v) {
      this.getInitData();
    }
  }

  @Watch('config.themeMode', {immediate: true})
  onThemeMode(mode: 'light' | 'dark' | 'grey' | 'luxury' | 'modern-dark' | 'crypto' | 'cyberpunk' | 'natural' | 'technology' | null) {
    const { theme } = this.$vuetify;

    // If user explicitly chose a theme
    if (mode != null) {
      if (this.mql) {
        this.mql.removeListener(null)
        this.mql = undefined
      }
      
      // Apply grey/luxury/natural/technology theme (light variants)
      if (mode === 'grey' || mode === 'luxury' || mode === 'natural' || mode === 'technology') {
        theme.dark = false;
        
        if (mode === 'grey') {
          // Apply darker grey color scheme
          theme.themes.light.primary = '#6b8fb5';
          theme.themes.light.secondary = '#757575';
          theme.themes.light.accent = '#90b4d4';
          theme.themes.light.error = '#d32f2f';
          theme.themes.light.info = '#5c9fd6';
          theme.themes.light.success = '#66bb6a';
          theme.themes.light.warning = '#ffa726';
        } else if (mode === 'luxury') {
          // Apply luxury color scheme
          theme.themes.light.primary = '#D4AF37';
          theme.themes.light.secondary = '#6C6863';
          theme.themes.light.accent = '#D4AF37';
          theme.themes.light.error = '#FF5252';
          theme.themes.light.info = '#2196F3';
          theme.themes.light.success = '#4CAF50';
          theme.themes.light.warning = '#FFC107';
          theme.themes.light.background = '#F9F8F6';
        } else if (mode === 'natural') {
          // Apply natural color scheme
          theme.themes.light.primary = '#5D7052';
          theme.themes.light.secondary = '#C18C5D';
          theme.themes.light.accent = '#E6DCCD';
          theme.themes.light.error = '#A85448';
          theme.themes.light.info = '#5D7052';
          theme.themes.light.success = '#5D7052';
          theme.themes.light.warning = '#C18C5D';
          theme.themes.light.background = '#FDFCF8';
        } else {
          // Apply technology color scheme
          theme.themes.light.primary = '#0052FF';
          theme.themes.light.secondary = '#64748B';
          theme.themes.light.accent = '#0052FF';
          theme.themes.light.error = '#EF4444';
          theme.themes.light.info = '#0052FF';
          theme.themes.light.success = '#22C55E';
          theme.themes.light.warning = '#F59E0B';
          theme.themes.light.background = '#FAFAFA';
        }
        
        // Add theme class
        this.$nextTick(() => {
          const app = (this.$refs.app as any)?.$el;
          if (app) {
            app.classList.remove('grey-theme', 'luxury-theme', 'natural-theme', 'technology-theme', 'modern-dark-theme', 'crypto-theme', 'cyberpunk-theme');
            if (mode === 'grey') app.classList.add('grey-theme');
            else if (mode === 'luxury') app.classList.add('luxury-theme');
            else if (mode === 'natural') app.classList.add('natural-theme');
            else app.classList.add('technology-theme');
          }
        });
      } else if (mode === 'modern-dark') {
        // Apply modern dark theme
        theme.dark = true;
        theme.themes.dark.primary = '#5E6AD2';
        theme.themes.dark.secondary = '#8A8F98';
        theme.themes.dark.accent = '#5E6AD2';
        theme.themes.dark.error = '#FF5252';
        theme.themes.dark.info = '#2196F3';
        theme.themes.dark.success = '#4CAF50';
        theme.themes.dark.warning = '#FFC107';
        
        this.$nextTick(() => {
          const app = (this.$refs.app as any)?.$el;
          if (app) {
            app.classList.remove('grey-theme', 'luxury-theme', 'natural-theme', 'technology-theme', 'modern-dark-theme', 'crypto-theme', 'cyberpunk-theme');
            app.classList.add('modern-dark-theme');
          }
        });
      } else if (mode === 'crypto') {
        // Apply crypto theme
        theme.dark = true;
        theme.themes.dark.primary = '#F7931A';
        theme.themes.dark.secondary = '#94A3B8';
        theme.themes.dark.accent = '#F7931A';
        theme.themes.dark.error = '#FF5252';
        theme.themes.dark.info = '#2196F3';
        theme.themes.dark.success = '#FFD600';
        theme.themes.dark.warning = '#EA580C';
        
        this.$nextTick(() => {
          const app = (this.$refs.app as any)?.$el;
          if (app) {
            app.classList.remove('grey-theme', 'luxury-theme', 'natural-theme', 'technology-theme', 'modern-dark-theme', 'crypto-theme', 'cyberpunk-theme');
            app.classList.add('crypto-theme');
          }
        });
      } else if (mode === 'cyberpunk') {
        // Apply cyberpunk theme
        theme.dark = true;
        theme.themes.dark.primary = '#00ff88';
        theme.themes.dark.secondary = '#6b7280';
        theme.themes.dark.accent = '#00ff88';
        theme.themes.dark.error = '#ff3366';
        theme.themes.dark.info = '#00d4ff';
        theme.themes.dark.success = '#00ff88';
        theme.themes.dark.warning = '#ff00ff';
        
        this.$nextTick(() => {
          const app = (this.$refs.app as any)?.$el;
          if (app) {
            app.classList.remove('grey-theme', 'luxury-theme', 'natural-theme', 'technology-theme', 'modern-dark-theme', 'crypto-theme', 'cyberpunk-theme');
            app.classList.add('cyberpunk-theme');
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
        
        // Remove theme classes
        this.$nextTick(() => {
          const app = (this.$refs.app as any)?.$el;
          if (app) {
            app.classList.remove('grey-theme', 'luxury-theme', 'natural-theme', 'technology-theme', 'modern-dark-theme', 'crypto-theme', 'cyberpunk-theme');
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

// Luxury theme - Sophisticated Monochrome
.v-application.theme--light {
  &.luxury-theme {
    color: #1A1A1A !important;

    .v-main {
      background-color: #F9F8F6 !important;
    }

    .v-card {
      background-color: #F0EEEB !important;
      color: #1A1A1A !important;
    }

    .v-sheet:not(.v-toolbar) {
      background-color: #F0EEEB !important;
    }

    .v-navigation-drawer {
      background-color: #F9F8F6 !important;
    }

    .v-app-bar.v-toolbar {
      background-color: #F9F8F6 !important;
    }

    .v-data-table {
      background-color: #F9F8F6 !important;
      color: #1A1A1A !important;

      tbody tr {
        background-color: #F9F8F6 !important;

        &:hover {
          background-color: #F0EEEB !important;
        }
      }

      tbody tr:nth-child(2n) {
        background-color: #F0EEEB !important;
      }

      thead {
        background-color: #F0EEEB !important;

        th {
          background-color: #F0EEEB !important;
          color: #1A1A1A !important;
        }
      }

      .v-data-table-header {
        background-color: #F0EEEB !important;

        th {
          background-color: #F0EEEB !important;
          color: #1A1A1A !important;
        }
      }
    }

    .v-list {
      background-color: #F9F8F6 !important;
    }

    .v-list-item {
      &:hover {
        background-color: #F0EEEB !important;
      }
    }

    .text--secondary,
    .v-label,
    .v-messages {
      color: #6C6863 !important;
    }
  }
}

// Modern Dark theme
.v-application.theme--dark {
  &.modern-dark-theme {
    background-color: #050506 !important;
    color: #EDEDEF !important;

    .v-main {
      background-color: #050506 !important;
    }

    .v-footer {
      background-color: #020203 !important;
    }

    .v-card {
      background-color: #141418 !important;
      color: #EDEDEF !important;
      border: 1px solid #1e1e24 !important;

      &:hover {
        background-color: #1a1a20 !important;
        border-color: #2a2a32 !important;
      }
    }

    .v-sheet:not(.v-toolbar) {
      background-color: #141418 !important;
    }

    .v-navigation-drawer {
      background-color: #0a0a0c !important;
    }

    .v-app-bar.v-toolbar {
      background-color: #0a0a0c !important;
      border-bottom: 1px solid #1e1e24 !important;
    }

    .v-btn {
      &:hover {
        background-color: rgba(255, 255, 255, 0.08) !important;
      }
    }

    .v-data-table {
      background-color: #050506 !important;
      color: #EDEDEF !important;

      tbody tr {
        background-color: #050506 !important;
        border-bottom: 1px solid #1e1e24 !important;

        &:hover {
          background-color: #141418 !important;
        }
      }

      tbody tr:nth-child(2n) {
        background-color: rgba(20, 20, 24, 0.5) !important;
      }

      thead {
        background-color: #0a0a0c !important;

        th {
          background-color: #0a0a0c !important;
          color: #8A8F98 !important;
          border-bottom: 1px solid #1e1e24 !important;
        }
      }

      .v-data-table-header {
        background-color: #0a0a0c !important;

        th {
          background-color: #0a0a0c !important;
          color: #8A8F98 !important;
        }
      }
    }

    .v-list {
      background-color: #050506 !important;
    }

    .v-list-item {
      color: #EDEDEF !important;

      &:hover {
        background-color: #141418 !important;
      }
    }

    .text--secondary,
    .v-label,
    .v-messages {
      color: #8A8F98 !important;
    }

    .v-divider {
      border-color: #1e1e24 !important;
    }

    .v-input,
    .v-select,
    .v-textarea {
      color: #EDEDEF !important;
    }

    .v-input__slot {
      background-color: #141418 !important;
      border: 1px solid #1e1e24 !important;

      &:hover {
        border-color: #2a2a32 !important;
      }
    }

    .v-chip {
      background-color: #141418 !important;
      color: #EDEDEF !important;
      border: 1px solid #1e1e24 !important;
    }

    .v-btn--active,
    .v-btn--active::before {
      color: #5E6AD2 !important;
    }

    a {
      color: #5E6AD2 !important;

      &:hover {
        color: #7B84E0 !important;
      }
    }

    .v-dialog {
      .v-card {
        background-color: #141418 !important;
      }
    }

    .v-menu__content {
      background-color: #141418 !important;
    }

    .v-snack__wrapper {
      background-color: #141418 !important;
    }
  }
}

// Crypto theme - True Void with Bitcoin Fire
.v-application.theme--dark {
  &.crypto-theme {
    background-color: #030304 !important;
    color: #FFFFFF !important;

    .v-main {
      background-color: #030304 !important;
    }

    .v-footer {
      background-color: #030304 !important;
    }

    .v-card {
      background-color: #0F1115 !important;
      color: #FFFFFF !important;
      border: 1px solid #1E293B !important;

      &:hover {
        border-color: rgba(247, 147, 26, 0.3) !important;
      }
    }

    .v-sheet:not(.v-toolbar) {
      background-color: #0F1115 !important;
    }

    .v-navigation-drawer {
      background-color: #0F1115 !important;
    }

    .v-app-bar.v-toolbar {
      background-color: #0F1115 !important;
      border-bottom: 1px solid #1E293B !important;
    }

    .v-btn {
      &:hover {
        background-color: rgba(247, 147, 26, 0.15) !important;
      }
    }

    .v-data-table {
      background-color: #030304 !important;
      color: #FFFFFF !important;

      tbody tr {
        background-color: #030304 !important;
        border-bottom: 1px solid #1E293B !important;

        &:hover {
          background-color: #0F1115 !important;
        }
      }

      tbody tr:nth-child(2n) {
        background-color: rgba(15, 17, 21, 0.5) !important;
      }

      thead {
        background-color: #0F1115 !important;

        th {
          background-color: #0F1115 !important;
          color: #94A3B8 !important;
          border-bottom: 1px solid #1E293B !important;
        }
      }

      .v-data-table-header {
        background-color: #0F1115 !important;

        th {
          background-color: #0F1115 !important;
          color: #94A3B8 !important;
        }
      }
    }

    .v-list {
      background-color: #030304 !important;
    }

    .v-list-item {
      color: #FFFFFF !important;

      &:hover {
        background-color: #0F1115 !important;
      }
    }

    .text--secondary,
    .v-label,
    .v-messages {
      color: #94A3B8 !important;
    }

    .v-divider {
      border-color: #1E293B !important;
    }

    .v-input,
    .v-select,
    .v-textarea {
      color: #FFFFFF !important;
    }

    .v-input__slot {
      background-color: #0F1115 !important;
      border: 1px solid #1E293B !important;

      &:hover {
        border-color: #F7931A !important;
      }
    }

    .v-chip {
      background-color: #0F1115 !important;
      color: #FFFFFF !important;
      border: 1px solid #1E293B !important;
    }

    .v-btn--active,
    .v-btn--active::before {
      color: #F7931A !important;
    }

    a {
      color: #F7931A !important;

      &:hover {
        color: #EA580C !important;
      }
    }
  }
}

// Cyberpunk theme - Neon-lit dark mode
.v-application.theme--dark {
  &.cyberpunk-theme {
    background-color: #0a0a0f !important;
    color: #e0e0e0 !important;

    .v-main {
      background-color: #0a0a0f !important;
    }

    .v-footer {
      background-color: #0a0a0f !important;
    }

    .v-card {
      background-color: #12121a !important;
      color: #e0e0e0 !important;
      border: 1px solid #2a2a3a !important;

      &:hover {
        border-color: #00ff88 !important;
        box-shadow: 0 0 8px rgba(0, 255, 136, 0.15) !important;
      }
    }

    .v-sheet:not(.v-toolbar) {
      background-color: #12121a !important;
    }

    .v-navigation-drawer {
      background-color: #1c1c2e !important;
    }

    .v-app-bar.v-toolbar {
      background-color: #1c1c2e !important;
      border-bottom: 1px solid #2a2a3a !important;
    }

    .v-btn {
      &:hover {
        background-color: rgba(0, 255, 136, 0.1) !important;
        border-color: #00ff88 !important;
      }
    }

    .v-data-table {
      background-color: #0a0a0f !important;
      color: #e0e0e0 !important;

      tbody tr {
        background-color: #0a0a0f !important;
        border-bottom: 1px solid #2a2a3a !important;

        &:hover {
          background-color: #12121a !important;
        }
      }

      tbody tr:nth-child(2n) {
        background-color: rgba(18, 18, 26, 0.5) !important;
      }

      thead {
        background-color: #1c1c2e !important;

        th {
          background-color: #1c1c2e !important;
          color: #6b7280 !important;
          border-bottom: 1px solid #2a2a3a !important;
        }
      }

      .v-data-table-header {
        background-color: #1c1c2e !important;

        th {
          background-color: #1c1c2e !important;
          color: #6b7280 !important;
        }
      }
    }

    .v-list {
      background-color: #0a0a0f !important;
    }

    .v-list-item {
      color: #e0e0e0 !important;

      &:hover {
        background-color: #12121a !important;
      }
    }

    .text--secondary,
    .v-label,
    .v-messages {
      color: #6b7280 !important;
    }

    .v-divider {
      border-color: #2a2a3a !important;
    }

    .v-input,
    .v-select,
    .v-textarea {
      color: #e0e0e0 !important;
    }

    .v-input__slot {
      background-color: #12121a !important;
      border: 1px solid #2a2a3a !important;

      &:hover {
        border-color: #00ff88 !important;
      }
    }

    .v-chip {
      background-color: #12121a !important;
      color: #e0e0e0 !important;
      border: 1px solid #2a2a3a !important;
    }

    .v-btn--active,
    .v-btn--active::before {
      color: #00ff88 !important;
    }

    a {
      color: #00ff88 !important;

      &:hover {
        color: #ff00ff !important;
      }
    }

    .v-text-field--focused .v-input__slot,
    .v-input--is-focused .v-input__slot {
      border-color: #00ff88 !important;
      box-shadow: 0 0 6px rgba(0, 255, 136, 0.25) !important;
    }

    .v-tabs {
      .v-tab--active {
        color: #00ff88 !important;
      }

      .v-tabs-slider {
        background-color: #00ff88 !important;
      }
    }

    .v-pagination__item--active {
      background-color: #00ff88 !important;
      color: #0a0a0f !important;
    }

    .v-progress-linear__determinate {
      background-color: #00ff88 !important;
    }
  }
}

// Natural theme - Forest floor, clay, and unbleached paper
.v-application.theme--light {
  &.natural-theme {
    background-color: #FDFCF8 !important;
    color: #2C2C24 !important;

    .v-main {
      background-color: #FDFCF8 !important;
    }

    .v-card {
      background-color: #F0EBE5 !important;
      color: #2C2C24 !important;
      border: 1px solid #DED8CF !important;

      &:hover {
        border-color: #5D7052 !important;
      }
    }

    .v-sheet:not(.v-toolbar) {
      background-color: #F0EBE5 !important;
    }

    .v-navigation-drawer {
      background-color: #FDFCF8 !important;
    }

    .v-app-bar.v-toolbar {
      background-color: #FDFCF8 !important;
      border-bottom: 1px solid #DED8CF !important;
    }

    .v-btn {
      &:hover {
        background-color: #E6DCCD !important;
      }
    }

    .v-data-table {
      background-color: #FDFCF8 !important;
      color: #2C2C24 !important;

      tbody tr {
        background-color: #FDFCF8 !important;
        border-bottom: 1px solid #DED8CF !important;

        &:hover {
          background-color: #F0EBE5 !important;
        }
      }

      tbody tr:nth-child(2n) {
        background-color: #F0EBE5 !important;
      }

      thead {
        background-color: #E6DCCD !important;

        th {
          background-color: #E6DCCD !important;
          color: #4A4A40 !important;
          border-bottom: 1px solid #DED8CF !important;
        }
      }

      .v-data-table-header {
        background-color: #E6DCCD !important;

        th {
          background-color: #E6DCCD !important;
          color: #4A4A40 !important;
        }
      }
    }

    .v-list {
      background-color: #FDFCF8 !important;
    }

    .v-list-item {
      color: #2C2C24 !important;

      &:hover {
        background-color: #F0EBE5 !important;
      }
    }

    .text--secondary,
    .v-label,
    .v-messages {
      color: #78786C !important;
    }

    .v-divider {
      border-color: #DED8CF !important;
    }

    .v-input,
    .v-select,
    .v-textarea {
      color: #2C2C24 !important;
    }

    .v-input__slot {
      background-color: #F0EBE5 !important;
      border: 1px solid #DED8CF !important;

      &:hover {
        border-color: #5D7052 !important;
      }
    }

    .v-chip {
      background-color: #E6DCCD !important;
      color: #4A4A40 !important;
      border: 1px solid #DED8CF !important;
    }

    .v-btn--active,
    .v-btn--active::before {
      color: #5D7052 !important;
    }

    a {
      color: #5D7052 !important;

      &:hover {
        color: #C18C5D !important;
      }
    }

    .v-text-field--focused .v-input__slot,
    .v-input--is-focused .v-input__slot {
      border-color: #5D7052 !important;
    }

    .v-tabs {
      .v-tab--active {
        color: #5D7052 !important;
      }

      .v-tabs-slider {
        background-color: #5D7052 !important;
      }
    }

    .v-pagination__item--active {
      background-color: #5D7052 !important;
      color: #F3F4F1 !important;
    }

    .v-progress-linear__determinate {
      background-color: #5D7052 !important;
    }
  }
}

// Technology theme - Electric Blue accent on warm off-white
.v-application.theme--light {
  &.technology-theme {
    background-color: #FAFAFA !important;
    color: #0F172A !important;

    .v-main {
      background-color: #FAFAFA !important;
    }

    .v-card {
      background-color: #FFFFFF !important;
      color: #0F172A !important;
      border: 1px solid #E2E8F0 !important;

      &:hover {
        border-color: #0052FF !important;
      }
    }

    .v-sheet:not(.v-toolbar) {
      background-color: #F1F5F9 !important;
    }

    .v-navigation-drawer {
      background-color: #FAFAFA !important;
    }

    .v-app-bar.v-toolbar {
      background-color: #FFFFFF !important;
      border-bottom: 1px solid #E2E8F0 !important;
    }

    .v-btn {
      &:hover {
        background-color: #F1F5F9 !important;
      }
    }

    .v-data-table {
      background-color: #FAFAFA !important;
      color: #0F172A !important;

      tbody tr {
        background-color: #FAFAFA !important;
        border-bottom: 1px solid #E2E8F0 !important;

        &:hover {
          background-color: #F1F5F9 !important;
        }
      }

      tbody tr:nth-child(2n) {
        background-color: #F1F5F9 !important;
      }

      thead {
        background-color: #F1F5F9 !important;

        th {
          background-color: #F1F5F9 !important;
          color: #64748B !important;
          border-bottom: 1px solid #E2E8F0 !important;
        }
      }

      .v-data-table-header {
        background-color: #F1F5F9 !important;

        th {
          background-color: #F1F5F9 !important;
          color: #64748B !important;
        }
      }
    }

    .v-list {
      background-color: #FAFAFA !important;
    }

    .v-list-item {
      color: #0F172A !important;

      &:hover {
        background-color: #F1F5F9 !important;
      }
    }

    .text--secondary,
    .v-label,
    .v-messages {
      color: #64748B !important;
    }

    .v-divider {
      border-color: #E2E8F0 !important;
    }

    .v-input,
    .v-select,
    .v-textarea {
      color: #0F172A !important;
    }

    .v-input__slot {
      background-color: #FFFFFF !important;
      border: 1px solid #E2E8F0 !important;

      &:hover {
        border-color: #0052FF !important;
      }
    }

    .v-chip {
      background-color: #F1F5F9 !important;
      color: #0F172A !important;
      border: 1px solid #E2E8F0 !important;
    }

    .v-btn--active,
    .v-btn--active::before {
      color: #0052FF !important;
    }

    a {
      color: #0052FF !important;

      &:hover {
        color: #4D7CFF !important;
      }
    }

    .v-text-field--focused .v-input__slot,
    .v-input--is-focused .v-input__slot {
      border-color: #0052FF !important;
      box-shadow: 0 0 0 1px #0052FF !important;
    }

    .v-tabs {
      .v-tab--active {
        color: #0052FF !important;
      }

      .v-tabs-slider {
        background: linear-gradient(to right, #0052FF, #4D7CFF) !important;
      }
    }

    .v-pagination__item--active {
      background: linear-gradient(to right, #0052FF, #4D7CFF) !important;
      color: #FFFFFF !important;
    }

    .v-progress-linear__determinate {
      background: linear-gradient(to right, #0052FF, #4D7CFF) !important;
    }

    .v-btn--contained {
      &.primary,
      &.v-btn--primary {
        background: linear-gradient(to right, #0052FF, #4D7CFF) !important;
        color: #FFFFFF !important;
        border: none !important;

        &:hover {
          background: linear-gradient(to right, #0042DD, #3D6CE6) !important;
        }
      }
    }
  }
}

.v-application.theme--light .v-navigation-drawer .v-navigation-drawer__content,
.v-application.theme--light .v-navigation-drawer .v-sheet,
.v-application.theme--light .v-navigation-drawer .v-list,
.v-application.theme--dark .v-navigation-drawer .v-navigation-drawer__content,
.v-application.theme--dark .v-navigation-drawer .v-sheet,
.v-application.theme--dark .v-navigation-drawer .v-list {
  background-color: transparent !important;
}
</style>
