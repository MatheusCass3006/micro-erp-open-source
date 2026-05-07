export default {
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "^.+\\.ts$": ["ts-jest", {}],
  },
  moduleNameMapper: {
    "^uuid$": "<rootDir>/tests/mocks/uuid.js",
  },
  testMatch: ["**/tests/**/*.test.ts"],
  clearMocks: true,
};
