<template>
  <v-data-table
    :headers="headers"
    :items="trackers"
    :items-per-page="50"
    :items-per-page-options="[10, 25, 50, -1]"
  >
    <template #item="row">
      <tr>
        <td>{{ row.item.tier }}</td>
        <td>{{ row.item.url }}</td>
        <td>{{ formatTrackerStatus(row.item.status) }}</td>
        <td>{{ formatTrackerNum(row.item.num_peers) }}</td>
        <td>{{ formatTrackerNum(row.item.num_seeds) }}</td>
        <td>{{ formatTrackerNum(row.item.num_leeches) }}</td>
        <td>{{ formatTrackerNum(row.item.num_downloaded) }}</td>
        <td>{{ row.item.msg }}</td>
      </tr>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import api from '../../Api';

import { Vue, Component, Prop, toNative } from 'vue-facing-decorator';
import BaseTorrentInfo from './baseTorrentInfo';
import { tr } from '@/locale'

@Component
class Trackers extends BaseTorrentInfo {
  @Prop({ type: String })
  readonly hash!: string

  readonly headers = [
    { title: tr('properties_widget.tier'), key: 'tier' },
    { title: tr('properties_widget.url'), key: 'url' },
    { title: tr('properties_widget.status'), key: 'status' },
    { title: tr('properties_widget.numPeers'), key: 'num_peers' },
    { title: tr('properties_widget.numSeeds'), key: 'num_seeds' },
    { title: tr('properties_widget.numLeeches'), key: 'num_leeches' },
    { title: tr('properties_widget.numDownloaded'), key: 'num_downloaded' },
    { title: tr('properties_widget.msg'), key: 'msg' },
  ]

  trackers: any[] = []

  async getTracker() {
    this.trackers = await api.getTorrentTracker(this.hash);
  }

  fetchInfo() {
    return this.getTracker()
  }

  formatTrackerStatus(status: number) {
    const map = [
      tr('properties_widget.disabled'),
      tr('properties_widget.notContracted'),
      tr('properties_widget.working'),
      tr('properties_widget.updating'),
      tr('properties_widget.notWorking'),
    ];

    return map[status];
  }

  formatTrackerNum(num: number) {
    if (num === -1) {
      return 'N/A';
    }

    return num.toString();
  }
}

export default toNative(Trackers)
</script>
