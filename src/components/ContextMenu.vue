<template>
  <v-menu
    v-model="show"
    :position-x="x"
    :position-y="y"
    absolute
    offset-y
    transition="slide-y-transition"
    @input="$emit('close')"
  >
    <v-list dense>
      <v-list-item @click="copySavePath">
        <v-list-item-icon>
          <v-icon>mdi-content-copy</v-icon>
        </v-list-item-icon>
        <v-list-item-title>{{ $t('copy_save_path') }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';

@Component
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
    this.$emit('input', val);
  }

  async copySavePath() {
    if (this.savePath) {
      await navigator.clipboard.writeText(this.savePath);
    }
  }
}
</script>
