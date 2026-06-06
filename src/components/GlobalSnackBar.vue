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
import { useMutations, useState } from '@/store';

export default {
  setup() {
    const mutations = useMutations(['closeSnackBar']);
    const { config } = useState(['config'], 'snackBar');

    const snackbarVisible = computed({
      get: () => !!config.value,
      set: (v) => { if (!v) mutations.closeSnackBar(); },
    });

    function clickBtn() {
      const cb = config.value.callback;

      mutations.closeSnackBar();

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
