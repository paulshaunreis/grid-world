import './site.css';

const app = document.querySelector<HTMLDivElement>('#site')!;

const navItems = ['Home', 'Discover', 'Communities', 'Events', 'Marketplace', 'Creator Hub'];
const siteStyles = ['aurora', 'studio', 'terminal', 'garden'] as const;
type SiteStyle = typeof siteStyles[number];
const SITE_STYLE_KEY = 'grid-world:site-style';
let siteStyle = (localStorage.getItem(SITE_STYLE_KEY) as SiteStyle | null) ?? 'aurora';
document.documentElement.dataset.siteStyle = siteStyle;

const posts = [
  { avatar: 'A', name: 'Aurora', meta: 'First Light · 12m', text: 'First Light is online. The world is beginning to change with time, weather, and living systems.', tag: 'WORLD UPDATE', likes: 42, comments: 8 },
  { avatar: 'L', name: 'Link', meta: 'Creator Hub · 31m', text: 'Grid Script is designed to make creation powerful without handing creators unrestricted code execution.', tag: 'CREATION', likes: 27, comments: 5 },
  { avatar: 'R', name: 'Rey', meta: 'Community · 1h', text: 'What should we build next? A floating city, a giant forest, or something nobody has imagined yet?', tag: 'DISCUSSION', likes: 64, comments: 19 },
];

app.innerHTML = `
  <header class="site-header">
    <a class="brand" href="#home"><span class="brand-mark">◇</span><span>GRID WORLD</span></a>
    <nav>${navItems.map((item, i) => `<a href="#${item.toLowerCase().replaceAll(' ', '-')}" class="${i === 0 ? 'active' : ''}">${item}</a>`).join('')}</nav>
    <div class="header-actions">
      <button class="ghost style-trigger" id="style-trigger" type="button">STYLE</button>
      <a class="ghost" href="/profile.html">PROFILE</a>
      <a class="primary" href="/play.html">ENTER WORLD</a>
    </div>
  </header>
  <div class="style-panel" id="style-panel" aria-label="Website style selector">
    <div class="style-panel-title">SITE VISUAL LANGUAGE</div>
    <p>Try different Grid World surface styles. Your choice is stored locally.</p>
    <div class="style-options" id="style-options"></div>
  </div>

  <main>
    <section class="hero" id="home">

      <div class="hero-grid"></div>
      <div class="hero-copy">
        <div class="eyebrow">A PERSISTENT FRAMEWORK FOR WORLDS</div>
        <h1>One grid.<br><span>Infinite worlds.</span></h1>
        <p>Explore connected worlds, meet people, create experiences, and build places that keep evolving even when you're offline.</p>
        <div class="hero-actions">
          <a class="primary large" href="/play.html">ENTER GRID WORLD</a>
          <a class="secondary large" href="#discover">EXPLORE WORLDS</a>
        </div>
        <div class="hero-stats"><span><b>09</b> starter regions</span><span><b>∞</b> expandable worlds</span><span><b>24/7</b> persistent simulation</span></div>
      </div>
      <div class="hero-orb"><div class="orb-ring r1"></div><div class="orb-ring r2"></div><div class="orb-core">GRID<br><small>FIRST LIGHT</small></div></div>
    </section>

    <section class="visual-atlas" id="visual-system">
      <div class="atlas-heading">
        <div>
          <div class="section-label">GRID WORLD VISUAL SYSTEM</div>
          <h2>The interface is part<br><span>of the world.</span></h2>
          <p>Every surface has a job: discover, create, connect, inspect, trade, or enter. The visual language stays coherent from the public site into the 3D world.</p>
        </div>
        <div class="atlas-orbit"><i></i><b>GRID</b><small>LIVE SYSTEM</small></div>
      </div>
      <div class="atlas-grid">
        <article class="atlas-card atlas-world">
          <div class="atlas-scene"><span class="sun"></span><span class="mountain m1"></span><span class="mountain m2"></span><span class="water"></span><div class="scene-avatar"></div><div class="scene-hud">FIRST LIGHT · 128 TRAVELERS</div></div>
          <div class="atlas-copy"><span>01 · WORLD</span><h3>Living Regions</h3><p>World cards preview places as environments, not generic thumbnails.</p></div>
        </article>
        <article class="atlas-card atlas-profile">
          <div class="prism">
            <div class="prism-core">PROFILE<br><small>PRISM</small></div>
            <span class="axis a1">MIND</span><span class="axis a2">VITALITY</span><span class="axis a3">SOCIAL</span><span class="axis a4">SPIRIT</span><span class="axis a5">ADAPT</span><span class="axis a6">FORM</span>
          </div>
          <div class="atlas-copy"><span>02 · OBJECT PROFILE</span><h3>Everything Has a Story</h3><p>Players can inspect people, creatures, plants, places, and creations.</p></div>
        </article>
        <article class="atlas-card atlas-creator">
          <div class="creator-preview"><div class="cube">◇</div><div class="tool-list"><b>BUILD</b><span>Move</span><span>Rotate</span><span>Carve</span><span>Materials</span><span>Script</span></div><div class="tool-status">ADVANCED MODE · VOXEL 2.0</div></div>
          <div class="atlas-copy"><span>03 · CREATOR</span><h3>Primitive → Sculpture</h3><p>Simple tools stay approachable while advanced mode opens deeper creation.</p></div>
        </article>
        <article class="atlas-card atlas-wallet">
          <div class="wallet-panel"><div class="wallet-balance"><small>GRID WALLET</small><strong>12,480 <em>G</em></strong><span>+240 pending</span></div><div class="wallet-actions"><i>Exchange</i><i>Inventory</i><i>Trade</i></div><div class="wallet-chart"><b></b><b></b><b></b><b></b><b></b><b></b></div></div>
          <div class="atlas-copy"><span>04 · ECONOMY</span><h3>Stable, Visible Systems</h3><p>Wallet, inventory, exchange, and ownership share one information language.</p></div>
        </article>
      </div>
    </section>

    <section class="social-layout" id="discover">
      <aside class="side-card profile-card">
        <div class="profile-avatar">G</div><h3>Your Grid Identity</h3><p>Traveler · Creator · Explorer</p>
        <div class="side-links"><a href="/profile.html">Profile Studio</a><a href="#friends">Friends</a><a href="#messages">Messages</a><a href="#notifications">Notifications</a></div>
      </aside>

      <section class="feed">
        <div class="composer">
          <div class="mini-avatar">G</div><input placeholder="What's happening in your Grid?" /><button>POST</button>
          <div class="composer-tools"><span>✦ Experience</span><span>▧ Image</span><span>◉ Event</span><span>⌁ Location</span></div>
        </div>
        ${posts.map(post => `
          <article class="post">
            <div class="post-head"><div class="mini-avatar avatar-${post.avatar}">${post.avatar}</div><div><strong>${post.name}</strong><small>${post.meta}</small></div><button class="more">•••</button></div>
            <div class="post-tag">${post.tag}</div><p>${post.text}</p>
            <div class="post-actions"><button>♡ ${post.likes}</button><button>◇ ${post.comments} comments</button><button>↗ Share</button></div>
          </article>
        `).join('')}
      </section>

      <aside class="right-rail">
        <div class="side-card"><div class="card-title">LIVE IN THE GRID</div><div class="live-row"><span class="dot"></span> First Light <b>128</b></div><div class="live-row"><span class="dot"></span> Neon District <b>74</b></div><div class="live-row"><span class="dot"></span> Verdant Arc <b>51</b></div><a class="card-link" href="#worlds">View all worlds →</a></div>
        <div class="side-card"><div class="card-title">UPCOMING EVENTS</div><div class="event"><b>NEON NIGHTS</b><small>Tonight · Neon District</small></div><div class="event"><b>CREATOR CAMP</b><small>Saturday · Virtual + IRL</small></div><a class="card-link" href="#events">Explore events →</a></div>
      </aside>
    </section>

    <section class="system-map" id="creator-hub">
      <div class="section-label">ONE PLATFORM · MANY SURFACES</div>
      <h2>Each area gets<br><span>its own place.</span></h2>
      <div class="system-map-grid">
        <a href="#discover"><strong>01</strong><span>Discover</span><small>Worlds · people · communities</small></a>
        <a href="#worlds"><strong>02</strong><span>Worlds</span><small>Regions · biomes · landmarks</small></a>
        <a href="#creator-hub"><strong>03</strong><span>Creator Hub</span><small>Build · sculpt · script · publish</small></a>
        <a href="#events"><strong>04</strong><span>Events</span><small>Concerts · classes · gatherings</small></a>
        <a href="/profile.html"><strong>05</strong><span>Identity</span><small>Profile · avatar · relationships</small></a>
        <a href="/play.html"><strong>06</strong><span>Enter World</span><small>3D · HUD · inventory · map</small></a>
      </div>
    </section>

    <section class="platform" id="communities">
      <div class="section-label">THE SOCIAL LAYER</div><h2>More than a world.<br><span>A place to belong.</span></h2>
      <div class="feature-grid">
        <article><div class="feature-icon">◎</div><h3>Grid Social</h3><p>Profiles, friends, feeds, messages, reactions, sharing and presence—connected to the same identity you use in-world.</p></article>
        <article><div class="feature-icon">◇</div><h3>Communities & Forums</h3><p>Every world, creator, interest and community can have a home for conversations, guides, ideas and collaboration.</p></article>
        <article><div class="feature-icon">⌁</div><h3>Grid Connect</h3><p>Bring virtual and real-world experiences together with events, meetups, classes, concerts and hybrid gatherings.</p></article>
        <article><div class="feature-icon">▣</div><h3>Creator Economy</h3><p>Create worlds, objects and experiences. Discover creations through the web or walk into them in 3D.</p></article>
      </div>
    </section>

    <section class="marketplace-section" id="marketplace">
      <div class="section-label">GRID MARKETPLACE</div>
      <h2>Things made<br><span>by the Grid.</span></h2>
      <div class="market-grid">
        <article><div class="market-art prism-art">◇</div><small>OBJECT</small><h3>Profile Prism Kit</h3><p>Identity components for creators.</p><button data-market-action="Profile Prism Kit" type="button">VIEW OBJECT</button></article>
        <article><div class="market-art voxel-art">▦</div><small>BUILD</small><h3>Voxel Workshop</h3><p>Primitive-to-sculpt creator tools.</p><button data-market-action="Voxel Workshop" type="button">VIEW OBJECT</button></article>
        <article><div class="market-art stage-art">✦</div><small>EVENT</small><h3>Stage Light Set</h3><p>Lighting primitives for live worlds.</p><button data-market-action="Stage Light Set" type="button">VIEW OBJECT</button></article>
      </div>
    </section>

    <section class="social-tools" id="social-tools">
      <div class="section-label">CONNECTED IDENTITY</div>
      <h2>Stay connected<br><span>between worlds.</span></h2>
      <div class="social-tools-grid">
        <article id="friends"><b>FRIENDS</b><h3>Traveler Network</h3><p>Keep a persistent friend list across web, desktop, and mobile.</p><button data-social="friends" type="button">OPEN FRIENDS</button></article>
        <article id="messages"><b>MESSAGES</b><h3>Cross-device chat</h3><p>Continue conversations when you leave the 3D world.</p><button data-social="messages" type="button">OPEN MESSAGES</button></article>
        <article id="notifications"><b>NOTIFICATIONS</b><h3>World signals</h3><p>Events, creator updates, invitations, and discovery alerts.</p><button data-social="notifications" type="button">OPEN NOTIFICATIONS</button></article>
      </div>
    </section>

    <section class="worlds" id="worlds">
      <div><div class="section-label">FIRST FRONTIER</div><h2>Start somewhere.<br><span>Go anywhere.</span></h2></div>
      <div class="world-cards">
        <div class="world-card first"><div><small>01</small><h3>FIRST LIGHT</h3><p>The beginning of the Grid.</p></div><a href="/play.html">ENTER →</a></div>
        <div class="world-card neon"><div><small>02</small><h3>NEON DISTRICT</h3><p>City lights. Social energy.</p></div><a href="#discover">DISCOVER →</a></div>
        <div class="world-card verdant"><div><small>03</small><h3>VERDANT ARC</h3><p>Living systems in motion.</p></div><a href="#discover">DISCOVER →</a></div>
      </div>
    </section>

    <section class="irllayer" id="events"><div><div class="section-label">GRID CONNECT</div><h2>Virtual or IRL.<br><span>Experience it together.</span></h2><p>Events can exist in the physical world, inside Grid World, or across both. Users choose what they share and where they participate.</p><a class="secondary large" href="#events">BROWSE EVENTS</a></div><div class="event-map"><span>GRID</span><i></i><b>IRL</b></div></section>
  </main>

  <section class="legal-strip" id="terms">
    <div><span>TERMS</span><p>Grid World surfaces are prototypes. Account, economy, creator, and community rules will be published as each service becomes operational.</p></div>
    <div id="privacy"><span>PRIVACY</span><p>Location-aware features will be opt-in. Mobile location access will be permissioned and minimized to the experience that needs it.</p></div>
    <div id="safety"><span>SAFETY</span><p>Moderation, reporting, blocking, creator permissions, and age-appropriate defaults are platform capabilities—not afterthoughts.</p></div>
    <div id="status"><span>STATUS</span><p>Prototype services: web UI, First Light 3D, local profile persistence, and optional realtime presence.</p></div>
  </section>
  <footer><div class="brand"><span class="brand-mark">◇</span><span>GRID WORLD</span></div><p>A framework for worlds, communities, and experiences.</p><div><a href="#terms">Terms</a><a href="#privacy">Privacy</a><a href="#safety">Safety</a><a href="#status">Status</a></div></footer>
  <div class="site-toast" id="site-toast" role="status" aria-live="polite"></div>
`;

function toast(message: string) {
  const element = document.querySelector<HTMLDivElement>('#site-toast');
  if (!element) return;
  element.textContent = message;
  element.classList.add('show');
  window.setTimeout(() => element.classList.remove('show'), 2400);
}

const styleOptions = document.querySelector<HTMLDivElement>('#style-options');
if (styleOptions) {
  styleOptions.innerHTML = siteStyles.map(style => {
    const title = style === 'aurora' ? 'AURORA' : style === 'studio' ? 'STUDIO' : style === 'terminal' ? 'TERMINAL' : 'GARDEN';
    const subtitle = style === 'aurora' ? 'luminous / cinematic' : style === 'studio' ? 'editorial / architectural' : style === 'terminal' ? 'technical / compact' : 'organic / exploratory';
    return '<button type="button" data-site-style="' + style + '" class="' + (style === siteStyle ? 'selected' : '') + '"><b>' + title + '</b><small>' + subtitle + '</small></button>';
  }).join('');
}

document.querySelectorAll<HTMLAnchorElement>('nav a').forEach(link => link.addEventListener('click', () => {
  document.querySelectorAll('nav a').forEach(item => item.classList.remove('active'));
  link.classList.add('active');
}));

document.querySelector('#style-trigger')?.addEventListener('click', () => {
  document.querySelector('#style-panel')?.classList.toggle('open');
});

document.querySelectorAll<HTMLButtonElement>('[data-site-style]').forEach(button => button.addEventListener('click', () => {
  siteStyle = (button.dataset.siteStyle as SiteStyle) ?? 'aurora';
  document.documentElement.dataset.siteStyle = siteStyle;
  localStorage.setItem(SITE_STYLE_KEY, siteStyle);
  document.querySelectorAll('[data-site-style]').forEach(item => item.classList.toggle('selected', item === button));
  toast('Website style changed to ' + siteStyle.toUpperCase());
}));

const composerInput = document.querySelector<HTMLInputElement>('.composer input');
const composerButton = document.querySelector<HTMLButtonElement>('.composer button');
const feed = document.querySelector<HTMLElement>('.feed');

composerButton?.addEventListener('click', () => {
  const value = composerInput?.value.trim();
  if (!value) {
    composerInput?.focus();
    toast('Write something for your Grid first.');
    return;
  }
  const article = document.createElement('article');
  article.className = 'post post-new';
  article.innerHTML = '<div class="post-head"><div class="mini-avatar">G</div><div><strong>Traveler</strong><small>Just now · Grid Social</small></div><button class="more" type="button">•••</button></div><div class="post-tag">NEW TRANSMISSION</div><p></p><div class="post-actions"><button type="button" data-action="like">♡ 0</button><button type="button" data-action="comment">◇ 0 comments</button><button type="button" data-action="share">↗ Share</button></div>';
  article.querySelector('p')!.textContent = value;
  feed?.insertBefore(article, feed?.querySelector('.post') ?? null);
  if (composerInput) composerInput.value = '';
  toast('Posted to Grid Social.');
});

document.addEventListener('click', event => {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>('.post-actions button');
  if (!target) return;
  const action = target.dataset.action ?? (target.textContent?.includes('♡') ? 'like' : target.textContent?.includes('comments') ? 'comment' : 'share');
  if (action === 'like') {
    const count = Number(target.textContent?.match(/\d+/)?.[0] ?? 0) + 1;
    target.textContent = '♥ ' + count;
    toast('Reaction recorded.');
  } else if (action === 'comment') {
    const count = Number(target.textContent?.match(/\d+/)?.[0] ?? 0) + 1;
    target.textContent = '◇ ' + count + ' comments';
    toast('Comment thread opened.');
  } else {
    navigator.clipboard?.writeText(window.location.href).then(() => toast('Grid World link copied.')).catch(() => toast('Share link ready.'));
  }
});

document.querySelectorAll<HTMLButtonElement>('.more').forEach(button => button.addEventListener('click', () => toast('Post menu: save, mute, report — moderation surface is next.')));
document.querySelectorAll<HTMLButtonElement>('[data-market-action]').forEach(button => button.addEventListener('click', () => toast((button.dataset.marketAction ?? 'Object') + ' opened in Marketplace.')));
document.querySelectorAll<HTMLButtonElement>('[data-social]').forEach(button => button.addEventListener('click', () => toast((button.dataset.social ?? 'social').toUpperCase() + ' surface opened.')));
document.querySelector('#login')?.addEventListener('click', () => toast('Grid Identity sign-in is coming next. Your in-world identity foundation is already in place.'));
