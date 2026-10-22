const { instance } = vi.hoisted(() => {
  const instance = {
    defaults: {
      headers: { post: {} as Record<string, string> },
      baseURL: 'api/v2',
    },
    get: vi.fn(),
    post: vi.fn(),
  };

  return { instance };
});

vi.mock('axios', () => ({
  default: {
    create: () => instance,
  },
}));

import api from '@/Api';

const response = (data: any, status = 200) => ({ data, status });

beforeEach(() => {
  instance.get.mockReset();
  instance.post.mockReset();
});

describe('login', () => {
  test('accepts 204 No Content (qBittorrent >= 5.2)', async () => {
    instance.post.mockResolvedValue(response('', 204));

    await expect(api.login({ username: 'a', password: 'b' })).resolves.toBe('Ok.');
  });

  test('accepts 200 with "Ok." body (older qBittorrent)', async () => {
    instance.post.mockResolvedValue(response('Ok.', 200));

    await expect(api.login({ username: 'a', password: 'b' })).resolves.toBe('Ok.');
  });

  test('passes the 403 body through', async () => {
    instance.post.mockResolvedValue(response('Fails.', 403));

    await expect(api.login({ username: 'a', password: 'b' })).resolves.toBe('Fails.');
  });

  test('maps 401 Unauthorized to "Fails." (qBittorrent >= 5.2)', async () => {
    instance.post.mockResolvedValue(response('Unauthorized', 401));

    await expect(api.login({ username: 'a', password: 'b' })).resolves.toBe('Fails.');
  });
});

describe('addTorrents', () => {
  test('accepts 200 with "Ok." body (older qBittorrent)', async () => {
    instance.post.mockResolvedValue(response('Ok.', 200));

    await expect(api.addTorrents({ urls: 'magnet:?xt=urn:btih:abc' })).resolves.toBe('Ok.');
  });

  test('accepts 200 with "Fails." body (older qBittorrent)', async () => {
    instance.post.mockResolvedValue(response('Fails.', 200));

    await expect(api.addTorrents({ urls: 'magnet:?xt=urn:btih:abc' })).resolves.toBe('Fails.');
  });

  test('accepts the JSON summary (qBittorrent >= 5.2)', async () => {
    instance.post.mockResolvedValue(response({
      success_count: 1,
      failure_count: 0,
      pending_count: 0,
      added_torrent_ids: ['abc'],
    }));

    await expect(api.addTorrents({ urls: 'magnet:?xt=urn:btih:abc' })).resolves.toBe('Ok.');
  });

  test('treats still-pending torrents as success (202)', async () => {
    instance.post.mockResolvedValue(response({
      success_count: 0,
      failure_count: 0,
      pending_count: 1,
      added_torrent_ids: [],
    }, 202));

    await expect(api.addTorrents({ urls: 'magnet:?xt=urn:btih:abc' })).resolves.toBe('Ok.');
  });

  test('reports a JSON summary without added torrents as failure', async () => {
    instance.post.mockResolvedValue(response({
      success_count: 0,
      failure_count: 1,
      pending_count: 0,
      added_torrent_ids: [],
    }));

    await expect(api.addTorrents({ urls: 'magnet:?xt=urn:btih:abc' })).resolves.toBe('Fails.');
  });

  test('treats 409 Conflict (nothing added) as failure', async () => {
    instance.post.mockResolvedValue(response('Conflict', 409));

    await expect(api.addTorrents({ urls: 'magnet:?xt=urn:btih:abc' })).resolves.toBe('Fails.');
  });

  test('accepts an empty 204 body', async () => {
    instance.post.mockResolvedValue(response('', 204));

    await expect(api.addTorrents({ urls: 'magnet:?xt=urn:btih:abc' })).resolves.toBe('Ok.');
  });

  test('sends both `paused` and `stopped` so every version honors "add stopped"', async () => {
    instance.post.mockResolvedValue(response('Ok.', 200));

    await api.addTorrents({ urls: 'magnet:?xt=urn:btih:abc', paused: true });

    const body = instance.post.mock.calls[0][1].toString();
    expect(body).toContain('paused=true');
    expect(body).toContain('stopped=true');
  });
});

describe('actions', () => {
  test('resolve when answered with 204 No Content', async () => {
    instance.post.mockResolvedValue(response('', 204));

    await expect(api.pauseTorrents(['abc'])).resolves.not.toThrow();
    await expect(api.deleteTorrents(['abc'], true)).resolves.not.toThrow();
    await expect(api.setPreferences({ locale: 'en' })).resolves.not.toThrow();
    await expect(api.refreshRssFeed('feed')).resolves.not.toThrow();
    await expect(api.stopSearch(1)).resolves.not.toThrow();
  });

  test('pause/resume use the endpoints that exist on qBittorrent >= 5.0', async () => {
    instance.post.mockResolvedValue(response('', 204));

    await api.pauseTorrents(['abc']);
    await api.resumeTorrents(['abc']);

    expect(instance.post.mock.calls[0][0]).toBe('/torrents/stop');
    expect(instance.post.mock.calls[0][1].toString()).toBe('hashes=abc');
    expect(instance.post.mock.calls[1][0]).toBe('/torrents/start');
    expect(instance.post.mock.calls[1][1].toString()).toBe('hashes=abc');
  });

  test('editTracker sends both the old and new url parameter names', async () => {
    instance.post.mockResolvedValue(response('', 204));

    await api.editTracker('abc', 'udp://old', 'udp://new');

    const body = instance.post.mock.calls[0][1].toString();
    expect(instance.post.mock.calls[0][0]).toBe('/torrents/editTracker');
    expect(body).toContain('origUrl=udp%3A%2F%2Fold');
    expect(body).toContain('url=udp%3A%2F%2Fold');
    expect(body).toContain('newUrl=udp%3A%2F%2Fnew');
  });
});
