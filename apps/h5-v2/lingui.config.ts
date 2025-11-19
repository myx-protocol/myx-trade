import { DEFAULT_LOCALE, Locales } from './src/locales/locale'
import { defineConfig } from '@lingui/cli'

export default defineConfig({
  locales: Locales,
  sourceLocale: DEFAULT_LOCALE,
  fallbackLocales: {
    default: DEFAULT_LOCALE,
  },
  format: 'po',
  formatOptions: {
    lineNumbers: false,
  },
  catalogs: [
    {
      path: '<rootDir>/src/locales/messages/{locale}',
      include: ['<rootDir>/src/**/*.ts', '<rootDir>/src/**/*.tsx'],
      exclude: [
        '<rootDir>/src/**/*.d.ts',
        '<rootDir>/src/**/*.test.*',
        '<rootDir>/src/types/v3/**',
        '<rootDir>/src/abis/types/**',
        '<rootDir>/src/graphql/**/__generated__/**',
      ],
    },
  ],
})

/*
export async function dynamicActivate(locale: string) {
  const { messages } = await import(`./src/locales/messages/${locale}.po`);

  i18n.load(locale, messages);
  i18n.activate(locale);
}
*/
