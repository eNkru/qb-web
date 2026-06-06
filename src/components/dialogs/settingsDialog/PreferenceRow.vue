<template>
  <v-row
    align="center"
    dense
  >
    <v-col
      cols="auto"
      v-if="$slots.header"
      class="header"
    >
      <slot name="header" />
    </v-col>
    <v-col>
      <span v-text="$t('preferences.' + this.$props.i18nKey)" />
    </v-col>
    <v-col>
      <slot />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Vue, Component, Prop, toNative } from 'vue-facing-decorator'

@Component
class PreferenceRow extends Vue {
  @Prop({ type: String })
  readonly i18nKey?: string
}

export default toNative(PreferenceRow)
</script>

<style lang="scss" scoped>
.header {
  height: 48px;
}
</style>