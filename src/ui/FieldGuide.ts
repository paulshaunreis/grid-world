export type FieldNode = {
  id: string;
  name: string;
  kind: string;
  distance: string;
  reward: string;
};

const COLLECTION_KEY = 'grid-world:field-collection:v1';

export class FieldGuide {
  readonly element: HTMLDivElement;
  private nodes: FieldNode[] = [
    { id: 'signal-grove', name: 'Signal Grove', kind: 'LIVING SITE', distance: '120 m', reward: '+12 discovery' },
    { id: 'memory-arch', name: 'Memory Arch', kind: 'LANDMARK', distance: '280 m', reward: '+20 history' },
    { id: 'maker-beacon', name: 'Maker Beacon', kind: 'CREATOR NODE', distance: '410 m', reward: '+1 blueprint' },
    { id: 'resonance-pool', name: 'Resonance Pool', kind: 'ANOMALY', distance: '650 m', reward: '+15 resonance' },
  ];

  constructor() {
    this.element = document.createElement('section');
    this.element.className = 'field-guide';
    this.element.innerHTML = `
      <div class="field-header">
        <div><span class="field-kicker">GRID FIELD</span><h2>Nearby Discovery</h2><p>Explore, scan, collect, and build a persistent trail of discoveries.</p></div>
        <button class="field-close" type="button" aria-label="Close field guide">×</button>
      </div>
      <div class="field-status"><span id="field-location-status">LOCATION · SIMULATED GRID</span><span id="field-count">0 DISCOVERIES</span></div>
      <div class="field-actions">
        <button type="button" data-field-action="locate">USE MY LOCATION</button>
        <button type="button" data-field-action="route">START DAILY ROUTE</button>
        <button type="button" data-field-action="camera">CAMERA SCAN</button>
      </div>
      <div class="field-nodes" id="field-nodes"></div>
      <div class="field-note">Location access is optional. When enabled on mobile, Grid Field can become the bridge between real-world movement and persistent Grid discoveries.</div>
    `;
    document.body.appendChild(this.element);
    this.render();
    this.bind();
  }

  open() { this.element.classList.add('open'); }
  close() { this.element.classList.remove('open'); }

  private getCollection(): string[] {
    try {
      const value = JSON.parse(localStorage.getItem(COLLECTION_KEY) ?? '[]');
      return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
    } catch {
      return [];
    }
  }

  private saveCollection(ids: string[]) {
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(ids));
  }

  private render() {
    const collected = new Set(this.getCollection());
    const nodes = this.element.querySelector<HTMLDivElement>('#field-nodes');
    const count = this.element.querySelector<HTMLSpanElement>('#field-count');
    if (!nodes || !count) return;
    count.textContent = collected.size + ' DISCOVERIES';
    nodes.innerHTML = this.nodes.map(node => {
      const done = collected.has(node.id);
      return `
        <article class="field-node ${done ? 'collected' : ''}">
          <div class="field-node-glyph">${done ? '✓' : '◇'}</div>
          <div class="field-node-copy"><b>${node.name}</b><span>${node.kind} · ${node.distance}</span><small>${node.reward}</small></div>
          <button type="button" data-scan="${node.id}">${done ? 'COLLECTED' : 'SCAN'}</button>
        </article>
      `;
    }).join('');
  }

  private bind() {
    this.element.querySelector('.field-close')?.addEventListener('click', () => this.close());
    this.element.addEventListener('click', event => {
      const target = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-scan]');
      if (!target) return;
      const id = target.dataset.scan;
      if (!id) return;
      const collected = new Set(this.getCollection());
      collected.add(id);
      this.saveCollection([...collected]);
      this.render();
      const node = this.nodes.find(item => item.id === id);
      this.element.querySelector('#field-location-status')!.textContent = 'DISCOVERY LOGGED · ' + (node?.name ?? 'NODE');
    });

    this.element.querySelector('[data-field-action="locate"]')?.addEventListener('click', () => {
      const status = this.element.querySelector('#field-location-status');
      if (!navigator.geolocation) {
        if (status) status.textContent = 'LOCATION · UNAVAILABLE';
        return;
      }
      if (status) status.textContent = 'LOCATION · REQUESTING PERMISSION…';
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude.toFixed(3);
          const lon = position.coords.longitude.toFixed(3);
          if (status) status.textContent = 'LOCATION · ' + lat + ' / ' + lon;
        },
        () => { if (status) status.textContent = 'LOCATION · PERMISSION NOT GRANTED'; },
        { enableHighAccuracy: false, maximumAge: 60000, timeout: 8000 },
      );
    });

    this.element.querySelector('[data-field-action="route"]')?.addEventListener('click', () => {
      const status = this.element.querySelector('#field-location-status');
      if (status) status.textContent = 'DAILY ROUTE · ACTIVE · 0.0 / 2.0 KM';
    });

    this.element.querySelector('[data-field-action="camera"]')?.addEventListener('click', () => {
      const status = this.element.querySelector('#field-location-status');
      if (status) status.textContent = 'CAMERA SCAN · READY FOR MOBILE AR LAYER';
    });
  }
}
