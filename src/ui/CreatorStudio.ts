import { parseGridScript } from '../scripting/GridScript';

export interface CreatorStudioOptions {
  terrain: {
    setMode: (mode: 'CARVE' | 'BUILD') => void;
    setEnabled: (enabled: boolean) => void;
  };
  onCreateWorld?: (name: string, description: string) => void;
  onMessage?: (message: string) => void;
}

type StudioTab = 'WORLD' | 'MATTER' | 'LOGIC' | 'ASSETS' | 'SIMULATION';

const STYLE = `
.grid-creator-studio{position:fixed;inset:7vh 7vw;z-index:1200;display:none;grid-template-columns:210px 1fr;background:rgba(6,10,18,.96);border:1px solid rgba(130,220,255,.35);box-shadow:0 24px 80px rgba(0,0,0,.55),0 0 50px rgba(70,180,255,.12);backdrop-filter:blur(18px);color:#dff7ff;font:12px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace}
.grid-creator-studio.open{display:grid}.gcs-nav{padding:18px;border-right:1px solid rgba(130,220,255,.18);background:rgba(255,255,255,.025)}.gcs-brand{font-size:15px;font-weight:800;letter-spacing:.14em;margin-bottom:4px}.gcs-sub{opacity:.5;font-size:10px;margin-bottom:22px}.gcs-tab{display:block;width:100%;text-align:left;padding:11px 10px;margin:4px 0;background:transparent;color:inherit;border:1px solid transparent;cursor:pointer}.gcs-tab:hover,.gcs-tab.active{border-color:rgba(130,220,255,.35);background:rgba(90,180,255,.08)}.gcs-main{min-width:0;display:flex;flex-direction:column}.gcs-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid rgba(130,220,255,.16)}.gcs-title{font-size:13px;font-weight:800;letter-spacing:.08em}.gcs-close{background:transparent;color:inherit;border:1px solid rgba(255,255,255,.18);padding:5px 9px;cursor:pointer}.gcs-body{padding:18px;overflow:auto}.gcs-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.gcs-card{padding:14px;border:1px solid rgba(130,220,255,.16);background:rgba(255,255,255,.025)}.gcs-card h3{margin:0 0 8px;font-size:11px;letter-spacing:.12em}.gcs-card p{margin:6px 0;opacity:.72}.gcs-input,.gcs-textarea{width:100%;box-sizing:border-box;background:rgba(0,0,0,.3);border:1px solid rgba(130,220,255,.2);color:inherit;padding:9px;font:inherit}.gcs-textarea{min-height:180px;resize:vertical}.gcs-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.gcs-btn{background:rgba(70,180,255,.09);color:inherit;border:1px solid rgba(130,220,255,.3);padding:8px 11px;cursor:pointer}.gcs-btn:hover{background:rgba(70,180,255,.17)}.gcs-output{white-space:pre-wrap;min-height:54px;margin-top:10px;padding:9px;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.08);opacity:.82}.gcs-status{font-size:10px;opacity:.55}.gcs-pill{display:inline-block;padding:3px 6px;margin:3px;border:1px solid rgba(130,220,255,.2);opacity:.75}.gcs-full{grid-column:1/-1}@media(max-width:850px){.grid-creator-studio{inset:2vh 2vw;grid-template-columns:145px 1fr}.gcs-grid{grid-template-columns:1fr}}
`;

export function mountCreatorStudio(options: CreatorStudioOptions) {
  if (!document.getElementById('grid-creator-studio-style')) {
    const style = document.createElement('style');
    style.id = 'grid-creator-studio-style';
    style.textContent = STYLE;
    document.head.appendChild(style);
  }

  const root = document.createElement('section');
  root.className = 'grid-creator-studio';
  root.innerHTML = `
    <aside class="gcs-nav">
      <div class="gcs-brand">CREATOR STUDIO</div>
      <div class="gcs-sub">GRID ENGINE 0.1 · AUTHORING WORKSPACE</div>
      <button class="gcs-tab active" data-tab="WORLD">01 · WORLD</button>
      <button class="gcs-tab" data-tab="MATTER">02 · GRID MATTER</button>
      <button class="gcs-tab" data-tab="LOGIC">03 · GRID SCRIPT</button>
      <button class="gcs-tab" data-tab="ASSETS">04 · ASSETS</button>
      <button class="gcs-tab" data-tab="SIMULATION">05 · SIMULATION</button>
    </aside>
    <main class="gcs-main">
      <header class="gcs-head"><div class="gcs-title" id="gcs-title">WORLD AUTHORING</div><button class="gcs-close" type="button">CLOSE</button></header>
      <div class="gcs-body" id="gcs-body"></div>
    </main>
  `;
  document.body.appendChild(root);

  const body = root.querySelector<HTMLDivElement>('#gcs-body')!;
  const title = root.querySelector<HTMLDivElement>('#gcs-title')!;

  const render = (tab: StudioTab) => {
    root.querySelectorAll<HTMLButtonElement>('.gcs-tab').forEach(button => button.classList.toggle('active', button.dataset.tab === tab));
    title.textContent = ({
      WORLD: 'WORLD AUTHORING',
      MATTER: 'GRID MATTER EDITOR',
      LOGIC: 'GRID SCRIPT WORKBENCH',
      ASSETS: 'ASSET & MATERIAL LAB',
      SIMULATION: 'PLAYTEST & SIMULATION',
    } as Record<StudioTab,string>)[tab];

    if (tab === 'WORLD') {
      body.innerHTML = `
        <div class="gcs-grid">
          <div class="gcs-card">
            <h3>WORLD FACTORY</h3>
            <p>Describe a world. Grid DNA derives architecture, climate, habitat, flora, fauna and atmosphere. There is no fixed world-count limit.</p>
            <input class="gcs-input" id="gcs-world-name" maxlength="40" placeholder="World name" />
            <textarea class="gcs-textarea" id="gcs-world-description" placeholder="Example: a floating archive grown through enormous crystal trees above a warm cloud sea…"></textarea>
            <div class="gcs-actions"><button class="gcs-btn" id="gcs-create-world">GENERATE WORLD</button></div>
          </div>
          <div class="gcs-card">
            <h3>AUTHORING PRINCIPLES</h3>
            <span class="gcs-pill">WORLD DNA</span><span class="gcs-pill">LIVING ECOLOGY</span><span class="gcs-pill">WEATHER</span><span class="gcs-pill">GRID MATTER</span><span class="gcs-pill">TRANSIT</span><span class="gcs-pill">QUESTS</span>
            <p>Creator actions become engine data instead of isolated editor tricks. A world can continue evolving after you leave it.</p>
          </div>
        </div>`;
      root.querySelector<HTMLButtonElement>('#gcs-create-world')?.addEventListener('click', () => {
        const name = (root.querySelector<HTMLInputElement>('#gcs-world-name')?.value ?? '').trim();
        const description = (root.querySelector<HTMLTextAreaElement>('#gcs-world-description')?.value ?? '').trim();
        if (!name || !description) {
          options.onMessage?.('Creator Studio: enter a world name and description first.');
          return;
        }
        options.onCreateWorld?.(name, description);
        options.onMessage?.('Creator Studio: world generation request accepted.');
      });
      return;
    }

    if (tab === 'MATTER') {
      body.innerHTML = `
        <div class="gcs-grid">
          <div class="gcs-card">
            <h3>SCULPT THE SUBSTRATE</h3>
            <p>Grid Matter is the editable physical layer beneath a world. Carve and build directly in the live scene.</p>
            <div class="gcs-actions"><button class="gcs-btn" id="gcs-carve">CARVE [C]</button><button class="gcs-btn" id="gcs-build">BUILD [B]</button><button class="gcs-btn" id="gcs-toggle">ENABLE / DISABLE [G]</button></div>
          </div>
          <div class="gcs-card">
            <h3>EDITOR MODEL</h3>
            <p>Each unit is persisted per world. The editor is deliberately separate from the simulation so terrain authoring can evolve without coupling the world to one renderer.</p>
            <div class="gcs-output">Grid Matter → terrain → caves/veins → minerals → ecology → gameplay</div>
          </div>
        </div>`;
      root.querySelector<HTMLButtonElement>('#gcs-carve')?.addEventListener('click', () => options.terrain.setMode('CARVE'));
      root.querySelector<HTMLButtonElement>('#gcs-build')?.addEventListener('click', () => options.terrain.setMode('BUILD'));
      root.querySelector<HTMLButtonElement>('#gcs-toggle')?.addEventListener('click', () => options.terrain.setEnabled(true));
      return;
    }

    if (tab === 'LOGIC') {
      body.innerHTML = `
        <div class="gcs-card">
          <h3>CAPABILITY-BOUNDED GRID SCRIPT</h3>
          <p>Author behavior without arbitrary JavaScript execution. Validate first; only approved Grid capabilities can run.</p>
          <textarea class="gcs-textarea" id="gcs-script">object "Creator Beacon"

when player interacts:
    show "Creator Studio signal received."
    play sound "ui.confirm"
</textarea>
          <div class="gcs-actions"><button class="gcs-btn" id="gcs-validate">VALIDATE</button></div>
          <div class="gcs-output" id="gcs-script-output">Ready.</div>
        </div>`;
      root.querySelector<HTMLButtonElement>('#gcs-validate')?.addEventListener('click', () => {
        const source = root.querySelector<HTMLTextAreaElement>('#gcs-script')?.value ?? '';
        const parsed = parseGridScript(source);
        const output = root.querySelector<HTMLDivElement>('#gcs-script-output')!;
        if (parsed.script) {
          const capabilities = new Set<string>();
          for (const handler of parsed.script.handlers) for (const action of handler.actions) capabilities.add(action.kind === 'call' ? 'object_control' : action.kind === 'play_sound' ? 'play_audio' : action.kind === 'give_item' ? 'economy_transaction' : 'ui_feedback');
          output.textContent = 'VALID · CAPABILITIES · ' + [...capabilities].join(' · ');
        } else {
          output.textContent = 'INVALID · ' + parsed.diagnostics.map(d => `L${d.line} ${d.message}`).join(' | ');
        }
      });
      return;
    }

    if (tab === 'ASSETS') {
      body.innerHTML = `
        <div class="gcs-grid">
          <div class="gcs-card"><h3>MODEL LAB</h3><p>Preview targets for buildings, avatars, creatures, plants and trees before placing them into a world.</p><div class="gcs-output">MODEL → MATERIAL → COLLISION → LOD → WORLD INSTANCE</div></div>
          <div class="gcs-card"><h3>MATERIAL LAB</h3><p>Grid-native materials can connect PBR appearance to world tags, climate and chemistry.</p><div class="gcs-output">PBR · NORMAL · ROUGHNESS · METALNESS · EMISSIVE</div></div>
          <div class="gcs-card gcs-full"><h3>FUTURE TOOL PANELS</h3><span class="gcs-pill">PARTICLES</span><span class="gcs-pill">ANIMATION</span><span class="gcs-pill">AUDIO</span><span class="gcs-pill">TERRAIN BRUSHES</span><span class="gcs-pill">CREATURE GENETICS</span><span class="gcs-pill">QUEST GRAPH</span><span class="gcs-pill">TELEPORT GRAPH</span><span class="gcs-pill">ECONOMY</span></div>
        </div>`;
      return;
    }

    body.innerHTML = `
      <div class="gcs-grid">
        <div class="gcs-card"><h3>LIVE PLAYTEST</h3><p>Creator Studio should eventually run the same authored world as players see it, with safe inspection overlays.</p><div class="gcs-actions"><button class="gcs-btn" id="gcs-inspect">INSPECT MODE</button><button class="gcs-btn" id="gcs-snapshot">SNAPSHOT</button></div><div class="gcs-output" id="gcs-sim-output">Simulation preview ready.</div></div>
        <div class="gcs-card"><h3>SIMULATION SIGNALS</h3><span class="gcs-pill">ECOLOGY</span><span class="gcs-pill">NPC MEMORY</span><span class="gcs-pill">EVOLUTION</span><span class="gcs-pill">WEATHER</span><span class="gcs-pill">QUEST CONSEQUENCES</span><span class="gcs-pill">PVP / PVE</span></div>
      </div>`;
      root.querySelector<HTMLButtonElement>('#gcs-inspect')?.addEventListener('click', () => {
        const output = root.querySelector<HTMLDivElement>('#gcs-sim-output')!;
        output.textContent = 'INSPECT MODE · live simulation remains authoritative; creator overlays are read-only in this pass.';
        options.onMessage?.('Creator Studio inspect mode is read-only in this pass.');
      });
      root.querySelector<HTMLButtonElement>('#gcs-snapshot')?.addEventListener('click', () => {
        localStorage.setItem('grid-world:creator-studio-snapshot', JSON.stringify({ savedAt: new Date().toISOString(), source: 'Creator Studio' }));
        options.onMessage?.('Creator Studio snapshot saved locally.');
      });
  };

  root.querySelectorAll<HTMLButtonElement>('.gcs-tab').forEach(button => button.addEventListener('click', () => render(button.dataset.tab as StudioTab)));
  root.querySelector<HTMLButtonElement>('.gcs-close')?.addEventListener('click', () => root.classList.remove('open'));
  render('WORLD');

  return {
    root,
    open: () => root.classList.add('open'),
    close: () => root.classList.remove('open'),
    toggle: () => root.classList.toggle('open'),
  };
}
