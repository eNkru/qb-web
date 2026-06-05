<template>
  <div class="add-form">
    <v-btn
      icon
      color="primary"
      size="large"
      @click="openAddForm"
      class="btn-add"
      :class="{'with-footer': $vuetify.display.smAndUp}"
    >
      <v-icon>mdi-link-plus</v-icon>
    </v-btn>
    <v-dialog
      v-model="state.isOpen"
      eager
      persistent
      scrollable
      :width="phoneLayout ? '100%' : '40em'"
    >
      <v-card>
        <v-card-title class="headline">
          <v-icon class="mr-2">mdi-link-plus</v-icon>
          <span>{{ state.downloadItem && state.downloadItem.title || $t('title.add_torrents') }}</span>
        </v-card-title>
        <v-card-text class="pb-0">
          <v-form ref="form">
            <v-container>
              <v-row no-gutters>
                <v-col ref="fileZone">
                  <v-file-input
                    v-show="files.length"
                    v-model="files"
                    ref="file"
                    multiple
                    chips
                    variant="outlined"
                    :label="$t('files')"
                  />
                  <v-textarea
                    v-show="!files.length"
                    label="URL"
                    :hint="$t('dialog.add_torrents.hint')"
                    :placeholder="$t('dialog.add_torrents.placeholder')"
                    prepend-icon="mdi-link"
                    append-outer-icon="mdi-attachment"
                    :rules="[v => (!!files.length || !!v || $t('msg.item_is_required', { item: 'URL' }))]"
                    :rows="$vuetify.display.xs ? 1 : 3"
                    required
                    :autofocus="!phoneLayout"
                    :model-value="params.urls"
                    :readonly="state.downloadItem !== null"
                    @update:model-value="setParams('urls', $event)"
                    @click:append-outer="selectFiles"
                  />
                </v-col>
              </v-row>
              <v-row no-gutters>
                <template v-if="showMore">
                  <v-col
                    cols="12"
                    sm="6"
                  >
                    <v-checkbox
                      prepend-icon="mdi-file-tree"
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
                      :label="$t('label.auto_tmm')"
                      :model-value="params.autoTMM"
                      @change="setParams('autoTMM', $event)"
                    />
                  </v-col>
                </template>
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-combobox
                    :label="$t('category', 1)"
                    prepend-icon="mdi-folder"
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
                    :label="$t('label.skip_hash_check')"
                    :model-value="params.skip_checking"
                    @change="setParams('skip_checking', $event)"
                  />
                </v-col>
                <template v-if="showMore">
                  <v-col
                    cols="12"
                    sm="6"
                  >
                    <v-checkbox
                      :label="$t('label.in_sequential_order')"
                      prepend-icon="mdi-sort-descending"
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
                      :label="$t('label.first_and_last_pieces_first')"
                      :model-value="params.firstLastPiecePrio"
                      @change="setParams('firstLastPiecePrio', $event)"
                    />
                  </v-col>
                </template>
              </v-row>
            </v-container>
          </v-form>
          <v-alert
            type="warning"
            :model-value="error"
            v-text="error"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn
            variant="text"
            @click="showMore = !showMore"
          >
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
            variant="text"
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
    this.$refs.fileZone.$el.addEventListener('drop', this.onDrop, true);
  }

  @Watch('state', {deep: true})
  onStateUpdate(state: AddFormState) {
    if (state.downloadItem) {
      this.setParams('urls', state.downloadItem.url);
    }
  }

  beforeUnmount() {
    this.$refs.fileZone.$el.removeEventListener('drop', this.onDrop, true);
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

.btn-add {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 100;
}

.btn-add.with-footer {
  bottom: 44px;
}

.container {
  padding: 12px 0 0;

  .col, [class*=col-] {
    padding: 0 0.5em;
  }
}
</style>
