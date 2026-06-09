<template>
  <v-dialog
    v-model="showDialog"
    :width="dialogWidth"
    :fullscreen="phoneLayout"
  >
    <v-card>
      <v-card-title class="headline">
        <v-icon class="mr-2">
          mdi-information-outline
        </v-icon>
        <span>{{ $t('info') }}</span>
      </v-card-title>
      <v-card-text class="dialog-body">
        <v-tabs
          v-model="tabSync"
          color="primary"
          grow
          density="comfortable"
          variant="pills"
        >
          <v-tab value="general">
            <v-icon start>mdi-information-outline</v-icon>
            {{ $t("prop_tab_bar.general") }}
          </v-tab>
          <v-tab value="trackers">
            <v-icon start>mdi-cloud-outline</v-icon>
            {{ $t("prop_tab_bar.trackers") }}
          </v-tab>
          <v-tab value="peers">
            <v-icon start>mdi-account-group-outline</v-icon>
            {{ $t("prop_tab_bar.peers") }}
          </v-tab>
          <v-tab value="content">
            <v-icon start>mdi-file-tree</v-icon>
            {{ $t("prop_tab_bar.content") }}
          </v-tab>
        </v-tabs>
        <v-window
          v-model="tabSync"
          touchless
        >
          <v-window-item value="general">
            <panel
              v-for="torrent in torrents"
              :key="torrent.hash"
              :title="torrent.name"
              :single="torrents.length === 1"
            >
              <torrent-info
                :torrent="torrent"
                :is-active="tabSync === 'general'"
              />
            </panel>
          </v-window-item>
          <v-window-item value="trackers">
            <panel
              v-for="torrent in torrents"
              :key="torrent.hash"
              :title="torrent.name"
              :single="torrents.length === 1"
            >
              <trackers
                :hash="torrent.hash"
                :is-active="tabSync === 'trackers'"
              />
            </panel>
          </v-window-item>
          <v-window-item value="peers">
            <panel
              v-for="torrent in torrents"
              :key="torrent.hash"
              :title="torrent.name"
              :single="torrents.length === 1"
            >
              <peers
                :hash="torrent.hash"
                :is-active="tabSync === 'peers'"
              />
            </panel>
          </v-window-item>
          <v-window-item value="content">
            <panel
              v-for="torrent in torrents"
              :key="torrent.hash"
              :title="torrent.name"
              :single="torrents.length === 1"
            >
              <torrent-content
                :hash="torrent.hash"
                :is-active="tabSync === 'content'"
              />
            </panel>
          </v-window-item>
        </v-window>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          @click="closeDialog"
        >
          {{ $t('close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop, Emit, Watch, toNative } from 'vue-facing-decorator';
import { useDisplay } from 'vuetify';
import TorrentInfo from './TorrentInfo.vue';
import TorrentContent from './TorrentContent.vue';
import Trackers from './Trackers.vue';
import Peers from './Peers.vue';
import Panel from './Panel.vue';
import { Torrent } from '../../types';

@Component({
  components: {
    TorrentInfo,
    TorrentContent,
    Trackers,
    Peers,
    Panel,
  },
  emits: ['update:modelValue', 'update:tab'],
})
class InfoDialog extends Vue {
  private display = useDisplay() as any;

  @Prop({ type: Array })
  readonly modelValue!: Torrent[]

  @Prop({ type: String })
  readonly tab!: string

  tabSync = 'general'

  @Watch('tab', { immediate: true })
  onTabChanged(v: string) {
    if (v) {
      this.tabSync = v;
    }
  }

  @Watch('tabSync')
  onTabSyncChanged(v: string) {
    this.$emit('update:tab', v);
  }

  get torrents() {
    return (this.modelValue || []).filter(Boolean)
  }

  get showDialog() {
    return true;
  }
  set showDialog(_val: boolean) {
    this.closeDialog();
  }

  get phoneLayout() {
    return this.display.xs;
  }
  get dialogWidth() {
    return this.phoneLayout ? '100%' : '80%';
  }

  @Emit('update:modelValue')
  closeDialog() {
    return false
  }
}

export default toNative(InfoDialog)
</script>

<style lang="scss" scoped>
@include dialog-title;

:deep(.v-dialog > .v-card) {
  border-radius: 16px;
}

:deep(.v-dialog) {
  max-width: 1200px;

  .v-card__text.dialog-body {
    padding: 0;

    .v-tabs {
      padding: 0 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);

      .v-theme--dark & {
        border-bottom-color: rgba(255, 255, 255, 0.08);
      }

      .v-tab {
        font-weight: 600;
        letter-spacing: 0.02em;
        text-transform: none;
        font-size: 0.85rem;
        min-width: 0;
        padding: 0 12px;
      }
    }
  }

  .v-card__text:not(.dialog-body) {
    min-height: 200px;
    padding: 16px 20px;
  }
}

:deep(.v-data-table) {
  .v-data-table-footer {
    margin-right: 0;
  }

  thead th, tbody td {
    padding: 3px 8px !important;
    height: auto;
    white-space: nowrap;

    &:first-child {
      padding-left: 14px !important;
    }
    &:last-child {
      padding-right: 14px !important;
    }
  }

  thead th {
    font-weight: 600;
    font-size: 0.78rem;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: rgba(var(--v-theme-on-surface), 0.55);
  }
}

.v-dialog--fullscreen {
  .v-card__text.dialog-body {
    padding-bottom: 52px;
  }

  .v-card__actions {
    position: absolute;
    bottom: 0;
    right: 0;
  }
}
</style>
