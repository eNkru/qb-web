import { defineStore } from 'pinia';
import { merge, cloneDeep } from 'lodash-es';
import { DialogState, DialogConfig } from './types';

export const useDialogStore = defineStore('dialog', {
  state: (): DialogState => ({
    config: null,
  }),
  actions: {
    showDialog(payload: DialogConfig) {
      this.config = cloneDeep(payload);
    },
    closeDialog() {
      this.config = null;
    },
    async asyncShowDialog(payload: DialogConfig): Promise<string | undefined> {
      return new Promise((resolve) => {
        const options = merge({}, payload, {
          callback: resolve,
        });

        this.showDialog(options);
      });
    },
  },
});
