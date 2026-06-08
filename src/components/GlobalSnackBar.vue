<template>
  <v-snackbar
    v-bind="config"
    v-model="snackbarVisible"
  >
    <template v-if="config">
      {{ config.text }}
      <v-btn
        v-if="config.callback"
        text
        color="info"
        @click="clickBtn"
      >
        {{ config.btnText ? config.btnText : $t('close') }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import { computed } from 'vue';
import { useSnackBarStore } from '@/store/snackBar';

export default {
  setup() {
    const snackBarStore = useSnackBarStore();

    const config = computed(() => snackBarStore.config);

    const snackbarVisible = computed({
      get: () => !!config.value,
      set: (v) => { if (!v) snackBarStore.closeSnackBar(); },
    });

    function clickBtn() {
      const cb = config.value?.callback;

      snackBarStore.closeSnackBar();

      if (cb) {
        cb();
      }
    }

    return {
      config,
      snackbarVisible,
      clickBtn,
    };
  },
};
</script>
