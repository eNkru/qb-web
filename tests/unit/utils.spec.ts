import { findSameNamedTorrents, codeToFlag, safeExternalUrl, sanitizeHtml, sleep } from '@/utils';
import { mockTorrent } from './utils';

test('timeout', async () => {
  vi.useFakeTimers();

  const fn = vi.fn();

  sleep(1000).then(fn);
  expect(fn).not.toBeCalled();

  vi.advanceTimersByTime(500);
  // HACK: force wait promise,
  // see https://stackoverflow.com/a/51132058/2806903
  // and https://stackoverflow.com/a/52196951/2806903
  await Promise.resolve();
  expect(fn).not.toBeCalled();

  vi.advanceTimersByTime(500);
  await Promise.resolve();
  expect(fn).toBeCalled();
});

test('code to flag', () => {
  expect(codeToFlag('CN')).toMatchObject({
    char: '🇨🇳',
    url: expect.stringContaining('1f1e8-1f1f3'),
  });
});

describe('find same named torrents', () => {
  const torrents = [
    mockTorrent({
      hash: '0',
      name: 'A',
    }),
    mockTorrent({
      hash: '1',
      name: 'B',
    }),
    mockTorrent({
      hash: '2',
      name: 'A',
    }),
    mockTorrent({
      hash: '3',
      name: 'C',
    }),
  ];

  test.each([
    [[mockTorrent({ name: 'A' })], [torrents[0], torrents[2]]],
    [[mockTorrent({ name: 'B' })], [torrents[1]]],
    [[mockTorrent({ name: 'C' })], [torrents[3]]],
    [[mockTorrent({ hash: '0', name: 'A' })], [torrents[2]]],
  ])('case %#', (target, result) => {
    expect(findSameNamedTorrents(torrents, target)).toEqual(result);
  });
});

describe('safeExternalUrl', () => {
  test('allows http and https urls', () => {
    expect(safeExternalUrl('https://example.com/path')).toBe('https://example.com/path');
    expect(safeExternalUrl('http://example.com/path')).toBe('http://example.com/path');
  });

  test('rejects unsafe or invalid urls', () => {
    expect(safeExternalUrl('javascript:alert(1)')).toBe('#');
    expect(safeExternalUrl('data:text/html,test')).toBe('#');
    expect(safeExternalUrl('http://[invalid')).toBe('#');
  });
});

describe('sanitizeHtml', () => {
  test('removes scripts, event handlers, styles, and unsafe urls', () => {
    const html = sanitizeHtml(`
      <script>alert(1)</script>
      <p style="color:red" onclick="alert(1)">Text</p>
      <img src="javascript:alert(1)" onerror="alert(1)">
      <a href="javascript:alert(1)">bad</a>
      <a href="https://example.com/path">good</a>
    `);

    expect(html).not.toContain('<script');
    expect(html).not.toContain('onclick');
    expect(html).not.toContain('onerror');
    expect(html).not.toContain('style=');
    expect(html).not.toContain('javascript:');
    expect(html).toContain('href="https://example.com/path"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
});
