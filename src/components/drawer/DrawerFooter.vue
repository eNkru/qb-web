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
        <template #activator="{ on }">
          <v-btn
            icon
            v-on="on"
          >
            <v-icon>mdi-translate</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item-group
            v-model="currentLocale"
            color="primary"
          >
            <v-list-item
              v-for="item in locales"
              :key="item.value"
              :value="item.value"
            >
              <v-list-item-title>{{ item.text }}</v-list-item-title>
            </v-list-item>
          </v-list-item-group>
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
        <template #activator="{ on }">
          <v-btn
            icon
            v-on="on"
          >
            <v-icon v-text="themeModeIcon" />
          </v-btn>
        </template>

        <v-list>
          <v-list-item-group
            v-model="currentThemeMode"
            color="primary"
          >
            <v-list-item
              v-for="item in themeModes"
              :key="item[0]"
              :value="item[0]"
            >
              <v-list-item-title>{{ item[1] }}</v-list-item-title>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-menu>
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
import Vue from 'vue'
import Component from 'vue-class-component';
import { mapMutations, mapActions } from 'vuex';
import { Watch } from 'vue-property-decorator';
import api from '../../Api';

import { tr, translations, defaultLocale, LocaleKey } from '@/locale';
import { DialogType, DialogConfig, SnackBarConfig, ConfigPayload } from '@/store/types';
import AppFooter from '@/components/Footer.vue';

const AUTO_KEY = 'auto';

type AllLocaleKey = NonNullable<LocaleKey> | typeof AUTO_KEY;
type ThemeModeKey = 'light' | 'dark' | 'grey' | null;

@Component({
  components: {
    AppFooter,
  },
  methods: {
    ...mapMutations([
      'showSnackBar',
      'updateConfig',
    ]),
    ...mapActions([
      'asyncShowDialog',
    ]),
  },
})
export default class DrawerFooter extends Vue {
  locales = this.buildLocales()
  currentLocale = this.$store.getters.config.locale || AUTO_KEY
  oldLocale = this.$store.getters.config.locale || AUTO_KEY
  showInfo = false

  themeModes = [
    ['light', tr('light')],
    ['dark', tr('dark')],
    ['grey', tr('grey')],
    [AUTO_KEY, tr('auto')],
  ]

  asyncShowDialog!: (_: DialogConfig) => Promise<string | undefined>
  showSnackBar!: (_: SnackBarConfig) => void
  updateConfig!: (_: ConfigPayload) => void

  fontScales = [0.9, 1, 1.2, 1.35]

  get currentThemeMode() {
    return this.$store.getters.config.themeMode || AUTO_KEY;
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
    const scale = this.$store.getters.config.fontScale;
    return typeof scale === 'number' && scale > 0 ? scale : 1;
  }

  get fontScaleTitle() {
    return `${tr('label.font_size')}: ${Math.round(this.currentFontScale * 100)}%`;
  }

  get phoneLayout() {
    return this.$vuetify.breakpoint.xsOnly;
  }

  buildLocales() {
    const locales: {}[] = Object.entries(translations).map(([lang, translation]) => {
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
  async onCurrentLocaleChanged(locale: AllLocaleKey, oldValue: AllLocaleKey) {
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
  onThemeModeChanged(mode: ThemeModeKey | typeof AUTO_KEY) {
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
}
</script>

<style lang="scss" scoped>
.button-bar {
  display: flex;
  padding: 0 8px;
  align-items: center;
  height: 52px;
}

.button-bar :deep(.v-btn) {
  min-width: 40px;
  width: 40px;
  height: 40px;
}

.button-bar :deep(.v-icon) {
  font-size: 22px;
}

.footer {
  padding: 1em;
}
</style>
