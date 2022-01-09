module.exports = {
  env: {
    jest: true,
    node: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    indent: 'off',
    'max-len': ['warn', { code: 160, ignoreUrls: true }],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
  },
};
