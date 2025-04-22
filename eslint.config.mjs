import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import vitestPlugin from 'eslint-plugin-vitest';

export default tseslint.config(
  // Global rules and ignores
  eslint.configs.recommended,
  {
    // Global ignores - apply to all configurations below
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'eslint.config.mjs', // Don't lint the config file itself with type-aware rules
      'vitest.config.ts', // Ignore other config files
      'tsup.config.ts',
    ],
  },
  {
    files: ['src/**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        project: true, // Use tsconfig.json from the root
        tsconfigRootDir: import.meta.dirname, // Helps resolve tsconfig.json
      },
    },
  },

  {
    files: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    extends: [vitestPlugin.configs.recommended],
  },
); 