<template>
  <v-dialog
    v-model="searchEngineState.isPluginManagerOpen"
    max-width="20rem"
    scrollable
  >
    <v-card>
      <v-card-title> <v-icon>mdi-toy-brick</v-icon> {{ $t("plugin_manager") }} </v-card-title>
      <v-card-text>
        <v-switch
          v-for="(plugin, key) in searchEngineState.searchPlugins"
          :key="key"
          :model-value="plugin.enabled"
          :label="plugin.fullName"
          @change="togglePluginAvailability(plugin)"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="warning"
          @click="updatePlugins()"
        >
          {{ $t("update_plugins") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { SearchEnginePage } from "@/store/types";
import { SearchPlugin } from "@/types";
import { Vue, Component } from "vue-facing-decorator";

@Component
export default class PluginsManager extends Vue {
  get searchEngineState(): SearchEnginePage {
    return this.$store.state.searchEngine;
  }

  togglePluginAvailabilityAction(plugin: SearchPlugin) {
    return this.$store.dispatch('togglePluginAvailability', plugin);
  }
  updatePluginsRequest() {
    return this.$store.dispatch('updatePluginsRequest');
  }

  togglePluginAvailability(plugin: SearchPlugin) {
    this.togglePluginAvailabilityAction(plugin);
  }

  updatePlugins() {
    this.updatePluginsRequest();
  }
}
</script>
