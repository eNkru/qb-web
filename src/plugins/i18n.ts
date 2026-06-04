import { App } from 'vue';
import { tr } from '@/locale';

export default {
  install(app: App) {
    app.config.globalProperties.$t = tr;
  },
};
