// GridWorld page hero injector — Paul's direction 2026-10-08.
// Gives every content page a rich cinematic hero banner so no page feels bare.
// Mounted from nav.ts (runs on every page). Pages with their own custom heroes
// (marketplace, membership, home, index) are skipped automatically.

interface HeroDef {
  img: string;
  eyebrow: string;
  title: string;
  sub: string;
}

const HEROES: Record<string, HeroDef> = {
  '/beta.html': {
    img: '/heroes/beta-portal.webp',
    eyebrow: 'CLOSED DEVELOPMENT',
    title: 'Beta Program',
    sub: 'Help shape the world before it opens.',
  },
  '/signin.html': {
    img: '/heroes/signin-gate.webp',
    eyebrow: 'CITIZEN ACCESS',
    title: 'Sign In',
    sub: 'Return to the Grid.',
  },
  '/join.html': {
    img: '/heroes/join-vista.webp',
    eyebrow: 'NEW CITIZENS',
    title: 'Join GridWorld',
    sub: 'Your journey starts at First Light.',
  },
  '/account.html': {
    img: '/heroes/account-deck.webp',
    eyebrow: 'COMMAND DECK',
    title: 'Your Account',
    sub: 'Manage your citizen identity.',
  },
  '/profile.html': {
    img: '/heroes/profile-identity.webp',
    eyebrow: 'IDENTITY',
    title: 'Profile',
    sub: 'Who you are on the Grid.',
  },
  '/shop.html': {
    img: '/heroes/shop-storefront.webp',
    eyebrow: 'GWC STOREFRONT',
    title: 'Shop',
    sub: 'Spend Grid World Currency on goods.',
  },
  '/sound.html': {
    img: '/heroes/sound-hall.webp',
    eyebrow: 'SONIC IDENTITY',
    title: 'Soundtrack',
    sub: 'The music of the Grid.',
  },
  '/docs.html': {
    img: '/heroes/docs-library.webp',
    eyebrow: 'KNOWLEDGE',
    title: 'Documentation',
    sub: 'Guides, lore, and build docs.',
  },
  '/omni.html': {
    img: '/heroes/omni-core.webp',
    eyebrow: 'AI GUIDE',
    title: 'OMNI',
    sub: 'Your intelligent companion.',
  },
  '/grid-world-studio.html': {
    img: '/heroes/studio-workshop.webp',
    eyebrow: 'CREATOR TOOLS',
    title: 'GridWorld Studio',
    sub: 'Build worlds, creatures, and stories.',
  },
  '/games.html': {
    img: '/heroes/games-arcade.webp',
    eyebrow: 'PLAY',
    title: 'Games',
    sub: 'Arcade experiences on the Grid.',
  },
  '/game.html': {
    img: '/heroes/game-portal.webp',
    eyebrow: 'STEP THROUGH',
    title: 'Enter the Game',
    sub: 'Your adventure awaits.',
  },
  '/social.html': {
    img: '/heroes/social-plaza.webp',
    eyebrow: 'CITIZENS',
    title: 'Community',
    sub: 'Meet the people of the Grid.',
  },
  '/classifieds.html': {
    img: '/heroes/community-square.webp',
    eyebrow: 'TOWN SQUARE',
    title: 'Classifieds',
    sub: 'Buy, sell, and trade with citizens.',
  },
  '/meetups.html': {
    img: '/heroes/community-square.webp',
    eyebrow: 'TOWN SQUARE',
    title: 'Meetups',
    sub: 'Gather with fellow citizens.',
  },
  '/diagnostics.html': {
    img: '/heroes/diagnostics-core.webp',
    eyebrow: 'SYSTEM STATUS',
    title: 'Diagnostics',
    sub: 'Grid health and telemetry.',
  },
  '/recover.html': {
    img: '/heroes/recover-key.webp',
    eyebrow: 'ACCOUNT RECOVERY',
    title: 'Recover Access',
    sub: 'Restore your citizen key.',
  },
  '/confirmed.html': {
    img: '/heroes/confirmed-sunrise.webp',
    eyebrow: 'WELCOME',
    title: 'Confirmed',
    sub: 'Your journey begins at First Light.',
  },
  '/enter.html': {
    img: '/heroes/enter-threshold.webp',
    eyebrow: 'FIRST LIGHT AWAITS',
    title: 'Enter GridWorld',
    sub: 'Step through the gates.',
  },
};

// Pages that already have rich custom heroes — never inject.
const SKIP = new Set([
  '/marketplace.html',
  '/membership.html',
  '/home.html',
  '/index.html',
  '/play.html',
  '/store.html',
]);

export function mountPageHero(): void {
  const path = window.location.pathname;
  if (SKIP.has(path)) return;
  const def = HEROES[path];
  if (!def) return;
  // Don't double-inject.
  if (document.querySelector('.gw-page-hero')) return;
  // Hide the generic artbar when a page-specific hero is present.
  document.querySelectorAll('.grid-page-artbar').forEach(el => {
    (el as HTMLElement).style.display = 'none';
  });

  const hero = document.createElement('section');
  hero.className = 'gw-page-hero';
  hero.innerHTML = `
    <div class="gw-page-hero-bg" style="background-image:url('${def.img}')" role="img" aria-label="${def.title} hero art"></div>
    <div class="gw-page-hero-copy">
      <span class="gw-page-hero-eyebrow">${def.eyebrow}</span>
      <h1>${def.title}</h1>
      <p>${def.sub}</p>
    </div>`;
  // Insert after the global nav, before page content.
  const nav = document.querySelector('header.gw-global-nav');
  if (nav && nav.parentNode) {
    nav.parentNode.insertBefore(hero, nav.nextSibling);
  } else {
    document.body.prepend(hero);
  }
}
