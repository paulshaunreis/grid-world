import { TEAM_AVATARS } from '../avatars/teamRoster';
import { TEAM_WORK_TASKS } from '../world/TeamWorkSystem';

const escapeHTML = (value: string): string => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char] ?? char));

export function mountTeamArea(): { open(): void; close(): void } {
  const style = document.createElement('style');
  style.textContent = `
    .gw-team-panel{position:fixed;right:22px;top:78px;width:min(760px,calc(100vw - 44px));max-height:calc(100vh - 110px);overflow:auto;z-index:30;background:rgba(5,9,15,.96);border:1px solid rgba(49,230,232,.25);box-shadow:0 24px 80px rgba(0,0,0,.5),inset 0 0 60px rgba(49,230,232,.025);backdrop-filter:blur(18px);padding:18px;color:#dff8ff;font:12px/1.45 ui-monospace,monospace;display:none}
    .gw-team-panel.open{display:block}.gw-team-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:18px}.gw-team-kicker{font-size:8px;letter-spacing:.2em;color:#6eeef0;opacity:.85}.gw-team-title{font:650 27px/1.1 system-ui;margin:5px 0}.gw-team-sub{opacity:.7;max-width:520px}.gw-team-close{border:1px solid rgba(49,230,232,.28);background:rgba(49,230,232,.06);color:inherit;padding:8px 11px;cursor:pointer}.gw-team-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.gw-team-member{min-width:0;padding:12px;border:1px solid rgba(122,205,255,.14);background:linear-gradient(145deg,rgba(10,28,42,.72),rgba(10,12,24,.7));box-shadow:inset 0 0 26px rgba(49,230,232,.025);overflow:hidden}.gw-team-member-head{display:flex;align-items:center;gap:12px;min-width:0}.gw-team-portrait-wrap{width:84px;flex:0 0 84px;aspect-ratio:1;position:relative;border:1px solid rgba(49,230,232,.35);background:radial-gradient(circle,rgba(49,230,232,.12),rgba(4,12,22,.9));overflow:hidden}.gw-team-portrait{display:block;width:100%;height:100%;object-fit:cover}.gw-team-portrait-fallback{display:none;place-items:center;width:100%;height:100%;font:700 28px system-ui;color:#74eff0;background:linear-gradient(145deg,#123f50,#061a25)}.gw-team-member strong{display:block;font:650 16px/1.2 system-ui;color:#f0fdff;overflow-wrap:anywhere}.gw-team-member small{display:block;color:#b7cbd7;opacity:.85;margin-top:4px;font:10px/1.4 system-ui}.gw-team-role{font-size:9px;color:#71e9ed;letter-spacing:.08em;margin-top:6px;text-transform:uppercase}.gw-team-topic{margin-top:10px;font-size:9px;line-height:1.65;color:#b5d2dc;overflow-wrap:anywhere}.gw-team-status{margin-top:16px;padding:11px;border-top:1px solid rgba(255,255,255,.08);font-size:9px;letter-spacing:.08em;color:#a6c0cc}.gw-team-status b{color:#7ee8b2}.gw-team-task{margin-top:10px;padding:12px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025)}.gw-team-task strong{font-family:system-ui}.gw-team-task small{display:block;opacity:.72;margin-top:3px}.gw-team-progress{height:3px;background:rgba(255,255,255,.08);margin-top:7px}.gw-team-progress i{display:block;height:100%;background:#31e6e8}.gw-team-foundation{margin-top:10px;padding:10px;border:1px solid rgba(98,205,255,.15);background:rgba(20,80,110,.08)}.gw-team-profile-toggle{margin-top:11px;width:100%;padding:8px 10px;border:1px solid rgba(49,230,232,.22);background:rgba(49,230,232,.055);color:#dffcff;font:700 9px ui-monospace,monospace;letter-spacing:.1em;text-align:left;cursor:pointer}.gw-team-profile-toggle:hover,.gw-team-profile-toggle:focus-visible{border-color:#31e6e8;outline:none;box-shadow:0 0 18px rgba(49,230,232,.1)}.gw-team-profile-detail{margin-top:12px;padding-top:12px;border-top:1px solid rgba(122,205,255,.14)}.gw-team-profile-detail[hidden]{display:none}.gw-team-profile-detail h4{font:700 8px ui-monospace,monospace;letter-spacing:.14em;color:#65e5e9;margin:12px 0 5px}.gw-team-profile-detail p{font:12px/1.55 system-ui;color:#c6dce6;margin:0;overflow-wrap:anywhere}.gw-team-profile-detail ul{margin:5px 0 0;padding-left:17px;color:#c6dce6;font:11px/1.6 system-ui}.gw-team-profile-detail li+li{margin-top:3px}.gw-team-live-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}.gw-team-live-grid .gw-team-member{padding:9px}
    @media(max-width:620px){.gw-team-panel{left:8px;right:8px;top:64px;width:auto;max-height:calc(100vh - 76px);padding:12px}.gw-team-grid,.gw-team-live-grid{grid-template-columns:1fr}.gw-team-portrait-wrap{width:72px;flex-basis:72px}.gw-team-title{font-size:23px}}
  `;
  document.head.appendChild(style);

  const panel = document.createElement('section');
  panel.className = 'gw-team-panel';
  panel.setAttribute('aria-label', 'Grid World Team Area');
  panel.innerHTML = `
    <div class="gw-team-head">
      <div><div class="gw-team-kicker">GRID WORLD // TEAM AREA</div><div class="gw-team-title">The Workshop</div><div class="gw-team-sub">Meet the minds behind the worlds. Each staff profile uses the same Grid World identity format while keeping its own voice and visual signature.</div></div>
      <button class="gw-team-close" type="button" aria-label="Close team area">CLOSE</button>
    </div>
    <div class="gw-team-grid" aria-label="Grid World staff profiles"></div>
    <div class="gw-team-status">TEAM NETWORK · <b>STAFF DIRECTORY</b> · Profile details expand on selection.</div>
    <div class="gw-team-task"><strong>PUBLIC TEAM WORK</strong><div class="gw-team-live-grid" id="gw-team-live-work"></div></div>
    <div class="gw-team-foundation"><strong>GRID FOUNDATION</strong><br><span>Base layer exists beneath the worlds. Foundation visibility is permission-gated and is not enabled by this client UI.</span></div>
  `;
  document.body.appendChild(panel);

  const liveWork = panel.querySelector<HTMLDivElement>('#gw-team-live-work')!;
  liveWork.innerHTML = TEAM_WORK_TASKS.filter(task => task.public).map(task => {
    const member = TEAM_AVATARS.find(item => item.id === task.memberId);
    return '<article class="gw-team-member"><strong>' + escapeHTML(member?.displayName ?? task.memberId) + '</strong><small>' + escapeHTML(task.title) + ' · ' + escapeHTML(task.zone) + '</small><div class="gw-team-topic">' + escapeHTML(task.status) + '</div><div class="gw-team-progress"><i style="width:' + Math.max(0, Math.min(100, task.progress)) + '%"></i></div></article>';
  }).join('') || '<p>No public team tasks are available right now.</p>';

  const grid = panel.querySelector<HTMLDivElement>('.gw-team-grid')!;
  grid.innerHTML = TEAM_AVATARS.map(member => {
    const name = escapeHTML(member.displayName);
    const role = escapeHTML(member.role);
    const title = escapeHTML(member.title);
    const topics = member.topics.map(escapeHTML);
    const portrait = escapeHTML(member.profileImage ?? ('/team/portraits/' + member.id + '.webp'));
    const bio = escapeHTML(member.bio ?? 'This staff profile is being expanded. More verified details will appear here as the profile record is completed.');
    const assignment = escapeHTML(member.currentlyWorkingOn ?? 'No current assignment has been published.');
    const recentWork = member.recentWork?.length
      ? '<ul>' + member.recentWork.map(item => '<li>' + escapeHTML(item) + '</li>').join('') + '</ul>'
      : '<p>No recent work has been published for this profile yet.</p>';
    const species = member.species ? '<p>' + escapeHTML(member.species) + '</p>' : '<p>Grid World staff collaborator</p>';
    return `
      <article class="gw-team-member" data-staff-id="${escapeHTML(member.id)}">
        <div class="gw-team-member-head">
          <div class="gw-team-portrait-wrap">
            <img class="gw-team-portrait" src="${portrait}" alt="${name} portrait" loading="lazy">
            <span class="gw-team-portrait-fallback" aria-hidden="true">${name.slice(0, 1)}</span>
          </div>
          <div><strong>${name}</strong><small>${title}</small><div class="gw-team-role">${role}</div></div>
        </div>
        <div class="gw-team-topic">${topics.slice(0, 4).join(' · ')}</div>
        <button class="gw-team-profile-toggle" type="button" aria-expanded="false">VIEW PROFILE <span aria-hidden="true">＋</span></button>
        <div class="gw-team-profile-detail" hidden>
          <h4>ABOUT</h4><p>${bio}</p>
          <h4>IDENTITY</h4>${species}
          <h4>SPECIALTIES</h4><p>${topics.join(' · ') || 'Not yet listed'}</p>
          <h4>CURRENT ASSIGNMENT</h4><p>${assignment}</p>
          <h4>RECENT WORK</h4>${recentWork}
          <h4>CONTACT / INTERACTION</h4><p>${escapeHTML(member.interaction)}</p>
        </div>
      </article>
    `;
  }).join('');

  grid.querySelectorAll<HTMLImageElement>('.gw-team-portrait').forEach(img => {
    img.addEventListener('error', () => {
      img.hidden = true;
      const fallback = img.parentElement?.querySelector<HTMLElement>('.gw-team-portrait-fallback');
      if (fallback) fallback.style.display = 'grid';
    }, { once: true });
  });
  grid.querySelectorAll<HTMLButtonElement>('.gw-team-profile-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const detail = button.parentElement?.querySelector<HTMLElement>('.gw-team-profile-detail');
      if (!detail) return;
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      detail.hidden = expanded;
      button.innerHTML = expanded ? 'VIEW PROFILE <span aria-hidden="true">＋</span>' : 'HIDE PROFILE <span aria-hidden="true">−</span>';
    });
  });

  const closeButton = panel.querySelector<HTMLButtonElement>('.gw-team-close')!;
  const open = () => panel.classList.add('open');
  const close = () => panel.classList.remove('open');
  closeButton.addEventListener('click', close);
  return { open, close };
}
