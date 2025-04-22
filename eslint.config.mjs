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

  // Configuration for TypeScript source files
  {
    files: ['src/**/*.ts'],
    // Apply TS recommended type-checked rules ONLY to these files
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        project: true, // Use tsconfig.json from the root
        tsconfigRootDir: import.meta.dirname, // Helps resolve tsconfig.json
      },
    },
    rules: {
      // Add specific TS source file rules or overrides here
    },
  },

  // Configuration for Test files
  {
    files: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    // Apply vitest recommended rules
    extends: [vitestPlugin.configs.recommended],
    languageOptions: {
      // globals: { ...vitestPlugin.environments.env.globals }, // If needed explicitly
    },
    rules: {
      // Add specific test file rules or overrides here
    },
  },
); 