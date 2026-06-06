<template>
  <v-container>
    <h4>{{ $t("preferences.webui_remote_control") }}</h4>
    <v-divider />
    <v-row
      dense
      align="center"
    >
      <v-col cols="2">
        <v-list-subheader>{{ $t("preferences.data_update_interval") }}</v-list-subheader>
      </v-col>
      <v-col cols="4">
        <v-text-field
          variant="outlined"
          density="compact"
          :model-value="config.updateInterval"
          type="number"
          @change="updateConfig({key: 'updateInterval', value: $event})"
        />
      </v-col>
    </v-row>
    <v-row
      dense
      align="center"
    >
      <v-col cols="2">
        <v-list-subheader>{{ $t("preferences.ip_address") }}</v-list-subheader>
      </v-col>
      <v-col cols="4">
        <v-text-field
          variant="outlined"
          density="compact"
          :model-value="preferences.web_ui_address"
          @change="changeSettings('web_ui_address', $event)"
        />
      </v-col>
      <v-col cols="1">
        <v-list-subheader>{{ $t("preferences.ip_port") }}</v-list-subheader>
      </v-col>
      <v-col cols="1">
        <v-text-field
          variant="outlined"
          density="compact"
          :model-value="preferences.web_ui_port"
          @change="changeSettings('web_ui_port', $event)"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col>
        <v-checkbox
          :label="$t('preferences.display_speed_in_title')"
          :model-value="config.displaySpeedInTitle"
          @change="updateTitleSpeedConfig($event)"
        />
      </v-col>
    </v-row>
    <h4>{{ $t("preferences.authentication") }}</h4>
    <v-divider />
    <preference-row i18n-key="web_ui_username">
      <v-text-field
        variant="outlined"
        density="compact"
        :model-value="preferences.web_ui_username"
        @change="changeSettings('web_ui_username', $event)"
      />
    </preference-row>
    <preference-row i18n-key="web_ui_password">
      <v-text-field
        variant="outlined"
        density="compact"
        :model-value="preferences.web_ui_password"
        @change="changeSettings('web_ui_password', $event)"
        :placeholder="$t('preferences.new_password')"
      />
    </preference-row>
    <v-row dense>
      <v-col cols="auto">
        {{ $t("preferences.web_ui_max_auth_fail_count") }}
      </v-col>
      <v-col cols="1">
        <v-text-field
          variant="outlined"
          density="compact"
          :model-value="preferences.web_ui_max_auth_fail_count"
          @change="changeSettings('web_ui_max_auth_fail_count', $event)"
        />
      </v-col>
      <v-col cols="auto">
        {{ $t("preferences.web_ui_ban_duration") }}
      </v-col>
      <v-col cols="1">
        <v-text-field
          variant="outlined"
          density="compact"
          :model-value="preferences.web_ui_ban_duration"
          @change="changeSettings('web_ui_ban_duration', $event)"
        />
      </v-col>
      <v-col cols="auto">
        {{ $t("preferences.web_ui_seconds") }}
      </v-col>
    </v-row>
    <v-row dense>
      <v-col>
        <v-checkbox
          :model-value="preferences.bypass_auth_subnet_whitelist_enabled"
          :label="$t('preferences.bypass_auth_subnet_whitelist')"
          @change="changeSettings('bypass_auth_subnet_whitelist_enabled', $event)"
        />
      </v-col>
      <v-col>
        <v-checkbox
          :model-value="preferences.bypass_local_auth"
          :label="$t('preferences.bypass_local_auth')"
          @change="changeSettings('bypass_local_auth', $event)"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="4">
        <v-textarea
          variant="outlined"
          density="compact"
          :model-value="preferences.bypass_auth_subnet_whitelist"
          @change="changeSettings('bypass_auth_subnet_whitelist', $event)"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-facing-decorator'
import {Preferences} from '@/types'
import {Config} from '@/store/config'
import { ConfigPayload } from '@/store/types';
import PreferenceRow from '@/components/dialogs/settingsDialog/PreferenceRow.vue'

@Component({
  components: {PreferenceRow},
})
export default class WebUISettings extends Vue {
  get config(): Config {
    return this.$store.getters.config;
  }
  get preferences(): Preferences {
    return this.$store.getters.allPreferences;
  }

  updateConfig(payload: ConfigPayload) {
    this.$store.commit('updateConfig', payload);
  }
  updatePreferencesRequest(data: any) {
    return this.$store.dispatch('updatePreferencesRequest', data);
  }

  changeSettings(property: string, value: string | boolean) {
    this.updatePreferencesRequest({[property]: value})
  }

  updateTitleSpeedConfig(event: boolean) {
    this.updateConfig({
      key: 'displaySpeedInTitle',
      value: event,
    })
    if(!event) {
      document.title = 'qBittorrent Web UI'
    }
  }
}
</script>
