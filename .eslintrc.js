module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
    browser: false
  },
  // parser: '@babel/eslint-parser',
  parserOptions: {
    sourceType: 'module'
  },
  extends: ['standard', 'eslint:recommended'],
  plugins: ['node'],
  rules: {
    semi: ['error', 'never'],
    indent: ['error', 2, { SwitchCase: 1 }],
    quotes: ['error', 'single'],
    eqeqeq: ['error', 'always'],
    'eol-last': ['error', 'always'],
    'no-console': 'off',
    'comma-dangle': ['error', 'never'],
    'padded-blocks': ['error', 'never'],
    'no-cond-assign': ['error', 'always'],
    'no-return-await': 'error',
    'no-multi-spaces': 'error',
    'no-trailing-spaces': 'error',
    'prefer-const': [
      'error',
      {
        destructuring: 'any',
        ignoreReadBeforeAssign: false
      }
    ],
    'no-multiple-empty-lines': [
      'error',
      {
        max: 1,
        maxEOF: 0,
        maxBOF: 0
      }
    ],
    'key-spacing': [
      2,
      {
        singleLine: { beforeColon: false, afterColon: true }
        // "multiLine": { "beforeColon": false, "afterColon": true, "align": "colon" }
      }
    ]
  }
}
