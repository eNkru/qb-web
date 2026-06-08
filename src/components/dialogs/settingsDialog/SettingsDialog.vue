<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    scrollable
    persistent
    :fullscreen="phoneLayout"
    max-width="720px"
  >
    <v-card>
      <v-card-title class="headline">
        <v-icon class="mr-2">mdi-cog</v-icon>
        <span>{{ $t('settings') }}</span>
        <v-spacer />
        <v-btn
          icon
          variant="text"
          size="small"
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
            v-show="preferenceUpdated"
            type="success"
            variant="tonal"
            density="compact"
            closable
            class="mt-2"
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
import { useDisplay } from 'vuetify'
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
  private display = useDisplay() as any;

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

  get phoneLayout() {
    return this.display.xs;
  }

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
@include dialog-title;

:deep(.v-card-text) {
  padding: 20px 24px;
}

:deep(.v-tabs) {
  margin-bottom: 16px;
}

.v-dialog--fullscreen {
  .v-card__text {
    padding-bottom: 68px;
  }
}
</style>
