/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  roots: ['<rootDir>/tests'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ["<rootDir>/tests/jest.setup.ts"],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {}],
  },
  testMatch: ['**/*.test.ts']
};