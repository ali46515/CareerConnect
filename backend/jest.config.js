// jest.config.js
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  // Use mongodb-memory-server for an in‑memory DB during tests
  globals: {
    MONGODB_URI: "mongodb://127.0.0.1:27017/careerconnect_test",
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
};
