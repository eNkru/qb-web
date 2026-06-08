<template>
  <v-container>
    <h4>{{ $t('preferences.adding_torrent') }}</h4>
    <v-divider />
    <v-container
      class="px-0"
      fluid
    >
      <v-switch
        :model-value="preferences.create_subfolder_enabled"
        :label="$t('preferences.create_subfolder_enabled')"
        @change="changeSettings('create_subfolder_enabled', !(preferences.create_subfolder_enabled ?? false))"
      />
      <v-switch
        :model-value="preferences.start_paused_enabled"
        :label="$t('preferences.start_paused_enabled')"
        @change="changeSettings('start_paused_enabled', !(preferences.start_paused_enabled ?? false))"
      />
      <v-switch
        :model-value="preferences.auto_delete_mode"
        :label="$t('preferences.auto_delete_mode')"
        @change="changeSettings('auto_delete_mode', !(preferences.auto_delete_mode ?? false))"
      />
    </v-container>
    <v-divider />
    <v-container
      class="px-0"
      fluid
    >
      <v-switch
        :model-value="preferences.preallocate_all"
        :label="$t('preferences.preallocate_all')"
        @change="changeSettings('preallocate_all', !(preferences.preallocate_all ?? false))"
      />
      <v-switch
        :model-value="preferences.incomplete_files_ext"
        :label="$t('preferences.incomplete_files_ext')"
        @change="changeSettings('incomplete_files_ext', !(preferences.incomplete_files_ext ?? false))"
      />
    </v-container>
    <h4>{{ $t('preferences.saving_management') }}</h4>
    <v-divider />
    <v-container
      class="px-0"
      fluid
    >
      <preference-row i18n-key="auto_tmm_enabled">
        <v-select
          variant="outlined"
          density="compact"
          :items="torrentMode"
          :model-value="(preferences.auto_tmm_enabled ?? false) ? torrentMode[0] : torrentMode[1]"
          @update:model-value="changeSettings('auto_tmm_enabled', $event == torrentMode[0])"
        />
      </preference-row>
      <preference-row i18n-key="torrent_changed_tmm_enabled">
        <v-select
          variant="outlined"
          density="compact"
          :items="torrentAction"
          :model-value="(preferences.category_changed_tmm_enabled ?? false) ? torrentAction[1] : torrentAction[0]"
          @update:model-value="changeSettings('torrent_changed_tmm_enabled', $event == torrentAction[1])"
        />
      </preference-row>
      <preference-row i18n-key="save_path_changed_tmm_enabled">
        <v-select
          variant="outlined"
          density="compact"
          :items="torrentAction"
          :model-value="(preferences.category_changed_tmm_enabled ?? false) ? torrentAction[1] : torrentAction[0]"
          @update:model-value="changeSettings('save_path_changed_tmm_enabled', $event == torrentAction[1])"
        />
      </preference-row>
      <preference-row i18n-key="category_changed_tmm_enabled">
        <v-select
          variant="outlined"
          density="compact"
          :items="torrentAction"
          :model-value="(preferences.category_changed_tmm_enabled ?? false) ? torrentAction[1] : torrentAction[0]"
          @update:model-value="changeSettings('category_changed_tmm_enabled', $event == torrentAction[1])"
        />
      </preference-row>
      <preference-row i18n-key="save_path">
        <v-text-field
          density="compact"
          variant="outlined"
          :model-value="preferences.save_path"
          @change="changeSettings('save_path', $event)"
        />
      </preference-row>
      <preference-row i18n-key="temp_path">
        <template #header>
          <v-checkbox
            density="compact"
            :model-value="preferences.temp_path_enabled"
            @update:model-value="changeSettings('temp_path_enabled', $event)"
          />
        </template>
        <v-text-field
          :disabled="!preferences.temp_path_enabled"
          :model-value="preferences.temp_path"
          @change="changeSettings('temp_path', $event)"
          density="compact"
          variant="outlined"
        />
      </preference-row>
      <preference-row
        i18n-key="export_dir"
        can-be-enabled="true"
      >
        <v-text-field
          :model-value="preferences.export_dir"
          @change="changeSettings('export_dir', $event)"
          variant="outlined"
          density="compact"
          clearable
        />
      </preference-row>
      <preference-row
        i18n-key="export_dir_fin"
        can-be-enabled="true"
      >
        <v-text-field
          :model-value="preferences.export_dir_fin"
          @change="changeSettings('export_dir_fin', $event)"
          variant="outlined"
          density="compact"
          clearable
        />
      </preference-row>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-facing-decorator'
import {Preferences} from '@/types'
import PreferenceRow from './PreferenceRow.vue'
import { tr } from '@/locale'
import { useMainStore } from '@/store/index';

@Component({
  components: {
    PreferenceRow,
  },
})
export default class DownloadSettings extends Vue {
  mainStore = useMainStore()

  get preferences(): Preferences {
    return this.mainStore.allPreferences;
  }
  torrentAction = [tr('preferences.switch_torrent_mode_to_manual'), tr('preferences.move_affected_torrent')]
  torrentMode = [tr('preferences.auto_mode'), tr('preferences.manual_mode')]

  updatePreferencesRequest(data: any) {
    return this.mainStore.updatePreferencesRequest(data);
  }

  changeSettings(property: string, value: any) {
    this.updatePreferencesRequest({[property]: value})
  }
}
</script>

<style lang="scss" scoped>
h4 {
  margin-top: 16px;
  margin-bottom: 4px;
  padding-left: 4px;
  font-weight: 600;
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

:deep(.v-switch) {
  margin: 0
}

@include dialog-title;
</style>
