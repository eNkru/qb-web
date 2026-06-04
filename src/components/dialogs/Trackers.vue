<template>
  <v-data-table
    :headers="headers"
    :items="trackers"
    :items-per-page="99999"
  >
    <template #bottom />
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
    { text: tr('properties_widget.tier'), value: 'tier' },
    { text: tr('properties_widget.url'), value: 'url' },
    { text: tr('properties_widget.status'), value: 'status' },
    { text: tr('properties_widget.numPeers'), value: 'num_peers' },
    { text: tr('properties_widget.numSeeds'), value: 'num_seeds' },
    { text: tr('properties_widget.numLeeches'), value: 'num_leeches' },
    { text: tr('properties_widget.numDownloaded'), value: 'num_downloaded' },
    { text: tr('properties_widget.msg'), value: 'msg' },
  ]

  trackers = []

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
