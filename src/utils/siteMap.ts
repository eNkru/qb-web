import { defaultLocale } from '@/locale';
import { loadConfig } from '@/store/config';

/**
 * A site entry can be a plain string (same in all locales) or an object
 * with separate English and Chinese display names.
 */
type SiteEntry = string | { en: string; zh: string };

/**
 * Maps tracker hostnames (or partial hostnames) to site abbreviations.
 * The lookup checks if the torrent's tracker hostname ends with any key here.
 * Add or override entries to customise abbreviations for your private trackers.
 */
const SITE_MAP: Record<string, SiteEntry> = {
  // --- Chinese private trackers ---
  'pthome.net':       { en: 'PTHome',    zh: '铂金' },
  'hdchina.org':      { en: 'HDChina',   zh: '高清视界' },
  'hdsky.me':         { en: 'HDSky',     zh: '天空' },
  'mteam.io':         { en: 'MTeam',     zh: '馒头' },
  'm-team.cc':         { en: 'MTeam',     zh: '馒头' },
  'ourbits.club':     { en: 'OurBits',   zh: '我的BT' },
  'chdbits.co':       { en: 'CHDBits',   zh: '春天' },
  'lemonhd.org':      { en: 'LemonHD',   zh: '柠檬' },
  'u2.dmhy.org':      { en: 'U2',        zh: 'U2' },
  'totheglory.im':    { en: 'TTG',       zh: 'TTG' },
  'hdtime.org':       { en: 'HDTime',    zh: '时光' },
  'hdhome.org':       { en: 'HDHome',    zh: '家园' },
  'pterclub.com':     { en: 'PTer',      zh: '蝶粉' },
  'keepfrds.com':     { en: 'Frds',      zh: '朋友' },
  'audiences.me':     { en: 'AudienceS', zh: '观众' },
  'hdarea.co':        { en: 'HDArea',    zh: '高清地带' },
  'gainbound.net':    { en: 'GainBound', zh: '皮之骨' },
  'nicept.net':       { en: 'NicePT',    zh: '老师' },
  'springsunday.net': { en: 'SSD',       zh: '春日部' },
  'tjupt.org':        { en: 'TJUPT',     zh: '北邮人' },
  'haidan.video':     { en: 'Haidan',    zh: '海胆' },
  'qingwapt.com':     { en: 'QingWa',    zh: '青蛙' },
  'discfan.net':      { en: 'DiscFan',   zh: '碟fans' },
  'hdatmos.club':     { en: 'HDAtmos',   zh: '大气层' },
  'carpt.net':        { en: 'CarPT',     zh: '车站' },
  'piggo.me':         { en: 'Piggo',     zh: '猪猪' },
  '2xfree.org':       { en: '2xFree',    zh: '2xFree' },
  'btschool.club':    { en: 'BTSchool',  zh: '学校' },
  'pt.sjtu.edu.cn':   { en: 'SJTU',      zh: '交大' },
  'zmpt.cc':          { en: 'ZMPT',      zh: '织梦' },
  'agsvpt.com':       { en: 'AGSV',      zh: 'AGSV' },
  'hdmayi.com':       { en: 'HDMayi',    zh: '蚂蚁' },
  'eastgame.org':     { en: 'EastGame',  zh: '东方' },
  'cnscg.club':       { en: 'CNSCG',     zh: '星空' },
  'rousi.zip':        { en: 'Rousi',     zh: '肉丝' },

  // --- International private trackers (English only) ---
  'redacted.ch':             'RED',
  'orpheus.network':         'OPS',
  'passthepopcorn.me':       'PTP',
  'broadcasthe.net':         'BTN',
  'gazellegames.net':        'GGn',
  'torrentleech.org':        'TL',
  'iptorrents.com':          'IPT',
  'beyondhd.co':             'BHD',
  'privatehd.to':            'PHD',
  'jpopsuki.eu':             'JPS',
  'animebytes.tv':           'AB',
  'avistaz.to':              'AvistaZ',
  'cinemaz.to':              'CinemaZ',
  'excinema.me':             'ExCinema',
  'fearnopeer.com':          'FNP',
  'blutopia.cc':             'BLU',
  'aither.cc':               'Aither',
  'hawke-uno.com':           'Hawke',
  'lst.gg':                  'LST',
  'anthelion.me':            'ANT',
  'animez.to':               'AnimeZ',

  // --- Public trackers ---
  'tracker.opentrackr.org':     'opentrackr',
  'open.tracker.cl':            'opentrackr',
  'tracker.openbittorrent.com': 'OBT',
  'nyaa.si':                    'Nyaa',
  'tracker.gbitt.info':         'GBitt',
};

/**
 * Returns the configured locale, falling back to the browser-matched default.
 */
function getConfiguredLocale() {
  return loadConfig().locale || defaultLocale;
}

/**
 * Given a tracker hostname and an optional locale string, returns a short
 * site abbreviation. Falls back to the second-level domain
 * (e.g. "example" from "tracker.example.com") if no mapping is found.
 */
export function getSiteAbbreviation(hostname: string, locale = getConfiguredLocale()): string {
  if (!hostname) return '';

  const isZh = locale.startsWith('zh');

  // Exact or suffix match (longest key wins)
  const keys = Object.keys(SITE_MAP).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (hostname === key || hostname.endsWith('.' + key)) {
      const entry = SITE_MAP[key];
      if (typeof entry === 'string') return entry;
      return isZh ? entry.zh : entry.en;
    }
  }

  // Fallback: use second-level domain (e.g. "example" from "tracker.example.com")
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    return parts[parts.length - 2];
  }

  return hostname;
}
