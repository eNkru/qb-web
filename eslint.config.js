import js from '@eslint/js';
import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';

export default [
  // Global ignores
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.*'],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // Vue 3 recommended rules (flat config format)
  ...pluginVue.configs['flat/strongly-recommended'],

  // TypeScript recommended rules
  ...tseslint.configs['flat/recommended'],

  // Node.js scripts (bin/)
  {
    files: ['bin/**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // Project-specific configuration
  {
    files: ['**/*.{js,ts,vue}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    rules: {
      // Production-sensitive rules
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',

      // TypeScript rules
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^(Vue|Base|_)',
      }],

      // Vue rules
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/no-v-model-argument': 'off',
      'vue/require-default-prop': 'off',
      'vue/singleline-html-element-content-newline': ['error', {
        ignoreWhenNoAttributes: true,
        ignoreWhenEmpty: true,
        ignores: ['span', 'v-icon'],
      }],

      // Formatting
      'comma-dangle': ['error', 'always-multiline'],
    },
  },

  // Test file overrides
  {
    files: ['tests/unit/**/*.{js,ts}', '__tests__/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      'no-console': 'off',
      'no-debugger': 'off',
    },
  },
];
