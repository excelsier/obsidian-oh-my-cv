// Jest setup file
// This runs before each test file
import '@jest/globals';

// Global setup code
beforeAll(() => {
  // Any global setup needed before all tests
  console.log('Setting up tests...');
});

// Global teardown code
afterAll(() => {
  // Any global cleanup needed after all tests
  console.log('Cleaning up after tests...');
});
