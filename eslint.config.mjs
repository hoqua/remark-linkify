import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import vitestPlugin from 'eslint-plugin-vitest';

export default tseslint.config(
  eslint.configs.recommended,
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'eslint.config.mjs', 
      'vitest.config.ts',
      'tsup.config.ts',
    ],
  },
  {
    files: ['src/**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    files: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    extends: [vitestPlugin.configs.recommended],
  },
); 