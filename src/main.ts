import { createApp } from 'vue';
import { createPinia } from 'pinia';
import vuetify from './plugins/vuetify';
import i18n from './plugins/i18n';
import router from './router';
import store from './store';
import { registerFilters } from './filters';
import { registerDirectives } from './directives';
import './locale';
import './buildInfo';
import App from './App.vue';

import 'roboto-fontface/css/roboto/roboto-fontface.css';
import '@mdi/font/css/materialdesignicons.css';

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.config.globalProperties.$store = store;
app.use(router);
app.use(i18n);
app.use(vuetify);

registerFilters(app);
registerDirectives(app);

app.mount('#app');
