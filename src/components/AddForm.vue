<template>
  <div class="add-form">
    <div
      class="btn-add-tab"
      :class="{'with-footer': $vuetify.display.smAndUp, 'phone-layout': phoneLayout}"
    >
      <v-btn
        color="primary"
        variant="flat"
        elevation="0"
        @click="openAddForm"
        class="btn-add"
        :title="$t('title.add_torrents')"
      >
        <v-icon size="22">mdi-plus</v-icon>
        <span class="btn-add-label">{{ $t('title.add_torrents') }}</span>
      </v-btn>
    </div>
    <v-dialog
      v-model="state.isOpen"
      eager
      persistent
      scrollable
      :fullscreen="phoneLayout"
      :width="phoneLayout ? '100%' : '42em'"
    >
      <v-card class="add-form-card">
        <v-card-title class="headline">
          <v-icon class="mr-2">mdi-link-plus</v-icon>
          <span>{{ state.downloadItem && state.downloadItem.title || $t('title.add_torrents') }}</span>
          <v-spacer />
          <v-btn
            icon
            variant="text"
            size="small"
            @click="closeAddForm"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-form ref="form">
            <!-- Source section -->
            <div class="form-section">
              <div class="section-label">
                {{ $t('dialog.add_torrents.source_label') }}
              </div>
              <div
                ref="fileZone"
                class="file-zone"
                :class="{ 'has-files': files.length }"
              >
                <v-file-input
                  v-show="files.length"
                  v-model="files"
                  ref="file"
                  multiple
                  chips
                  variant="outlined"
                  density="compact"
                  :label="$t('files')"
                />
                <v-textarea
                  v-show="!files.length"
                  label="URL"
                  :hint="$t('dialog.add_torrents.hint')"
                  :placeholder="$t('dialog.add_torrents.placeholder')"
                  prepend-icon="mdi-link"
                  variant="outlined"
                  density="compact"
                  :rules="[v => (!!files.length || !!v || $t('msg.item_is_required', { item: 'URL' }))]"
                  :rows="$vuetify.display.xs ? 1 : 3"
                  required
                  :autofocus="!phoneLayout"
                  :model-value="params.urls"
                  :readonly="state.downloadItem !== null"
                  @update:model-value="setParams('urls', $event)"
                >
                  <template #append>
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      @click="selectFiles"
                      :title="$t('dialog.add_torrents.attach_files')"
                    >
                      <v-icon>mdi-attachment</v-icon>
                    </v-btn>
                  </template>
                </v-textarea>
              </div>
            </div>

            <!-- Options section -->
            <div class="form-section">
              <div class="section-label">
                {{ $t('dialog.add_torrents.options_label') }}
              </div>
              <v-row dense>
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-combobox
                    :label="$t('category', 1)"
                    prepend-icon="mdi-folder"
                    variant="outlined"
                    density="compact"
                    clearable
                    hide-no-data
                    :items="categoryItems"
                    :model-value="params.category"
                    :return-object="false"
                    @update:model-value="setParams('category', $event)"
                  />
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  v-if="!phoneLayout || showMore"
                >
                  <v-text-field
                    :label="$t('location')"
                    prepend-icon="mdi-folder-marker"
                    variant="outlined"
                    density="compact"
                    clearable
                    :disabled="params.autoTMM"
                    :placeholder="defaultPath"
                    :model-value="params.autoTMM ? null : userParams.savepath"
                    @update:model-value="setParams('savepath', $event)"
                  />
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-checkbox
                    :label="$t('label.start_torrent')"
                    prepend-icon="mdi-play-pause"
                    density="compact"
                    hide-details
                    :model-value="!params.paused"
                    @change="setParams('paused', !$event)"
                  />
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  v-if="!phoneLayout || showMore"
                >
                  <v-checkbox
                    prepend-icon="mdi-progress-check"
                    density="compact"
                    hide-details
                    :label="$t('label.skip_hash_check')"
                    :model-value="params.skip_checking"
                    @change="setParams('skip_checking', $event)"
                  />
                </v-col>
              </v-row>
            </div>

            <!-- Advanced options -->
            <v-expand-transition>
              <div
                v-if="showMore"
                class="form-section advanced-section"
              >
                <div class="section-label">
                  {{ $t('dialog.add_torrents.advanced_label') }}
                </div>
                <v-row dense>
                  <v-col
                    cols="12"
                    sm="6"
                  >
                    <v-checkbox
                      prepend-icon="mdi-file-tree"
                      density="compact"
                      hide-details
                      :label="$t('label.create_subfolder')"
                      :model-value="true"
                      @change="setParams('root_path', $event)"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                  >
                    <v-checkbox
                      prepend-icon="mdi-car-shift-pattern"
                      density="compact"
                      hide-details
                      :label="$t('label.auto_tmm')"
                      :model-value="params.autoTMM"
                      @change="setParams('autoTMM', $event)"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                  >
                    <v-checkbox
                      :label="$t('label.in_sequential_order')"
                      prepend-icon="mdi-sort-descending"
                      density="compact"
                      hide-details
                      :model-value="params.sequentialDownload"
                      @change="setParams('sequentialDownload', $event)"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                  >
                    <v-checkbox
                      prepend-icon="mdi-ray-start-end"
                      density="compact"
                      hide-details
                      :label="$t('label.first_and_last_pieces_first')"
                      :model-value="params.firstLastPiecePrio"
                      @change="setParams('firstLastPiecePrio', $event)"
                    />
                  </v-col>
                </v-row>
              </div>
            </v-expand-transition>
          </v-form>
          <v-alert
            v-if="error"
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-3"
            closable
            @click:close="error = null"
          >
            {{ error }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-btn
            variant="text"
            size="small"
            @click="showMore = !showMore"
          >
            <v-icon
              start
              size="small"
            >
              {{ showMore ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
            </v-icon>
            {{ showMore ? $t('less') : $t('more') }}
          </v-btn>
          <v-spacer />
          <v-btn
            variant="text"
            @click="closeAddForm"
          >
            {{ $t('cancel') }}
          </v-btn>
          <v-btn
            variant="flat"
            @click="submit"
            color="primary"
            :disabled="submitting"
            :loading="submitting"
          >
            {{ $t('submit') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { isNil } from 'lodash';
import { Vue, Component, Watch, toNative } from 'vue-facing-decorator';

import api from '../Api';
import { Preferences, Category } from '../types';
import { AddFormState } from '@/store/types';

/* eslint-disable camelcase */
const defaultParams = {
  urls: '',
  category: '',
  paused: false,
  savepath: '',
  skip_checking: false,
  root_path: false,
  sequentialDownload: false,
  firstLastPiecePrio: false,
  autoTMM: false,
};
/* eslint-enable camelcase */

@Component
class AddForm extends Vue {
  files: FileList | [] = []
  defaultParams = defaultParams
  userParams: Record<string, any> = {}
  error: string | null = null
  submitting = false
  showMore = false

  get state(): AddFormState {
    return this.$store.state.addForm;
  }
  get pasteUrl(): string | null {
    return this.$store.state.pasteUrl;
  }
  get prefs(): Preferences {
    return this.$store.state.preferences;
  }
  get allCategories(): Category[] {
    return this.$store.getters.allCategories;
  }

  declare $refs: {
    form: any;
    file: any;
    fileZone: any;
  }

  openAddForm() {
    this.$store.commit('openAddForm');
  }
  closeAddForm() {
    this.$store.commit('closeAddForm');
  }

  get params() {
    return Object.assign({}, defaultParams, this.userParams);
  }
  get phoneLayout() {
    return this.$vuetify.display.xs;
  }
  get categoryItems() {
    return this.allCategories.map(c => ({ text: c.name, value: c.key }));
  }
  get defaultPath() {
    if (this.params.autoTMM && this.params.category) {
      const category = this.allCategories.find(c => {
        return c.key === this.params.category;
      });
      
      if (!category) {
        return this.params.category;
      }

      return category.savePath || category.name
    }

    return this.defaultParams.savepath;
  }

  created() {
    defaultParams.paused = this.prefs.start_paused_enabled;
    /* eslint-disable-next-line camelcase */
    defaultParams.root_path = this.prefs.create_subfolder_enabled;
    defaultParams.savepath = this.prefs.save_path;
    defaultParams.autoTMM = this.prefs.auto_tmm_enabled;
  }

  mounted() {
    const el = this.$refs.fileZone instanceof HTMLElement
      ? this.$refs.fileZone
      : this.$refs.fileZone.$el;
    el.addEventListener('drop', this.onDrop, true);
  }

  @Watch('state', {deep: true})
  onStateUpdate(state: AddFormState) {
    if (state.downloadItem) {
      this.setParams('urls', state.downloadItem.url);
    }
  }

  beforeUnmount() {
    const el = this.$refs.fileZone instanceof HTMLElement
      ? this.$refs.fileZone
      : this.$refs.fileZone.$el;
    el.removeEventListener('drop', this.onDrop, true);
  }

  setParams(key: keyof typeof defaultParams, value: any) {
    if (isNil(value) || value === defaultParams[key]) {
      delete this.userParams[key];
    } else {
      this.userParams[key] = value;
    }
  }

  async submit() {
    if (this.submitting) {
      return;
    }

    this.submitting = true;
    this.error = null;
    let files;
    if (this.files.length) {
      ({ files } = this);
      delete this.userParams['urls'];
    } else {
      files = null;
    }

    try {
      const resp = await api.addTorrents(this.userParams, files);

      if (resp !== 'Ok.') {
        this.error = resp;
      }
    } catch (e) {
      this.error = e.message;
    }

    this.submitting = false;

    if (this.error) {
      return;
    }

    this.closeAddForm();

    delete this.userParams['urls'];
    this.files = [];

    this.$refs.form.resetValidation();
  }

  selectFiles() {
    const input = this.$refs.file.$el.querySelector('input[type=file]');
    input.click();
  }

  onDrop(e: DragEvent) {
    const transfer = e.dataTransfer!;
    const { files } = transfer;
    if (!files.length) {
      return;
    }

    e.preventDefault();
    this.files = files;
  }

  @Watch('pasteUrl', {immediate: true})
  onPasteUrl(v: string) {
    if (!v) {
      return;
    }

    if (!this.state.isOpen) {
      this.userParams['urls'] = v;
      this.openAddForm();
    }
  }

  @Watch('files')
  onFilesChange() {
    this.$refs.form.validate();
  }
}

export default toNative(AddForm)
</script>

<style lang="scss" scoped>
@import '~@/assets/styles.scss';

@include dialog-title;

.btn-add-tab {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  padding: 12px 0;

  .btn-add {
    height: 44px;
    min-width: 44px;
    padding: 0 18px;
    border-radius: 22px 0 0 22px;
    white-space: nowrap;
    font-weight: 600;
    letter-spacing: 0.02em;
    // Peek out showing the full icon
    transform: translateX(calc(100% - 44px));
    box-shadow: 0 3px 12px rgba(var(--v-theme-primary), 0.3);
    transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
                box-shadow 0.25s cubic-bezier(0.22, 1, 0.36, 1),
                padding 0.25s cubic-bezier(0.22, 1, 0.36, 1);

    .btn-add-label {
      max-width: 0;
      overflow: hidden;
      opacity: 0;
      transition: max-width 0.25s cubic-bezier(0.22, 1, 0.36, 1),
                  opacity 0.15s ease 0.1s;
    }

    &:hover {
      transform: translateX(0);
      padding: 0 24px 0 20px;
      box-shadow: 0 6px 20px rgba(var(--v-theme-primary), 0.4);
    }

    &:hover .btn-add-label {
      max-width: 180px;
      opacity: 1;
    }

    &:active {
      transform: translateX(2px);
      box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.3);
    }
  }

  // Mobile: bottom-right
  &.phone-layout {
    top: auto;
    bottom: 20px;
    right: 0;
    transform: none;
    padding: 0;

    &.with-footer {
      bottom: 56px;
    }

    .btn-add {
      transform: translateX(calc(100% - 44px));
    }
  }
}

.add-form-card {
  :deep(.v-card-text) {
    padding: 20px 24px;
  }
}

.form-section {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }

  .section-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba(var(--v-theme-on-surface), 0.6);
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
  }
}

.file-zone {
  position: relative;
}

.advanced-section {
  padding-top: 4px;
}

.v-dialog--fullscreen {
  .v-card__text {
    padding-bottom: 68px;
  }

  .v-card__actions {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgb(var(--v-theme-surface));
    border-top: 1px solid rgba(var(--v-border-color), 0.12);
  }
}

:deep(.v-row.dense) {
  margin: -4px;

  > .v-col {
    padding: 4px;
  }
}

:deep(.v-checkbox) {
  margin-top: 2px;
}
</style>
