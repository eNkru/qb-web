<template>
  <fieldset
    class="panel"
    v-if="!single"
  >
    <legend>{{ title }}</legend>
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
  margin: 16px 16px 0;

  .inner {
    overflow-y: auto;
  }
}

fieldset {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  padding: 0;

  .v-theme--dark & {
    border-color: rgba(255, 255, 255, 0.08);
  }

  legend {
    margin-left: 12px;
    padding: 0 8px;
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: rgba(var(--v-theme-on-surface), 0.5);
  }

  .inner {
    padding: 12px;
  }
}
</style>
