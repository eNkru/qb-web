<template>
  <v-container>
    <v-switch
      :model-value="preferences.rss_processing_enabled"
      :label="$t('preferences.rss_processing_enabled')"
      @change="changeSettings('rss_processing_enabled', !preferences.rss_processing_enabled)"
    />
    <v-switch
      :model-value="preferences.rss_auto_downloading_enabled"
      :label="$t('preferences.rss_auto_downloading_enabled')"
      @change="changeSettings('rss_auto_downloading_enabled', !preferences.rss_auto_downloading_enabled)"
    />
    <v-text-field
      variant="outlined"
      density="compact"
      suffix="min"
      type="number"
      :model-value="preferences.rss_refresh_interval"
      :label="$t('preferences.rss_refresh_interval')"
      @change="changeSettings('rss_refresh_interval', $event)"
    />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-facing-decorator'
import {Preferences} from '@/types'

@Component({
  components: {},
})
export default class SpeedSettings extends Vue {
  get preferences(): Preferences {
    return this.$store.getters.allPreferences;
  }

  updatePreferencesRequest(data: any) {
    return this.$store.dispatch('updatePreferencesRequest', data);
  }

  changeSettings(property: string, value: string | boolean | number) {
    this.updatePreferencesRequest({[property]: value})
  }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/styles.scss";

:deep(.v-switch) {
  margin: 0
}

@include dialog-title;
</style>
