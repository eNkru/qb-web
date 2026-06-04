import { createApp } from 'vue';
import vuetify from './plugins/vuetify';
import i18n from './plugins/i18n';
import store from './store';
import { registerFilters } from './filters';
import { registerDirectives } from './directives';
import './locale';
import './buildInfo';
import App from './App.vue';

import 'roboto-fontface/css/roboto/roboto-fontface.css';
import '@mdi/font/css/materialdesignicons.css';

const app = createApp(App);

app.use(store);
app.config.globalProperties.$store = store;
app.use(i18n);
app.use(vuetify);

registerFilters(app);
registerDirectives(app);

app.mount('#app');
