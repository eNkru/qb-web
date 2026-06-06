import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { mdi } from 'vuetify/iconsets/mdi';
import 'vuetify/styles';
import i18n from '@/locale';

let locale = i18n.locale();
switch (locale) {
  case 'zh-CN':
    locale = 'zhHans';
    break;
  case 'zh-TW':
    locale = 'zhHant';
    break;
  default:
    locale = locale.split('-', 1)[0];
    break;
}

export default createVuetify({
  components,
  directives,
  theme: {
    themes: {
      light: {
        colors: {
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
  },
  locale: {
    locale,
  },
  icons: {
    defaultSet: 'mdi',
    sets: { mdi },
  },
  defaults: {
    VList: {
      density: 'compact',
    },
    VDataTable: {
      density: 'compact',
    },
    VBtn: {
      variant: 'text',
    },
    VTextField: {
      density: 'compact',
    },
    VSelect: {
      density: 'compact',
    },
    VInput: {
      density: 'compact',
    },
    VAutocomplete: {
      density: 'compact',
    },
    VMenu: {
      density: 'compact',
    },
    VCard: {
      density: 'compact',
    },
  },
});
