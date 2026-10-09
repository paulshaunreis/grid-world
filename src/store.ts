// Grid World Store — real-world merchandise storefront.
// In active development. NO checkout. Products are "Coming Soon" with
// a Notify Me signup (localStorage for now). Paul's direction 2026-10-08.
// NOTE: /shop.html is the in-game player shop studio (GWC). This is the
// real-world GridWorld Store (USD when live). They are separate on purpose.
import './store.css';
import './theme/accent.css';

interface Product {
  id: string;
  cat: 'plushies' | 'apparel' | 'accessories' | 'prints';
  name: string;
  desc: string;
  art: string;
  artAlt: string;
}

const CATS: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'ALL' },
  { id: 'plushies', label: 'PLUSHIES' },
  { id: 'apparel', label: 'APPAREL' },
  { id: 'accessories', label: 'ACCESSORIES' },
  { id: 'prints', label: 'PRINTS & ART' },
];

const PRODUCTS: Product[] = [
  // ---- Plushies: the five mascots ----
  {
    id: 'voltkit-plush', cat: 'plushies', name: 'Voltkit Plushie',
    desc: 'The flagship. Indigo fox with glowing circuit stripes and a lantern-bright tail-tip. Premium edition has a real LED tail that brightens with a squeeze — a living emotion lantern you can hug.',
    art: '/creatures/mascots/voltkit.jpg', artAlt: 'Voltkit mascot concept art',
  },
  {
    id: 'mossimp-plush', cat: 'plushies', name: 'Mossimp Plushie',
    desc: 'Perfectly round, impossibly soft. Leaf-sprout antennae and a clip-on golden flower — collect seasonal blooms. Basically already a plushie; we just made it official.',
    art: '/creatures/mascots/mossimp.jpg', artAlt: 'Mossimp mascot concept art',
  },
  {
    id: 'glimmerwing-plush', cat: 'plushies', name: 'Glimmerwing Plushie',
    desc: 'The mysterious one. Velvet violet body, four wings patterned with glowing star constellations. A living star map you can hold.',
    art: '/creatures/mascots/glimmerwing.jpg', artAlt: 'Glimmerwing mascot concept art',
  },
  {
    id: 'pebblor-plush', cat: 'plushies', name: 'Pebblor Plushie',
    desc: 'Round, warm, dependable. Amber crystal shell studded with a real chime inside — squeeze it and hear distant wind chimes. Built for naps.',
    art: '/creatures/mascots/pebblor.jpg', artAlt: 'Pebblor mascot concept art',
  },
  {
    id: 'nixie-plush', cat: 'plushies', name: 'Nixie Plushie',
    desc: 'Teal, bubbly, fearless. Feathery gills and a pearl-white belly. Water-safe edition doubles as a bath companion.',
    art: '/creatures/mascots/nixie.jpg', artAlt: 'Nixie mascot concept art',
  },
  // ---- Apparel: GridWorld-native, wearable art ----
  {
    id: 'first-light-jacket', cat: 'apparel', name: 'First Light Field Jacket',
    desc: 'Cut like it came from the world itself. Midnight fabric, tonal grid-stitch lining, compass-shield embroidery at the chest. Every seam considered — not a logo slapped on a blank.',
    art: '/brand/logo-icon-only.svg', artAlt: 'Grid World shield mark',
  },
  {
    id: 'voltkit-tee', cat: 'apparel', name: 'Voltkit Circuit Tee',
    desc: 'Heavyweight cotton, indigo dye. Voltkit\'s circuit-stripe pattern wraps the sleeves in reflective cyan ink that catches light at night. The tail-lantern glows on the back print.',
    art: '/creatures/mascots/voltkit.jpg', artAlt: 'Voltkit mascot concept art',
  },
  {
    id: 'mossimp-hoodie', cat: 'apparel', name: 'Mossimp Garden Hoodie',
    desc: 'Moss-green fleece with embroidered leaf-sprout drawstring tips and a golden-flower chest patch. The pocket lining is printed with micro-fern detail. Soft as the creature itself.',
    art: '/creatures/mascots/mossimp.jpg', artAlt: 'Mossimp mascot concept art',
  },
  {
    id: 'gridworld-cap', cat: 'apparel', name: 'GridWorld Shield Cap',
    desc: 'Six-panel, structured crown. The compass shield embroidered in metallic blue and gold thread — clean at any size, from street to stream.',
    art: '/brand/logo-icon-only.svg', artAlt: 'Grid World shield mark',
  },
  // ---- Accessories ----
  {
    id: 'mascot-pins', cat: 'accessories', name: 'Mascot Enamel Pin Set',
    desc: 'All five mascots as hard-enamel pins with polished gold plating. Voltkit\'s tail-tip uses glow enamel. Numbered backing cards with each creature\'s lore.',
    art: '/creatures/mascots/glimmerwing.jpg', artAlt: 'Glimmerwing mascot concept art',
  },
  {
    id: 'mascot-stickers', cat: 'accessories', name: 'Mascot Sticker Pack',
    desc: 'Twenty weatherproof vinyl stickers — chibi expressions, signature traits, and GridWorld iconography. Laptop, water bottle, and notebook ready.',
    art: '/creatures/mascots/nixie.jpg', artAlt: 'Nixie mascot concept art',
  },
  {
    id: 'gwc-coin', cat: 'accessories', name: 'GWC Collector Coin',
    desc: 'A struck-metal <span class="gwc-inline"><span class="gwc-symbol">G</span>WC</span> coin — the Grid World Currency mark in antique silver. The symbol of the in-world economy, made real. Display stand included.',
    art: '/brand/logo-mono-black.svg', artAlt: 'Grid World mark',
  },
  // ---- Prints & art ----
  {
    id: 'mascot-prints', cat: 'prints', name: 'Mascot Art Print Set',
    desc: 'All five mascot key-art pieces as museum-grade giclée prints. Photorealistic cinematic detail, archival inks, embossed © GridWorld seal.',
    art: '/creatures/mascots/pebblor.jpg', artAlt: 'Pebblor mascot concept art',
  },
  {
    id: 'logo-poster', cat: 'prints', name: 'GridWorld Shield Poster',
    desc: 'The full-color master lockup — compass shield, luminous globe, gold orbitals — printed large. The piece that started the world.',
    art: '/brand/logo-full-color.svg', artAlt: 'Grid World full color logo',
  },
  {
    id: 'voltkit-canvas', cat: 'prints', name: 'Voltkit Canvas — First Friend',
    desc: 'Gallery-wrapped canvas of Voltkit, the first friend every newcomer meets. Ready to hang, wired, and waiting for a wall that needs some light.',
    art: '/creatures/mascots/voltkit.jpg', artAlt: 'Voltkit mascot concept art',
  },
];

const NOTIFY_KEY = 'gridworld:store-notify';
const esc = (v: string) => v.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

function getNotify(): { email: string; products: string[]; ts: number } | null {
  try {
    const raw = localStorage.getItem(NOTIFY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function setNotify(email: string, productId?: string) {
  const cur = getNotify() || { email, products: [], ts: Date.now() };
  cur.email = email;
  if (productId && !cur.products.includes(productId)) cur.products.push(productId);
  cur.ts = Date.now();
  localStorage.setItem(NOTIFY_KEY, JSON.stringify(cur));
}

function validEmail(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());
}

let activeCat = 'all';

function productCard(p: Product): string {
  const noted = getNotify()?.products.includes(p.id);
  const catLabel = CATS.find(c => c.id === p.cat)?.label || p.cat.toUpperCase();
  return `
  <article class="product" data-id="${p.id}">
    <div class="product-art">
      <img src="${p.art}" alt="${esc(p.artAlt)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
      <span class="art-fallback" style="display:none">◇</span>
      <span class="soon-ribbon">COMING SOON</span>
    </div>
    <div class="product-body">
      <span class="product-cat">${catLabel}</span>
      <h3>${esc(p.name)}</h3>
      <p>${p.desc}</p>
      <div class="product-foot">
        <span class="price">TBD<small>USD · WHEN LIVE</small></span>
        <button class="notify-btn${noted ? ' done' : ''}" data-notify="${p.id}" ${noted ? 'disabled' : ''}>
          ${noted ? '✓ NOTED' : 'NOTIFY ME'}
        </button>
      </div>
    </div>
  </article>`;
}

function render(root: HTMLElement) {
  const filtered = activeCat === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.cat === activeCat);
  const noted = getNotify();
  root.innerHTML = `
  <div class="store-wrap">
    <section class="store-hero">
      <span class="store-dev-badge">IN ACTIVE DEVELOPMENT · NOT YET OPEN</span>
      <h1>GRID WORLD STORE</h1>
      <p>Real-world GridWorld goods — apparel cut like it came from the world itself,
      plushies that pass the hug test, and art worth framing. Every piece is designed
      with the same care as the world it comes from.</p>
    </section>
    <section class="store-distinction">
      <div><strong>This is the real-world GridWorld Store</strong> — physical goods, priced in USD when live.
      Looking for in-world items? The <a href="/marketplace.html" style="color:var(--accent-dim)">Marketplace</a>
      trades digital goods in <span class="gwc-inline"><span class="gwc-symbol">G</span>WC</span> (Grid World Currency).</div>
    </section>
    <nav class="store-cats" aria-label="Product categories">
      ${CATS.map(c => `<button data-cat="${c.id}" class="${c.id === activeCat ? 'active' : ''}">${c.label}</button>`).join('')}
    </nav>
    <main class="store-grid" aria-live="polite">
      ${filtered.map(productCard).join('')}
    </main>
    <section class="store-notify">
      <div class="panel">
        <h2>Be first through the door</h2>
        <p>The store isn't open yet — no checkout, no charges, no funny business.
        Leave your email and we'll tell you the moment each drop goes live.</p>
        <form class="notify-form" id="store-notify-form">
          <input type="email" id="store-email" placeholder="you@example.com" aria-label="Email address"
            value="${noted ? esc(noted.email) : ''}" ${noted ? 'disabled' : ''}>
          <button type="submit" ${noted ? 'disabled' : ''}>${noted ? '✓ YOU\'RE IN' : 'NOTIFY ME'}</button>
        </form>
        <div class="notify-msg" id="store-notify-msg">${noted ? '✓ You\'re on the list. We\'ll email you when the store opens.' : ''}</div>
      </div>
    </section>
    <footer class="store-honesty">
      GridWorld is in active development. Nothing here is for sale yet — prices are marked TBD
      and every product shows as Coming Soon until the store officially opens.<br>
      © GridWorld. All designs are original works of Paul Shaun Reis.
    </footer>
  </div>`;

  root.querySelectorAll<HTMLButtonElement>('[data-cat]').forEach(b => {
    b.addEventListener('click', () => {
      activeCat = b.dataset.cat!;
      render(root);
    });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-notify]').forEach(b => {
    b.addEventListener('click', () => {
      const pid = b.dataset.notify!;
      let email = getNotify()?.email || '';
      if (!email) {
        const input = root.querySelector<HTMLInputElement>('#store-email');
        input?.focus();
        input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const msg = root.querySelector('#store-notify-msg')!;
        msg.textContent = 'Enter your email below first — then tap NOTIFY ME on any product.';
        msg.className = 'notify-msg err';
        return;
      }
      setNotify(email, pid);
      render(root);
    });
  });

  root.querySelector<HTMLFormElement>('#store-notify-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const input = root.querySelector<HTMLInputElement>('#store-email')!;
    const msg = root.querySelector('#store-notify-msg')!;
    const email = input.value.trim();
    if (!validEmail(email)) {
      msg.textContent = 'That email doesn\'t look right — mind checking it?';
      msg.className = 'notify-msg err';
      return;
    }
    setNotify(email);
    msg.textContent = '✓ You\'re on the list. We\'ll email you when the store opens.';
    msg.className = 'notify-msg ok';
    render(root);
  });
}

const root = document.getElementById('store-root');
if (root) render(root);
