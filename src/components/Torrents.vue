<template>
  <div
    class="torrents"
    :class="{'phone-layout': isXs}"
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
          :disabled="!hasSelected || selectedHashes.length > 5"
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
        <template v-if="!isXs">
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
            :disabled="!hasSelected"
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
          </v-btn>          <v-btn
            icon
            @click="recheckTorrents"
            :title="$t('recheck')"
            :disabled="!hasSelected"
          >
            <v-icon>mdi-backup-restore</v-icon>
          </v-btn>
        </template>
        <div class="toolbar-divider" />
        <v-menu>
          <template #activator="{ props: menuProps }">
            <v-btn
              icon
              v-bind="menuProps"
              title="Toggle columns"
            >
              <v-icon>mdi-cog-outline</v-icon>
            </v-btn>
          </template>
          <v-list
            density="compact"
            class="column-toggle-list"
          >
            <v-list-subheader>Visible Columns</v-list-subheader>
            <v-list-item
              v-for="col in toggleableColumns"
              :key="col.key"
              @click="toggleColumn(col.key)"
            >
              <template #prepend>
                <v-checkbox-btn
                  :model-value="!isColumnHidden(col.key)"
                  @click.stop="toggleColumn(col.key)"
                />
              </template>
              <v-list-item-title>{{ col.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
      <v-divider />
    </div>

    <div class="table-wrapper">
      <v-data-table
        :headers="headers"
        :items="torrents"
        item-value="hash"
        fixed-header
        :class="{'hide-headers': hasSelected}"
        v-model:page="currentPage"
        v-model:items-per-page="itemsPerPage"
        v-model:sort-by="sortBy"
        :loading="loading"
        density="compact"
        :items-per-page-options="[10, 20, 50, -1]"
      >
        <template #[`header.data-table-select`]="">
          <v-checkbox-btn
            :model-value="isAllSelected"
            :indeterminate="isIndeterminate"
            @update:model-value="toggleSelectAll"
          />
        </template>

        <template #item="{ item }">
          <tr
            :key="item.hash"
            :class="{
              'torrent-row': true,
              'torrent-row--selected': isSelected(item.hash),
            }"
            @click="toggleSelection(item.hash)"
            @contextmenu.stop.prevent="onRowContextMenu($event, item)"
          >
            <td>
              <v-checkbox-btn
                :model-value="isSelected(item.hash)"
                @click.stop="toggleSelection(item.hash)"
              />
            </td>
            <td
              v-if="!isColumnHidden('name')"
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
            <td
              v-if="!isColumnHidden('tracker')"
              class="site-cell"
            >
              <v-tooltip location="bottom">
                <template #activator="{ props: tooltipProps }">
                  <span
                    v-bind="tooltipProps"
                    class="site-badge"
                  >
                    <img
                      v-if="getTrackerSiteIcon(item.tracker)"
                      :src="getTrackerSiteIcon(item.tracker)"
                      :alt="getTrackerSiteName(item.tracker)"
                      class="site-badge__icon"
                    >
                    <span
                      v-else
                      class="site-badge__fallback"
                    >
                      {{ (getTrackerSiteName(item.tracker) || '?').charAt(0).toUpperCase() }}
                    </span>
                    <span class="site-badge__label">
                      {{ getTrackerSiteName(item.tracker) }}
                    </span>
                  </span>
                </template>
                <span>{{ getTrackerHostname(item.tracker) || item.tracker }}</span>
              </v-tooltip>
            </td>
            <td v-if="!isColumnHidden('size')">
              {{ $formatSize(item.size) }}
            </td>
            <td
              v-if="!isColumnHidden('progress')"
              class="progress-cell"
            >
              <v-progress-linear
                :model-value="item.progress * 100"
                :color="stateColor(item.state, true, item.seq_dl)"
                :bg-color="isDark ? 'grey-darken-3' : 'grey-lighten-3'"
                bg-opacity="0.5"
                height="22"
                rounded
              >
                <template #default>
                  <span
                    class="progress-label"
                    :class="getProgressColorClass(item.progress)"
                  >
                    {{ $progress(item.progress) }}
                  </span>
                </template>
              </v-progress-linear>
            </td>
            <td v-if="!isColumnHidden('state')">
              {{ $t('torrent_state.' + item.state) }}
            </td>
            <td v-if="!isColumnHidden('priority')">
              {{ formatTorrentPriority(item.priority) }}
            </td>
            <td v-if="!isColumnHidden('num_complete')">
              {{ item.num_seeds }}/{{ item.num_complete }}
            </td>
            <td v-if="!isColumnHidden('num_incomplete')">
              {{ item.num_leechs }}/{{ item.num_incomplete }}
            </td>
            <td v-if="!isColumnHidden('dlspeed')">
              {{ formatNetworkSpeed(item.dlspeed) }}
            </td>
            <td v-if="!isColumnHidden('upspeed')">
              {{ formatNetworkSpeed(item.upspeed) }}
            </td>
            <td v-if="!isColumnHidden('eta')">
              {{ $formatDuration(item.eta, {dayLimit: 100}) }}
            </td>
            <td v-if="!isColumnHidden('ratio')">
              {{ item.ratio.toFixed(2) }}
            </td>
            <td v-if="!isColumnHidden('added_on')">
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
import { useDisplay, useTheme } from 'vuetify'
import { intersection, uniqBy } from 'lodash-es'

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
import { useMainStore } from '@/store/index'
import { useConfigStore } from '@/store/config'
import { useDialogStore } from '@/store/dialog'
import { useSnackBarStore } from '@/store/snackBar'

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
  display = useDisplay() as any;
  theme = useTheme() as any;
  mainStore = useMainStore()
  configStore = useConfigStore()
  dialogStore = useDialogStore()
  snackBarStore = useSnackBarStore()

  get isXs() { return this.display.xs; }
  get isDark() { return this.theme.global.current.dark; }
  readonly allColumns = [
    { title: tr('name'), key: 'name' },
    { title: tr('sites'), key: 'tracker' },
    { title: tr('size'), key: 'size' },
    { title: tr('progress'), key: 'progress' },
    { title: tr('status'), key: 'state' },
    { title: tr('priority.column'), key: 'priority' },
    { title: tr('seeds'), key: 'num_complete' },
    { title: tr('peers'), key: 'num_incomplete' },
    { title: tr('dl_speed'), key: 'dlspeed' },
    { title: tr('up_speed'), key: 'upspeed' },
    { title: tr('eta'), key: 'eta' },
    { title: tr('ratio'), key: 'ratio' },
    { title: tr('added_on'), key: 'added_on' },
  ]

  get headers() {
    const selectCol = { title: '', key: 'data-table-select', sortable: false, width: '48px' };
    const hidden = this.configStore.config.hiddenColumns || [];
    const visible = this.allColumns.filter(c => !hidden.includes(c.key));
    return [selectCol, ...visible];
  }

  get toggleableColumns() {
    return this.allColumns;
  }

  sortBy: any = []
  selectedRows: string[] = []
  toDelete: Torrent[] = []
  toSetCategory: Torrent[] = []
  categoryToSet: string | null = null
  toShowInfo: Torrent[] = []
  toEditTracker: Torrent[] = []
  infoTab = null
  itemsPerPage = 50
  currentPage = 1

  get isDataReady(): boolean {
    return this.mainStore.isDataReady;
  }
  get allTorrents(): Torrent[] {
    return this.mainStore.allTorrents;
  }
  get allCategories(): Category[] {
    return this.mainStore.allCategories;
  }
  get allTags(): Tag[] {
    return this.mainStore.allTags;
  }
  get torrentGroupByCategory(): {[category: string]: Torrent[]} {
    return this.mainStore.torrentGroupByCategory;
  }
  get torrentGroupByTag(): {[tag: string]: Torrent[]} {
    return this.mainStore.torrentGroupByTag;
  }
  get torrentGroupBySite(): {[site: string]: Torrent[]} {
    return this.mainStore.torrentGroupBySite;
  }
  get torrentGroupByState(): {[state: string]: Torrent[]} {
    return this.mainStore.torrentGroupByState;
  }
  get filter(): TorrentFilter {
    return this.configStore.config.filter;
  }
  get query(): string | null {
    return this.mainStore.query;
  }

  updateConfig(payload: ConfigPayload) {
    this.configStore.updateConfig(payload);
  }

  isColumnHidden(key: string): boolean {
    const hidden = this.configStore.config.hiddenColumns || [];
    return hidden.includes(key);
  }

  toggleColumn(key: string) {
    const hidden = [...(this.configStore.config.hiddenColumns || [])];
    const idx = hidden.indexOf(key);
    if (idx === -1) {
      hidden.push(key);
    } else {
      hidden.splice(idx, 1);
    }
    this.updateConfig({ key: 'hiddenColumns', value: hidden.length ? hidden : null });
  }
  showSnackBar(config: SnackBarConfig) {
    this.snackBarStore.showSnackBar(config);
  }
  async asyncShowDialog(config: DialogConfig): Promise<string | undefined> {
    return this.dialogStore.asyncShowDialog(config);
  }

  get loading() {
    return !this.isDataReady;
  }
  get hasSelected() {
    return !!this.selectedRows.length;
  }
  get selectedHashes(): string[] {
    return this.selectedRows;
  }

  get selectedTorrents(): Torrent[] {
    const hashSet = new Set(this.selectedRows);
    return this.allTorrents.filter(t => hashSet.has(t.hash));
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
      === Math.min(this.torrents.length, this.itemsPerPage);
  }

  get isAllSelected(): boolean {
    const visible = this.torrents;
    return visible.length > 0 && visible.every(t => this.selectedRows.includes(t.hash));
  }

  get isIndeterminate(): boolean {
    return this.hasSelected && !this.isAllSelected;
  }

  toggleSelectAll() {
    if (this.isAllSelected) {
      this.selectedRows = [];
    } else {
      this.selectedRows = this.torrents.map(t => t.hash);
    }
  }

  stateIcon(state: string) {
    const item = getStateInfo(state);
    return `mdi-${item.icon}`;
  }

  stateColor(state: string, isProgress?: boolean, isSeqDL?: boolean): string | undefined {
    const item = getStateInfo(state);
    if (!isProgress) {
      return item.color ?? undefined;
    }
    if (isSeqDL) {
      return '#e33371';
    }

    return item.color || 'grey-lighten-1';
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
    const color = (progress >= 0.5 || this.isDark)
      ? 'text-white' : 'text-black';
    return color;
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
      hash: torrent.hash,
    });
  }

  created() {
    const savedItemsPerPage = this.configStore.config.pageOptions?.itemsPerPage;
    if (savedItemsPerPage != null) {
      this.itemsPerPage = savedItemsPerPage;
    }
    this.sortBy = this.configStore.config.sortBy ?? [];
  }

  mounted() {
    window.addEventListener('show-torrent-details', this.onShowTorrentDetails as any);
  }

  beforeUnmount() {
    window.removeEventListener('show-torrent-details', this.onShowTorrentDetails as any);
  }

  onShowTorrentDetails(e: Event) {
    this.showInfo((e as CustomEvent).detail);
  }

  confirmDelete() {
    this.toDelete = this.selectedTorrents;
  }

  showInfo(row?: any) {
    this.toShowInfo = row ? [row] : this.selectedTorrents;
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
      this.selectedRows = this.allTorrents.map(t => t.hash);
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
    const savePaths = uniqBy(this.selectedTorrents, 'save_path');

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
    this.toSetCategory = this.selectedTorrents;
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
    if (!this.hasSelected) {
      this.selectedRows = this.allTorrents.map(t => t.hash);
    }
    this.toEditTracker = this.selectedTorrents;
  }

  @Watch('itemsPerPage')
  onItemsPerPageChanged() {
    this.updateConfig({
      key: 'pageOptions',
      value: { itemsPerPage: this.itemsPerPage },
    })
  }

  @Watch('sortBy', { deep: true})
  onSortByChanged() {
    this.updateConfig({
      key: 'sortBy',
      value: this.sortBy,
    })
  }

  isSelected(hash: string): boolean {
    return this.selectedRows.includes(hash);
  }

  toggleSelection(hash: string) {
    const idx = this.selectedRows.indexOf(hash);
    if (idx === -1) {
      this.selectedRows = [...this.selectedRows, hash];
    } else {
      this.selectedRows = this.selectedRows.filter(h => h !== hash);
    }
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

    const visibleHashes = new Set(v.map(t => t.hash));
    const newSelected = this.selectedRows.filter(hash => visibleHashes.has(hash));
    if (newSelected.length !== this.selectedRows.length) {
      this.selectedRows = newSelected;
    }
  }
}

export default toNative(Torrents)
</script>

<style lang="scss" scoped>
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
  flex: 1;
  min-height: 0;
}

.table-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;

  .v-data-table {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    :deep(.torrent-row) {
      cursor: pointer;
    }

    :deep(.torrent-row--selected > td) {
      background-color: rgba(25, 118, 210, 0.12);
    }

    :deep(.torrent-row--selected:hover > td) {
      background-color: rgba(25, 118, 210, 0.18);
    }

    :deep(thead th), :deep(tbody td) {
      white-space: nowrap;
      padding: 0 4px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    :deep(thead th) {
      overflow: visible;
    }

    :deep(thead th) {
      position: relative;
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
        display: inline-block;
        max-width: calc(100% - 24px);
        vertical-align: middle;
      }
    }

    :deep(.v-data-table-footer) {
      margin-right: 4em;
      height: 52px;
      padding-top: 0;
      padding-bottom: 0;
      box-sizing: border-box;

      .v-data-table-footer__items-per-page .v-select {
        margin: {
          top: 0;
          bottom: 0;
        }

        .v-field--variant-outlined {
          .v-field__outline {
            display: none;
          }

          .v-field__field {
            background: transparent !important;
            border: none !important;
          }

          .v-field__overlay {
            display: none;
          }
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
    height: 52px;
    padding-top: 0;
    padding-bottom: 0;
    box-sizing: border-box;

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

.site-cell {
  white-space: nowrap;
}

.site-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 10px;
  border-radius: 4px;
  background: transparent;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
  color: rgba(var(--v-theme-on-surface), 0.7);
  cursor: default;
  transition: border-color 0.15s ease, color 0.15s ease;

  &:hover {
    border-color: rgba(var(--v-theme-on-surface), 0.3);
    color: rgba(var(--v-theme-on-surface), 0.9);
  }
}

.site-badge__icon {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  object-fit: contain;
  border-radius: 3px;
}

.site-badge__fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  border-radius: 4px;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  font-size: 0.6rem;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
}

.site-badge__label {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1;
}

.progress-cell {
  min-width: 110px;
  padding-right: 12px !important;

  .v-progress-linear {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .progress-label {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    line-height: 1;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
  }
}

.column-toggle-list {
  min-width: 200px;
  max-height: 400px;
  overflow-y: auto;
}
</style>
