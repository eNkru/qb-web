<template>
  <v-menu
    v-model="show"
    :position-x="x"
    :position-y="y"
    absolute
    offset-y
    transition="slide-y-transition"
  >
    <v-list density="compact">
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
  emits: ['update:modelValue', 'close'],
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

  get show() {
    return this.value;
  }

  set show(val: boolean) {
    this.$emit('update:modelValue', val);
    if (!val) {
      this.$emit('close');
    }
  }

  async copySavePath() {
    if (this.savePath) {
      await navigator.clipboard.writeText(this.savePath);
    }
  }
}
</script>
