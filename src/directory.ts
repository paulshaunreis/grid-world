import './directory.css';
import './glass-system.css';
import { TEAM_AVATARS } from './avatars/teamRoster';

const app = document.querySelector<HTMLDivElement>('#directory')!;
const esc = (value: string): string => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char] ?? char));
const count = TEAM_AVATARS.length;

app.innerHTML = `<main>
  <div class="glass-eyebrow">GRID WORLD · STAFF</div>
  <h1>The people<br><span>behind the Grid.</span></h1>
  <p class="lead"><strong>${count} staff</strong> and counting — humans, robots, aliens, and animal-folk alike. Every profile follows the same Grid World identity layout.</p>
  <div class="grid">${TEAM_AVATARS.map(member => {
    const name = esc(member.displayName);
    const portrait = esc(member.profileImage ?? ('/team/portraits/' + member.id + '.webp'));
    const topics = member.topics.map(esc);
    const recent = member.recentWork?.length
      ? '<ul>' + member.recentWork.map(item => '<li>' + esc(item) + '</li>').join('') + '</ul>'
      : '<p>No recent work has been published for this profile yet.</p>';
    const bio = esc(member.bio ?? member.interaction);
    const assignment = esc(member.currentlyWorkingOn ?? 'No current assignment has been published.');
    return `<article class="glass-card staff-profile">
      <div class="card-art staff-art">
        <img src="${portrait}" alt="${name} portrait" loading="lazy">
        <span class="staff-art-fallback" aria-hidden="true">${name.slice(0,1)}</span>
      </div>
      <div class="card-body">
        <div class="tag">GRID WORLD STAFF · ${esc(member.role).toUpperCase()}</div>
        <h2>${name}</h2><h3>${esc(member.title)}</h3>
        ${member.species ? '<div class="species">' + esc(member.species) + '</div>' : ''}
        <p>${bio}</p>
        <div class="staff-profile-section"><b>SPECIALTIES</b><p>${topics.join(' · ') || 'Not yet listed'}</p></div>
        <div class="staff-profile-section"><b>CURRENT ASSIGNMENT</b><p>${assignment}</p></div>
        <details class="staff-profile-more"><summary>RECENT WORK &amp; INTERACTION</summary>${recent}<p>${esc(member.interaction)}</p></details>
        <div class="status">● GRID WORLD STAFF</div>
      </div>
    </article>`;
  }).join('')}</div>
</main>`;

app.querySelectorAll<HTMLImageElement>('.staff-art img').forEach(img => {
  img.addEventListener('error', () => {
    img.hidden = true;
    const fallback = img.parentElement?.querySelector<HTMLElement>('.staff-art-fallback');
    if (fallback) fallback.style.display = 'grid';
  }, { once: true });
});
