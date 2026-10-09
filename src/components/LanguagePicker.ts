/**
 * LanguagePicker — custom glass-UI language dropdown with flag emojis.
 * Replaces the native <select> (which renders as an unstyled white box).
 * Flags let users identify languages visually even if they can't read the name.
 */
import { GRID_SUPPORTED_LOCALES, type GridLocale } from '../core/GridLanguagePreferences';
import { readLocalLocale, writeLocalLocale } from '../i18n/GridLanguageService';

interface LocaleMeta { flag: string; name: string; }

const LOCALE_META: Record<string, LocaleMeta> = {
  'en-US':   { flag: '🇺🇸', name: 'English' },
  'es-ES':   { flag: '🇪🇸', name: 'Español' },
  'fr-FR':   { flag: '🇫🇷', name: 'Français' },
  'de-DE':   { flag: '🇩🇪', name: 'Deutsch' },
  'pt-BR':   { flag: '🇧🇷', name: 'Português' },
  'it-IT':   { flag: '🇮🇹', name: 'Italiano' },
  'ja-JP':   { flag: '🇯🇵', name: '日本語' },
  'ko-KR':   { flag: '🇰🇷', name: '한국어' },
  'zh-Hans': { flag: '🇨🇳', name: '简体中文' },
  'zh-Hant': { flag: '🇹🇼', name: '繁體中文' },
  'ar':      { flag: '🇸🇦', name: 'العربية' },
  'hi-IN':   { flag: '🇮🇳', name: 'हिन्दी' },
};

export function localeLabel(locale: string): string {
  const meta = LOCALE_META[locale];
  return meta ? `${meta.flag} ${meta.name}` : locale;
}

/**
 * Mount a custom language dropdown into `container`.
 * Calls onChange with the new locale code when the user picks one.
 */
export function mountLanguagePicker(
  container: HTMLElement,
  opts: { onChange?: (locale: GridLocale) => void } = {},
): void {
  const current = readLocalLocale();
  const currentMeta = LOCALE_META[current] ?? { flag: '🌐', name: current };

  container.classList.add('gw-language-picker');
  container.innerHTML = `
    <button type="button" class="gw-lang-btn" aria-haspopup="listbox" aria-expanded="false"
      title="Language — applies across the website and in-world" aria-label="Language">
      <span class="gw-lang-flag">${currentMeta.flag}</span>
      <span class="gw-lang-name">${currentMeta.name}</span>
      <span class="gw-lang-caret" aria-hidden="true">▾</span>
    </button>
    <ul class="gw-lang-menu" role="listbox" hidden>
      ${GRID_SUPPORTED_LOCALES.map(l => {
        const meta = LOCALE_META[l] ?? { flag: '🌐', name: l };
        const selected = l === current;
        return `<li role="option" aria-selected="${selected}" data-locale="${l}" class="gw-lang-option${selected ? ' selected' : ''}">
          <span class="gw-lang-flag">${meta.flag}</span>
          <span class="gw-lang-name">${meta.name}</span>
          <span class="gw-lang-code">${l}</span>
          ${selected ? '<span class="gw-lang-check" aria-hidden="true">✓</span>' : ''}
        </li>`;
      }).join('')}
    </ul>`;

  const btn = container.querySelector<HTMLButtonElement>('.gw-lang-btn')!;
  const menu = container.querySelector<HTMLUListElement>('.gw-lang-menu')!;

  const close = () => {
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  };
  const open = () => {
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.hidden ? open() : close();
  });

  menu.addEventListener('click', (e) => {
    const opt = (e.target as HTMLElement).closest<HTMLElement>('.gw-lang-option');
    if (!opt) return;
    const locale = opt.dataset.locale as GridLocale;
    writeLocalLocale(locale);
    const meta = LOCALE_META[locale] ?? { flag: '🌐', name: locale };
    btn.querySelector('.gw-lang-flag')!.textContent = meta.flag;
    btn.querySelector('.gw-lang-name')!.textContent = meta.name;
    menu.querySelectorAll('.gw-lang-option').forEach(o => {
      const isSel = o.getAttribute('data-locale') === locale;
      o.classList.toggle('selected', isSel);
      o.setAttribute('aria-selected', String(isSel));
    });
    close();
    opts.onChange?.(locale);
  });

  // Close on outside click or Escape
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target as Node)) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}
