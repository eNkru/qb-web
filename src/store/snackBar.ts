import { defineStore } from 'pinia';
import { cloneDeep, isString } from 'lodash';
import { SnackBarState, SnackBarConfig } from './types';

export const useSnackBarStore = defineStore('snackBar', {
  state: (): SnackBarState => ({
    config: null,
  }),
  actions: {
    showSnackBar(payload: string | SnackBarConfig) {
      if (isString(payload)) {
        this.config = {
          text: payload,
        };
      } else {
        this.config = cloneDeep(payload);
      }
    },
    closeSnackBar() {
      this.config = null;
    },
  },
});
