import './sound.css';

const app = document.querySelector<HTMLDivElement>('#sound')!;
const tracks = [
  { title: 'First Light', artist: 'Aurora.ai', genre: 'Ambient / Cinematic', plays: '12.4K', color: 'LUM' },
  { title: 'Neon Rain', artist: 'Grid Collective', genre: 'Electronic / Night', plays: '8.7K', color: 'SPK' },
  { title: 'Verdant Signal', artist: 'Solenne.ai', genre: 'Organic / Downtempo', plays: '6.1K', color: 'ECO' },
  { title: 'Forge the Horizon', artist: 'FRG Studio', genre: 'Experimental / Industrial', plays: '4.9K', color: 'FRG' },
  { title: 'Meridian', artist: 'Morrow.ai', genre: 'Archive / Soundtrack', plays: '3.8K', color: 'MRD' },
];

app.innerHTML = `
<header class="sound-header">
  <a class="sound-brand" href="/"><span>◇</span> GRID OMNI SOUND</a>
  <nav><a href="#discover">DISCOVER</a><a href="#charts">CHARTS</a><a href="#radio">RADIO</a><a href="#creator">CREATOR</a><a href="/marketplace.html">MARKET</a></nav>
  <a class="sound-enter" href="/play.html">ENTER WORLD</a>
</header>
<main>
  <section class="sound-hero">
    <div><span class="eyebrow">THE SOUND LAYER OF GRID WORLD</span><h1>Sound should be<br><em>a place.</em></h1><p>Publish tracks, live sets, podcasts, soundscapes and performances. Follow creators, build playlists, and let music become part of the world itself.</p><div class="sound-actions"><button id="play-featured">▶ PLAY FEATURED</button><a href="#creator">CREATE A CHANNEL</a></div></div>
    <div class="record"><div class="record-label">GRID<br>OMNI<br>SOUND</div><div class="needle"></div></div>
  </section>
  <section class="sound-strip"><span>◇ IDENTITIES</span><span>⌁ TOPICS</span><span>◈ CHANNELS</span><span>∿ SOUNDS</span><span>△ EVENTS</span></section>
  <section id="discover" class="sound-section"><div class="section-head"><div><span class="eyebrow">DISCOVER</span><h2>Signals worth hearing.</h2></div><span class="live">● LIVE</span></div><div class="track-list">${tracks.map((t, i) => `<article class="track"><button class="track-play" data-track="${i}">▶</button><div class="cover"><span>${t.color}</span></div><div class="track-copy"><strong>${t.title}</strong><small>${t.artist} · ${t.genre}</small></div><span class="plays">${t.plays}</span><button class="save">＋</button></article>`).join('')}</div></section>
  <section id="charts" class="sound-section split"><div><span class="eyebrow">GRID CHARTS</span><h2>What's moving<br>through the Grid.</h2><p>Charts can be segmented by world, community, genre, event, creator and time window rather than one global popularity score.</p></div><div class="chart"><i style="height:42%"></i><i style="height:68%"></i><i style="height:51%"></i><i style="height:84%"></i><i style="height:61%"></i><i style="height:93%"></i><i style="height:76%"></i></div></section>
  <section id="radio" class="sound-section radio"><span class="eyebrow">GRID OMNI RADIO</span><h2>One world. Many frequencies.</h2><div class="radio-grid"><article><b>FIRST LIGHT FM</b><small>Ambient · exploration · sunrise</small></article><article><b>NEON AFTER DARK</b><small>Electronic · clubs · city nights</small></article><article><b>CREATOR SIGNAL</b><small>Interviews · process · workshops</small></article></div></section>
  <section id="creator" class="sound-section creator"><div><span class="eyebrow">CREATOR AUDIO</span><h2>Build sound into the world.</h2><p>Attach audio to places, objects, events and experiences. Grid Omni Sound keeps publishing, permissions, reporting, licensing metadata and moderation in the same platform family.</p></div><div class="creator-card"><b>UPLOAD → ANALYZE → PROTECT → PUBLISH</b><span>Original audio · licensed audio · live performance · spatial soundscape</span></div></section>
</main>
<footer><span>GRID OMNI SOUND</span><a href="/docs.html">DOCS</a><a href="/directory.html">STAFF</a><a href="/economics.html">ECONOMICS</a><a href="/">GRID WORLD</a></footer>
`;

let current = -1;
const toast = (message: string) => {
  let el = document.querySelector<HTMLDivElement>('#sound-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'sound-toast';
    el.className = 'sound-toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('show');
  window.setTimeout(() => el?.classList.remove('show'), 1800);
};
document.querySelector('#play-featured')?.addEventListener('click', () => toast('Featured stream queued. Audio playback service is the next live integration.'));
document.querySelectorAll<HTMLButtonElement>('[data-track]').forEach(button => button.addEventListener('click', () => {
  const index = Number(button.dataset.track ?? -1);
  current = current === index ? -1 : index;
  document.querySelectorAll('[data-track]').forEach((b, i) => b.textContent = i === current ? 'Ⅱ' : '▶');
  toast(current >= 0 ? 'Playing ' + tracks[current].title : 'Playback paused.');
}));
document.querySelectorAll<HTMLButtonElement>('.save').forEach(button => button.addEventListener('click', () => toast('Saved to your Grid Sound library.')));
