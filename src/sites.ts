const iconModules = import.meta.glob('./assets/site_icons/*.png', { eager: true, import: 'default' }) as Record<string, string>;

function getSiteIcon(name: string): string {
  const key = `./assets/site_icons/${name}.png`;
  return iconModules[key] || '';
}

export interface SiteInfo {
  name: string;
  icon?: string;
}

const sites: {[key: string]: SiteInfo} = {
  'm-team.cc': {
    name: 'M-Team',
    icon: getSiteIcon('m-team'),
  },
  'mteam.io': {
    name: 'M-Team',
    icon: getSiteIcon('m-team'),
  },
  'audiences.me': {
    name: 'AudienceS',
    icon: getSiteIcon('audiences'),
  },
  'keepfrds.com': {
    name: 'PT@KEEPFRDS',
    icon: getSiteIcon('keepfrds'),
  },
  'springsunday.net': {
    name: 'SSD',
    icon: getSiteIcon('springsunday'),
  },
  'hdchina.org': {
    name: 'HDChina',
    icon: getSiteIcon('hdchina'),
  },
  'chdbits.co': {
    name: 'CHDBits',
    icon: getSiteIcon('chdbits'),
  },
  'hdhome.org': {
    name: 'HDHome',
    icon: getSiteIcon('hdhome'),
  },
  'u2.dmhy.org': {
    name: 'U2',
    icon: getSiteIcon('u2'),
  },
  'dmhy.org': {
    name: 'U2',
    icon: getSiteIcon('u2'),
  },
  'dmhy.best': {
    name: 'U2',
    icon: getSiteIcon('u2'),
  },
  'totheglory.im': {
    name: 'TTG',
    icon: getSiteIcon('totheglory'),
  },
  'oshen.win': {
    name: 'OshenPT',
    icon: getSiteIcon('oshen'),
  },
  'soulvoice.club': {
    name: '铃音Club',
    icon: getSiteIcon('soulvoice'),
  },
  'ourbits.club': {
    name: 'OurBits',
    icon: getSiteIcon('ourbits'),
  },
  'btschool.club': {
    name: 'BTSCHOOL',
    icon: getSiteIcon('btschool'),
  },
  'ptsbao.club': {
    name: '烧包',
    icon: getSiteIcon('ptsbao'),
  },
  'pterclub.com': {
    name: 'PTer',
    icon: getSiteIcon('pterclub'),
  },
  'hdtime.org': {
    name: 'HDTime',
    icon: getSiteIcon('hdtime'),
  },
  'hddolby.com': {
    name: 'HD Dolby',
    icon: getSiteIcon('hddolby'),
  },
  'lemonhd.org': {
    name: 'LemonHD',
    icon: getSiteIcon('lemonhd'),
  },
  'hares.top': {
    name: 'HaresClub',
    icon: getSiteIcon('hares'),
  },
  'pthome.net': {
    name: 'PTHOME',
    icon: getSiteIcon('pthome'),
  },
  'hdsky.me': {
    name: 'HDSky',
    icon: getSiteIcon('hdsky'),
  },
  'hdfans.org': {
    name: 'HDFans',
    icon: getSiteIcon('hdfans'),
  },
  'hdatmos.club': {
    name: 'HDAtmos',
    icon: getSiteIcon('hdatmos'),
  },
  'hdzone.me': {
    name: 'HDZone',
    icon: getSiteIcon('hdzone'),
  },
  'open.cd': {
    name: 'OpenCD',
    icon: getSiteIcon('opencd'),
  },
  '1ptba.com': {
    name: '1PTBar',
    icon: getSiteIcon('1ptba'),
  },
  'pttime.org': {
    name: 'PTTime',
    icon: getSiteIcon('pttime'),
  },
  'beitai.pt': {
    name: '备胎',
    icon: getSiteIcon('beitai'),
  },
  'kamept.com': {
    name: 'kamept',
    icon: getSiteIcon('kamept'),
  },
  'nicept.net': {
    name: 'NicePT',
    icon: getSiteIcon('nicept'),
  },
  '2xfree.org': {
    name: '2xfree',
    icon: getSiteIcon('2xfree'),
  },
  'animez.to': {
    name: 'AnimeZ',
    icon: getSiteIcon('animez'),
  },
  'hdarea.co': {
    name: 'HDArea',
    icon: getSiteIcon('hdarea'),
  },
  'gainbound.net': {
    name: 'GainBound',
    icon: getSiteIcon('gainbound'),
  },
  'tjupt.org': {
    name: 'TJUPT',
    icon: getSiteIcon('tjupt'),
  },
  'haidan.video': {
    name: 'Haidan',
    icon: getSiteIcon('haidan'),
  },
  'qingwapt.com': {
    name: 'QingWa',
    icon: getSiteIcon('qingwapt'),
  },
  'discfan.net': {
    name: 'DiscFan',
    icon: getSiteIcon('discfan'),
  },
  'carpt.net': {
    name: 'CarPT',
    icon: getSiteIcon('carpt'),
  },
  'piggo.me': {
    name: 'Piggo',
    icon: getSiteIcon('piggo'),
  },
  'pt.sjtu.edu.cn': {
    name: 'SJTU',
    icon: getSiteIcon('sjtu'),
  },
  'zmpt.cc': {
    name: 'ZMPT',
    icon: getSiteIcon('zmpt'),
  },
  'agsvpt.com': {
    name: 'AGSV',
    icon: getSiteIcon('agsv'),
  },
  'hdmayi.com': {
    name: 'HDMayi',
    icon: getSiteIcon('hdmayi'),
  },
  'eastgame.org': {
    name: 'EastGame',
    icon: getSiteIcon('eastgame'),
  },
  'cnscg.club': {
    name: '星空',
    icon: getSiteIcon('cnscg'),
  },
  'rousi.zip': {
    name: '肉丝',
    icon: getSiteIcon('rousi'),
  },
  'rousi.pro': {
    name: '肉丝',
    icon: getSiteIcon('rousi'),
  },
  'pandapt.net': {
    name: '熊猫',
    icon: getSiteIcon('pandapt'),
  },
  'pandapt.cc': {
    name: '熊猫',
    icon: getSiteIcon('pandapt'),
  },
  'exoticaz.to': {
    name: 'Exoticaz',
    icon: getSiteIcon('exoticaz'),
  },
  'exoticaz.net': {
    name: 'Exoticaz',
    icon: getSiteIcon('exoticaz'),
  },
  'cinefiles.info': {
    name: 'CineFiles',
    icon: getSiteIcon('cinefiles'),
  },
  'redacted.ch': {
    name: 'RED',
    icon: getSiteIcon('redacted'),
  },
  'orpheus.network': {
    name: 'OPS',
    icon: getSiteIcon('orpheus'),
  },
  'passthepopcorn.me': {
    name: 'PTP',
    icon: getSiteIcon('passthepopcorn'),
  },
  'broadcasthe.net': {
    name: 'BTN',
    icon: getSiteIcon('broadcasthe'),
  },
  'gazellegames.net': {
    name: 'GGn',
    icon: getSiteIcon('gazellegames'),
  },
  'torrentleech.org': {
    name: 'TL',
    icon: getSiteIcon('torrentleech'),
  },
  'iptorrents.com': {
    name: 'IPT',
    icon: getSiteIcon('iptorrents'),
  },
  'beyondhd.co': {
    name: 'BHD',
    icon: getSiteIcon('beyondhd'),
  },
  'privatehd.to': {
    name: 'PHD',
    icon: getSiteIcon('privatehd'),
  },
  'jpopsuki.eu': {
    name: 'JPS',
    icon: getSiteIcon('jpopsuki'),
  },
  'animebytes.tv': {
    name: 'AB',
    icon: getSiteIcon('animebytes'),
  },
  'avistaz.to': {
    name: 'AvistaZ',
    icon: getSiteIcon('avistaz'),
  },
  'cinemaz.to': {
    name: 'CinemaZ',
    icon: getSiteIcon('cinemaz'),
  },
  'excinema.me': {
    name: 'ExCinema',
    icon: getSiteIcon('excinema'),
  },
  'fearnopeer.com': {
    name: 'FNP',
    icon: getSiteIcon('fearnopeer'),
  },
  'blutopia.cc': {
    name: 'BLU',
    icon: getSiteIcon('blutopia'),
  },
  'aither.cc': {
    name: 'Aither',
    icon: getSiteIcon('aither'),
  },
  'hawke-uno.com': {
    name: 'Hawke',
    icon: getSiteIcon('hawke'),
  },
  'lst.gg': {
    name: 'LST',
    icon: getSiteIcon('lst'),
  },
  'anthelion.me': {
    name: 'ANT',
    icon: getSiteIcon('anthelion'),
  },
  'tracker.opentrackr.org': {
    name: 'opentrackr',
    icon: getSiteIcon('opentrackr'),
  },
  'open.tracker.cl': {
    name: 'opentrackr',
    icon: getSiteIcon('opentrackr'),
  },
  'tracker.openbittorrent.com': {
    name: 'OBT',
    icon: getSiteIcon('openbittorrent'),
  },
  'nyaa.si': {
    name: 'Nyaa',
    icon: getSiteIcon('nyaa'),
  },
  'tracker.gbitt.info': {
    name: 'GBitt',
    icon: getSiteIcon('gbitt'),
  },
};

/**
 * Given a tracker hostname, returns the site info.
 * Tries exact match first, then suffix match.
 */
export function getSiteByHostname(hostname: string): SiteInfo | undefined {
  if (!hostname) return undefined;

  // Exact match
  if (sites[hostname]) return sites[hostname];

  // Suffix match (longest key wins)
  const keys = Object.keys(sites).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (hostname.endsWith('.' + key)) {
      return sites[key];
    }
  }

  // Fallback: use top domain
  const parts = hostname.split('.');
  if (parts.length > 2) {
    const domain = parts.slice(-2).join('.');
    if (sites[domain]) return sites[domain];
  }

  return undefined;
}

export default sites;
