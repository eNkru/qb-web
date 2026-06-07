const isCi = !!process.env.CI;

module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx', 'json', 'vue', 'ts', 'tsx'],
  transform: {
    '^.+\\.vue$': ['@vue/vue3-jest', {
      tsConfig: 'tsconfig.test.json',
      transform: {
        ts: ['ts-jest', { tsconfig: 'tsconfig.test.json', diagnostics: false }],
      },
    }],
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
      diagnostics: false,
    }],
    '^.+\\.jsx?$': 'babel-jest',
    '\\.(css|less|sass|scss|stylus)$': 'jest-transform-stub',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  snapshotSerializers: ['jest-serializer-vue'],
  testMatch: [
    '**/tests/unit/**/*.spec.[jt]s?(x)',
    '**/__tests__/*.[jt]s?(x)',
  ],
  transformIgnorePatterns: ['/node_modules/'],
  collectCoverage: isCi,
};
