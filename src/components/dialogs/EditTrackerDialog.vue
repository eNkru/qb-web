<template>
  <v-dialog
    v-model="showDialog"
    :fullscreen="phoneLayout"
    persistent
    width="40em"
  >
    <v-card>
      <v-card-title class="headline">
        <v-icon class="mr-2">mdi-server</v-icon>
        <span>Edit tracker</span>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-stepper
          v-model="step"
          :items="['Search', 'Preview', 'Result']"
        >
          <template #default>
            <v-stepper-window>
              <v-stepper-window-item value="1">
                <v-form v-model="valid">
                  <v-text-field
                    v-model="search"
                    label="Search"
                    :rules="[v => !!v || 'Required']"
                    placeholder="Regex format"
                    required
                  />
                  <v-text-field
                    v-model="replace"
                    label="Replace"
                  />
                </v-form>
              </v-stepper-window-item>
              <v-stepper-window-item value="2">
                {{ toEdit.length }} torrent(s) to update.
                <ol class="torrents pt-6">
                  <li
                    v-for="(row, i) in toEdit"
                    :key="i"
                  >
                    {{ row.name }}
                    <br>
                    {{ row.origUrl }}
                    <br>
                    {{ row.newUrl }}
                  </li>
                </ol>
              </v-stepper-window-item>
              <v-stepper-window-item value="3">
                <v-progress-linear
                  v-if="submitting && currentIndex != toEdit.length"
                  :model-value="currentIndex / toEdit.length * 100"
                />
                <template v-else>
                  {{ currentIndex }} torrent(s) updated.
                </template>
              </v-stepper-window-item>
            </v-stepper-window>
          </template>
        </v-stepper>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          @click="back"
          v-if="step < 3"
        >
          {{ step == 1 ? $t('cancel') : $t('back') }}
        </v-btn>
        <v-btn
          @click="foward"
          color="warning"
          :disabled="!canNext"
          :loading="submitting"
        >
          {{ [null, $t('next'), $t('confirm'), $t('close')][step] }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { chain } from 'lodash';
import { Vue, Component, Prop, Emit, toNative } from 'vue-facing-decorator';

import api from '@/Api';
import { Torrent } from '../../types';


@Component
class EditTrackerDialog extends Vue {
  @Prop({ type: Array })
  readonly modelValue!: Torrent[]

  step = 1
  valid = false
  submitting = false
  torrents: Torrent[] = []
  search = ''
  replace = ''
  toEdit: any[] = []
  currentIndex = 0

  get allTorrents(): Torrent[] {
    return this.$store.getters.allTorrents;
  }

  get showDialog() {
    return true;
  }
  set showDialog(_val: boolean) {
    this.closeDialog();
  }

  created() {
    this.torrents = this.modelValue
  }

  get phoneLayout() {
    return this.$vuetify.display.xs;
  }
  get canNext() {
    if (this.step === 1 && this.valid) {
      return true;
    }
    if (this.step === 2 && this.toEdit.length > 0) {
      return true;
    }
    if (this.step === 3 && !this.submitting) {
      return true;
    }
    return false;
  }

  @Emit('update:modelValue')
  closeDialog() {
    return []
  }

  calcResults(): any[] {
    const regex = new RegExp(this.search);

    return chain(this.torrents)
      .map(({ tracker, hash, name }) => {
        const newUrl = tracker.replace(regex, this.replace);
        return newUrl === tracker ? null : {
          hash,
          name,
          origUrl: tracker,
          newUrl,
        };
      }).compact().value();
  }

  back() {
    if (this.step === 1) {
      this.closeDialog();
      return;
    }
    this.step--;
  }

  async foward() {
    if (this.step === 1) {
      this.toEdit = this.calcResults();
      this.step++;
      return;
    }
    if (this.step === 3) {
      this.closeDialog();
      return;
    }

    if (this.submitting) {
      return;
    }

    this.submitting = true;
    this.step++;

    this.currentIndex = 0;

    for (const item of this.toEdit) {
      await api.editTracker(item.hash, item.origUrl, item.newUrl);
      this.currentIndex++;
    }

    this.submitting = false;
  }
}

export default toNative(EditTrackerDialog)
</script>

<style lang="scss" scoped>
@import '~@/assets/styles.scss';

@include dialog-title;

.torrents {
  overflow: auto;
  white-space: nowrap;
}

.v-stepper {
  box-shadow: none;
}

.v-dialog--fullscreen {
  .v-card__text {
    padding-bottom: 52px;
  }

  .v-card__actions {
    position: absolute;
    bottom: 0;
    right: 0;
  }
}
</style>
