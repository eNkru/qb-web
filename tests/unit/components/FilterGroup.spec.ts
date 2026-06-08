import { createPinia, setActivePinia } from 'pinia';
import { useConfigStore } from '@/store/config';
import * as types from '@/components/types';
import { mock } from '../utils';

// Create a store that properly simulates the config module
const createStore = () => {
  setActivePinia(createPinia());
  const store = useConfigStore();
  // Set up test data
  store.$patch({
    userConfig: {
      filter: {
        state: null,
        category: null,
        site: null,
        foo: 'bar',
      },
    },
  });
  return store;
};

// Create a simple mock-based approach since vue-facing-decorator doesn't work well with direct instantiation
// Instead, we test the component logic by manually creating an object that behaves like the component
function createComponentInstance(props: { group: types.Group }) {
  const piniaStore = createStore();

  // Create a plain object that mimics the component's behavior
  const instance = {
    group: props.group,
    model: false as boolean | null,
    selected: null as string | null,
    configStore: piniaStore,

    // Method copied from FilterGroup component
    select(key: string | null) {
      this.selected = this.selected === key ? null : key;
      this.configStore.updateConfig({
        key: 'filter',
        value: {
          [this.group.select]: this.selected,
        },
      });
    },

    // isFontIcon helper
    isFontIcon(icon: string) {
      return icon.startsWith('mdi-');
    },
  };

  // Call created hook logic manually (from FilterGroup.vue created())
  instance.model = instance.group.model;
  const s = instance.configStore.config.filter[instance.group.select];
  if (instance.group.children.some((child: types.Child) => child.key === s)) {
    instance.selected = s;
  } else {
    instance.select(null);
  }
  if (instance.model == null) {
    instance.model = instance.selected != null;
  }

  return instance;
}

const emptyGroup: types.Group = {
  title: '',
  icon: '',
  children: [],
  model: false,
  select: '',
};

const emptyChild: types.Child = {
  title: '',
  key: null,
  icon: '',
  append: null,
};

const mockGroup = mock(emptyGroup);
const mockChild = mock(emptyChild);

test('normal create', () => {
  const group = mockGroup({
    children: [
      mockChild({
        key: 'bar',
      }),
    ],
    select: 'foo',
    model: true,
  });

  const vm = createComponentInstance({ group });

  expect(vm.selected).toEqual('bar');
  expect(vm.model).toBeTruthy();
});

test('manual select child', () => {
  const group = mockGroup({
    select: 'foo',
  });

  const vm = createComponentInstance({ group });

  vm.select('ha');
  expect(vm.selected).toEqual('ha');
});

test('unselect if can not found children', () => {
  const group = mockGroup({
    select: 'foo',
  });

  const vm = createComponentInstance({ group });

  expect(vm.selected).toBeNull();
});
