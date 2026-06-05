<template>
  <v-data-table
    :headers="headers"
    :items="peers"
    :items-per-page="99999"
  >
    <template #bottom />
    <template #item="row">
      <tr>
        <td class="ip">
          <template v-if="row.item.country_code">
            <img
              v-if="isWindows"
              class="country-flag"
              :title="row.item.country"
              :alt="codeToFlag(row.item.country_code).char"
              :src="codeToFlag(row.item.country_code).url"
            >
            <template v-else>
              {{ codeToFlag(row.item.country_code).char }}
            </template>
          </template>
          {{ row.item.ip }}
          <span class="text-grey">
            :{{ row.item.port }}
          </span>
        </td>
        <td>{{ row.item.connection }}</td>
        <td :title="row.item.flags_desc">
          {{ row.item.flags }}
        </td>
        <td>{{ row.item.client }}</td>
        <td>{{ $progress(row.item.progress) }}</td>
        <td>{{ $formatNetworkSpeed(row.item.dl_speed) }}</td>
        <td>{{ networkSize(row.item.downloaded) }}</td>
        <td>{{ $formatNetworkSpeed(row.item.up_speed) }}</td>
        <td>{{ networkSize(row.item.uploaded) }}</td>
        <td>{{ $progress(row.item.relevance) }}</td>
        <td>{{ row.item.files }}</td>
      </tr>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import { map, merge, cloneDeep } from 'lodash';
import { codeToFlag, isWindows } from '../../utils';
import api from '../../Api';
import { formatSize } from '../../filters';
import BaseTorrentInfo from './baseTorrentInfo';

import { Vue, Component, Prop, toNative } from 'vue-facing-decorator';
import { tr } from '@/locale'

@Component
class Peers extends BaseTorrentInfo {
  @Prop({ type: String })
  readonly hash!: string

  headers = [
    { title: tr('properties_widget.ip'), key: 'ip' },
    { title: tr('properties_widget.connection'), key: 'connection' },
    { title: tr('properties_widget.flags'), key: 'flags' },
    { title: tr('properties_widget.client'), key: 'client' },
    { title: tr('properties_widget.progress'), key: 'progress' },
    { title: tr('properties_widget.downloadSpeed'), key: 'dl_speed' },
    { title: tr('properties_widget.downloaded'), key: 'downloaded' },
    { title: tr('properties_widget.uploadSpeed'), key: 'up_speed' },
    { title: tr('properties_widget.uploaded'), key: 'uploaded' },
    { title: tr('properties_widget.relevance'), key: 'relevance' },
    { title: tr('properties_widget.files'), key: 'files' },
  ]

  peersObj: any = null
  rid: number | null = null
  isWindows: boolean = isWindows

  get peers() {
    return map(this.peersObj, (value, key) => merge({}, value, { key }));
  }

  codeToFlag(code: string) {
    if (code) {
      return codeToFlag(code);
    }

    return {};
  }

  async getPeers() {
    const resp = await api.getTorrentPeers(this.hash, this.rid || undefined);
    this.rid = resp.rid;

    if (resp.full_update) {
      this.peersObj = resp.peers;
    } else {
      const tmp: any = cloneDeep(this.peersObj);
      if (resp.peers_removed) {
        for (const key of resp.peers_removed) {
          delete tmp[key];
        }
      }
      this.peersObj = merge(tmp, resp.peers);
    }
  }

  fetchInfo() {
    return this.getPeers()
  }

  networkSize(size: number) {
    if (size === 0) {
      return null;
    }

    return formatSize(size);
  }

  startTask() {
    this.setTaskAndRun(this.doTask, 2000)
  }
}

export default toNative(Peers)
</script>

<style lang="scss" scoped>
:deep(.ip) {
  display: flex;
  align-items: center;

  .country-flag {
    width: 1.5em;
    margin-right: 0.5em;
  }
}
</style>
