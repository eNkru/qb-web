<template>
  <div
    class="footer d-flex"
    :class="topLayoutClass"
    v-if="isDataReady"
  >
    <div
      class="d-flex shrink"
      :class="phoneLayout ? 'flex-column' : 'align-center'"
      v-if="app"
    >
      <div v-if="!phoneLayout">
        <v-tooltip location="top">
          <template #activator="{ props }">
            <span v-bind="props">
              qBittorrent {{ app.version }}
            </span>
          </template>
          <span>
            API version: {{ app.apiVersion }}
          </span>
          <br>
          <span>
            qb-web version: {{ buildInfo }}
          </span>
        </v-tooltip>
      </div>
      <v-divider
        vertical
        class="mx-2"
        v-if="!phoneLayout"
      />
      <div class="icon-label">
        <v-icon>mdi-sprout</v-icon>
        {{ allTorrents.length }} [{{ $formatSize(totalSize) }}]
      </div>
      <v-divider
        vertical
        class="mx-2"
        v-if="!phoneLayout"
      />
      <v-tooltip location="top">
        <template #activator="{ props }">
          <div
            class="icon-label"
            v-bind="props"
          >
            <v-icon>mdi-nas</v-icon>
            {{ $formatSize(info?.free_space_on_disk ?? 0) }}
          </div>
        </template>
        <span>
          Queued I/O jobs: {{ info?.queued_io_jobs }}
        </span>
        <br>
        <span>
          Avg queue time: {{ info?.average_time_queue }} ms
        </span>
      </v-tooltip>
      <v-divider
        vertical
        class="mx-2"
        v-if="!phoneLayout"
      />
      <div
        class="icon-label"
        v-if="!phoneLayout"
      >
        <v-icon class="icon-upload-download">
          mdi-swap-vertical-bold
        </v-icon>
        <span>
          {{ $formatSize(info?.alltime_dl ?? 0) }}/{{ $formatSize(info?.alltime_ul ?? 0) }}
        </span>
      </div>
    </div>
    <div
      class="d-flex shrink"
      :class="phoneLayout ? 'flex-column' : 'align-center'"
      v-if="info"
    >
      <div
        v-if="!phoneLayout"
        class="icon-label"
      >
        <v-icon>mdi-lan</v-icon>            {{ $t('label.dht_nodes', info?.dht_nodes ?? 0) }}
      </div>
      <v-divider
        vertical
        class="mx-2"
        v-if="!phoneLayout"
      />
      <div class="icon-label">
        <v-tooltip location="top">
          <template #activator="{ props }">
            <v-icon
              v-bind="props"
              :color="connectionIconColor(info?.connection_status ?? '')"
            >
              mdi-{{ connectionIcon(info?.connection_status ?? '') }}
            </v-icon>
            <span v-if="phoneLayout">
              Network {{ info?.connection_status ?? '' }}
            </span>
          </template>
          <span>
            Network {{ info?.connection_status }}
          </span>
        </v-tooltip>
      </div>
      <v-divider
        vertical
        class="mx-2"
        v-if="!phoneLayout"
      />
      <div class="icon-label">
        <v-switch
          v-if="phoneLayout"
          hide-details
          :model-value="speedLimited"
          @change="toggleSpeedLimitsMode"
          label="Alternative speed limits"
          class="mt-0 pt-0 speed-switch"
        >
          <template #prepend>
            <v-icon
              v-bind="speedModeBind"
            >
              mdi-speedometer
            </v-icon>
          </template>
        </v-switch>
        <v-tooltip
          location="top"
          v-else
        >
          <template #activator="{ props }">
            <v-icon
              v-bind="{ ...props, ...speedModeBind }"
              @click="toggleSpeedLimitsMode"
            >
              mdi-speedometer
            </v-icon>
          </template>
          <span>
            Alternative speed limits {{ speedLimited ? 'enabled' : 'disabled' }}
          </span>
        </v-tooltip>
      </div>
      <v-divider
        vertical
        class="mx-2"
        v-if="!phoneLayout"
      />
      <div class="icon-label">
        <v-icon            :color="(info?.dl_info_speed ?? 0) > 0 ? 'success' : undefined"
        >
          mdi-download
        </v-icon>
        <span>
          {{ $formatSize(info?.dl_info_speed ?? 0) }}/s
          <template v-if="info?.dl_rate_limit">
            ({{ $formatSize(info?.dl_rate_limit) }}/s)
          </template>
          <template v-if="!phoneLayout">
            [{{ $formatSize(info?.dl_info_data ?? 0) }}]
          </template>
        </span>
      </div>
      <v-divider
        vertical
        class="mx-2"
        v-if="!phoneLayout"
      />
      <div class="icon-label">
        <v-icon            :color="(info?.up_info_speed ?? 0) > 0 ? 'warning' : undefined"
        >
          mdi-upload
        </v-icon>
        <span>
          {{ $formatSize(info?.up_info_speed ?? 0) }}/s
          <template v-if="info?.up_rate_limit">
            ({{ $formatSize(info?.up_rate_limit) }}/s)
          </template>
          <template v-if="!phoneLayout">
            [{{ $formatSize(info?.up_info_data ?? 0) }}]
          </template>
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { sumBy } from 'lodash';
import { Vue, Component, Prop, Watch, toNative } from 'vue-facing-decorator';
import { useDisplay } from 'vuetify';
import api from '../Api';
import buildInfo from '@/buildInfo';
import { Torrent, ServerState } from '@/types';


@Component
class Footer extends Vue {
  display = useDisplay() as any;

  @Prop({ type: Boolean })
  readonly phoneLayout!: boolean

  app: any = null
  speedLimited = false

  buildInfo = buildInfo

  get info(): ServerState | null {
    return this.isDataReady ? (this.$store.state as any).mainData?.server_state ?? null : null;
  }
  get isDataReady(): boolean {
    return this.$store.getters.isDataReady;
  }
  get allTorrents(): Torrent[] {
    return this.$store.getters.allTorrents;
  }

  get totalSize() {
    return sumBy(this.allTorrents, 'size');
  }

  get speedModeBind() {
    if (this.speedLimited) {
      return {
        class: 'speed-limited',
        color: 'warning',
      };
    }

    return {
      class: null,
      color: 'success',
    };
  }

  get topLayoutClass() {
    const v = this.phoneLayout;
    if (v) {
      return ['in-drawer', 'flex-column'];
    }

    return ['mx-4', 'justify-space-between'];
  }

  async getAppInfo() {
    let resp = await api.getAppVersion();
    const version = resp.data;

    resp = await api.getApiVersion();
    const apiVersion = resp.data;

    this.app = {
      version, apiVersion,
    };
  }

  async toggleSpeedLimitsMode() {
    this.speedLimited = !this.speedLimited;
    await api.toggleSpeedLimitsMode();
  }

  created() {
    if (!this.isDataReady) {
      return;
    }

    if (!this.info) {
      return;
    }
    this.speedLimited = this.info.use_alt_speed_limits;
    this.getAppInfo();
  }

  @Watch('isDataReady')
  onDataReady(v: boolean) {
    if (v && this.app === null) {
      this.getAppInfo();
    }
  }

  @Watch('info.use_alt_speed_limits')
  onSpeedLimitChanged (v: boolean) {
    this.speedLimited = v;
  }

  connectionIcon(status: string) {
    const statusMap: any = {
      connected: 'check-network',
      firewalled: 'minus-network',
      disconnected: 'close-network',
    };
    return statusMap[status];
  }

  connectionIconColor(status: string) {
    const statusMap: any = {
      connected: 'success',
      firewalled: 'warning',
      disconnected: 'error',
    };
    return statusMap[status];
  }
}

export default toNative(Footer)
</script>

<style lang="scss" scoped>
.footer {
  font-size: 14px;
  width: 100%;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  padding: 6px 0;
}

.v-theme--dark .footer {
  border-top-color: rgba(255, 255, 255, 0.08);
}

.icon-label {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 6px;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  .v-icon {
    opacity: 0.7;
  }
}

.icon-upload-download {
  transform: scaleX(-1);
}

.speed-switch {
  font-size: inherit;
  width: 100%;

  :deep() {
    .v-input__prepend-outer {
      margin-right: 0;
    }

    .v-input__control {
      margin-left: 4px;
      width: 100%;

      .v-field__field {
        justify-content: space-between;

        .v-selection-control__input {
          order: 2;
        }

        .v-label {
          color: inherit;
          font-size: inherit;
        }
      }
    }
  }
}

.speed-limited {
  transform: scaleX(-1);
}
.in-drawer {
  .no-icon {
    margin-left: 24px;
  }
}
</style>
