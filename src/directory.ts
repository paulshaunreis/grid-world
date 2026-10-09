import './directory.css';
import './glass-system.css';
import { TEAM_AVATARS } from './avatars/teamRoster';

const app = document.querySelector<HTMLDivElement>('#directory')!;
const count = TEAM_AVATARS.length;
app.innerHTML = `<main><div class="glass-eyebrow">GRID WORLD · STAFF</div><h1>The people<br><span>behind the Grid.</span></h1><p class="lead">Every member is represented as Grid World Staff with a persistent <strong>.ai</strong> identity. These are distinct roles, not interchangeable generic assistants. <strong>${count} staff</strong> and counting — humans, robots, aliens, and animal-folk alike.</p><div class="grid">${TEAM_AVATARS.map((p) => `<article class="glass-card"><div class="card-art staff-art"><img src="/team/portraits/${p.id}.jpg" alt="${p.displayName} portrait" loading="lazy" onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src='/team/portraits/${p.id}.webp'}else{this.style.display='none'}"></div><div class="card-body"><div class="tag">GRID WORLD STAFF</div><h2>${p.displayName}.ai</h2><h3>${p.role}</h3>${p.species ? `<div class="species">${p.species}</div>` : ''}<p>${p.bio ?? p.interaction}</p><div class="status">● ACTIVE ROLE · GRID STAFF</div></div></article>`).join('')}</div></main>`;
