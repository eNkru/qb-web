const qbWebUiTarget = process.env.QB_WEBUI_URL || 'http://127.0.0.1:8080';
const sassImplementation = require('sass');

// Vuetify 2 and the current webpack/sass toolchain emit many upstream Sass deprecation
// warnings that are not actionable in this app. Silence them for local dev/build output.
process.env.SASS_QUIET_DEPS = process.env.SASS_QUIET_DEPS || 'true';
process.env.SASS_SILENCE_DEPRECATIONS = process.env.SASS_SILENCE_DEPRECATIONS
  || 'legacy-js-api,import,global-builtin,slash-div,if-function';

const sassOptions = {
  quietDeps: true,
  silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'slash-div', 'if-function'],
};

module.exports = {
  outputDir: 'dist/public',
  publicPath: './',
  css: {
    loaderOptions: {
      sass: {
        implementation: sassImplementation,
        sassOptions,
      },
      scss: {
        implementation: sassImplementation,
        sassOptions,
      },
    },
  },

  pwa: {
    // name: "qb-web",
    themeColor: "#4d8ad5",
    msTileColor: "#4d8ad5",
    appleMobileWebAppCapable: 'yes',

    iconPaths: {
      favicon32: 'img/icons/favicon-32x32.png',
      favicon16: 'img/icons/favicon-16x16.png',
      appleTouchIcon: 'img/icons/apple-touch-icon.png',
      maskIcon: null,
      msTileImage: null,
    },
  },

  devServer: {
    port: 8000,
    proxy: {
      '/api': {
        target: qbWebUiTarget,
        changeOrigin: true,
      },
    },
  },

  chainWebpack(config) {
    config.plugin('define').tap(args => {
      let arg = args[0]
      arg = {
        ...arg,
        'process.env.GIT_TAG': JSON.stringify(process.env.GIT_TAG),
      }

      return [arg]
    })
  },
};
