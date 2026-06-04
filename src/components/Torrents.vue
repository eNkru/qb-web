<template>
  <div
    class="torrents"
    :class="{'phone-layout': $vuetify.display.xs}"
  >
    <div class="toolbar-wrapper">
      <div class="toolbar">
        <v-btn
          icon
          @click="confirmDelete"
          :title="$t('delete')"
          :disabled="!hasSelected"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        <div class="toolbar-divider" />
        <v-btn
          icon
          @click="resumeTorrents"
          :title="$t('resume')"
          :disabled="!hasSelected"
        >
          <v-icon>mdi-play</v-icon>
        </v-btn>
        <v-btn
          icon
          @click="pauseTorrents"
          :title="$t('pause')"
          :disabled="!hasSelected"
        >
          <v-icon>mdi-pause</v-icon>
        </v-btn>

        <v-btn
          icon
          @click="forceStartTorrents"
          :title="$t('force_start')"
          :disabled="!hasSelected"
        >
          <v-icon>mdi-play-speed</v-icon>
        </v-btn>

        <div class="toolbar-divider" />
        <v-btn
          icon
          @click="showInfo()"
          :title="$t('info')"
          :disabled="!hasSelected || selectedRows.length > 5"
        >
          <v-icon>mdi-alert-circle</v-icon>
        </v-btn>
        <v-menu>
          <template #activator="{ props: menuProps }">
            <v-btn
              icon
              v-bind="menuProps"
              :title="$t('title.set_category')"
              :disabled="!hasSelected"
            >
              <v-icon>mdi-folder-star</v-icon>
            </v-btn>
          </template>
          <v-list class="category-actions">
            <v-list-subheader @click.stop="">
              {{ $t('title.set_category') }}
            </v-list-subheader>
            <v-list-item
              v-for="(item, i) in allCategories"
              :key="i"
              @click="setTorrentsCategory(item.key)"
            >
              <template #prepend>
                <v-icon>mdi-folder</v-icon>
              </template>
              <v-list-item-title>
                {{ item.name }}
              </v-list-item-title>
            </v-list-item>
            <v-divider />
            <v-list-item @click="setTorrentsCategory('')">
              <template #prepend>
                <v-icon>mdi-folder-remove</v-icon>
              </template>
              <v-list-item-title>
                {{ $t('reset') }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn
          icon
          @click="maximizeTorrentPriority"
          :title="$t('priority.top')"
          :disabled="!hasSelected"
        >
          <v-icon>mdi-chevron-double-up</v-icon>
        </v-btn>
        <v-btn
          icon
          @click="increaseTorrentPriority"
          :title="$t('priority.increase')"
          :disabled="!hasSelected"
        >
          <v-icon>mdi-chevron-up</v-icon>
        </v-btn>
        <v-btn
          icon
          @click="decreaseTorrentPriority"
          :title="$t('priority.decrease')"
          :disabled="!hasSelected"
        >
          <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
        <v-btn
          icon
          @click="minimizeTorrentPriority"
          :title="$t('priority.bottom')"
          :disabled="!hasSelected"
        >
          <v-icon>mdi-chevron-double-down</v-icon>
        </v-btn>
        <template v-if="!$vuetify.display.xs">
          <div class="toolbar-divider" />
          <v-btn
            icon
            @click="toggleSequentialTorrents"
            :title="$t('toggle_sequential')"
            :disabled="!hasSelected"
          >
            <v-icon>mdi-transit-connection-variant</v-icon>
          </v-btn>
          <v-btn
            icon
            @click="setTorrentLocation"
            :title="$t('title.set_location')"
            :disabled="selectedRows.length === 0"
          >
            <v-icon>mdi-folder-marker</v-icon>
          </v-btn>
          <v-btn
            icon
            @click="reannounceTorrents"
            :title="$t('reannounce')"
          >
            <v-icon>mdi-bullhorn</v-icon>
          </v-btn>
          <v-btn
            icon
            @click="editTracker"
            :title="$t('title.edit_tracker')"
          >
            <v-icon>mdi-server</v-icon>
          </v-btn>
          <v-btn
            icon
            @click="recheckTorrents"
            :title="$t('recheck')"
            :disabled="selectedRows.length === 0"
          >
            <v-icon>mdi-backup-restore</v-icon>
          </v-btn>
        </template>
      </div>
      <v-divider />
    </div>

    <div class="table-wrapper">
      <v-data-table
        :headers="headers"
        :items="torrents"
        item-key="hash"
        item-value="hash"
        fixed-header
        :class="{'hide-headers': hasSelected}"
        show-select
        v-model:options="pageOptions"
        v-model:selected="selectedRows"
        :loading="loading"
        density="compact"
        :items-per-page-options="[10, 20, 50, -1]"
      >
        <template #item="{ item, internalItem, isSelected, toggleSelect }">
          <tr
            :key="item.hash"
            :class="{
              'torrent-row': true,
              'torrent-row--selected': isSelected(internalItem),
            }"
            @click="toggleSelect(internalItem)"
            @dblclick.prevent="showInfo(item)"
            @contextmenu.stop.prevent="onRowContextMenu($event, item)"
          >
            <td>
              <v-checkbox-btn
                :model-value="isSelected(internalItem)"
                @click.stop="toggleSelect(internalItem)"
              />
            </td>
            <td
              :title="item.name"
              class="icon-label"
            >
              <v-icon :color="stateColor(item.state)">
                {{ stateIcon(item.state) }}
              </v-icon>
              <span class="torrent-title">
                {{ item.name }}
              </span>
            </td>
            <td>
              <v-tooltip bottom>
                <template #activator="{ props: tooltipProps }">
                  <v-chip
                    v-bind="tooltipProps"
                    small
                    label
                    class="site-chip"
                  >
                    <img
                      v-if="getTrackerSiteIcon(item.tracker)"
                      :src="getTrackerSiteIcon(item.tracker)"
                      :alt="getTrackerSiteName(item.tracker)"
                      class="site-chip__icon"
                    >
                    <span class="site-chip__label">
                      {{ getTrackerSiteName(item.tracker) }}
                    </span>
                  </v-chip>
                </template>
                <span>{{ getTrackerHostname(item.tracker) || item.tracker }}</span>
              </v-tooltip>
            </td>
            <td>{{ $formatSize(item.size) }}</td>
            <td>
              <v-progress-linear
                height="1.4em"
                :model-value="item.progress * 100"
                :color="stateColor(item.state, true, item.seq_dl)"
                class="text-center ma-0"
              >
                <span :class="getProgressColorClass(item.progress)">
                  {{ $progress(item.progress) }}
                </span>
              </v-progress-linear>
            </td>
            <td>{{ $t('torrent_state.' + item.state) }}</td>
            <td>{{ formatTorrentPriority(item.priority) }}</td>
            <td>{{ item.num_seeds }}/{{ item.num_complete }}</td>
            <td>{{ item.num_leechs }}/{{ item.num_incomplete }}</td>
            <td>{{ formatNetworkSpeed(item.dlspeed) }}</td>
            <td>{{ formatNetworkSpeed(item.upspeed) }}</td>
            <td>{{ $formatDuration(item.eta, {dayLimit: 100}) }}</td>
            <td>{{ item.ratio.toFixed(2) }}</td>
            <td>
              <span :title="$formatTimestamp(item.added_on)">
                {{ $formatAsDuration(item.added_on) }} ago
              </span>
            </td>
          </tr>
        </template>
      </v-data-table>
    </div>

    <confirm-delete-dialog
      v-if="toDelete.length"
      v-model="toDelete"
    />
    <confirm-set-category-dialog
      v-if="toSetCategory.length"
      :category="categoryToSet"
      v-model="toSetCategory"
    />
    <edit-tracker-dialog
      v-if="toEditTracker.length"
      v-model="toEditTracker"
    />
    <info-dialog
      v-if="toShowInfo.length"
      v-model="toShowInfo"
      v-model:tab="infoTab"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, toNative } from 'vue-facing-decorator'
import { intersection, difference, uniqBy } from 'lodash'

import { tr } from '@/locale'
import ConfirmDeleteDialog from './dialogs/ConfirmDeleteDialog.vue'
import ConfirmSetCategoryDialog from './dialogs/ConfirmSetCategoryDialog.vue'
import EditTrackerDialog from './dialogs/EditTrackerDialog.vue'
import InfoDialog from './dialogs/InfoDialog.vue'
import api from '../Api'
import { formatSize } from '@/filters'
import { getSiteAbbreviation } from '@/utils/siteMap'
import { getSiteByHostname } from '@/sites'
import { DialogType, TorrentFilter, ConfigPayload, DialogConfig, SnackBarConfig } from '@/store/types'
import { Torrent, Category, Tag } from '@/types'

function getTrackerHostname(tracker: string) {
  if (!tracker) {
    return '';
  }

  try {
    return new URL(tracker).hostname;
  } catch {
    return '';
  }
}

function getStateInfo(state: string) {
  let icon;
  switch (state) {
    case 'metaDL':
    case 'allocating':
    case 'downloading':
    case 'forcedDL':
      icon = {
        icon: 'download',
        color: 'info',
      };
      break;
    case 'uploading':
    case 'forcedUP':
      icon = {
        icon: 'upload',
        color: 'info',
      };
      break;
    case 'stalledDL':
      icon = {
        icon: 'download',
        color: null,
      };
      break;
    case 'stalledUP':
      icon = {
        icon: 'upload',
        color: null,
      };
      break;
    case 'pausedDL':
      icon = {
        icon: 'pause',
        color: 'warning',
      };
      break;
    case 'pausedUP':
      icon = {
        icon: 'check',
        color: null,
      };
      break;
    case 'queuedDL':
    case 'queuedUP':
      icon = {
        icon: 'timer-sand',
        color: 'info',
      };
      break;
    case 'checkingDL':
    case 'checkingUP':
    case 'queuedForChecking':
    case 'checkingResumeData':
    case 'moving':
      icon = {
        icon: 'backup-restore',
        color: 'info',
      };
      break;
    case 'error':
    case 'unknown':
    case 'missingFiles':
      icon = {
        icon: 'alert',
        color: 'error',
      };
      break;
    default:
      throw Error('Unknown state');
  }

  return icon;
}

@Component({
  components: {
    ConfirmDeleteDialog,
    ConfirmSetCategoryDialog,
    EditTrackerDialog,
    InfoDialog,
  },
  emits: ['torrent-contextmenu'],
})
class Torrents extends Vue {
  readonly headers = [
    { text: tr('name'), value: 'name' },
    { text: tr('sites'), value: 'tracker' },
    { text: tr('size'), value: 'size' },
    { text: tr('progress'), value: 'progress' },
    { text: tr('status'), value: 'state' },
    { text: tr('priority.column'), value: 'priority' },
    { text: tr('seeds'), value: 'num_complete' },
    { text: tr('peers'), value: 'num_incomplete' },
    { text: tr('dl_speed'), value: 'dlspeed' },
    { text: tr('up_speed'), value: 'upspeed' },
    { text: tr('eta'), value: 'eta' },
    { text: tr('ratio'), value: 'ratio' },
    { text: tr('added_on'), value: 'added_on' },
  ]

  selectedRows: Torrent[] = []
  toDelete: Torrent[] = []
  toSetCategory: Torrent[] = []
  categoryToSet: string | null = null
  toShowInfo: Torrent[] = []
  toEditTracker: Torrent[] = []
  infoTab = null
  pageOptions: any = null

  get isDataReady(): boolean {
    return this.$store.getters.isDataReady;
  }
  get allTorrents(): Torrent[] {
    return this.$store.getters.allTorrents;
  }
  get allCategories(): Category[] {
    return this.$store.getters.allCategories;
  }
  get allTags(): Tag[] {
    return this.$store.getters.allTags;
  }
  get torrentGroupByCategory(): {[category: string]: Torrent[]} {
    return this.$store.getters.torrentGroupByCategory;
  }
  get torrentGroupByTag(): {[tag: string]: Torrent[]} {
    return this.$store.getters.torrentGroupByTag;
  }
  get torrentGroupBySite(): {[site: string]: Torrent[]} {
    return this.$store.getters.torrentGroupBySite;
  }
  get torrentGroupByState(): {[state: string]: Torrent[]} {
    return this.$store.getters.torrentGroupByState;
  }
  get filter(): TorrentFilter {
    return this.$store.getters.config.filter;
  }
  get query(): string | null {
    return this.$store.state.query;
  }

  updateConfig(payload: ConfigPayload) {
    this.$store.commit('updateConfig', payload);
  }
  showSnackBar(config: SnackBarConfig) {
    this.$store.commit('showSnackBar', config);
  }
  async asyncShowDialog(config: DialogConfig): Promise<string | undefined> {
    return this.$store.dispatch('asyncShowDialog', config);
  }

  get loading() {
    return !this.isDataReady;
  }
  get hasSelected() {
    return !!this.selectedRows.length;
  }
  get selectedHashes() {
    return this.selectedRows.map(r => r.hash);
  }

  get torrents() {
    if (!this.isDataReady) {
      return [];
    }

    let list = this.allTorrents;
    if (this.filter.site !== null) {
      list = intersection(list, this.torrentGroupBySite[this.filter.site]);
    }
    if (this.filter.category !== null) {
      list = intersection(list, this.torrentGroupByCategory[this.filter.category]);
    }
    if (this.filter.tag !== null) {
      list = intersection(list, this.torrentGroupByTag[this.filter.tag]);
    }
    if (this.filter.state !== null) {
      list = intersection(list, this.torrentGroupByState[this.filter.state]);
    }
    if (this.query) {
      const q = this.query.toLowerCase();

      list = list.filter(t => {
        return t.name.toLowerCase().includes(q) ||
          t.tracker.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q);
      });
    }

    return list;
  }

  get hasSelectedAll() {
    return this.hasSelected && this.selectedRows.length
      === Math.min(this.torrents.length, this.pageOptions?.itemsPerPage);
  }

  stateIcon(state: string) {
    const item = getStateInfo(state);
    return `mdi-${item.icon}`;
  }

  stateColor(state: string, isProgress?: boolean, isSeqDL?: boolean) {
    const item = getStateInfo(state);
    if (!isProgress) {
      return item.color;
    }
    if (isSeqDL) {
      return '#e33371';
    }

    return item.color || '#0008';
  }

  formatNetworkSpeed(speed: number) {
    if (speed === 0) {
      return null;
    }

    return `${formatSize(speed)}/s`;
  }

  getTrackerSiteName(tracker: string) {
    const hostname = getTrackerHostname(tracker);
    if (!hostname) {
      return tracker;
    }

    return getSiteAbbreviation(hostname);
  }

  getTrackerSiteIcon(tracker: string) {
    const hostname = getTrackerHostname(tracker);
    if (!hostname) {
      return undefined;
    }

    return getSiteByHostname(hostname)?.icon;
  }

  getTrackerHostname(tracker: string) {
    return getTrackerHostname(tracker);
  }

  getProgressColorClass(progress: number) {
    const color = (progress >= 0.5 || (this.$vuetify.theme as any).global.current.dark)
      ? 'white' : 'black';
    return `${color}--text`;
  }

  formatTorrentPriority(priority: number) {
    if (priority <= 0) {
      return '-';
    }

    return priority;
  }

  onRowContextMenu(e: MouseEvent, torrent: Torrent) {
    this.$emit('torrent-contextmenu', {
      x: e.clientX,
      y: e.clientY,
      savePath: torrent.save_path,
    });
  }

  created() {
    this.pageOptions = this.$store.getters.config.pageOptions;
  }

  confirmDelete() {
    this.toDelete = this.selectedRows;
  }

  showInfo(row?: any) {
    this.toShowInfo = row ? [row] : this.selectedRows;
  }

  async resumeTorrents() {
    await api.resumeTorrents(this.selectedHashes);
  }

  async forceStartTorrents() {
    await api.setForceStartTorrents(this.selectedHashes);
  }

  async toggleSequentialTorrents() {
    await api.toggleSequentialTorrents(this.selectedHashes);
  }
  async pauseTorrents() {
    await api.pauseTorrents(this.selectedHashes);
  }

  async reannounceTorrents() {
    if (!this.hasSelected) {
      this.selectedRows = this.allTorrents;
    }

    await api.reannounceTorrents(this.selectedHashes);

    this.showSnackBar({text: tr('label.reannounced')});
  }

  async recheckTorrents() {
    const v = await this.asyncShowDialog({
      title: tr('title.recheck_torrents'),
      text: tr('dialog.recheck_torrents.msg'),
      type: DialogType.OkCancel,
    });

    if (!v) {
      return;
    }
    await api.recheckTorrents(this.selectedHashes);

    this.showSnackBar({text: tr('label.rechecking')});
  }

  async setTorrentLocation() {
    const savePaths = uniqBy(this.selectedRows, 'save_path');

    const oldPath = savePaths.length > 1 ? '' : savePaths[0].save_path
    const v = await this.asyncShowDialog({
      title: tr('title.set_location'),
      text: '',
      type: DialogType.Input,
      value: oldPath,
    });

    if (!v) {
      return;
    }

    this.showSnackBar({text: tr('label.moving')});

    try {
      await api.setTorrentLocation(this.selectedHashes, v);
    } catch (e) {
      this.showSnackBar({text: e});
      return;
    }

    this.showSnackBar({text: tr('label.moved')});
  }

  setTorrentsCategory(category: string) {
    this.categoryToSet = category;
    this.toSetCategory = this.selectedRows;
  }

  async maximizeTorrentPriority() {
    await api.maximizeTorrentPriority(this.selectedHashes);
  }

  async increaseTorrentPriority() {
    await api.increaseTorrentPriority(this.selectedHashes);
  }

  async decreaseTorrentPriority() {
    await api.decreaseTorrentPriority(this.selectedHashes);
  }

  async minimizeTorrentPriority() {
    await api.minimizeTorrentPriority(this.selectedHashes);
  }

  editTracker() {
    if (this.hasSelected) {
      this.selectedRows = this.allTorrents;
    }
    this.toEditTracker = this.selectedRows;
  }

  @Watch('pageOptions', { deep: true})
  onPageOptionsChanged() {
    this.updateConfig({
      key: 'pageOptions',
      value: this.pageOptions,
    })
  }

  @Watch('filter')
  onFilterChanged() {
    this.selectedRows = []
  }

  @Watch('torrents')
  onTorrentsChanged(v: Torrent[]) {
    if (!this.hasSelected) {
      return;
    }

    const torrentHashs = v.map(t => t.hash);
    const toRemove = difference(this.selectedHashes, torrentHashs);
    if (!toRemove) {
      return;
    }

    this.selectedRows = this.selectedRows.filter(r => !toRemove.includes(r.hash));
  }
}

export default toNative(Torrents)
</script>

<style lang="scss" scoped>
@import '~@/assets/styles.scss';

.toolbar {
  display: flex;
  align-items: center;
  margin-left: 2px;
  gap: 2px;
  position: relative;
  z-index: 1;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: rgba(0, 0, 0, 0.12);
  margin: 0 4px;
  flex-shrink: 0;
}

.torrents {
  display: flex;
  flex-direction: column;
  padding: 0;
  height: 100%;
}

.table-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .v-data-table {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    :deep(.v-data-table__wrapper) {
      flex: 1;
      overflow-y: auto;
    }

    :deep(.torrent-row) {
      cursor: pointer;
    }

    :deep(.torrent-row--selected > td) {
      background-color: rgba(25, 118, 210, 0.12);
    }

    :deep(.torrent-row--selected:hover > td) {
      background-color: rgba(25, 118, 210, 0.18);
    }

    :deep(thead th), td {
      white-space: nowrap;
      padding: 0 4px;
      overflow: hidden;
    }

    :deep(thead th .v-data-table__checkbox) {
      padding-left: 4px;
    }

    :deep(.v-data-table__wrapper table) {
      border-collapse: separate;
      border-spacing: 0 6px;
    }

    td {
      height: auto;
      vertical-align: middle;
      border-bottom: none !important;
      padding-top: 8px !important;
      padding-bottom: 8px !important;
      background-color: inherit;

      .v-checkbox-btn {
        margin: 0 4px;
      }

      .torrent-title {
        text-overflow: ellipsis;
        overflow: hidden;
        max-width: 32em;
      }
    }

    :deep(.v-data-table-footer) {
      margin-right: 4em;

      .v-data-table-footer__items-per-page .v-select {
        margin: {
          top: 10px;
          bottom: 10px;
        }
      }
    }
  }
}

.phone-layout {
  .v-data-table :deep(.v-data-table-footer) {
    justify-content: flex-start;
    flex-wrap: nowrap;
    margin-right: 0;

    .v-data-table-footer__items-per-page {
      display: none;
    }

    .v-data-table-footer__pagination {
      margin-left: 0;
    }
  }
}

.icon-label {
  white-space: nowrap;
}

.icon-label :deep(.v-icon) {
  vertical-align: middle;
  margin-right: 4px;
}

.icon-label .torrent-title {
  vertical-align: middle;
}

.site-chip {
  width: 8.5rem;
  max-width: 8.5rem;
  min-height: 28px;
  padding: 0 10px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 999px;
  background: rgba(241, 245, 249, 0.9);
  box-shadow: none;
  color: rgba(15, 23, 42, 0.82);

  :deep(.v-chip__content) {
    display: inline-flex;
    align-items: center;
    width: 100%;
    min-width: 0;
    gap: 6px;
    overflow: hidden;
  }
}

.v-theme--dark .site-chip {
  border-color: rgba(100, 116, 139, 0.55);
  background: rgba(30, 41, 59, 0.88);
  box-shadow: none;
  color: rgba(241, 245, 249, 0.9);
}

.site-chip__icon {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  object-fit: contain;
}

.site-chip__label {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 700;
  letter-spacing: 0.01em;
}
</style>
