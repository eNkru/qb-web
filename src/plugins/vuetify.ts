import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import i18n from '@/locale';

Vue.use(Vuetify);

let locale = i18n.locale();
switch (locale) {
  case 'zh-CN':
    locale = 'zh-Hans';
    break;
  case 'zh-TW':
    locale = 'zh-Hant';
    break;
  default:
    locale = locale.split('-', 1)[0];
    break;
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { default: translation } = require('vuetify/lib/locale/' + locale + '.js');

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#1976d2',
        secondary: '#424242',
        accent: '#82B1FF',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107',
      },
    },
  },
  lang: {
    locales: { [locale]: translation },
    current: locale,
  },
  icons: {
    iconfont: 'mdi',
  },
});
