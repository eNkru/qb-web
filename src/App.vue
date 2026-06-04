<template>
  <v-app ref="app">
    <v-navigation-drawer
      app
      v-model="drawer"
      :class="{'phone-layout': phoneLayout}"
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
      v-if="$vuetify.display.smAndUp"
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
import { Vue, Component, Watch, toNative } from 'vue-facing-decorator';
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
})
class App extends Vue {
  drawer = true
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

  get mainData(): MainData {
    return this.$store.state.mainData;
  }
  get rid(): number {
    return this.$store.state.rid;
  }
  get preferences(): any {
    return this.$store.state.preferences;
  }
  get needAuth(): boolean {
    return this.$store.state.needAuth;
  }
  get config(): Config {
    return this.$store.getters.config;
  }

  updateMainData(data: any) {
    this.$store.commit('updateMainData', data);
  }
  updatePreferences(data: any) {
    this.$store.commit('updatePreferences', data);
  }
  setPasteUrl(data: any) {
    this.$store.commit('setPasteUrl', data);
  }
  updateNeedAuth(value: boolean) {
    this.$store.commit('updateNeedAuth', value);
  }

  get phoneLayout() {
    return this.$vuetify.display.xs;
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
    this.drawer = !this.phoneLayout;

    this.initProtocolHandler();

    await this.getInitData();
    appWrapEl = (this.$refs.app as any).$el;
    appWrapEl.addEventListener('paste', this.onPaste);
  }

  beforeUnmount() {
    if (this.task) {
      clearTimeout(this.task);
    }
    appWrapEl?.removeEventListener('paste', this.onPaste);
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

  private setThemeColors(
    target: 'light' | 'dark',
    colors: Record<string, string>,
  ) {
    const theme = this.$vuetify.theme as any;
    const themeColors = theme.themes[target].colors;
    Object.keys(colors).forEach(key => {
      themeColors[key] = colors[key];
    });
  }

  private removeThemeClasses() {
    const app = (this.$refs.app as any)?.$el;
    if (app) {
      app.classList.remove('grey-theme', 'luxury-theme', 'natural-theme', 'technology-theme', 'modern-dark-theme', 'crypto-theme', 'cyberpunk-theme');
    }
  }

  @Watch('needAuth')
  onNeedAuth(v: boolean) {
    if (!v) {
      this.getInitData();
    }
  }

  @Watch('config.themeMode', {immediate: true})
  onThemeMode(mode: 'light' | 'dark' | 'grey' | 'luxury' | 'modern-dark' | 'crypto' | 'cyberpunk' | 'natural' | 'technology' | null) {
    const theme = this.$vuetify.theme as any;

    if (mode != null) {
      if (this.mql) {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.mql.removeEventListener('change', () => {});
        this.mql = undefined
      }

      if (mode === 'grey' || mode === 'luxury' || mode === 'natural' || mode === 'technology') {
        theme.change('light');

        if (mode === 'grey') {
          this.setThemeColors('light', {
            primary: '#6b8fb5', secondary: '#757575', accent: '#90b4d4',
            error: '#d32f2f', info: '#5c9fd6', success: '#66bb6a', warning: '#ffa726',
          });
        } else if (mode === 'luxury') {
          this.setThemeColors('light', {
            primary: '#D4AF37', secondary: '#6C6863', accent: '#D4AF37',
            error: '#FF5252', info: '#2196F3', success: '#4CAF50', warning: '#FFC107',
            background: '#F9F8F6',
          });
        } else if (mode === 'natural') {
          this.setThemeColors('light', {
            primary: '#5D7052', secondary: '#C18C5D', accent: '#E6DCCD',
            error: '#A85448', info: '#5D7052', success: '#5D7052', warning: '#C18C5D',
            background: '#FDFCF8',
          });
        } else {
          this.setThemeColors('light', {
            primary: '#0052FF', secondary: '#64748B', accent: '#0052FF',
            error: '#EF4444', info: '#0052FF', success: '#22C55E', warning: '#F59E0B',
            background: '#FAFAFA',
          });
        }

        this.$nextTick(() => {
          this.removeThemeClasses();
          const app = (this.$refs.app as any)?.$el;
          if (app) {
            if (mode === 'grey') app.classList.add('grey-theme');
            else if (mode === 'luxury') app.classList.add('luxury-theme');
            else if (mode === 'natural') app.classList.add('natural-theme');
            else app.classList.add('technology-theme');
          }
        });
      } else if (mode === 'modern-dark') {
        theme.change('dark');
        this.setThemeColors('dark', {
          primary: '#5E6AD2', secondary: '#8A8F98', accent: '#5E6AD2',
          error: '#FF5252', info: '#2196F3', success: '#4CAF50', warning: '#FFC107',
        });

        this.$nextTick(() => {
          this.removeThemeClasses();
          const app = (this.$refs.app as any)?.$el;
          if (app) app.classList.add('modern-dark-theme');
        });
      } else if (mode === 'crypto') {
        theme.change('dark');
        this.setThemeColors('dark', {
          primary: '#F7931A', secondary: '#94A3B8', accent: '#F7931A',
          error: '#FF5252', info: '#2196F3', success: '#FFD600', warning: '#EA580C',
        });

        this.$nextTick(() => {
          this.removeThemeClasses();
          const app = (this.$refs.app as any)?.$el;
          if (app) app.classList.add('crypto-theme');
        });
      } else if (mode === 'cyberpunk') {
        theme.change('dark');
        this.setThemeColors('dark', {
          primary: '#00ff88', secondary: '#6b7280', accent: '#00ff88',
          error: '#ff3366', info: '#00d4ff', success: '#00ff88', warning: '#ff00ff',
        });

        this.$nextTick(() => {
          this.removeThemeClasses();
          const app = (this.$refs.app as any)?.$el;
          if (app) app.classList.add('cyberpunk-theme');
        });
      } else {
        this.setThemeColors('light', {
          primary: '#1976d2', secondary: '#424242', accent: '#82B1FF',
          error: '#FF5252', info: '#2196F3', success: '#4CAF50', warning: '#FFC107',
        });

        this.$nextTick(() => {
          this.removeThemeClasses();
        });

        theme.change((mode === 'dark') ? 'dark' : 'light');
      }
      return;
    }

    this.mql = window.matchMedia('(prefers-color-scheme: dark)');
    this.mql.addEventListener('change', (e: MediaQueryListEvent) => {
      theme.change(e.matches ? 'dark' : 'light');
    });
    theme.change(this.mql.matches ? 'dark' : 'light');
  }

  @Watch('config.fontScale', {immediate: true})
  onFontScale(scale: number | null) {
    const safeScale = typeof scale === 'number' && scale > 0 ? scale : 1;
    document.documentElement.style.setProperty('--app-font-scale', String(safeScale));
  }

  @Watch('config.darkMode')
  onDarkMode(mode: any) {
    if (mode != null && this.config.themeMode == null) {
      this.$store.commit('updateConfig', {
        key: 'themeMode',
        value: mode ? 'dark' : 'light',
      });
      this.$store.commit('updateConfig', {
        key: 'darkMode',
        value: null,
      });
    }
  }
}

export default toNative(App)
</script>

<style lang="scss" scoped>
:deep(.v-footer) {
  min-height: 36px;
}
</style>

<style lang="scss">
html {
  overflow-y: hidden;
}

html {
  font-size: calc(16px * var(--app-font-scale, 1)) !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.v-navigation-drawer {
  font-size: calc(16px * var(--app-font-scale, 1));
  top: 64px !important;
  height: calc(100vh - 100px) !important;
}

.v-app-bar {
  left: 0 !important;
  width: 100% !important;
}

.v-footer {
  left: 0 !important;
  width: 100% !important;
}

.v-main {
  padding-top: 64px !important;
}

// Grey theme background colors
.v-theme--light {
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
.v-theme--light {
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

    .text-secondary,
    .v-label,
    .v-messages {
      color: #6C6863 !important;
    }
  }
}

// Modern Dark theme
.v-theme--dark {
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

    .text-secondary,
    .v-label,
    .v-messages {
      color: #8A8F98 !important;
    }

    .v-divider {
      border-color: #1e1e24 !important;
    }

    .v-field,
    .v-select,
    .v-textarea {
      color: #EDEDEF !important;
    }

    .v-field__field {
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

    .v-btn--active {
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

    .v-snackbar__wrapper {
      background-color: #141418 !important;
    }
  }
}

// Crypto theme - True Void with Bitcoin Fire
.v-theme--dark {
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

    .text-secondary,
    .v-label,
    .v-messages {
      color: #94A3B8 !important;
    }

    .v-divider {
      border-color: #1E293B !important;
    }

    .v-field,
    .v-select,
    .v-textarea {
      color: #FFFFFF !important;
    }

    .v-field__field {
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

    .v-btn--active {
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
.v-theme--dark {
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

    .text-secondary,
    .v-label,
    .v-messages {
      color: #6b7280 !important;
    }

    .v-divider {
      border-color: #2a2a3a !important;
    }

    .v-field,
    .v-select,
    .v-textarea {
      color: #e0e0e0 !important;
    }

    .v-field__field {
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

    .v-btn--active {
      color: #00ff88 !important;
    }

    a {
      color: #00ff88 !important;

      &:hover {
        color: #ff00ff !important;
      }
    }

    .v-field--focused .v-field__field {
      border-color: #00ff88 !important;
      box-shadow: 0 0 6px rgba(0, 255, 136, 0.25) !important;
    }

    .v-tabs {
      .v-tab--selected {
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
.v-theme--light {
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

    .text-secondary,
    .v-label,
    .v-messages {
      color: #78786C !important;
    }

    .v-divider {
      border-color: #DED8CF !important;
    }

    .v-field,
    .v-select,
    .v-textarea {
      color: #2C2C24 !important;
    }

    .v-field__field {
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

    .v-btn--active {
      color: #5D7052 !important;
    }

    a {
      color: #5D7052 !important;

      &:hover {
        color: #C18C5D !important;
      }
    }

    .v-field--focused .v-field__field {
      border-color: #5D7052 !important;
    }

    .v-tabs {
      .v-tab--selected {
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
.v-theme--light {
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

    .text-secondary,
    .v-label,
    .v-messages {
      color: #64748B !important;
    }

    .v-divider {
      border-color: #E2E8F0 !important;
    }

    .v-field,
    .v-select,
    .v-textarea {
      color: #0F172A !important;
    }

    .v-field__field {
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

    .v-btn--active {
      color: #0052FF !important;
    }

    a {
      color: #0052FF !important;

      &:hover {
        color: #4D7CFF !important;
      }
    }

    .v-field--focused .v-field__field {
      border-color: #0052FF !important;
      box-shadow: 0 0 0 1px #0052FF !important;
    }

    .v-tabs {
      .v-tab--selected {
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

    .v-btn--variant-elevated {
      &.bg-primary {
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

.v-theme--light .v-navigation-drawer .v-navigation-drawer__content,
.v-theme--light .v-navigation-drawer .v-sheet,
.v-theme--light .v-navigation-drawer .v-list,
.v-theme--dark .v-navigation-drawer .v-navigation-drawer__content,
.v-theme--dark .v-navigation-drawer .v-sheet,
.v-theme--dark .v-navigation-drawer .v-list {
  background-color: transparent !important;
}
</style>
