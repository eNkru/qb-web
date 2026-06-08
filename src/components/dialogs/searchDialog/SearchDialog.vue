<template>
  <div>
    <v-dialog
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      scrollable
      fullscreen
      persistent
    >
      <v-card>
        <v-card-title class="headline">
          <v-icon class="mr-2">mdi-card-search-outline</v-icon>
          <span>{{ $t('search') }}</span>
          <v-spacer />
          <v-btn
            icon
            @click="closeDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <SearchDialogForm
            :loading="loading"
            @trigger-search="triggerSearch"
            @stop-search="stopSearch"
          />

          <v-data-table
            :headers="grid.headers"
            :items="grid.searchItems"
            :items-per-page="10"
            :loading="loading"
            class="elevation-1"
          >
            <template #[`item.fileName`]="{ item }">
              <a
                :href="item.descrLink"
                target="_blank"
              >{{ item.fileName }}</a>
            </template>
            <template #[`item.fileSize`]="{ item }">
              {{ $formatSize(item.fileSize) }}
            </template>
            <template #[`item.actions`]="{ item }">
              <v-icon @click="downloadTorrent(item)">mdi-download</v-icon>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="openPluginManager">
            <v-icon>mdi-cog</v-icon> {{ $t("plugin_manager") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <PluginManager />
  </div>
</template>

<script lang="ts">
import api from "@/Api";
import HasTask from "@/mixins/hasTask";
import { Component, Prop, Emit } from "vue-facing-decorator";
import { SearchTaskTorrent } from "@/types";
import { tr } from "@/locale";
import SearchDialogForm from "./SearchDialogForm.vue";
import PluginManager from "./PluginsManager.vue";
import { Category, Preferences } from '@/types';

interface GridConfig {
  searchItems: SearchTaskTorrent[];
  downloadItem: SearchTaskTorrent | null;
  headers: { [key: string]: any }[];
}

@Component({
  components: {
    SearchDialogForm,
    PluginManager,
  },
})
export default class SearchDialog extends HasTask {
  private _searchId = 0;

  @Prop({ type: Boolean })
  readonly modelValue!: boolean;

  get allCategories(): Category[] {
    return this.$store.getters.allCategories;
  }
  get preferences(): Preferences {
    return this.$store.getters.preferences;
  }

  setPasteUrl(data: any) {
    this.$store.commit('setPasteUrl', data);
  }
  openAddForm() {
    this.$store.commit('openAddForm');
  }
  addFormDownloadItem(data: any) {
    this.$store.commit('addFormDownloadItem', data);
  }
  loadSearchPlugins() {
    return this.$store.dispatch('fetchSearchPlugins');
  }
  openPluginManager() {
    this.$store.commit('openPluginManager');
  }

  grid: GridConfig = {
    searchItems: [],
    downloadItem: {
      descrLink: "",
      fileName: "",
      fileSize: 0,
      fileUrl: "",
      nbLeechers: 0,
      nbSeeders: 0,
      siteUrl: "",
    },
    headers: [
        { title: tr("name"), key: "fileName" },
        { title: tr("size"), key: "fileSize" },
        { title: tr("seeds"), key: "nbSeeders" },
        { title: tr("peers"), key: "nbLeechers" },
        { title: tr("search_engine"), key: "siteUrl" },
        { title: tr("action", 2), key: "actions", sortable: false },
    ],
  };

  loading = false;

  mounted() {
    this.loadSearchPlugins(); // load the plugins so they are available in the entire module
  }

  async downloadTorrent(item: SearchTaskTorrent) {
    this.addFormDownloadItem({
      downloadItem: {
        title: item.fileName,
        url: item.fileUrl,
      },
    });
    this.openAddForm();
  }

  async stopSearch() {
    this.cancelTask();
    await this._stopSearch(this._searchId);
    this.loading = false;
  }

  @Emit("update:modelValue")
  closeDialog() {
    return false;
  }

  async triggerSearch(searchForm: any) { // TODO: find a good way to type the form.
    this.grid.searchItems = []; // Clear the table
    this.loading = true;

    try {
      const response = await this._startSearch(searchForm);
      this._searchId = response.id;

      this.setTaskAndRun(this.task(response.id));
    } catch {
      //
    }
  }

  private async _startSearch(searchForm: any): Promise<{ id: number }> {
    const result = await api.startSearch(
      searchForm.pattern,
      searchForm.plugins,
      searchForm.category,
    );

    return result;
  }

  private async _stopSearch(id: number) {
    await api.stopSearch(id);
    this._searchId = 0;
  }

  /**
   * Does request until the plugins return data
   */
  private task(responseId: number): CallableFunction {
    return async () => {
      const response = await api.getSearchResults(responseId);
      const isStopped = response.status === "Stopped";

      const items = this.grid.searchItems
      items.splice(items.length, 0, ...response.results.slice(items.length))

      if (isStopped) {
        this.loading = false;
      }

      return isStopped;
    };
  }
}
</script>

<style lang="scss" scoped>
@include dialog-title;
</style>
