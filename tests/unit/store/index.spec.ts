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

describe('torrentGroupBySite getter', () => {
  test('groups malformed tracker urls under empty key', () => {
    mainStore.$patch(mockState({
      mainData: {
        categories: {},
        tags: [""],
        server_state: undefined as any,
        torrents: {
          a: mockBaseTorrent({ tracker: 'not a url' }),
          b: mockBaseTorrent({ tracker: 'https://example.com/announce' }),
        },
      },
    }));

    expect(mainStore.torrentGroupBySite['']).toMatchObject([
      { hash: 'a' },
    ]);
    expect(mainStore.torrentGroupBySite['example.com']).toMatchObject([
      { hash: 'b' },
    ]);
  });
});

describe('update main data', () => {
  test('removes torrents, categories, and tags from incremental updates', () => {
    mainStore.$patch(mockState({
      mainData: {
        categories: {
          movies: { key: 'movies', name: 'Movies' },
          music: { key: 'music', name: 'Music' },
        },
        tags: ['hd', 'audio', 'keep'],
        server_state: undefined as any,
        torrents: {
          a: mockBaseTorrent({ name: 'removed' }),
          b: mockBaseTorrent({ name: 'kept' }),
        },
      },
    }));

    const payload = {
      rid: 2,
      torrents_removed: ['a'],
      categories_removed: ['movies'],
      tags_removed: ['audio'],
    };

    mainStore.updateMainData(payload);

    expect(mainStore.rid).toBe(2);
    expect(mainStore.mainData?.torrents).not.toHaveProperty('a');
    expect(mainStore.mainData?.torrents).toHaveProperty('b');
    expect(mainStore.mainData?.categories).not.toHaveProperty('movies');
    expect(mainStore.mainData?.categories).toHaveProperty('music');
    expect(mainStore.mainData?.tags).toEqual(['hd', 'keep']);
    expect(payload).toEqual({
      rid: 2,
      torrents_removed: ['a'],
      categories_removed: ['movies'],
      tags_removed: ['audio'],
    });
  });

  test('merges partial incremental updates into existing main data', () => {
    mainStore.$patch(mockState({
      mainData: {
        categories: {},
        tags: [],
        server_state: {
          dl_info_speed: 10,
          up_info_speed: 20,
        } as any,
        torrents: {
          a: mockBaseTorrent({ dlspeed: 1, name: 'kept' }),
        },
      },
    }));

    mainStore.updateMainData({
      rid: 3,
      server_state: {
        up_info_speed: 30,
      },
      torrents: {
        a: {
          dlspeed: 2,
        },
      },
    });

    expect(mainStore.rid).toBe(3);
    expect(mainStore.mainData?.server_state.dl_info_speed).toBe(10);
    expect(mainStore.mainData?.server_state.up_info_speed).toBe(30);
    expect(mainStore.mainData?.torrents.a.name).toBe('kept');
    expect(mainStore.mainData?.torrents.a.dlspeed).toBe(2);
  });

  test('ignores incremental updates before initial main data', () => {
    expect(() => mainStore.updateMainData({
      rid: 4,
      server_state: {
        up_info_speed: 30,
      },
    })).not.toThrow();

    expect(mainStore.rid).toBe(4);
    expect(mainStore.mainData).toBeUndefined();
  });
});
