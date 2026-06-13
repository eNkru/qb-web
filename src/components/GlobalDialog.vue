<template>
  <v-dialog
    v-bind="config ? config.dialog : null"
    v-model="value"
    max-width="420"
    class="global-dialog"
  >
    <v-card
      v-if="!!config"
      class="dialog-card"
    >
      <div
        v-if="config.title"
        class="dialog-header"
      >
        <v-icon
          v-if="dialogIcon"
          size="small"
          class="dialog-header-icon"
        >
          {{ dialogIcon }}
        </v-icon>
        <span class="dialog-title">{{ config.title }}</span>
      </div>
      <v-card-text
        class="dialog-content"
        :class="{'is-input': isInput}"
      >
        <v-text-field
          v-if="isInput"
          v-model="input"
          :label="config.text"
          :rules="config.rules"
          :placeholder="config.placeholder"
          :hide-details="!config.rules"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          autofocus
        />
        <template v-else>
          <v-icon
            v-if="alertIcon"
            :color="alertIconColor"
            size="small"
            class="dialog-text-icon"
          >
            {{ alertIcon }}
          </v-icon>
          <span class="dialog-text">{{ config.text }}</span>
        </template>
      </v-card-text>
      <v-card-actions class="dialog-actions">
        <v-spacer />
        <v-btn
          v-for="(btn, index) in btns"
          :key="index"
          :variant="isConfirmBtn(index) ? 'flat' : 'text'"
          :color="isConfirmBtn(index) ? 'primary' : undefined"
          rounded="lg"
          class="dialog-btn"
          @click="clickBtn(btn[1])"
        >
          {{ btn[0] }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';

import { tr } from '@/locale';
import { DialogType, DialogConfig } from '@/store/types';
import { useDialogStore } from '@/store/dialog';

const BUTTONS: Record<number, (string | boolean)[][]> = {
  [DialogType.Alert]: [
    [tr('close'), false],
  ],
  [DialogType.YesNo]: [
    [tr('no'), false],
    [tr('yes'), true],
  ],
  [DialogType.OkCancel]: [
    [tr('cancel'), false],
    [tr('ok'), true],
  ],
  [DialogType.Input]: [
    [tr('cancel'), false],
    [tr('ok'), true],
  ],
  [DialogType.Custom]: [],
};

const DefaultDialogWidth = '25%'

export default {
  setup() {
    const display = useDisplay() as any;
    const dialogStore = useDialogStore();

    const config = computed(() => {
      if (!dialogStore.config) {
        return null;
      }
      const o = Object.assign({dialog: {}}, dialogStore.config) as DialogConfig;

      if (!('width' in o.dialog)) {
        o.dialog.width = display.smAndDown ? null : DefaultDialogWidth
      }

      return o
    });
    const value = ref<boolean>();
    const input = ref<string>();

    const isInput = computed(() => {
      const type = config.value!.type
      return type === DialogType.Input
    })

    const dialogType = computed(() => {
      return (config.value && config.value.type) ? config.value.type : DialogType.Alert;
    })

    const dialogIcon = computed(() => {
      switch (dialogType.value) {
        case DialogType.YesNo:
        case DialogType.OkCancel:
          return 'mdi-help-circle-outline'
        default:
          return null
      }
    })

    const alertIcon = computed(() => {
      if (dialogType.value === DialogType.Alert) {
        return 'mdi-information-outline'
      }
      return null
    })

    const alertIconColor = computed(() => {
      return 'info'
    })

    function isConfirmBtn(index: number) {
      const btns = BUTTONS[dialogType.value]
      if (!btns) return false
      return index === btns.length - 1
    }

    async function clickBtn(btnValue: any) {
      const cb = config.value!.callback;

      if (cb) {
        if (isInput.value) {
          cb(btnValue ? input.value : undefined)
        } else {
          cb(btnValue);
        }
      }

      dialogStore.closeDialog();
    }

    watch(config, (v) => {
      value.value = !!v;
      if (!v) {
        input.value = undefined
      } else {
        input.value = v.value
      }
    });
    watch(value, (v) => {
      if (v || !config.value) {
        return
      }

      clickBtn(null);
    });

    const btns = computed(() => {
      const c = config.value;
      const dt = (c && c.type) ? c.type : DialogType.Alert;

      if (dt === DialogType.Custom) {
        return c!.buttons;
      }

      return BUTTONS[dt];
    });

    return {
      config,
      value,
      input,
      isInput,
      btns,
      dialogIcon,
      alertIcon,
      alertIconColor,
      isConfirmBtn,
      clickBtn,
    };
  },
};
</script>

<style lang="scss" scoped>
.dialog-card {
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background-color: rgba(0, 0, 0, 0.02);
}

.v-theme--dark .dialog-header {
  border-bottom-color: rgba(255, 255, 255, 0.08);
  background-color: rgba(255, 255, 255, 0.03);
}

.dialog-header-icon {
  opacity: 0.7;
}

.dialog-title {
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.dialog-content {
  padding: 20px;
}

.dialog-content:not(.is-input) {
  white-space: pre-line;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.dialog-text-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.dialog-text {
  line-height: 1.6;
}

.dialog-actions {
  padding: 8px 16px 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
}

.v-theme--dark .dialog-actions {
  border-top-color: rgba(255, 255, 255, 0.06);
}

.dialog-btn {
  font-weight: 500;
  letter-spacing: 0.01em;
  text-transform: none;
}
</style>
