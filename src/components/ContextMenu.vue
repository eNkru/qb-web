<template>
  <v-menu
    v-model="show"
    :target="[x, y]"
    location="top start"
    origin="top start"
    transition="scale-transition"
  >
    <v-list density="compact">
      <v-list-item @click="showDetails">
        <template #prepend>
          <v-icon>mdi-information-outline</v-icon>
        </template>
        <v-list-item-title>{{ $t('show_details') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="copySavePath">
        <template #prepend>
          <v-icon>mdi-content-copy</v-icon>
        </template>
        <v-list-item-title>{{ $t('copy_save_path') }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-facing-decorator';

@Component({
  emits: ['update:modelValue', 'close', 'show-details'],
})
export default class ContextMenu extends Vue {
  @Prop({ type: Boolean, default: false })
  readonly value!: boolean

  @Prop({ type: Number, default: 0 })
  readonly x!: number

  @Prop({ type: Number, default: 0 })
  readonly y!: number

  @Prop({ type: String, default: '' })
  readonly savePath!: string

  @Prop({ type: String, default: '' })
  readonly hash!: string

  get show() {
    return this.value;
  }

  set show(val: boolean) {
    this.$emit('update:modelValue', val);
    if (!val) {
      this.$emit('close');
    }
  }

  showDetails() {
    this.$emit('show-details', this.hash);
    this.show = false;
  }

  async copySavePath() {
    if (this.savePath) {
      try {
        await navigator.clipboard.writeText(this.savePath);
      } catch {
        const textarea = document.createElement('textarea');
        textarea.value = this.savePath;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      this.show = false;
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.v-menu__content) {
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
</style>
