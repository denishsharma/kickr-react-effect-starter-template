import antfu from '@antfu/eslint-config'

export default antfu(
  {
    formatters: true,
    react: true,
    stylistic: {
      overrides: {
        'style/comma-dangle': ['error', 'always-multiline'],
        'style/array-bracket-newline': ['error', { multiline: true, minItems: 3 }],
        'style/function-call-argument-newline': ['error', 'consistent'],
        'style/brace-style': [
          'error',
          '1tbs',
          { allowSingleLine: true },
        ],
        'style/max-statements-per-line': ['error', { max: 2 }],
        'style/wrap-regex': 'error',
        'style/member-delimiter-style': 'error',
        'style/jsx-self-closing-comp': ['error', { component: true, html: true }],
        'style/jsx-max-props-per-line': ['error', { maximum: 1, when: 'multiline' }],
        'style/jsx-curly-brace-presence': [
          'error',
          {
            props: 'always',
            children: 'never',
            propElementValues: 'always',
          },
        ],
        'style/jsx-wrap-multilines': [
          'error',
          {
            return: 'parens-new-line',
            declaration: 'parens-new-line',
            condition: 'parens-new-line',
            logical: 'parens-new-line',
            arrow: 'parens-new-line',
          },
        ],
      },
    },
    regexp: { level: 'warn' },
    lessOpinionated: true,
    typescript: {
      overrides: {
        'ts/no-redeclare': 'off',
        'ts/array-type': ['error', { default: 'array' }],
        'ts/naming-convention': [
          'error',
          {
            selector: 'variable',
            format: [
              'camelCase',
              'UPPER_CASE',
              'PascalCase',
            ],
          },
          {
            selector: 'typeLike',
            format: ['PascalCase'],
          },
          {
            selector: 'class',
            format: ['PascalCase'],
          },
          {
            selector: 'interface',
            format: ['PascalCase'],
            custom: {
              regex: '^I[A-Z]',
              match: false,
            },
          },
        ],
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',

      'import/no-cycle': ['error', { maxDepth: '∞' }],

      'node/handle-callback-err': ['error', '^(err|error)$'],

      'unicorn/throw-new-error': 'off',
      'unicorn/filename-case': [
        'error',
        {
          case: 'snakeCase',
          ignore: [
            'vite-env.d.ts',
            'lint-staged.config.js',
          ],
        },
      ],
      'unicorn/no-await-expression-member': 'error',
    },
    ignores: ['./.generated/'],
  },
  {
    files: ['**/*.{tsx,jsx}'],
    rules: {
      'unicorn/filename-case': ['error', { cases: { snakeCase: true, kebabCase: true } }],
    },
  },
)
