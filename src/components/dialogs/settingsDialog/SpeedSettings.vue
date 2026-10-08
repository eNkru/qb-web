<template>
  <v-container>
    <h4>{{ $t('preferences.global_rate_limits') }}</h4>
    <v-divider />
    <v-container
      class="px-0"
      fluid
    >
      <preference-row i18n-key="dl_limit">
        <v-text-field
          variant="outlined"
          density="compact"
          @change="changeSettings('dl_limit', convertToBytes(Number($event) || 0))"
          :placeholder="convertToKB(Number(preferences.dl_limit) || 0)"
        />
      </preference-row>
      <preference-row i18n-key="up_limit">
        <v-text-field
          variant="outlined"
          density="compact"
          @change="changeSettings('up_limit', convertToBytes(Number($event) || 0))"
          :placeholder="convertToKB(Number(preferences.up_limit) || 0)"
        />
      </preference-row>
    </v-container>
    <h4>{{ $t('preferences.alternate_rate_limits') }}</h4>
    <v-divider />
    <v-container
      class="px-0"
      fluid
    >
      <preference-row i18n-key="dl_limit">
        <v-text-field
          variant="outlined"
          density="compact"
          type="number"
          @change="changeSettings('alt_dl_limit', convertToBytes(Number($event) || 0))"
          :placeholder="convertToKB(Number(preferences.alt_dl_limit) || 0)"
        />
      </preference-row>
      <preference-row i18n-key="up_limit">
        <v-text-field
          variant="outlined"
          density="compact"
          type="number"
          @change="changeSettings('alt_up_limit', convertToBytes(Number($event) || 0))"
          :placeholder="convertToKB(Number(preferences.alt_up_limit) || 0)"
        />
      </preference-row>
      <v-checkbox
        color="primary"
        :label="$t('preferences.alternate_schedule_enable_time')"
        @change="changeSettings('scheduler_enabled', $event)"
        :model-value="preferences.scheduler_enabled"
      />
    </v-container>
    <v-row
      v-if="preferences.scheduler_enabled"
      class="justify-center"
    >
      <v-col
        cols="auto"
      >
        <v-time-picker
          :model-value="(preferences.schedule_from_hour ?? '') + ':' + (preferences.schedule_from_min ?? '')"
          color="green-lighten-1"
          format="24hr"
          @update:model-value="updateSchedulerFrom($event)"
        />
      </v-col>
      <v-col
        cols="auto"
      >
        <v-time-picker
          :model-value="(preferences.schedule_to_hour ?? '') + ':' + (preferences.schedule_to_min ?? '')"
          color="green-lighten-1"
          format="24hr"
          @update:model-value="updateSchedulerTo($event)"
        />
      </v-col>
    </v-row>
    <v-container
      class="px-0"
      fluid
    >
      <v-switch
        color="primary"
        :model-value="preferences.limit_utp_rate"
        :label="$t('preferences.limit_utp_rate')"
        @change="changeSettings('limit_utp_rate', !(preferences.limit_utp_rate ?? false))"
      />
      <v-switch
        color="primary"
        :model-value="preferences.limit_tcp_overhead"
        :label="$t('preferences.limit_tcp_overhead')"
        @change="changeSettings('limit_tcp_overhead', !(preferences.limit_tcp_overhead ?? false))"
      />
      <v-switch
        color="primary"
        :model-value="preferences.limit_lan_peers"
        :label="$t('preferences.limit_lan_peers')"
        @change="changeSettings('limit_lan_peers', !(preferences.limit_lan_peers ?? false))"
      />
    </v-container>
    <h4>{{ $t('preferences.queueing') }}</h4>
    <v-divider />
    <v-container
      class="px-0"
      fluid
    >
      <v-switch
        color="primary"
        :model-value="preferences.queueing_enabled"
        :label="$t('preferences.queueing_enabled')"
        @change="changeSettings('queueing_enabled', !(preferences.queueing_enabled ?? false))"
      />
      <preference-row i18n-key="max_active_downloads">
        <v-text-field
          variant="outlined"
          density="compact"
          type="number"
          :disabled="!preferences.queueing_enabled"
          :model-value="preferences.max_active_downloads"
          @change="changeSettings('max_active_downloads', Number($event))"
        />
      </preference-row>
      <preference-row i18n-key="max_active_uploads">
        <v-text-field
          variant="outlined"
          density="compact"
          type="number"
          :disabled="!preferences.queueing_enabled"
          :model-value="preferences.max_active_uploads"
          @change="changeSettings('max_active_uploads', Number($event))"
        />
      </preference-row>
      <preference-row i18n-key="max_active_torrents">
        <v-text-field
          variant="outlined"
          density="compact"
          type="number"
          :disabled="!preferences.queueing_enabled"
          :model-value="preferences.max_active_torrents"
          @change="changeSettings('max_active_torrents', Number($event))"
        />
      </preference-row>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-facing-decorator'
import {Preferences} from '@/types'
import PreferenceRow from './PreferenceRow.vue'
import { useMainStore } from '@/store/index';

@Component({
  components: {
    PreferenceRow,
  },
})
export default class SpeedSettings extends Vue {
  mainStore = useMainStore()

  get preferences(): Preferences {
    return this.mainStore.allPreferences;
  }

  updatePreferencesRequest(data: any) {
    return this.mainStore.updatePreferencesRequest(data);
  }

  convertToKB(value: number): string {
    return (value / 1024).toString()
  }

  convertToBytes(value: number): number {
    return value * 1024
  }

  changeSettings(property: string, value: any) {
    this.updatePreferencesRequest({[property]: value})
  }

  updateSchedulerFrom(event: string | null) {
    if (!event) return
    const strings = event.split(':')
    this.updatePreferencesRequest({'schedule_from_hour': strings[0], 'schedule_from_min': strings[1]})
  }

  updateSchedulerTo(event: string | null) {
    if (!event) return
    const strings = event.split(':')
    this.updatePreferencesRequest({'schedule_to_hour': strings[0], 'schedule_to_min': strings[1]})
  }
}
</script>

<style lang="scss" scoped>
:deep(.v-switch) {
  margin: 0
}

// The rate limit fields use the current value as a placeholder hint;
// hide it while editing so the field starts out empty.
:deep(.v-field__input:focus::placeholder) {
  color: transparent;
}

h4 {
  margin-top: 16px;
  margin-bottom: 4px;
  padding-left: 4px;
  font-weight: 600;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-primary));
}

@include dialog-title;
</style>
