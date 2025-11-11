module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true
  },
  extends: ['eslint:recommended', 'plugin:promise/recommended', 'plugin:n/recommended'],
  plugins: ['import'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-console': 'off',
    'import/order': [
      'warn',
      {
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true }
      }
    ],
    'n/shebang': 'off'
  },
  ignorePatterns: [
    'dist/',
    'build/',
    'node_modules/',
    'layers/',
    'docs/',
    'backend/',
    'pages/',
    'public/',
    'modules/',
    'utils/',
    'bazaarcodexv1.html',
    'index.js'
  ],
  overrides: [
    {
      files: ['__tests__/**/*.js', 'vitest.config.mjs'],
      env: {
        node: true
      },
      rules: {
        'n/no-unpublished-import': 'off'
      }
    }
  ]
};
