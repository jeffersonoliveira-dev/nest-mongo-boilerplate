// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 5,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      "prettier/prettier": ["error"],
      "@typescript-eslint/no-shadow": ["error"],
      "@typescript-eslint/no-explicit-any": 1,
      "no-use-before-define": 0,
      "no-restricted-syntax": 0,
      "import/no-unresolved": 0,
      "object-literal-sort-keys": 0,
      "no-param-reassign": [
        "error",
        {
          "props": false
        }
      ]
    },
  },
);