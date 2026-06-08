import { createPinia, setActivePinia } from 'pinia';
import { useConfigStore } from '@/store/config';

let store: ReturnType<typeof useConfigStore>;

beforeEach(() => {
  setActivePinia(createPinia());
  store = useConfigStore();
  // Reset userConfig after store creation
  store.$patch({ userConfig: {} });
});

test('load config', () => {
  const spyGet = vi.spyOn(Object.getPrototypeOf(localStorage), 'getItem');
  spyGet.mockReturnValue('{"foo": "bar"}');

  // Re-create store to trigger loadConfig from localStorage
  setActivePinia(createPinia());
  const newStore = useConfigStore();

  expect(newStore.config).toMatchObject({
    foo: 'bar',
  });

  spyGet.mockRestore();
});

test('config getter', () => {
  expect(store.config).not.toEqual({});
});

describe('update config', () => {
  const spySet = vi.spyOn(Object.getPrototypeOf(localStorage), 'setItem');

  beforeEach(() => {
    spySet.mockClear();
  });
  afterAll(() => {
    spySet.mockRestore();
  });

  test('update object', () => {
    const value1 = {
      foo1: 'bar1',
    };

    store.updateConfig({
      key: 'obj',
      value: value1,
    });

    expect(store.userConfig).toEqual({
      obj: value1,
    });

    const value2 = {
      foo2: 'bar2',
    };
    store.updateConfig({
      key: 'obj',
      value: value2,
    });

    expect(store.userConfig).toEqual({
      obj: Object.assign({}, value1, value2),
    });
  });

  test('update plain type', () => {
    store.updateConfig({
      key: 'foo',
      value: 'bar',
    });

    expect(store.config).toMatchObject({
      foo: 'bar',
    });
    expect(spySet).toBeCalled();
  });
});
