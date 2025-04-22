module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json'
    }],
  },
  moduleNameMapper: {
    // Mock Obsidian API and other external dependencies
    '^obsidian$': '<rootDir>/tests/mocks/obsidian.ts',
    // Mock the plugin instance to avoid circular dependencies
    '\.\./core/plugin-instance': '<rootDir>/tests/mocks/plugin-instance.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**/*.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
