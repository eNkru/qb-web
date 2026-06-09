<template>
  <div class="torrent-content">
    <div class="file-controls">
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        density="compact"
        variant="outlined"
        hide-details
        :placeholder="$t('filter')"
        clearable
      />
      <span class="file-count">{{ $t('files') }}: {{ files.length }}</span>
    </div>
    <v-treeview
      open-on-click
      :items="filteredTree"
      item-title="name"
      item-children="children"
      item-value="id"
      :model-value="selected"
      selectable
      @update:model-value="selectChanged"
    >
      <template #prepend="{ item }">
        <v-progress-circular
          v-if="inChanging.includes((item as any).id)"
          size="24"
          width="2"
          indeterminate
        />
        <v-icon v-else>
          {{ getRowIcon(item as any) }}
        </v-icon>
      </template>
      <template #append="{ item }">
        <span>
          [{{ $formatSize((item as any).size) }}]
        </span>
        <span class="progress">
          {{ $progress((item as any).progress) }}
        </span>
      </template>
    </v-treeview>
    <div
      v-if="files?.length && !filteredFiles.length"
      class="no-matches"
    >
      <v-icon>mdi-file-search-outline</v-icon>
      <span>{{ $t('no_matches') }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { groupBy, xor, sumBy } from 'lodash-es';
import api from '../../Api';
import BaseTorrentInfo from './baseTorrentInfo'

import { Vue, Component, Prop, toNative } from 'vue-facing-decorator';

enum EFilePriority {
  notDownload = 0,
  normal = 1,
  high = 6,
  maximal = 7
}

 
interface File {
  id: number;
  name: string;
  size: number;
  progress: number;
  priority: EFilePriority;
  is_seed: boolean;
  piece_range: Array<number>;
  availability: number;
}
 

interface TreeItem {
  id: number;
  name: string;
  item?: File;
  children?: Array<TreeItem>;
  size: number;
  progress: number;
}

const FILE_KEY = '/FILE/';

const UNWANTED_FILE = '.unwanted';

@Component
class TorrentContent extends BaseTorrentInfo {
  @Prop({ type: String })
  readonly hash!: string

  files: File[] = []
  folderIndex!: number
  inChanging: number[] = []
  search = ''

  get filteredFiles(): File[] {
    const source = this.files ?? [];
    if (!this.search) return source;
    const q = this.search.toLowerCase();
    return source.filter(f => f.name.toLowerCase().includes(q));
  }

  get filteredTree(): TreeItem[] {
    return this.buildTree(this.filteredFiles, 0);
  }

  get selected(): number[] {
    return (this.files ?? []).filter((item) => {
      return item.priority !== EFilePriority.notDownload;
    }).map(item => item.id);
  }

  async getFiles() {
    const files = await api.getTorrentFiles(this.hash) as File[] ?? []
    files.forEach((v, i) => v.id = i)
    files.sort((a, b) => a.name.localeCompare(b.name))

    this.files = files
    this.folderIndex = 0

    this.inChanging = [];
  }

  getRowIcon(item: TreeItem) {
    if (item.item) {
      return 'mdi-file';
    }

    return 'mdi-folder';
  }

  async selectChanged(items: Array<number>) {
    const previous = this.selected;
    const visibleIds = new Set(this.filteredFiles.map(f => f.id));
    const visiblePrevious = previous.filter(id => visibleIds.has(id));
    const diff = xor(visiblePrevious, items);

    if (diff.length === 0) return;

    this.inChanging.push(...diff);

    await api.setTorrentFilePriority(this.hash, diff, items.length > visiblePrevious.length ?
      EFilePriority.normal : EFilePriority.notDownload);
  }

  getFileFolder(item: File, start: number) {
    const { name } = item;
    const index = name.indexOf('/', start);
    if (index === -1) {
      return FILE_KEY;
    }

    return name.substring(start, index);
  }

  buildTree(files: File[] | undefined, start: number): TreeItem[] {
    if (!files?.length) {
      return [];
    }

    const entries = groupBy(files, item => this.getFileFolder(item, start));

    const result = [];
    for (const [folder, values] of Object.entries(entries)) {
      // Push .unwanted file to current folder, just like original web ui
      if(folder === UNWANTED_FILE) {
        for (const item of values) {
          result.push({
            id: item.id,
            name: item.name.substring(start + folder.length + 1),
            item,
            size: item.size,
            progress: item.progress,
          });
        }
        continue;
      }

      if (folder !== FILE_KEY) {
        const subTree = this.buildTree(values, start + folder.length + 1);
        // Offset folder id to making sure it will not influence array content
        result.push({
          id: this.files.length + this.folderIndex++,
          name: folder,
          children: subTree,
          size: sumBy(subTree, 'size'),
          progress: sumBy(subTree, 'progress') / subTree.length,
        });
        continue;
      }

      for (const item of values) {
        result.push({
          id: item.id,
          name: item.name.substring(start),
          item,
          size: item.size,
          progress: item.progress,
        });
      }
    }

    return result;
  }

  fetchInfo() {
    return this.getFiles()
  }
}

export default toNative(TorrentContent)
</script>

<style lang="scss" scoped>
.torrent-content {
  :deep(.v-treeview-node__root) {
    min-height: 0;
  }

  .file-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: rgb(var(--v-theme-surface));

    .v-text-field {
      flex: 1;
    }

    .file-count {
      font-size: 0.8125rem;
      color: rgba(var(--v-theme-on-surface), 0.6);
      white-space: nowrap;
    }
  }

  .no-matches {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 32px;
    color: rgba(var(--v-theme-on-surface), 0.4);
    font-size: 0.875rem;
  }
}

.progress {
  display: inline-block;
  width: 3em;
}
</style>
