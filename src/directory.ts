import './directory.css';
import './glass-system.css';
import { TEAM_AVATARS } from './avatars/teamRoster';

const app = document.querySelector<HTMLDivElement>('#directory')!;
const count = TEAM_AVATARS.length;
app.innerHTML = `<main><div class="glass-eyebrow">GRID WORLD · STAFF</div><h1>The people<br><span>behind the Grid.</span></h1><p class="lead"><strong>${count} staff</strong> and counting — humans, robots, aliens, and animal-folk alike.</p><div class="grid">${TEAM_AVATARS.map((p) => `<article class="glass-card"><div class="card-art staff-art"><img src="/team/portraits/${p.id}.jpg" alt="${p.firstName} ${p.lastName} portrait" loading="lazy" onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src='/team/portraits/${p.id}.webp'}else{this.style.display='none'}"></div><div class="card-body"><div class="tag">GRID WORLD STAFF</div><h2>${p.firstName} ${p.lastName}</h2><h3>${p.title}</h3>${p.species ? `<div class="species">${p.species}</div>` : ''}<p>${p.bio ?? p.interaction}</p><div class="status">● ACTIVE · GRID STAFF</div></div></article>`).join('')}</div></main>`;
