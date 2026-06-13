<template>
  <div class="drawer-footer">
    <v-expand-transition v-if="showInfo">
      <div>
        <v-divider />

        <AppFooter
          phone-layout
        />
      </div>
    </v-expand-transition>

    <v-divider />

    <div class="button-bar">
      <v-btn
        icon
        :title="pinned ? 'Unpin drawer' : 'Pin drawer'"
        @click="togglePin"
      >
        <v-icon>{{ pinned ? 'mdi-pin' : 'mdi-pin-off' }}</v-icon>
      </v-btn>

      <template v-if="phoneLayout">
        <v-btn
          icon
          @click="showInfo = !showInfo"
        >
          <v-icon>mdi-information</v-icon>
        </v-btn>
      </template>

      <v-spacer />

      <v-menu>
        <template #activator="{ props }">
          <v-btn
            icon
            v-bind="props"
          >
            <v-icon>mdi-translate</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item
            v-for="item in locales"
            :key="item.value"
            :active="currentLocale === item.value"
            @click="currentLocale = item.value"
          >
            <v-list-item-title>{{ item.text }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn
        icon
        @click="cycleFontScale"
        :title="fontScaleTitle"
      >
        <v-icon>mdi-format-size</v-icon>
      </v-btn>

      <v-menu>
        <template #activator="{ props }">
          <v-btn
            icon
            v-bind="props"
          >
            <v-icon>{{ themeModeIcon }}</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item
            v-for="item in themeModes"
            :key="item[0]"
            :active="currentThemeMode === item[0]"
            @click="currentThemeMode = item[0] as any"
          >
            <v-list-item-title>{{ item[1] }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn
        icon
        @click="triggerSwitchUi"
        :title="$t('label.switch_to_old_ui')"
      >
        <v-icon>mdi-history</v-icon>
      </v-btn>
      <v-btn
        icon
        @click="triggerApplicationShutdown"
        :title="$t('trigger_application_shutdown')"
      >
        <v-icon>mdi-power-plug-off</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, toNative } from 'vue-facing-decorator';
import { useDisplay } from 'vuetify';
import api from '../../Api';

import { tr, translations, defaultLocale, LocaleKey } from '@/locale';
import { DialogType, DialogConfig, SnackBarConfig, ConfigPayload } from '@/store/types';
import AppFooter from '@/components/Footer.vue';
import { useConfigStore } from '@/store/config';
import { useDialogStore } from '@/store/dialog';
import { useSnackBarStore } from '@/store/snackBar';

const AUTO_KEY = 'auto';

type AllLocaleKey = NonNullable<LocaleKey> | typeof AUTO_KEY;
type ThemeModeKey = 'light' | 'dark' | 'grey' | 'luxury' | 'modern-dark' | 'crypto' | 'cyberpunk' | 'natural' | 'technology' | null;

@Component({
  components: {
    AppFooter,
  },
})
class DrawerFooter extends Vue {
  private  display = useDisplay() as any;
  configStore = useConfigStore()
  dialogStore = useDialogStore()
  snackBarStore = useSnackBarStore()

  locales: { text: string; value: string }[] = this.buildLocales()
  currentLocale: string = AUTO_KEY
  oldLocale = AUTO_KEY
  showInfo = false

  get pinned() {
    return this.configStore.config.drawerPinned ?? false;
  }

  togglePin() {
    this.updateConfig({
      key: 'drawerPinned',
      value: !this.pinned,
    });
  }

  themeModes = [
    ['light', tr('light')],
    ['dark', tr('dark')],
    ['grey', tr('grey')],
    ['luxury', tr('luxury')],
    ['modern-dark', tr('modernDark')],
    ['crypto', tr('crypto')],
    ['cyberpunk', tr('cyberpunk')],
    ['natural', tr('natural')],
    ['technology', tr('technology')],
    [AUTO_KEY, tr('auto')],
  ]

  fontScales = [0.9, 1, 1.2, 1.35]

  created() {
    this.currentLocale = this.configStore.config.locale || AUTO_KEY
    this.oldLocale = this.configStore.config.locale || AUTO_KEY
  }

  async asyncShowDialog(config: DialogConfig): Promise<string | undefined> {
    return this.dialogStore.asyncShowDialog(config);
  }
  showSnackBar(config: SnackBarConfig) {
    this.snackBarStore.showSnackBar(config);
  }
  updateConfig(payload: ConfigPayload) {
    this.configStore.updateConfig(payload);
  }

  get currentThemeMode() {
    return this.configStore.config.themeMode || AUTO_KEY;
  }

  set currentThemeMode(value: ThemeModeKey | typeof AUTO_KEY) {
    // Guard against undefined values from v-list-item-group
    if (value === undefined) {
      return;
    }
    this.updateConfig({
      key: 'themeMode',
      value: value === AUTO_KEY ? null : value,
    });
  }

  get themeModeIcon() {
    if (this.currentThemeMode === 'dark') {
      return 'mdi-brightness-4'
    } else if (this.currentThemeMode === 'light') {
      return 'mdi-brightness-7'
    } else if (this.currentThemeMode === 'grey') {
      return 'mdi-brightness-6'
    } else {
      return 'mdi-brightness-auto'
    }
  }

  get currentFontScale() {
    const scale = this.configStore.config.fontScale;
    return typeof scale === 'number' && scale > 0 ? scale : 1;
  }

  get fontScaleTitle() {
    return `${tr('label.font_size')}: ${Math.round(this.currentFontScale * 100)}%`;
  }

  get phoneLayout() {
    return this.display.xs;
  }

  buildLocales(): { text: string; value: string }[] {
    const locales = Object.entries(translations).map(([lang, translation]) => {
      return {
        text: translation.lang,
        value: lang,
      };
    });

    return [
      {
        text: tr('auto'),
        value: 'auto',
      },
      ...locales,
    ]
  }

  @Watch('currentLocale')
  async onCurrentLocaleChanged(locale: AllLocaleKey, _oldValue: AllLocaleKey) {
    // Guard against undefined from v-list-item-group
    if (locale === undefined) {
      return;
    }
    
    if (locale === this.oldLocale) {
      return;
    }

    const localeKey = locale === AUTO_KEY ? defaultLocale : locale
    const confirm = await this.asyncShowDialog({
      text: tr('dialog.switch_locale.msg', { lang: translations[localeKey].lang }),
      type: DialogType.OkCancel,
    });

    if (!confirm) {
      this.currentLocale = this.oldLocale;
      return;
    }

    // Update the old locale tracker
    this.oldLocale = locale;

    this.updateConfig({
      key: 'locale',
      value: locale === AUTO_KEY ? null : locale,
    });

    this.showSnackBar({
      text: tr('label.reloading'),
    })

    location.reload();
  }

  cycleFontScale() {
    const current = this.currentFontScale;
    const currentIndex = this.fontScales.findIndex(scale => Math.abs(scale - current) < 0.001);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % this.fontScales.length;
    this.updateConfig({
      key: 'fontScale',
      value: this.fontScales[nextIndex],
    });
  }

  @Watch('currentThemeMode')
  onThemeModeChanged(_mode: ThemeModeKey | typeof AUTO_KEY) {
    // Watcher kept for potential future use
  }

  async triggerApplicationShutdown() {
    const v = await this.asyncShowDialog({
      title:  tr('dialog.trigger_exit_qb.title'),
      text:  tr('dialog.trigger_exit_qb.text'),
      type: DialogType.OkCancel,
    });

    if (!v) {
      return;
    }
    await api.shutdownApplication();
  }

  async triggerSwitchUi() {
    const v = await this.asyncShowDialog({
      title:  tr('dialog.switch_to_old_ui.title'),
      text:  tr('dialog.switch_to_old_ui.text'),
      type: DialogType.OkCancel,
    });

    if (!v) {
      return;
    }
    await api.switchToOldUi();
    location.reload();
  }
}

export default toNative(DrawerFooter)
</script>

<style lang="scss" scoped>
.button-bar {
  display: flex;
  padding: 0 8px;
  align-items: center;
  height: 52px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.v-theme--dark .button-bar {
  border-top-color: rgba(255, 255, 255, 0.08);
}

.button-bar :deep(.v-btn) {
  min-width: 36px;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.06);
  }

  .v-theme--dark &:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }
}

.button-bar :deep(.v-icon) {
  font-size: 20px;
  opacity: 0.7;
  transition: opacity 0.15s ease;
}

.button-bar :deep(.v-btn:hover .v-icon) {
  opacity: 1;
}

.footer {
  padding: 1em;
}
</style>
