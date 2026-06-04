<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    scrollable
    persistent
    max-width="720px"
  >
    <v-card>
      <v-card-title class="headline">
        <v-icon class="mr-2">mdi-cog</v-icon>
        <span v-text="$t('settings')" />
        <v-spacer />
        <v-btn
          icon
          @click="closeDialog"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-tabs v-model="tab">
          <v-tab
            v-for="item of tabList"
            :key="item"
            :value="item"
          >
            {{ $t('preferences.' + item) }}
          </v-tab>
        </v-tabs>
        <v-fade-transition>
          <v-alert
            density="compact"
            text
            type="success"
            v-show="preferenceUpdated"
          >
            {{ $t('preferences.change_applied') }}
          </v-alert>
        </v-fade-transition>
        <v-window v-model="tab">
          <v-window-item value="downloads">
            <download-settings />
          </v-window-item>
          <v-window-item value="speed">
            <speed-settings />
          </v-window-item>
          <v-window-item value="rss">
            <rss-settings />
          </v-window-item>
          <v-window-item value="webui">
            <web-u-i-settings />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Emit, Prop, Watch } from 'vue-facing-decorator'
import DownloadSettings from './DownloadSettings.vue'
import SpeedSettings from './SpeedSettings.vue'
import {Preferences} from '@/types'
import WebUISettings from './WebUISettings.vue'
import RssSettings from './RssSettings.vue'
import {Config} from '@/store/config'
import { timeout } from '@/utils'

@Component({
  components: {
    DownloadSettings,
    SpeedSettings,
    WebUISettings,
    RssSettings,
  },
})
export default class SettingsDialog extends Vue {
  @Prop({ type: Boolean })
  readonly modelValue!: boolean

  get config(): Config {
    return this.$store.getters.config;
  }
  get preferences(): Preferences {
    return this.$store.getters.allPreferences;
  }

  preferenceUpdated = false
  tabList = ['downloads', 'speed', 'rss', 'webui']
  tab = 'downloads'

  @Watch('preferences')
  @Watch('config')
  async onPreferenceUpdate() {
    this.preferenceUpdated = true
    await timeout(3000)
    this.preferenceUpdated = false
  }

  @Emit('update:modelValue')
  closeDialog() {
    return false
  }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/styles.scss";

@include dialog-title;

:deep(.v-card__text) {
}
</style>
