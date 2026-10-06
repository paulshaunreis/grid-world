import {
  getGridLanguage,
  getSupportedGridLanguages,
  setGridLanguage,
  subscribeGridLanguage,
  type GridLanguagePreference,
} from '../i18n/GridLanguage';

const STYLE_ID = 'grid-language-settings-style';

function installStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .grid-language-setting{display:flex;align-items:center;gap:10px;margin-top:12px}
    .grid-language-setting label{font:700 10px/1.2 "IBM Plex Mono",monospace;letter-spacing:.12em;opacity:.78}
    .grid-language-setting select{min-width:210px;max-width:100%;background:rgba(4,12,20,.86);border:1px solid rgba(116,221,255,.28);color:#e9fbff;border-radius:6px;padding:8px 10px;font:600 11px "IBM Plex Mono",monospace}
    .grid-language-setting small{display:block;margin-top:6px;opacity:.58;font:500 9px/1.4 "IBM Plex Mono",monospace}
    .grid-site-language select{background:rgba(4,10,18,.8);color:inherit;border:1px solid currentColor;border-radius:4px;padding:7px 9px;font:700 10px "IBM Plex Mono",monospace;opacity:.9}
  `;
  document.head.appendChild(style);
}

export function mountGridLanguageSettings(container: HTMLElement, variant: 'world'|'site' = 'world') {
  if (container.querySelector('.grid-language-setting')) return;
  installStyle();

  const wrap = document.createElement('div');
  wrap.className = variant === 'site' ? 'grid-language-setting grid-site-language' : 'grid-language-setting';
  wrap.innerHTML = '<label>LANGUAGE</label><select aria-label="Grid World language"></select>';
  if (variant === 'world') {
    const note = document.createElement('small');
    note.textContent = 'Auto follows your device language. You can choose another language at any time.';
    wrap.appendChild(note);
  }
  container.appendChild(wrap);

  const select = wrap.querySelector('select')!;
  const sync = () => { select.value = getGridLanguage(); };
  sync();

  void getSupportedGridLanguages().then(languages => {
    const current = getGridLanguage();
    select.innerHTML = '<option value="auto">Automatic · Device Language</option>' +
      languages.map(language => '<option value="' + escapeHtml(language.code) + '">' + escapeHtml(language.name) + ' · ' + escapeHtml(language.code) + '</option>').join('');
    select.value = current;
    if (select.value !== current) select.value = 'auto';
  });

  select.addEventListener('change', () => setGridLanguage(select.value as GridLanguagePreference));
  return subscribeGridLanguage(sync);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character] || character));
}
