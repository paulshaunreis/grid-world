import { buildDreamSeedPreview, type DreamSeedWorldBlueprint } from '../world/DreamSeedWorldAdapter';

export interface DreamSeedPreviewPanelOptions {
  onPreview?: (preview: ReturnType<typeof buildDreamSeedPreview>) => void;
}

export function mountDreamSeedPreviewPanel(options: DreamSeedPreviewPanelOptions = {}) {
  const button = document.createElement('button');
  button.className = 'toolbar-button';
  button.type = 'button';
  button.textContent = 'DREAM SEED';
  document.body.appendChild(button);

  const panel = document.createElement('div');
  panel.style.cssText = 'position:fixed;inset:0;z-index:82;display:none;place-items:center;background:rgba(2,6,12,.72);backdrop-filter:blur(12px);';
  panel.innerHTML = '<div style="width:min(760px,94vw);max-height:88vh;overflow:auto;padding:24px;border:1px solid rgba(160,220,255,.35);background:rgba(8,14,25,.96);box-shadow:0 0 70px rgba(40,190,255,.14);font-family:system-ui;color:#e9f7ff">' +
    '<div style="letter-spacing:.18em;font-size:12px;opacity:.7">GRID DREAM SEED · PREVIEW</div>' +
    '<h2 style="margin:8px 0">Give the Grid a dream.</h2>' +
    '<p style="opacity:.72">This stage creates an inspectable preview only. It does not create, persist, publish, or grant authority to a world.</p>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      '<input id="gds-name" placeholder="World name" style="box-sizing:border-box;width:100%;padding:12px;background:#09111d;color:#fff;border:1px solid #29485b">' +
      '<input id="gds-seed" placeholder="Seed ID" style="box-sizing:border-box;width:100%;padding:12px;background:#09111d;color:#fff;border:1px solid #29485b">' +
    '</div>' +
    '<input id="gds-owner" placeholder="Owner ID" value="local-preview" style="box-sizing:border-box;width:100%;padding:12px;margin:10px 0;background:#09111d;color:#fff;border:1px solid #29485b">' +
    '<input id="gds-reality" placeholder="Reality class · e.g. R3" value="R3" style="box-sizing:border-box;width:100%;padding:12px;margin:0 0 10px;background:#09111d;color:#fff;border:1px solid #29485b">' +
    '<textarea id="gds-intent" placeholder="Describe the dream: landscape, life, architecture, atmosphere, culture..." style="box-sizing:border-box;width:100%;height:150px;padding:12px;background:#09111d;color:#fff;border:1px solid #29485b"></textarea>' +
    '<div id="gds-status" style="min-height:44px;margin:12px 0;opacity:.82"></div>' +
    '<div id="gds-result" style="display:none;padding:14px;background:rgba(10,22,36,.8);border:1px solid rgba(120,220,255,.22);white-space:pre-wrap;font:12px/1.55 IBM Plex Mono,monospace"></div>' +
    '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:12px"><button id="gds-close" type="button">Close</button><button id="gds-preview" type="button">BUILD PREVIEW</button></div>' +
  '</div>';
  document.body.appendChild(panel);

  const name = panel.querySelector<HTMLInputElement>('#gds-name')!;
  const seed = panel.querySelector<HTMLInputElement>('#gds-seed')!;
  const owner = panel.querySelector<HTMLInputElement>('#gds-owner')!;
  const reality = panel.querySelector<HTMLInputElement>('#gds-reality')!;
  const intent = panel.querySelector<HTMLTextAreaElement>('#gds-intent')!;
  const status = panel.querySelector<HTMLElement>('#gds-status')!;
  const result = panel.querySelector<HTMLElement>('#gds-result')!;

  const close = () => { panel.style.display = 'none'; };
  button.addEventListener('click', () => { panel.style.display = 'grid'; name.focus(); });
  panel.querySelector<HTMLButtonElement>('#gds-close')!.addEventListener('click', close);
  panel.addEventListener('click', event => { if (event.target === panel) close(); });

  panel.querySelector<HTMLButtonElement>('#gds-preview')!.addEventListener('click', () => {
    try {
      const blueprint: DreamSeedWorldBlueprint = {
        seedId: seed.value.trim() || 'local-preview-seed',
        ownerId: owner.value.trim(),
        name: name.value.trim(),
        creativeIntent: intent.value.trim(),
        realityClass: reality.value.trim(),
        blueprintVersion: '0.1.0-preview',
      };
      const preview = buildDreamSeedPreview(blueprint);
      result.style.display = 'block';
      result.textContent = JSON.stringify(preview, null, 2);
      status.textContent = 'PREVIEW ONLY · no world registered · no persistence · no permissions · no publication';
      options.onPreview?.(preview);
    } catch (error) {
      result.style.display = 'none';
      status.textContent = error instanceof Error ? error.message : 'Dream Seed preview failed.';
    }
  });

  return { open: () => { panel.style.display = 'grid'; name.focus(); }, close };
}
