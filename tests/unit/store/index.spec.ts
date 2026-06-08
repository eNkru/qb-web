import { createPinia, setActivePinia } from 'pinia';
import { useMainStore } from '@/store/index';
import { RootState } from '@/store/types';
import { mock, mockBaseTorrent } from '../utils';


const emtpyState: RootState = {
  rid: 0,
  mainData: undefined,
  preferences: null,
  pasteUrl: null,
  needAuth: false,
  query: null,
};

const mockState = mock(emtpyState);

beforeAll(() => {
  setActivePinia(createPinia());
});

let mainStore: ReturnType<typeof useMainStore>;

beforeEach(() => {
  mainStore = useMainStore();
  mainStore.$patch(emtpyState);
});

test('update preferences', () => {
  const obj = {
    url: 'something',
  };
  mainStore.updatePreferences(obj);

  expect(mainStore.preferences).toEqual(obj);
});

test('set paste url', () => {
  mainStore.setPasteUrl('something');

  expect(mainStore.pasteUrl).toEqual('something');
});

describe('all torrents getter', () => {
  test('empty', () => {
    expect(mainStore.allTorrents).toEqual([]);
  });

  test('with data', () => {
    mainStore.$patch(mockState({
      mainData: {
        categories: {},
        tags: [""],
         
        server_state: undefined as any,
        torrents: {
          a: mockBaseTorrent({}),
          b: mockBaseTorrent({}),
        },
      },
    }));

    expect(mainStore.allTorrents).toMatchObject([
      { hash: 'a' }, { hash: 'b' },
    ]);
  });
});
