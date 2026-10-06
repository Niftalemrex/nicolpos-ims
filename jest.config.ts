import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript',
      ],
      plugins: [
        ['@babel/plugin-proposal-decorators', { version: 'legacy' }],
      ],
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@nestjs|@prisma)/)',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};

export default config;