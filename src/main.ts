import { createApp } from 'vue';
import { createPinia } from 'pinia';
import vuetify from './plugins/vuetify';
import i18n from './plugins/i18n';
import router from './router';
import { registerFilters } from './filters';
import { registerDirectives } from './directives';
import './locale';
import './buildInfo';
import App from './App.vue';

import 'roboto-fontface/css/roboto/roboto-fontface.css';
import '@mdi/font/css/materialdesignicons.css';

// eslint-disable-next-line no-console
const origWarn = console.warn;
// eslint-disable-next-line no-console
console.warn = (...args: any[]) => {
  if (typeof args[0] === 'string' && /(?:not found in "\w+"|No match found for location)/.test(args[0])) return;
  origWarn(...args);
};

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(i18n);
app.use(vuetify);

registerFilters(app);
registerDirectives(app);

app.mount('#app');
