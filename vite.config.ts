import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

// Silence Sass deprecation warnings from Vuetify and upstream libraries
process.env.SASS_SILENCE_DEPRECATIONS = 'legacy-js-api,import,global-builtin,slash-div';

const qbWebUiTarget = process.env.QB_WEBUI_URL || 'http://127.0.0.1:8080';

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  base: './',
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: qbWebUiTarget,
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/vuetify')) return 'vuetify';
          if (id.includes('node_modules/vue') || id.includes('node_modules/pinia') || id.includes('node_modules/vue-router')) return 'vue-vendor';
          if (id.includes('node_modules/lodash-es')) return 'lodash';
          if (id.includes('node_modules/@mdi/js')) return 'mdi-icons';
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/styles.scss" as *;`,
      },
    },
  },
});