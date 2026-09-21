/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  clearMocks: true,
  // Integration tests import the Express app, which opens a real ioredis
  // connection at module load time; force the process to exit once Jest's
  // own reporting is done rather than waiting on that socket.
  forceExit: true,
};
