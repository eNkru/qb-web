<template>
  <v-list
    density="compact"
    expand
    class="drawer"
    style="background-color: transparent !important;"
  >
    <template v-for="item in items">
      <v-list-group
        v-if="item.children"
        :key="item.title"
        v-model="item.model"
        append-icon=""
      >
        <template #activator="{ props }">
          <v-list-item v-bind="props">
            <template #prepend>
              <v-icon>{{ item.model ? item.icon : item['icon-alt'] }}</v-icon>
            </template>
            <v-list-item-title>
              {{ item.title }}
            </v-list-item-title>
          </v-list-item>
        </template>
        <v-list-item
          v-for="(child, i) in item.children"
          :key="i"
          @click="item.click ? item.click(child.value) : null"
        >
          <template #prepend>
            <v-icon>{{ child.icon }}</v-icon>
          </template>
          <v-list-item-title>
            {{ child.title }}
          </v-list-item-title>
        </v-list-item>
      </v-list-group>
      <template v-else-if="item.filterGroups">
        <filter-group
          v-for="(child, i) in item.filterGroups"
          :key="i"
          :group="child"
        />
      </template>
      <v-list-item
        v-else
        :key="item.title"
        @click="item.click ? item.click() : null"
      >
        <template #prepend>
          <v-icon>{{ item.icon }}</v-icon>
        </template>
        <v-list-item-title>
          {{ item.title }}
        </v-list-item-title>
      </v-list-item>
    </template>
  </v-list>
</template>

<script lang="ts">
import { sortBy, sumBy, isUndefined } from 'lodash-es';
import { Vue, Component, Prop, Emit, toNative } from 'vue-facing-decorator';
import { useDisplay } from 'vuetify';

import { tr } from '@/locale';
import { Torrent, Category, Tag } from '@/types';
import FilterGroup from './drawer/FilterGroup.vue';
import api from '../Api';
import { formatSize } from '@/filters';
import { StateType } from '@/consts';
import { getSiteByHostname } from '@/sites'
import { getSiteAbbreviation } from '@/utils/siteMap'
import { useMainStore } from '@/store/index';

const stateList = [
  {
    title: tr('category_state.downloading'),
    state: StateType.Downloading,
    icon: 'download',
  },
  {
    title: tr('category_state.seeding'),
    state: StateType.Seeding,
    icon: 'upload',
  },
  {
    title: tr('category_state.completed'),
    state: StateType.Completed,
    icon: 'check',
  },
  {
    title: tr('category_state.resumed'),
    state: StateType.Resumed,
    icon: 'play',
  },
  {
    title: tr('category_state.paused'),
    state: StateType.Paused,
    icon: 'pause',
  },
  {
    title: tr('category_state.active'),
    state: StateType.Active,
    icon: 'filter',
  },
  {
    title: tr('category_state.inactive'),
    state: StateType.Inactive,
    icon: 'filter-outline',
  },
  {
    title: tr('category_state.errored'),
    state: StateType.Errored,
    icon: 'alert',
  },
];

interface MenuItem {
  icon: string;
  'icon-alt'?: string;
  title: string;
  model?: boolean | null;
  select?: string;
  click?: (value?: string) => void;
  children?: MenuChildrenItem[];
  filterGroups?: any[];
}

interface MenuChildrenItem extends MenuItem {
  key: string | null;
  value?: string;
  append?: string;
}

@Component({
  components: {
    FilterGroup,
  },
})
class Drawer extends Vue {
  display = useDisplay() as any;
  mainStore = useMainStore()

  @Prop()
  readonly modelValue: any

  endItems: MenuItem[] = [
    { icon: 'mdi-delta', title: tr('logs'), click: () => this.updateOptions('showLogs', true) },
    { icon: 'mdi-card-search-outline', title: tr('search'), click: () => this.updateOptions('showSearch', true) },
    { icon: 'mdi-rss-box', title: 'RSS', click: () => this.updateOptions('showRss', true) },
  ]

  pcItems: MenuItem[] = [
    { icon: 'mdi-cog-box', title: tr('settings'), click: () => this.updateOptions('showSettings', true) },
  ]

  get isDataReady(): boolean {
    return this.mainStore.isDataReady;
  }
  get allTorrents(): Torrent[] {
    return this.mainStore.allTorrents;
  }
  get allCategories(): Category[] {
    return this.mainStore.allCategories;
  }
  get allTags(): Tag[] {
    return this.mainStore.allTags;
  }
  get torrentGroupByCategory(): {[category: string]: Torrent[]} {
    return this.mainStore.torrentGroupByCategory;
  }
  get torrentGroupByTag(): {[tag: string]: Torrent[]} {
    return this.mainStore.torrentGroupByTag;
  }
  get torrentGroupBySite(): {[site: string]: Torrent[]} {
    return this.mainStore.torrentGroupBySite;
  }
  get torrentGroupByState(): {[state: string]: Torrent[]} {
    return this.mainStore.torrentGroupByState;
  }

  created() {
   if (this.phoneLayout) {
      return;
    }

    this.endItems = this.endItems.concat(this.pcItems)
  }

  get phoneLayout() {
    return this.display.smAndDown;
  }

  buildStateGroup(): MenuChildrenItem[] {
    return stateList.map((item) => {
      let value = this.torrentGroupByState[item.state];
      if (isUndefined(value)) {
        value = [];
      }
      const size = formatSize(sumBy(value, 'size'));
      const title = `${item.title} (${value.length})`;
      const append = `[${size}]`;
      return {
        icon: `mdi-${item.icon}`, title, key: item.state, append,
      };
    })
  }

  buildCategoryGroup(): MenuChildrenItem[] {
    return [{
      key: '',
      name: tr('uncategorized'),
    }].concat(this.allCategories).map((category) => {
      let value = this.torrentGroupByCategory[category.key];
      if (isUndefined(value)) {
        value = [];
      }
      const size = formatSize(sumBy(value, 'size'));
      const title = `${category.name} (${value.length})`;
      const append = `[${size}]`;
      return {
        icon: 'mdi-folder', title, key: category.key, append,
      };
    });
  }

  buildTagGroup(): MenuChildrenItem[] {
    return [{
      key: '',
      name: tr('untagged'),
    }].concat(this.allTags).map((tag) => {
      let value = this.torrentGroupByTag[tag.key];
      if (isUndefined(value)) {
        value = [];
      }
      const size = formatSize(sumBy(value, 'size'));
      const title = `${tag.name} (${value.length})`;
      const append = `[${size}]`;
      return {
        icon: 'mdi-folder', title, key: tag.key, append,
      };
    });
  }

  buildSiteGroup(): MenuChildrenItem[] {
    return sortBy(Object.entries(this.torrentGroupBySite).map(([key, value]) => {
      const size = formatSize(sumBy(value, 'size'));
      const site = getSiteByHostname(key);
      const siteName = key ? getSiteAbbreviation(key) : tr('others');
      const title = `${siteName} (${value.length})`;
      const icon = site?.icon ?? 'mdi-server';
      const append = `[${size}]`;
      return {
        icon, title, key, append,
      };
    }), 'title');
  }

  get items() {
    if (!this.isDataReady) {
      return this.endItems
    }

    const filterGroups: MenuItem[] = [];
    const totalSize = formatSize(sumBy(this.allTorrents, 'size'));

    filterGroups.push({
      icon: 'mdi-menu-up',
      'icon-alt': 'mdi-menu-down',
      title: tr('category_state._'),
      model: null,
      select: 'state',
      children: [
        {
          icon: 'mdi-filter-remove', title: `${tr('all')} (${this.allTorrents.length})`, key: null, append: `[${totalSize}]`,
        },
        ...this.buildStateGroup(),
      ],
    });

    filterGroups.push({
      icon: 'mdi-menu-up',
      'icon-alt': 'mdi-menu-down',
      title: tr('category', 0),
      model: null,
      select: 'category',
      children: [
        {
          icon: 'mdi-folder', title: `${tr('all')} (${this.allTorrents.length})`, key: null, append: `[${totalSize}]`,
        },
        ...this.buildCategoryGroup(),
      ],
    });

    filterGroups.push({
      icon: 'mdi-menu-up',
      'icon-alt': 'mdi-menu-down',
      title: tr('tag', 0),
      model: null,
      select: 'tag',
      children: [
        {
          icon: 'mdi-folder', title: `${tr('all')} (${this.allTorrents.length})`, key: null, append: `[${totalSize}]`,
        },
        ...this.buildTagGroup(),
      ],
    });

    filterGroups.push({
      icon: 'mdi-menu-up',
      'icon-alt': 'mdi-menu-down',
      title: tr('sites'),
      model: null,
      select: 'site',
      children: [
        {
          icon: 'mdi-server', title: `${tr('all')} (${this.allTorrents.length})`, key: null, append: `[${totalSize}]`,
        },
        ...this.buildSiteGroup(),
      ],
    });

    return ([] as MenuItem[]).concat([{filterGroups}] as any, this.endItems);
  }

  async switchUi() {
    await api.switchToOldUi();

    window.location.reload();
  }

  @Emit('update:modelValue')
  updateOptions(key: string, value: any) {
    return Object.assign({}, this.modelValue, { [key]: value })
  }
}

export default toNative(Drawer)
</script>

<style lang="scss" scoped>
.drawer {
  :deep(.v-list-item) {
    border-radius: 8px;
    margin: 1px 4px;
    transition: background-color 0.15s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .v-theme--dark &:hover {
      background-color: rgba(255, 255, 255, 0.06);
    }

    &.v-list-item--active {
      background-color: rgba(25, 118, 210, 0.08);
    }
  }

  :deep(.v-list-item__prepend) {
    margin-left: 4px;

    .v-icon {
      opacity: 0.7;
      transition: opacity 0.15s ease;
    }
  }

  :deep(.v-list-item:hover .v-list-item__prepend .v-icon) {
    opacity: 1;
  }

  :deep(.v-list-group__items .v-list-item) {
    padding-left: 12px;
  }
}
</style>
