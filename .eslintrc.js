const isProdEnv = process.env.NODE_ENV === 'production';

module.exports = {
  root: true,
  env: {
    node: true,
  },
  plugins: [
  ],
  extends: [
    'plugin:vue/strongly-recommended',
    'eslint:recommended',
    '@vue/typescript/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_|^Vue$|^Base$',
    }],
    'no-console': isProdEnv ? 'error' : 'warn',
    'no-debugger': isProdEnv ? 'error' : 'warn',

    "comma-dangle": ["error", "always-multiline"],

    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-types': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-v-model-argument': 'off',
    'vue/no-v-text-v-html-on-component': 'off',
    'vue/no-v-for-template-key': 'off',

    'vue/singleline-html-element-content-newline': ['warn', {
      ignores: ['pre', 'textarea', 'span', 'v-icon'],
    }],
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)',
      ],
      env: {
        jest: true,
      },
    },
  ],
};
