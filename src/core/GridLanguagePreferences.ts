import { readVersioned, removeVersioned, writeVersioned } from './VersionedStorage';

export const GRID_LANGUAGE_PREFERENCES_KEY = 'gridworld.language-preferences';
export const GRID_LANGUAGE_PREFERENCES_SCHEMA = 1;

export const GRID_SUPPORTED_LOCALES = [
  'en-US',
  'es-ES',
  'fr-FR',
  'de-DE',
  'pt-BR',
  'it-IT',
  'ja-JP',
  'ko-KR',
  'zh-Hans',
  'zh-Hant',
  'ar',
  'hi-IN',
] as const;

export type GridLocale = (typeof GRID_SUPPORTED_LOCALES)[number];

export interface GridLanguagePreferences {
  uiLocale: GridLocale;
  fallbackLocales: GridLocale[];
}

const DEFAULT_LANGUAGE_PREFERENCES: GridLanguagePreferences = {
  uiLocale: 'en-US',
  fallbackLocales: ['en-US'],
};

function isGridLocale(value: unknown): value is GridLocale {
  return typeof value === 'string' &&
    (GRID_SUPPORTED_LOCALES as readonly string[]).includes(value);
}

function sanitizeFallbacks(value: unknown, uiLocale: GridLocale): GridLocale[] {
  if (!Array.isArray(value)) return [uiLocale, 'en-US'].filter(
    (locale, index, list) => list.indexOf(locale) === index,
  ) as GridLocale[];

  const result = value.filter(isGridLocale);
  if (!result.includes(uiLocale)) result.unshift(uiLocale);
  if (!result.includes('en-US')) result.push('en-US');
  return result.filter((locale, index) => result.indexOf(locale) === index);
}

function migrateLanguagePreferences(
  data: unknown,
  schema: number,
): GridLanguagePreferences | null {
  if (schema !== 1 || typeof data !== 'object' || data === null) return null;

  const candidate = data as Record<string, unknown>;
  const uiLocale = isGridLocale(candidate.uiLocale)
    ? candidate.uiLocale
    : DEFAULT_LANGUAGE_PREFERENCES.uiLocale;

  return {
    uiLocale,
    fallbackLocales: sanitizeFallbacks(candidate.fallbackLocales, uiLocale),
  };
}

export function getGridLanguagePreferences(): GridLanguagePreferences {
  return readVersioned(
    GRID_LANGUAGE_PREFERENCES_KEY,
    GRID_LANGUAGE_PREFERENCES_SCHEMA,
    migrateLanguagePreferences,
  ) ?? { ...DEFAULT_LANGUAGE_PREFERENCES, fallbackLocales: ['en-US'] };
}

export function setGridLanguagePreferences(
  preferences: Partial<GridLanguagePreferences>,
): GridLanguagePreferences {
  const current = getGridLanguagePreferences();
  const uiLocale = isGridLocale(preferences.uiLocale)
    ? preferences.uiLocale
    : current.uiLocale;

  const next: GridLanguagePreferences = {
    uiLocale,
    fallbackLocales: sanitizeFallbacks(
      preferences.fallbackLocales ?? current.fallbackLocales,
      uiLocale,
    ),
  };

  writeVersioned(
    GRID_LANGUAGE_PREFERENCES_KEY,
    GRID_LANGUAGE_PREFERENCES_SCHEMA,
    next,
  );

  return next;
}

export function resetGridLanguagePreferences(): GridLanguagePreferences {
  removeVersioned(GRID_LANGUAGE_PREFERENCES_KEY);
  return getGridLanguagePreferences();
}
