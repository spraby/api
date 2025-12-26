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
      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/explicit-function-return-type': 'off', // React components don't need explicit return types
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',

      // React rules
      'react/react-in-jsx-scope': 'off', // Not needed in React 18+
      'react/prop-types': 'off', // Using TypeScript for prop types
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-uses-react': 'off', // Not needed in React 18+
      'react/jsx-uses-vars': 'error',
      'react/no-children-prop': 'warn',
      'react/no-danger-with-children': 'error',
      'react/no-deprecated': 'warn',
      'react/no-direct-mutation-state': 'error',
      'react/no-unescaped-entities': 'warn',
      'react/no-unknown-property': 'error',
      'react/self-closing-comp': 'warn',

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Accessibility rules
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',

      // Import rules
      'import/order': ['warn', {
        'groups': [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
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

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-alert': 'warn',
      'no-unused-vars': 'off', // Using @typescript-eslint/no-unused-vars instead
      'prefer-const': 'warn',
      'no-var': 'error',
    },
  },

  // Specific rules for JavaScript files (less strict)
  {
    files: ['**/*.{js,jsx}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // Specific rules for TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'error',
    },
  }
);