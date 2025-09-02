const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './', // load next.config.js and .env files
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/_*.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: { statements: 0, branches: 0, functions: 0, lines: 0 },
  },
};

module.exports = createJestConfig(customJestConfig);
