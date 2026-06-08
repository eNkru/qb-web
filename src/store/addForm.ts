import { defineStore } from 'pinia';
import { AddFormState } from './types';

export const useAddFormStore = defineStore('addForm', {
  state: (): AddFormState => ({
    isOpen: false,
    downloadItem: null,
  }),
  getters: {
    isOpen(state) {
      return state.isOpen;
    },
  },
  actions: {
    openAddForm() {
      this.isOpen = true;
    },
    closeAddForm() {
      this.isOpen = false;
      this.downloadItem = null;
    },
    addFormDownloadItem(payload: { downloadItem: AddFormState['downloadItem'] }) {
      const { downloadItem } = payload;
      this.downloadItem = downloadItem;
    },
  },
});
