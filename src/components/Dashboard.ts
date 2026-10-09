/* ============================================================
   GridWorld Dashboard — Paul 2026-10-09.
   AAA game-launcher dashboard panels matching the concept art.
   Grayscale-first: surfaces from --gw-*, ALL color from --accent.
   ============================================================ */

const WORLDS = [
  { name: 'AZURE SKIES', img: '/home/world-azure-skies.jpg', href: '/play.html#azure-skies' },
  { name: 'CYBER DISTRICT', img: '/home/world-cyber-district.jpg', href: '/play.html#cyber-district' },
  { name: 'THE VERDANT REACH', img: '/home/world-verdant-reach.jpg', href: '/play.html#verdant-reach' },
  { name: 'THE LOST RUINS', img: '/home/world-lost-ruins.jpg', href: '/play.html#lost-ruins' },
  { name: 'VOID FRONTIER', img: '/home/world-void-frontier.jpg', href: '/play.html#void-frontier' },
  { name: 'ICE CAULDRON', img: '/home/world-ice-cauldron.jpg', href: '/play.html#ice-cauldron' },
];

const MARKET_ITEMS = [
  { img: '/home/items/item-01.jpg', name: 'Aurora Crystal' },
  { img: '/home/items/item-02.jpg', name: 'Void Shard' },
  { img: '/home/items/item-03.jpg', name: 'Ember Blade' },
  { img: '/home/items/item-04.jpg', name: 'Frost Core' },
  { img: '/home/items/item-05.jpg', name: 'Storm Helm' },
  { img: '/home/items/item-06.jpg', name: 'Golem Plate' },
  { img: '/home/items/item-07.jpg', name: 'Solar Coin' },
  { img: '/home/items/item-08.jpg', name: 'Tide Pearl' },
  { img: '/home/items/item-09.jpg', name: 'Rift Dagger' },
  { img: '/home/items/item-10.jpg', name: 'Bloom Seed' },
  { img: '/home/items/item-11.jpg', name: 'Ironclad Shield' },
  { img: '/home/items/item-12.jpg', name: 'Prism Lens' },
];

export function renderDashboard(): string {
  return `
  <!-- ============ DASHBOARD : concept-art panel composition ============ -->
  <section class="gw-dashboard" id="dashboard" aria-label="Grid World dashboard">

    <!-- ROW 1 : hero + explore worlds -->
    <div class="dash-row dash-row-hero">
      <article class="dash-panel dash-hero">
        <img class="dash-hero-bg" src="/home/hero-worlds.jpg" alt="Grid World vista — floating islands, waterfalls, and a shining city" loading="eager">
        <div class="dash-hero-copy">
          <h2>MORE WORLDS.<br><span>MORE POSSIBILITIES.</span></h2>
          <p>Grid World is a living, expanding universe of endless worlds, people, and experiences.</p>
          <div class="dash-hero-actions">
            <a class="dash-btn dash-btn-primary" href="/join.html">JOIN NOW</a>
            <a class="dash-btn dash-btn-ghost" href="/play.html">▶&nbsp; WATCH TRAILER</a>
          </div>
          <div class="dash-hero-badges">
            <span><i>∞</i> NO LIMIT<br>TO WORLDS</span>
            <span><i>◉</i> EXPLORE<br>TOGETHER</span>
            <span><i>✦</i> CREATE<br>&amp; BUILD</span>
            <span><i>✓</i> SAFE &amp; SECURE<br>COMMUNITY</span>
          </div>
        </div>
        <div class="dash-hero-tag">Your World.<br>Your Story.</div>
      </article>

      <article class="dash-panel dash-worlds">
        <a class="dash-panel-title" href="/play.html">EXPLORE DIVERSE WORLDS <span>›</span></a>
        <div class="dash-worlds-grid">
          ${WORLDS.map(w => `
            <a class="dash-world-card" href="${w.href}">
              <img src="${w.img}" alt="${w.name} — Grid World region" loading="lazy">
              <span>${w.name}</span>
            </a>`).join('')}
        </div>
      </article>
    </div>

    <!-- ROW 2 : in-world / profile / inventory -->
    <div class="dash-row dash-row-trio">
      <article class="dash-panel dash-inworld">
        <div class="dash-panel-title">IN-WORLD EXPERIENCE</div>
        <div class="dash-inworld-screen">
          <img src="/home/inworld-experience.jpg" alt="In-world Grid World experience — avatar overlooking a living city" loading="lazy">
          <div class="dash-inworld-hud">
            <img class="dash-mini-avatar" src="/home/avatar-aurora.jpg" alt="Aurora avatar">
            <div><b>Aurora</b><small>Lv 42</small><div class="dash-xp"><i style="width:62%"></i></div></div>
          </div>
          <div class="dash-chat">
            <p><b>You</b> entered: Crystal Falls</p>
            <p><b>System:</b> Welcome to Grid World!</p>
            <p><b>Aurora:</b> Beautiful view today ✨</p>
            <p><b>Ranger:</b> Anyone up for a quest?</p>
          </div>
        </div>
      </article>

      <article class="dash-panel dash-profile">
        <div class="dash-panel-title">YOUR PROFILE</div>
        <div class="dash-profile-head">
          <img src="/home/avatar-aurora.jpg" alt="Aurora — Grid World profile">
          <div>
            <b>Aurora</b><small>@aurora.exe</small>
            <span class="dash-online">● Online</span>
          </div>
        </div>
        <div class="dash-level"><b>42</b><div><small>Level 42</small><div class="dash-xp"><i style="width:62%"></i></div><small>12,840 / 20,000 XP</small></div></div>
        <p class="dash-bio">Cosmic navigator. Thoughtful guide.<br>Always here to help.</p>
        <div class="dash-stats">
          <span><b>243</b><small>Friends</small></span>
          <span><b>1.2k</b><small>Followers</small></span>
          <span><b>12</b><small>Worlds</small></span>
          <span><b>★</b><small>Explorer</small></span>
        </div>
        <div class="dash-tabs"><span class="on">STATS</span><span>ACHIEVEMENTS</span><span>MEDIA</span><span>SETTINGS</span></div>
      </article>

      <article class="dash-panel dash-inventory">
        <a class="dash-panel-title" href="/marketplace.html">INVENTORY &amp; MARKETPLACE <span>›</span></a>
        <div class="dash-inv-body">
          <div class="dash-inv-tabs"><span class="on">◈ Inventory</span><span>⚑ Map</span><span>✓ Quests</span><span>★ Achievements</span><span>⚙ Settings</span></div>
          <div class="dash-inv-grid">
            ${MARKET_ITEMS.map(m => `<a href="/marketplace.html" title="${m.name}"><img src="${m.img}" alt="${m.name}" loading="lazy"></a>`).join('')}
          </div>
          <div class="dash-featured">
            <img src="/home/items/item-01.jpg" alt="Aurora Crystal">
            <div><b>Aurora Crystal</b><small>Rare · Crystal</small><p>A rare crystal found in high altitude regions. Used for crafting and energy cells.</p><span class="dash-price">Value: <b>◉ 1,250</b></span></div>
          </div>
        </div>
      </article>
    </div>

    <!-- ROW 3 : build / play / connected / safe -->
    <div class="dash-row dash-row-quad">
      <article class="dash-panel dash-build">
        <div class="dash-panel-title">BUILD &amp; CREATE</div>
        <img src="/home/build-create.jpg" alt="Futuristic Grid World architecture" loading="lazy">
        <div class="dash-build-tools">
          <span class="on">▤ Structures</span><span>◈ Props</span><span>▲ Terrain</span><span>◉ Materials</span><span>✦ Tools</span>
        </div>
        <small>Shape your world. No limits.</small>
      </article>

      <article class="dash-panel dash-play">
        <div class="dash-panel-title">PLAY &amp; CONNECT</div>
        <img src="/home/play-connect.jpg" alt="Rider on a winged creature over Grid World" loading="lazy">
        <ul class="dash-play-menu">
          <li><a href="/games.html">◎ Quests</a></li>
          <li><a href="/games.html">◈ Missions</a></li>
          <li><a href="/games.html">✦ Events</a></li>
          <li><a href="/social.html">◉ Groups</a></li>
          <li><a href="/social.html">⬢ Guilds</a></li>
          <li><a href="/social.html">✚ Teams</a></li>
        </ul>
        <small>Adventure is better together.</small>
      </article>

      <article class="dash-panel dash-connected">
        <div class="dash-panel-title">STAY CONNECTED</div>
        <img src="/home/stay-connected.jpg" alt="Grid World on phone and desktop" loading="lazy">
        <small>On any device. Anywhere.</small>
      </article>

      <article class="dash-panel dash-safe">
        <div class="dash-panel-title">SAFE &amp; SECURE</div>
        <img src="/home/safe-secure.jpg" alt="Protective energy shield over a Grid World city" loading="lazy">
        <ul class="dash-safe-list">
          <li>› Content Rating</li>
          <li>› Privacy Controls</li>
          <li>› AI Moderation</li>
          <li>› Audit Logs</li>
          <li>› Encrypted Data</li>
        </ul>
        <small>Your safety. Our priority.</small>
      </article>
    </div>

    <!-- FOOTER -->
    <footer class="dash-footer">
      <a class="dash-footer-logo" href="/">◉ GRID WORLD</a>
      <nav><a href="/play.html">EXPLORE</a><i>/</i><a href="/play.html">CREATE</a><i>/</i><a href="/social.html">CONNECT</a><i>/</i><a href="/join.html">BELONG</a></nav>
      <div class="dash-social">
        <a href="https://discord.com" aria-label="Discord" title="Discord">◈</a>
        <a href="https://youtube.com" aria-label="YouTube" title="YouTube">▶</a>
        <a href="https://instagram.com" aria-label="Instagram" title="Instagram">◎</a>
        <a href="https://x.com" aria-label="X" title="X">✕</a>
        <a href="/" aria-label="Website" title="Website">🌐</a>
      </div>
      <small>A UNIVERSE BUILT TOGETHER.</small>
    </footer>
  </section>`;
}
