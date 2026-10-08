import type {SupabaseClient} from '@supabase/supabase-js';
import {
  getGridLanguagePreferences,
  setGridLanguagePreferences,
  GRID_SUPPORTED_LOCALES,
  type GridLocale,
} from '../core/GridLanguagePreferences';
import {GridAuditLog, GridAuditActions} from '../governance/GridAuditLog';

// GridWorld shared language authority (Phase 1 of governance/localization implementation).
// Surfaces 1-3: pre-auth selection, onboarding inheritance, single shared authority.
//
// This builds on Paul's GridLanguagePreferences foundation (PR #100):
// - Client-side: GridLanguagePreferences (uiLocale + fallbackLocales, VersionedStorage)
// - Server-side: profiles.language (authenticated settings authority)
// The doc explicitly anticipated this: "until an authenticated settings authority
// is introduced" — this service IS that authority.
//
// Website and in-world clients read from this same authority — never drift apart.

/** Map a full locale (en-US) to the server's primary language subtag (en). */
export function localeToLanguage(locale: string): string {
  return locale.split('-')[0].toLowerCase();
}

/** Detect the browser's preferred locale, mapped to our supported set. Falls back to 'en-US'. */
export function detectBrowserLocale(): GridLocale {
  try {
    const nav = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
    // Direct match (en-US)
    if ((GRID_SUPPORTED_LOCALES as readonly string[]).includes(nav)) return nav as GridLocale;
    // Primary subtag match (en -> en-US)
    const primary = nav.split('-')[0].toLowerCase();
    const match = GRID_SUPPORTED_LOCALES.find(l => l.toLowerCase().startsWith(primary));
    if (match) return match;
  } catch { /* fall through */ }
  return 'en-US';
}

/** Read the pre-auth / client-side locale selection (no auth required). */
export function readLocalLocale(): GridLocale {
  return getGridLanguagePreferences().uiLocale;
}

/** Persist the pre-auth / client-side locale selection (no auth required). */
export function writeLocalLocale(locale: string): void {
  const normalized = (GRID_SUPPORTED_LOCALES as readonly string[]).includes(locale)
    ? (locale as GridLocale)
    : detectBrowserLocale();
  setGridLanguagePreferences({uiLocale: normalized});
  // Notify other tabs / the in-world client of the change.
  try { window.dispatchEvent(new CustomEvent('grid-language-change', {detail: {locale: normalized}})); } catch { /* noop */ }
}

export class GridLanguageService {
  constructor(
    private readonly client: SupabaseClient,
    private readonly audit?: GridAuditLog,
  ) {}

  /**
   * Get the authoritative locale for the current user.
   * Server (profiles.language) wins; falls back to local preference for signed-out users.
   * Returns the full locale (e.g. en-US); use localeToLanguage() for the primary subtag.
   */
  async getLocale(): Promise<GridLocale> {
    const {data: {user}} = await this.client.auth.getUser();
    if (!user) return readLocalLocale();
    const {data, error} = await this.client
      .from('profiles')
      .select('language')
      .eq('id', user.id)
      .maybeSingle();
    if (error || !data?.language) return readLocalLocale();
    const serverLang = data.language as string;
    // Map server language code back to a full locale.
    const match = GRID_SUPPORTED_LOCALES.find(
      l => l.toLowerCase() === serverLang.toLowerCase() || l.toLowerCase().startsWith(serverLang.toLowerCase() + '-')
    );
    return (match ?? readLocalLocale()) as GridLocale;
  }

  /** Convenience: get the primary language subtag (en, es, ja...). */
  async getLanguage(): Promise<string> {
    return localeToLanguage(await this.getLocale());
  }

  /**
   * Set the locale. Single write path for the shared authority:
   * updates server (profiles.language) AND the local GridLanguagePreferences,
   * then audit-logs. Website and in-world clients both read through getLocale(),
   * so they can never drift apart.
   */
  async setLocale(locale: string): Promise<GridLocale> {
    const normalized = (GRID_SUPPORTED_LOCALES as readonly string[]).includes(locale)
      ? (locale as GridLocale)
      : detectBrowserLocale();
    const {data: {user}} = await this.client.auth.getUser();
    if (user) {
      const {error} = await this.client
        .from('profiles')
        .update({language: localeToLanguage(normalized)})
        .eq('id', user.id);
      if (error) throw error;
    }
    writeLocalLocale(normalized);
    void this.audit?.logAsUser(GridAuditActions.LANGUAGE_SET, {
      target_type: 'profile',
      target_id: user?.id ?? undefined,
      metadata: {locale: normalized, language: localeToLanguage(normalized)},
    });
    return normalized;
  }

  /** Listen for cross-tab / cross-client language changes. Returns an unsubscribe fn. */
  onChange(cb: (locale: GridLocale) => void): () => void {
    const handler = (e: Event) => cb((e as CustomEvent).detail.locale as GridLocale);
    window.addEventListener('grid-language-change', handler);
    return () => window.removeEventListener('grid-language-change', handler);
  }
}
