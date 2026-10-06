export const GRID_LANGUAGE_KEY = 'grid-world:language';
export const GRID_TRANSLATION_ENDPOINT = '/api/i18n';
export type GridLanguagePreference = 'auto' | string;
export type GridLanguage = { code: string; name: string };

const FALLBACK_LANGUAGES: GridLanguage[] = [
  ['en','English'],['es','Spanish'],['fr','French'],['de','German'],['it','Italian'],
  ['pt','Portuguese'],['pt-BR','Portuguese (Brazil)'],['ja','Japanese'],['ko','Korean'],
  ['zh-CN','Chinese (Simplified)'],['zh-TW','Chinese (Traditional)'],['ar','Arabic'],
  ['hi','Hindi'],['bn','Bengali'],['ur','Urdu'],['ru','Russian'],['uk','Ukrainian'],
  ['pl','Polish'],['nl','Dutch'],['tr','Turkish'],['vi','Vietnamese'],['th','Thai'],
  ['id','Indonesian'],['ms','Malay'],['fil','Filipino'],['he','Hebrew'],['fa','Persian'],
  ['sw','Swahili'],['el','Greek'],['cs','Czech'],['sv','Swedish'],['da','Danish'],
  ['no','Norwegian'],['fi','Finnish'],['ro','Romanian'],['hu','Hungarian'],
  ['ca','Catalan'],['sk','Slovak'],['bg','Bulgarian'],['hr','Croatian'],['sr','Serbian'],
  ['sl','Slovenian'],['et','Estonian'],['lv','Latvian'],['lt','Lithuanian'],
  ['is','Icelandic'],['ga','Irish'],['cy','Welsh'],['af','Afrikaans'],['zu','Zulu'],
  ['am','Amharic'],['ne','Nepali'],['ta','Tamil'],['te','Telugu'],
].map(([code,name]) => ({code,name}));

export function getGridLanguage(): GridLanguagePreference {
  const saved = localStorage.getItem(GRID_LANGUAGE_KEY);
  return saved && saved.trim() ? saved : 'auto';
}

export function getEffectiveGridLanguage(): string {
  const preference = getGridLanguage();
  if (preference !== 'auto') return preference;
  return (navigator.language || 'en').trim() || 'en';
}

export function setGridLanguage(preference: GridLanguagePreference) {
  const value = preference.trim() || 'auto';
  localStorage.setItem(GRID_LANGUAGE_KEY, value);
  window.dispatchEvent(new CustomEvent('grid:language-changed', { detail: { language: value } }));
}

export function subscribeGridLanguage(listener: (language: GridLanguagePreference) => void) {
  const onCustom = (event: Event) => {
    const detail = (event as CustomEvent<{language?: string}>).detail;
    listener(detail?.language || getGridLanguage());
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === GRID_LANGUAGE_KEY) listener(event.newValue || 'auto');
  };
  window.addEventListener('grid:language-changed', onCustom);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener('grid:language-changed', onCustom);
    window.removeEventListener('storage', onStorage);
  };
}

export async function getSupportedGridLanguages(): Promise<GridLanguage[]> {
  try {
    const response = await fetch(GRID_TRANSLATION_ENDPOINT + '/languages', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('language catalog unavailable');
    const data = await response.json() as { languages?: Array<{code?: string; languageCode?: string; name?: string; displayName?: string}> };
    const languages = (data.languages ?? [])
      .map(item => ({ code: item.code || item.languageCode || '', name: item.name || item.displayName || item.code || item.languageCode || '' }))
      .filter(item => item.code && item.name);
    if (languages.length) return languages;
  } catch {
    // Keep the selector useful while the translation backend is unavailable.
  }
  return FALLBACK_LANGUAGES;
}

export async function translateGridText(text: string, target = getEffectiveGridLanguage(), source?: string): Promise<string> {
  if (!text.trim() || target === 'auto' || target.toLowerCase() === (source || '').toLowerCase()) return text;
  try {
    const response = await fetch(GRID_TRANSLATION_ENDPOINT + '/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ text, target, source }),
    });
    if (!response.ok) throw new Error('translation unavailable');
    const data = await response.json() as { translatedText?: string };
    return data.translatedText || text;
  } catch {
    return text;
  }
}
