<template>
  <v-dialog
    v-model="showDialog"
    scrollable
    :fullscreen="phoneLayout"
    :width="dialogWidth"
  >
    <v-card>
      <v-card-title class="headline">
        <v-icon class="mr-2">mdi-delta</v-icon>
        <span>{{ $t('logs') }}</span>
      </v-card-title>
      <v-card-text>
        <v-progress-linear
          class="mt-4"
          :indeterminate="true"
          v-if="!logs.length"
        />
        <ol class="logs caption">
          <li
            v-for="(row, i) in logs"
            :key="i"
            class="log-item"
            :class="typeColor(row.type)"
          >
            <span class="tag">[{{ formatType(row.type) }} {{ $formatTimestamp(row.timestamp / 1000) }}]</span>
            <span v-html="row.message" />
          </li>
        </ol>
        <div ref="end" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="closeDialog"
        >{{ $t('close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import api from '@/Api';
import { Vue, Component, Prop, Emit, toNative } from 'vue-facing-decorator';
import { useDisplay } from 'vuetify';
import HasTask from '../../mixins/hasTask';

@Component
class LogsDialog extends HasTask {
  private display = useDisplay() as any;

  @Prop({ type: Boolean })
  readonly modelValue!: boolean

  logs: any[] = []

  get showDialog() {
    return this.modelValue;
  }
  set showDialog(val: boolean) {
    this.$emit('update:modelValue', val);
  }

  get dialogWidth() {
    return this.display.smAndDown ? '100%' : '70%';
  }
  get phoneLayout() {
    return this.display.xs;
  }

  @Emit('update:modelValue')
  closeDialog() {
    return false
  }

  async getLogs() {
    const lastId = this.logs.length ? this.logs[this.logs.length - 1].id : -1;
    const logs = await api.getLogs(lastId);

    if (this.destroy) {
      return;
    }

    if (logs.length) {
      this.logs = this.logs.concat(logs);

      await this.$nextTick();

      (this.$refs.end as HTMLElement).scrollIntoView();
    }
  }

  created() {
    this.setTaskAndRun(this.getLogs)
  }

  formatType(type: number) {
    const map: any = {
      1: 'N',
      2: 'I',
      4: 'W',
      8: 'C',
    };
    return map[type];
  }

  typeColor(type: number) {
    const map: any = {
      1: null,
      2: 'text-info',
      4: 'text-warning',
      8: 'text-error',
    };
    return map[type];
  }
}

export default toNative(LogsDialog)
</script>

<style lang="scss" scoped>
@include dialog-title;

.logs {
  .log-item {
    line-height: 1.4em;

    .tag {
      font-family: monospace;
    }
  }
}
</style>
