<template>
  <v-app-bar
    app
    elevation="0"
    class="app-bar pl-2"
    :class="{'phone-layout': phoneLayout}"
  >
    <v-app-bar-nav-icon @click="toggle" />
    <v-toolbar-title
      class="bar-title"
      v-show="!searchBarExpanded"
    >
      <img
        class="icon"
        src="/img/icons/favicon-192x192.png"
      >
      <span class="title hidden-sm-and-down ml-3 mr-5">
        qBittorrent Web UI
      </span>
    </v-toolbar-title>
    <v-spacer v-if="!phoneLayout" />
    <v-text-field
      class="search-bar"
      :flat="!focusedSearch"
      :variant="focusedSearch ? 'solo' : 'solo-inverted'"
      hide-details
      :clearable="!phoneLayout || searchBarExpanded"
      prepend-inner-icon="mdi-magnify"
      :label="$t('search')"
      @focus="focusedSearch = true"
      @blur="focusedSearch = false"
      v-model="searchInput"
    />
    <v-spacer v-if="!phoneLayout" />
  </v-app-bar>
</template>

<script lang="ts">
import { throttle } from 'lodash';
import { Vue, Component, Prop, Emit, Watch, toNative } from 'vue-facing-decorator';
import { useDisplay } from 'vuetify';

@Component
class MainToolbar extends Vue {
  display = useDisplay() as any;

  @Prop({ type: Boolean })
  readonly modelValue!: boolean

  focusedSearch = false
  searchInput = ''

  setQuery(value: string | null) {
    this.$store.commit('setQuery', value);
  }

  get searchQuery() {
    return this.$store.state.query;
  }

  get phoneLayout() {
    return this.display.smAndDown;
  }

  get searchBarExpanded() {
    return this.phoneLayout && (this.focusedSearch || !!this.searchQuery);
  }

  @Emit('update:modelValue')
  toggle() {
    return !this.modelValue;
  }

  mounted() {
    this.searchInput = this.searchQuery || '';
  }

  @Watch('searchInput')
  onSearchInputChanged(v: string) {
    this.onSearch(v);
  }

  @Watch('searchQuery')
  onSearchQueryChanged(v: string | null) {
    if (v !== this.searchInput) {
      this.searchInput = v || '';
    }
  }

  onSearch = throttle((v: string) => {
    this.setQuery(v || null);
  }, 400)
}

export default toNative(MainToolbar)
</script>

<style lang="scss" scoped>
.app-bar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(8px);

  .v-theme--dark & {
    border-bottom-color: rgba(255, 255, 255, 0.08);

    .v-app-bar-nav-icon:hover {
      background-color: rgba(255, 255, 255, 0.08);
    }
  }

  .v-app-bar-nav-icon {
    transition: background-color 0.2s ease;
    border-radius: 8px;

    &:hover {
      background-color: rgba(0, 0, 0, 0.06);
    }
  }

  .bar-title {
    display: flex;
    align-items: center;
    gap: 10px;

    :deep(.v-toolbar-title__placeholder) {
      display: flex;
      align-items: center;
    }

    .icon {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.1);
      }
    }

    .title {
      font-weight: 600;
      letter-spacing: 0.01em;
      opacity: 0.85;
    }
  }

  .search-bar {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    max-width: 420px;

    :deep(.v-field) {
      border-radius: 24px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    :deep(.v-field--variant-solo) {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

      &:hover {
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
      }
    }

    :deep(.v-field--variant-solo-inverted) {
      box-shadow: none;

      &:hover {
        background-color: rgba(255, 255, 255, 0.12);
      }
    }

    :deep(.v-field--focused) {
      box-shadow: 0 2px 12px rgba(25, 118, 210, 0.18);
    }

    :deep(.v-field__prepend-inner) {
      opacity: 0.6;
      transition: opacity 0.2s ease;
    }

    :deep(.v-field--focused .v-field__prepend-inner) {
      opacity: 1;
    }

    :deep(.v-field__clearable) {
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    &:hover :deep(.v-field__clearable),
    &:focus-within :deep(.v-field__clearable) {
      opacity: 1;
    }
  }

  &.phone-layout {
    .search-bar {
      flex: 1;
      margin: 0 0.5em 0 1em;
    }
  }
}
</style>
