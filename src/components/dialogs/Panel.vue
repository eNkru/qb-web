<template>
  <fieldset
    class="panel"
    v-if="!single"
  >
    <legend v-text="title" />
    <div class="inner">
      <slot />
    </div>
  </fieldset>
  <div
    v-else
    class="inner"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, toNative } from 'vue-facing-decorator';

@Component
class Panel extends Vue {
  @Prop({ type: Boolean })
  readonly single!: boolean

  @Prop({ type: String, required: true })
  readonly title!: string
}

export default toNative(Panel);
</script>

<style lang="scss" scoped>
.panel {
  margin-top: 1em;

  .inner {
    max-height: 500px;
    overflow-y: auto;
  }
}

fieldset {
  border-width: 1px;

  legend {
    margin-left: 1em;
  }
}
</style>
