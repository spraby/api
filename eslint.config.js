import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  // Base ESLint recommended config
  js.configs.recommended,

  // TypeScript ESLint recommended configs
  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,

  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/vendor/**',
      '**/public/build/**',
      '**/bootstrap/cache/**',
      '**/storage/**',
      '**/dist/**',
      '**/.vite/**',
      'vite.config.js',
      'vite.config.ts',
      'resources/js/admin/app.js',
    ],
  },

  // React and TypeScript files configuration
  {
    files: ['**/*.{ts,tsx,js,jsx}'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },

      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        // Node globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },

    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      'import': importPlugin,
    },

    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },

    rules: {
      // ============================================
      // TypeScript Strict Rules
      // ============================================
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_|^__$',
        caughtErrorsIgnorePattern: '^_',
      }],
      '@typescript-eslint/explicit-function-return-type': 'off', // Too strict for React components
      '@typescript-eslint/explicit-module-boundary-types': 'off', // TypeScript infers return types
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/ban-ts-comment': ['error', {
        'ts-expect-error': 'allow-with-description',
        'ts-ignore': true,
        'ts-nocheck': true,
        'ts-check': false,
        minimumDescriptionLength: 10,
      }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': ['error', {
        checksVoidReturn: false,
      }],
      '@typescript-eslint/prefer-nullish-coalescing': 'off', // Optional improvement, not required
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'off', // Too many false positives
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports',
      }],
      '@typescript-eslint/consistent-type-exports': ['error', {
        fixMixedExportsWithInlineTypeSpecifier: true,
      }],
      '@typescript-eslint/no-unsafe-assignment': 'off', // Too strict for dynamic code
      '@typescript-eslint/no-unsafe-member-access': 'off', // Too strict for dynamic code
      '@typescript-eslint/no-unsafe-call': 'off', // Too strict for dynamic code
      '@typescript-eslint/no-unsafe-return': 'off', // Too strict for dynamic code
      '@typescript-eslint/no-unsafe-argument': 'off', // Too strict for dynamic code
      '@typescript-eslint/strict-boolean-expressions': 'off', // Too strict for common JS patterns
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/no-duplicate-enum-values': 'error',
      '@typescript-eslint/no-duplicate-type-constituents': 'error',
      '@typescript-eslint/array-type': ['error', { default: 'array' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-confusing-void-expression': ['error', {
        ignoreArrowShorthand: true, // Common in React event handlers
        ignoreVoidOperator: false,
      }],
      '@typescript-eslint/no-meaningless-void-operator': 'error',
      '@typescript-eslint/no-mixed-enums': 'error',
      '@typescript-eslint/no-redundant-type-constituents': 'error',
      '@typescript-eslint/no-useless-empty-export': 'error',
      '@typescript-eslint/non-nullable-type-assertion-style': 'error',
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/prefer-literal-enum-member': 'error',
      '@typescript-eslint/prefer-reduce-type-parameter': 'error',
      '@typescript-eslint/prefer-return-this-type': 'error',
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/require-array-sort-compare': ['error', {
        ignoreStringArrays: true,
      }],
      '@typescript-eslint/no-base-to-string': 'error',
      '@typescript-eslint/no-confusing-non-null-assertion': 'error',
      '@typescript-eslint/no-dynamic-delete': 'error',
      '@typescript-eslint/no-invalid-void-type': 'off', // Valid for Promise<void>
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/prefer-promise-reject-errors': 'error',
      '@typescript-eslint/unified-signatures': 'error',
      '@typescript-eslint/method-signature-style': ['error', 'property'],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'forbid',
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'forbid',
          filter: {
            regex: '^__$',
            match: false,
          },
        },
        {
          selector: 'import',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          filter: {
            regex: '^__$|^App$',
            match: false,
          },
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'typeLike',
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
        {
          selector: 'objectLiteralProperty',
          format: null,
        },
        {
          selector: 'typeProperty',
          format: null,
        },
      ],

      // ============================================
      // React Rules
      // ============================================
      'react/react-in-jsx-scope': 'off', // Not needed in React 18+
      'react/prop-types': 'off', // Using TypeScript for prop types
      'react/jsx-key': ['error', {
        checkFragmentShorthand: true,
        checkKeyMustBeforeSpread: true,
        warnOnDuplicates: true,
      }],
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-uses-react': 'off', // Not needed in React 18+
      'react/jsx-uses-vars': 'error',
      'react/no-children-prop': 'error',
      'react/no-danger-with-children': 'error',
      'react/no-deprecated': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-unescaped-entities': 'error',
      'react/no-unknown-property': 'error',
      'react/self-closing-comp': ['error', {
        component: true,
        html: true,
      }],
      'react/jsx-no-leaked-render': ['error', {
        validStrategies: ['coerce', 'ternary'],
      }],
      'react/jsx-curly-brace-presence': ['error', {
        props: 'never',
        children: 'never',
      }],
      'react/jsx-boolean-value': ['error', 'never'],
      'react/jsx-fragments': ['error', 'syntax'],
      'react/jsx-no-useless-fragment': ['error', {
        allowExpressions: true,
      }],
      'react/jsx-pascal-case': 'error',
      'react/no-array-index-key': 'off', // Sometimes necessary for static lists
      'react/no-unstable-nested-components': 'error',
      'react/void-dom-elements-no-children': 'error',
      'react/jsx-sort-props': 'off', // Not critical, can be handled by formatters

      // ============================================
      // React Hooks Rules
      // ============================================
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      // ============================================
      // Accessibility Rules
      // ============================================
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/no-static-element-interactions': 'error',
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/no-autofocus': 'off', // Autofocus can be useful for UX
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/scope': 'error',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/html-has-lang': 'error',
      'jsx-a11y/img-redundant-alt': 'error',
      'jsx-a11y/interactive-supports-focus': 'error',

      // ============================================
      // Import Rules
      // ============================================
      'import/order': ['error', {
        'groups': [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
          'type',
        ],
        'pathGroups': [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
          {
            pattern: '@/**',
            group: 'internal',
          },
        ],
        'pathGroupsExcludedImportTypes': ['react'],
        'newlines-between': 'always',
        'alphabetize': {
          order: 'asc',
          caseInsensitive: true,
        },
      }],
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off', // TypeScript handles this
      'import/named': 'off', // TypeScript handles this
      'import/namespace': 'off', // TypeScript handles this
      'import/default': 'off', // TypeScript handles this
      'import/no-named-as-default-member': 'off', // TypeScript handles this
      'import/no-cycle': 'error',
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'error',
      'import/newline-after-import': 'error',
      'import/no-anonymous-default-export': ['error', {
        allowArray: false,
        allowArrowFunction: false,
        allowAnonymousClass: false,
        allowAnonymousFunction: false,
        allowCallExpression: true,
        allowNew: false,
        allowLiteral: false,
        allowObject: false,
      }],
      'import/no-default-export': 'off', // We need default exports for pages

      // ============================================
      // General Rules
      // ============================================
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-unused-vars': 'off', // Using @typescript-eslint/no-unused-vars instead
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'curly': ['error', 'all'],
      'no-implicit-coercion': ['error', {
        allow: ['!!'],
      }],
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',
      'no-return-await': 'off', // @typescript-eslint/return-await handles this
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],
      'no-nested-ternary': 'error',
      'no-unneeded-ternary': 'error',
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'no-useless-concat': 'error',
      'no-lonely-if': 'error',
      'no-else-return': ['error', { allowElseIf: false }],
      'object-shorthand': ['error', 'always'],
      'prefer-destructuring': ['error', {
        array: false,
        object: true,
      }, {
        enforceForRenamedProperties: false,
      }],
      'no-param-reassign': ['error', {
        props: true,
        ignorePropertyModificationsFor: [
          'acc', // for reduce accumulators
          'accumulator', // for reduce accumulators
          'e', // for e.returnvalue
          'ctx', // for Koa routing
          'context', // for Koa routing
          'req', // for Express requests
          'request', // for Express requests
          'res', // for Express responses
          'response', // for Express responses
          'state', // for Redux state
          'draft', // for immer
        ],
      }],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ForInStatement',
          message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
        },
        {
          selector: 'LabeledStatement',
          message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
        },
        {
          selector: 'WithStatement',
          message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
        },
      ],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
      ],
    },
  },

  // Specific rules for JavaScript files (less strict)
  {
    files: ['**/*.{js,jsx}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  // Specific rules for TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'error',
    },
  },

  // Relaxed rules for test files
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'off',
    },
  }
);