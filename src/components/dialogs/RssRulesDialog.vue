<template>
  <v-dialog
    v-model="showDialog"
    persistent
    width="50%"
  >
    <v-card>
      <v-card-title class="headline">
        <v-icon class="mr-2">mdi-filter</v-icon>
        <span>{{ $t('dialog.rss_rule.title') }}</span>
        <v-spacer />
        <v-btn
          icon
          @click="closeDialog"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <div class="toolbar">
          <v-btn
            icon
            @click="addRssRule"
            :title="$t('dialog.rss_rule.add_rule')"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <v-btn
            icon
            :disabled="!selectedRuleName"
            @click="deleteRssRule"
            :title="$t('delete')"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>
        <v-divider />
        <div class="content">
          <div
            v-if="!rssRules"
            class="loading"
          >
            <v-progress-circular indeterminate />
          </div>
          <template v-else>
            <div class="rss-rules">
              <v-list
                density="compact"
              >
                <v-list-item
                  v-for="(value, ruleKey) in rssRules"
                  :key="ruleKey"
                  :active="selectedRuleName === (ruleKey as string)"
                  @click="selectedRuleName = String(ruleKey)"
                >
                  <template #prepend>
                    <v-checkbox
                      density="compact"
                      v-model="value.enabled"
                    />
                  </template>
                  <v-list-item-title>{{ ruleKey }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </div>
            <v-divider vertical />
            <div class="rule-details">
              <v-form class="rule-form">
                <p
                  class="form-title"
                >{{ $t('dialog.rss_rule.rule_settings') }}</p>

                <v-checkbox
                  density="compact"
                  :label="$t('dialog.rss_rule.use_regex')"
                  :disabled="!selectedRule.enabled"
                  :model-value="selectedRule.useRegex"
                  @change="editRule('useRegex', $event)"
                />
                <v-text-field
                  density="compact"
                  :label="$t('dialog.rss_rule.must_contain')"
                  :disabled="!selectedRule.enabled"
                  :model-value="selectedRule.mustContain"
                  @change="editRule('mustContain', $event)"
                />
                <v-text-field
                  density="compact"
                  :label="$t('dialog.rss_rule.must_not_contain')"
                  :disabled="!selectedRule.enabled"
                  :model-value="selectedRule.mustNotContain"
                  @change="editRule('mustNotContain', $event)"
                />
                <v-text-field
                  density="compact"
                  :label="$t('dialog.rss_rule.episode_filter')"
                  :disabled="!selectedRule.enabled"
                  :model-value="selectedRule.episodeFilter"
                  @change="editRule('episodeFilter', $event)"
                />
                <v-checkbox
                  density="compact"
                  :label="$t('dialog.rss_rule.smart_episode')"
                  :disabled="!selectedRule.enabled"
                  :model-value="selectedRule.smartFilter"
                  @change="editRule('smartFilter', $event)"
                />

                <v-select
                  density="compact"
                  :label="$t('dialog.rss_rule.assign_category')"
                  :items="categoryItems"
                  :disabled="!selectedRule.enabled"
                  :model-value="selectedRule.assignedCategory"
                  @change="editRule('assignedCategory', $event)"
                />
                <v-text-field
                  density="compact"
                  :label="$t('location')"
                  :disabled="!selectedRule.enabled"
                  :model-value="selectedRule.savepath"
                  @change="editRule('savepath', $event)"
                />
              </v-form>

              <v-divider />

              <p
                class="feeds-title"
              >{{ $t('dialog.rss_rule.apply_to_feeds') }}</p>
              <v-list
                density="compact"
                v-if="selectedRule.enabled"
              >
                <v-list-item
                  v-for="item in rssItems"
                  :key="item.value"
                >
                  <template #prepend>
                    <v-checkbox
                      density="compact"
                      :model-value="hasSelectSite(item.value)"
                      @change="selectSite(item.value, $event)"
                    />
                  </template>
                  <v-list-item-title>{{ item.text }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </div>
          </template>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { isEmpty, isEqual, pull, cloneDeep } from 'lodash'
import { Vue, Component } from 'vue-facing-decorator';

import { tr } from '@/locale'
import { Prop, Emit, Watch } from 'vue-facing-decorator';
import { RssRule, Category, RssNode } from '../../types';
import api from '../../Api';
import { DialogConfig, DialogType, SnackBarConfig } from '../../store/types';

@Component
export default class RssRulesDialog extends Vue {
  @Prop({ type: Boolean })
  readonly modelValue!: boolean

  get showDialog() {
    return this.modelValue;
  }
  set showDialog(val: boolean) {
    this.$emit('update:modelValue', val);
  }

  @Prop()
  readonly rssNode!: RssNode

  rssRules: {[key: string]: RssRule} | null = null
  selectedRuleName: string | null = null

  get allCategories(): Category[] {
    return this.$store.getters.allCategories;
  }

  asyncShowDialog(config: DialogConfig): Promise<string | undefined> {
    return this.$store.dispatch('asyncShowDialog', config);
  }
  showSnackBar(config: SnackBarConfig) {
    this.$store.commit('showSnackBar', config);
  }
  closeSnackBar() {
    this.$store.commit('closeSnackBar');
  }

  get selectedRule(): RssRule {
    if (!this.selectedRuleName || !(this.selectedRuleName in this.rssRules!)) {
      return {} as RssRule
    }

    return this.rssRules![this.selectedRuleName]
  }
  set selectedRule(v: RssRule) {
    this.rssRules![this.selectedRuleName!] = v
  }

  get categoryItems() {
    const uncategory: Category = {
      key: '',
      name: tr('uncategorized'),
    }

    return [uncategory, ...this.allCategories].map(c => {
      return {
        text: c.name,
        value: c.key,
      }
    })
  }
  get rssItems() {
    return this.buildRssItems(this.rssNode)
  }

  hasSelectSite(url: string) {
    return this.selectedRule.affectedFeeds.includes(url)
  }

  selectSite(url: string, enabled: boolean) {
    const rule = cloneDeep(this.selectedRule)
    const feeds = rule.affectedFeeds

    if (enabled) {
      feeds.push(url)
    } else {
      pull(feeds, url)
    }

    this.selectedRule = rule
  }

  editRule(key: keyof RssRule, value: any) {
    const rule: any = cloneDeep(this.selectedRule)
    rule[key] = value

    this.selectedRule = rule
  }

  buildRssItems(node: RssNode) {
    let result: any[] = []

    for (const [key, value] of Object.entries(node)) {
      if ('uid' in value) {
        result.push({
          text: key,
          value: value.url,
        })
      } else {
        result = result.concat(this.buildRssItems(value))
      }
    }

    return result
  }

  async fetchRssRules() {
    this.rssRules = await api.getRssRules()
  }

  async addRssRule() {
    const name = await this.asyncShowDialog({
      text: tr('dialog.rss_rule.new_rule_name'),
      type: DialogType.Input,
    })

    if (!name) {
      return
    }

    this.showSnackBar({
      text: tr('label.adding'),
    })

    await api.setRssRule(name);
    this.fetchRssRules()

    this.closeSnackBar();
  }

  async deleteRssRule() {
    const input = await this.asyncShowDialog({
      text: tr('dialog.rss_rule.delete_rule'),
      type: DialogType.OkCancel,
    })

    if (!input) {
      return
    }

    this.showSnackBar({
      text: tr('label.deleting'),
    })

    await api.removeRssRule(this.selectedRuleName!);
    this.fetchRssRules()

    this.closeSnackBar();
  }

  @Emit('update:modelValue')
  closeDialog() {
    return false
  }

  created() {
    this.fetchRssRules()
  }

  @Watch('selectedRule', {deep: true})
  async onSelectedRuleChanged(v: RssRule, old: RssRule) {
    if (isEmpty(old) || isEmpty(v)) {
      // just select rule
      return
    }

    if (isEqual(v, old)) {
      return
    }

    await api.setRssRule(this.selectedRuleName!, v)
    await this.fetchRssRules()
  }
}
</script>

<style lang="scss" scoped>
@include dialog-title;

.v-card {
  display: flex;
  flex-direction: column;

  .v-card__text {
    flex: 1;
    display: flex;
    flex-direction: column;

    padding: 0;
  }
}

.loading {
  width: 100%;
  text-align: center;
  margin: 1em 0;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  padding: 0 18px;
  align-items: center;
}

.content {
  height: 75vh;
  display: flex;
}

.rss-rules {
  flex: 30%;
  
  :deep(.v-list-item__append) {
    margin: 0;
  }
}

.rule-details {
  flex: 70%;

  overflow-y: auto;

  .rule-form {
    margin: 0.5em;

    .v-divider {
      margin-bottom: 1em;
    }

    :deep(.v-selection-control) {
      margin-top: 4px;
    }
  }

  .form-title {
    margin-bottom: 0.5em;
  }

  .feeds-title {
    margin: 0.5em;
  }

  .v-list-item {
    padding: 0 0.5em;
  }

  :deep(.v-list-item__append) {
    margin: 0;
  }
}
</style>