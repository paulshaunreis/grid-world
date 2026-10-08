/* Grid World concept homepage — separate page, does not touch index/site.ts.
   All imagery is generated concept art; page is labeled accordingly. */
import './homepage-redesign.css';

const WORLDS = [
  { name: 'AZURE SKIES', img: '/home/world-azure-skies.jpg' },
  { name: 'CYBER DISTRICT', img: '/home/world-cyber-district.jpg' },
  { name: 'THE VERDANT REACH', img: '/home/world-verdant-reach.jpg' },
  { name: 'THE LOST RUINS', img: '/home/world-lost-ruins.jpg' },
  { name: 'VOID FRONTIER', img: '/home/world-void-frontier.jpg' },
  { name: 'ICE CAULDRON', img: '/home/world-ice-cauldron.jpg' },
];

const ITEMS: Array<[string, string]> = [
  ['Crystal Shard', '/home/items/item-01.jpg'],
  ['Aurora Crystal', '/home/items/item-02.jpg'],
  ['Sun Gem', '/home/items/item-03.jpg'],
  ['Blood Crystal', '/home/items/item-04.jpg'],
  ['Steel Sword', '/home/items/item-05.jpg'],
  ['Gold Shield', '/home/items/item-06.jpg'],
  ['Iron Helm', '/home/items/item-07.jpg'],
  ['Traveler Boots', '/home/items/item-08.jpg'],
  ['Health Potion', '/home/items/item-09.jpg'],
  ['Mana Potion', '/home/items/item-10.jpg'],
  ['Coin Stack', '/home/items/item-11.jpg'],
  ['Ancient Scroll', '/home/items/item-12.jpg'],
  ['Emerald Ring', '/home/items/item-13.jpg'],
  ['Ruby Amulet', '/home/items/item-14.jpg'],
  ['Hunter Bow', '/home/items/item-15.jpg'],
];

const NAV: Array<[string, string]> = [
  ['HOME', '/home.html'],
  ['WORLDS', '/'],
  ['COMMUNITY', '/social.html'],
  ['MARKETPLACE', '/marketplace.html'],
  ['GAMES', '/games.html'],
  ['VAULT', '/economics.html'],
  ['SUPPORT', '/docs.html'],
];

function toast(msg: string) {
  let t = document.querySelector<HTMLDivElement>('.hw-toast');
  if (!t) { t = document.createElement('div'); t.className = 'hw-toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  window.setTimeout(() => t!.classList.remove('show'), 2600);
}

const app = document.querySelector<HTMLDivElement>('#home-root')!;

app.innerHTML = `
<nav class="hw-nav" aria-label="Primary">
  <a class="hw-logo" href="/home.html"><img src="/grid-world-logo.svg" alt="Grid World logo">GRID WORLD</a>
  <div class="hw-links">${NAV.map(([l, h], i) => `<a href="${h}" class="${i === 0 ? 'active' : ''}">${l}</a>`).join('')}</div>
  <a class="hw-search" href="/directory.html" aria-label="Search" title="Search">⌕</a>
  <a class="hw-join" href="/join.html">JOIN</a>
</nav>

<main class="hw-main">
  <!-- HERO -->
  <section class="hw-panel hw-hero" aria-label="Welcome">
    <span class="badge-concept">CONCEPT ART</span>
    <div class="hw-hero-bg"><img src="/home/hero-worlds.jpg" alt="Concept art: floating islands, waterfalls and a ringed planet over a vast fantasy world"></div>
    <div class="hw-hero-shade"></div>
    <div class="hw-story">Your World.<br>Your Story.</div>
    <div class="hw-hero-inner">
      <h1>MORE WORLDS.<br><span class="cy">MORE POSSIBILITIES.</span></h1>
      <p>Grid World is a living, expanding universe of endless worlds, people, and experiences.</p>
      <div class="hw-cta">
        <a class="btn-primary" href="/join.html">JOIN NOW</a>
        <button class="btn-ghost" id="hw-trailer">▶&nbsp; WATCH TRAILER</button>
      </div>
    </div>
    <div class="hw-features">
      <div class="hw-feature"><span class="fi">∞</span><span>NO LIMIT<br>TO WORLDS</span></div>
      <div class="hw-feature"><span class="fi">◉</span><span>EXPLORE<br>TOGETHER</span></div>
      <div class="hw-feature"><span class="fi">⚒</span><span>CREATE &amp;<br>BUILD</span></div>
      <div class="hw-feature"><span class="fi">🛡</span><span>SAFE &amp; SECURE<br>COMMUNITY</span></div>
    </div>
  </section>

  <!-- EXPLORE WORLDS -->
  <aside class="hw-panel hw-explore" aria-label="Explore worlds">
    <div class="hw-panel-head">EXPLORE DIVERSE WORLDS <span class="chev">›</span></div>
    <div class="hw-worlds">
      ${WORLDS.map(w => `<div class="hw-world" data-world="${w.name}" title="${w.name} — concept art"><img src="${w.img}" alt="${w.name} concept art" loading="lazy"><span>${w.name}</span></div>`).join('')}
    </div>
  </aside>

  <!-- IN-WORLD EXPERIENCE -->
  <section class="hw-panel hw-inworld" aria-label="In-world experience">
    <div class="hw-panel-head">IN-WORLD EXPERIENCE</div>
    <div class="shot">
      <span class="badge-concept">CONCEPT ART</span>
      <img src="/home/inworld-experience.jpg" alt="Concept art: explorer overlooking a fantasy city of waterfalls">
      <div class="hw-hud tl"><img class="ava" src="/home/avatar-aurora.jpg" alt="Aurora avatar"><span>Aurora <span class="lvl">Lv 42</span></span></div>
      <div class="hw-chat">
        <div>✦ You have entered: Crystal Falls</div>
        <div>◉ System: Welcome to Grid World!</div>
        <div>✦ Aurora: Beautiful view today!</div>
        <input type="text" placeholder="Say something…" aria-label="Chat (concept)">
      </div>
    </div>
  </section>

  <!-- PROFILE -->
  <section class="hw-panel hw-profile" aria-label="Sample profile">
    <div class="hw-panel-head">YOUR PROFILE</div>
    <div class="hw-prof-body">
      <div class="hw-prof-ava"><img src="/home/avatar-aurora.jpg" alt="Aurora profile portrait (concept art)"></div>
      <div class="hw-prof-info">
        <h3>Aurora</h3>
        <div class="handle">@iaurora.exe</div>
        <div class="hw-online">Online</div>
        <div class="hw-levelrow">
          <div class="hw-levelbadge">42</div>
          <div class="hw-xpwrap"><small>Level 42</small><div class="hw-xpbar"><i></i></div><div class="hw-xpnum">12,840 / 20,000 XP</div></div>
        </div>
      </div>
    </div>
    <div style="padding:0 18px"><p class="hw-bio">Cosmic navigator. Thoughtful guide.<br>Always here to help.</p></div>
    <div class="hw-stats">
      <div class="hw-stat"><span class="ic">👥</span><b>243</b><small>Friends</small></div>
      <div class="hw-stat"><span class="ic">◉</span><b>1.2k</b><small>Followers</small></div>
      <div class="hw-stat"><span class="ic">▣</span><b>12</b><small>Worlds</small></div>
      <div class="hw-stat"><span class="ic">★</span><b>Explorer</b><small>Rank</small></div>
    </div>
    <div class="hw-tabs">
      <button class="active">STATS</button><button data-soon>ACHIEVEMENTS</button><button data-soon>MEDIA</button><button data-soon>SETTINGS</button>
    </div>
  </section>

  <!-- INVENTORY -->
  <section class="hw-panel hw-inv" aria-label="Inventory and marketplace">
    <div class="hw-panel-head">INVENTORY &amp; MARKETPLACE <span class="chev">›</span></div>
    <div class="hw-inv-body">
      <div class="hw-inv-nav">
        <button class="active"><span class="nic">▣</span>Inventory</button>
        <button data-soon><span class="nic">◉</span>Map</button>
        <button data-soon><span class="nic">✦</span>Quests</button>
        <button data-soon><span class="nic">🏆</span>Achievements</button>
        <button data-soon><span class="nic">⚙</span>Settings</button>
      </div>
      <div class="hw-inv-grid">
        ${ITEMS.map(([n, src], i) => `<div class="hw-slot${i === 1 ? ' hero-slot' : ''}" title="${n} (concept)"><img src="${src}" alt="${n} icon" loading="lazy"></div>`).join('')}
      </div>
      <div class="hw-feat">
        <img src="/home/items/item-02.jpg" alt="Aurora Crystal">
        <h4>Aurora Crystal</h4>
        <div class="rare">Rare · Crystal</div>
        <p>A rare crystal found in high altitude regions. Used for crafting and energy cells.</p>
        <div class="val">1,250</div>
      </div>
    </div>
  </section>

  <!-- BUILD -->
  <section class="hw-panel hw-build" aria-label="Build and create">
    <div class="hw-panel-head">BUILD &amp; CREATE</div>
    <div class="hw-cardimg"><span class="badge-concept">CONCEPT ART</span><img src="/home/build-create.jpg" alt="Concept art: futuristic creator dome" loading="lazy"></div>
    <div class="hw-cardbody">
      <div class="tag">Shape your world. No limits.</div>
      <div class="hw-catlist">
        <button data-soon><span class="cube">▣</span>Structures</button>
        <button data-soon><span class="cube">◈</span>Props</button>
        <button data-soon><span class="cube">▲</span>Terrain</button>
        <button data-soon><span class="cube">⬢</span>Materials</button>
        <button data-soon><span class="cube">⚒</span>Tools</button>
      </div>
    </div>
  </section>

  <!-- PLAY -->
  <section class="hw-panel hw-play" aria-label="Play and connect">
    <div class="hw-panel-head">PLAY &amp; CONNECT</div>
    <div class="hw-cardimg"><span class="badge-concept">CONCEPT ART</span><img src="/home/play-connect.jpg" alt="Concept art: rider on a winged creature over floating islands" loading="lazy"></div>
    <div class="hw-cardbody">
      <div class="tag">Adventure is better together.</div>
      <ul class="hw-checklist">
        <li>Quests</li><li>Missions</li><li>Events</li><li>Groups</li><li>Guilds</li><li>Teams</li>
      </ul>
    </div>
  </section>

  <!-- STAY CONNECTED -->
  <section class="hw-panel hw-stay" aria-label="Stay connected">
    <div class="hw-panel-head">STAY CONNECTED</div>
    <div class="hw-cardimg"><span class="badge-concept">CONCEPT ART</span><img src="/home/stay-connected.jpg" alt="Concept art: phone and desktop showing Grid World" loading="lazy"></div>
    <div class="hw-cardbody"><div class="tag">On any device. Anywhere.</div></div>
  </section>

  <!-- SAFE -->
  <section class="hw-panel hw-safe" aria-label="Safe and secure">
    <div class="hw-panel-head">SAFE &amp; SECURE</div>
    <div class="hw-cardbody">
      <ul class="hw-checklist">
        <li>Content Rating<small>All-ages spaces by default</small></li>
        <li>Privacy Controls<small>You choose what you share</small></li>
        <li>AI Moderation<small>Always-on community safety</small></li>
        <li>Audit Logs<small>Transparent record of actions</small></li>
        <li>Encrypted Data<small>Protected in transit &amp; at rest</small></li>
      </ul>
      <div class="tag" style="margin-top:12px">Your safety. Our priority.</div>
    </div>
  </section>
</main>

<footer class="hw-foot">
  <a class="hw-logo" href="/home.html"><img src="/grid-world-logo.svg" alt="Grid World logo">GRID WORLD</a>
  <nav><a href="/">EXPLORE</a><span>/</span><a href="/grid-world-studio.html">CREATE</a><span>/</span><a href="/social.html">CONNECT</a><span>/</span><a href="/join.html">BELONG</a></nav>
  <div class="hw-socials">
    <a href="#" title="Discord" data-soon>◈</a><a href="#" title="YouTube" data-soon>▶</a><a href="#" title="Instagram" data-soon>◉</a><a href="#" title="X" data-soon>✕</a><a href="#" title="Web" data-soon>⌕</a>
  </div>
  <div class="hw-tagline">A UNIVERSE BUILT TOGETHER.</div>
</footer>
<div class="hw-devnote"><b>IN ACTIVE DEVELOPMENT</b> — all imagery on this page is concept art. Grid World is not yet live or playable.</div>
`;

document.getElementById('hw-trailer')?.addEventListener('click', () =>
  toast('Trailer is in production — coming soon.'));
document.querySelectorAll('[data-soon]').forEach(el =>
  el.addEventListener('click', (e) => { e.preventDefault(); toast('In active development — coming soon.'); }));
document.querySelectorAll('.hw-world').forEach(el =>
  el.addEventListener('click', () => toast(`${(el as HTMLElement).dataset.world} — concept art, world in development.`)));
document.querySelectorAll('.hw-tabs button').forEach(btn =>
  btn.addEventListener('click', () => {
    document.querySelectorAll('.hw-tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (btn.hasAttribute('data-soon')) toast('In active development — coming soon.');
  }));
