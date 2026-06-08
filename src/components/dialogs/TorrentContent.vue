<template>
  <div class="torrent-content">
    <v-treeview
      open-on-click
      :items="fileTree"
      :model-value="selected"
      selectable
      @update:model-value="selectChanged"
    >
      <template #prepend="row">
        <v-progress-circular
          v-if="inChanging.includes(row.item.id)"
          size="24"
          width="2"
          indeterminate
        />
        <v-icon v-else>
          {{ getRowIcon(row) }}
        </v-icon>
      </template>
      <template #append="row">
        <span>
          [{{ $formatSize(row.item.size) }}]
        </span>
        <span class="progress">
          {{ $progress(row.item.progress) }}
        </span>
      </template>
    </v-treeview>
  </div>
</template>

<script lang="ts">
import { groupBy, xor, sumBy } from 'lodash';
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

  get fileTree(): TreeItem[] {
    return this.buildTree(this.files, 0);
  }

  get selected(): number[] {
    return this.files.filter((item) => {
      return item.priority !== EFilePriority.notDownload;
    }).map(item => item.id);
  }

  async getFiles() {
    const files = await api.getTorrentFiles(this.hash) as File[]
    files.forEach((v, i) => v.id = i)
    files.sort((a, b) => a.name.localeCompare(b.name))

    this.files = files
    this.folderIndex = 0

    this.inChanging = [];
  }

  getRowIcon(row: any) {
    if (row.item.item) {
      return 'mdi-file';
    }

    return row.open ? 'mdi-folder-open' : 'mdi-folder';
  }

  async selectChanged(items: Array<number>) {
    const previous = this.selected;
    const diff = xor(previous, items);

    if(diff.length == 0) return;

    this.inChanging.push(...diff);

    await api.setTorrentFilePriority(this.hash, diff, items.length > previous.length ?
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

  buildTree(files: Array<File>, start: number): TreeItem[] {
    if (!files.length) {
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
}

.progress {
  display: inline-block;
  width: 3em;
}
</style>
