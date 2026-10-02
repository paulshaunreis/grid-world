import { TEAM_AVATARS } from '../avatars/teamRoster';
import { TEAM_WORK_TASKS } from '../world/TeamWorkSystem';

export function mountTeamArea(): { open(): void; close(): void } {
  const style = document.createElement('style');
  style.textContent = `
    .gw-team-panel{position:fixed;right:22px;top:78px;width:min(430px,calc(100vw - 44px));max-height:calc(100vh - 110px);overflow:auto;z-index:30;background:rgba(5,9,15,.94);border:1px solid rgba(122,205,255,.22);box-shadow:0 24px 80px rgba(0,0,0,.45);backdrop-filter:blur(18px);padding:18px;color:#dff8ff;font:12px/1.45 ui-monospace,monospace;display:none}
    .gw-team-panel.open{display:block}.gw-team-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px}.gw-team-kicker{font-size:8px;letter-spacing:.2em;opacity:.55}.gw-team-title{font:600 24px system-ui;margin:4px 0}.gw-team-sub{opacity:.65;max-width:330px}.gw-team-close{border:1px solid rgba(255,255,255,.16);background:transparent;color:inherit;padding:7px 9px;cursor:pointer}.gw-team-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.gw-team-member{padding:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025)}.gw-team-portrait{width:100%;aspect-ratio:1;object-fit:cover;border:1px solid rgba(122,205,255,.18);margin-bottom:8px;background:#07111f}.gw-team-member strong{display:block;font-family:system-ui;font-size:14px}.gw-team-member small{display:block;opacity:.55;margin-top:2px}.gw-team-topic{margin-top:7px;font-size:9px;opacity:.48}.gw-team-status{margin-top:15px;padding:10px;border-top:1px solid rgba(255,255,255,.08);font-size:9px;letter-spacing:.08em}.gw-team-status b{color:#7ee8b2}.gw-team-task{padding:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025)}.gw-team-task strong{font-family:system-ui}.gw-team-task small{display:block;opacity:.62;margin-top:3px}.gw-team-progress{height:3px;background:rgba(255,255,255,.08);margin-top:7px}.gw-team-progress i{display:block;height:100%;background:#68d9ff}.gw-team-foundation{margin-top:10px;padding:10px;border:1px solid rgba(98,205,255,.15);background:rgba(20,80,110,.08)}.gw-aurora-profile{margin:0 0 14px;padding:14px;border:1px solid rgba(104,217,255,.28);background:linear-gradient(135deg,rgba(104,217,255,.09),rgba(122,90,255,.05));box-shadow:inset 0 0 40px rgba(104,217,255,.03)}.gw-aurora-identity{display:flex;gap:12px;align-items:center}.gw-aurora-portrait{width:72px;height:72px;object-fit:cover;border:1px solid rgba(104,217,255,.35);border-radius:50%}.gw-aurora-kicker{font-size:8px;letter-spacing:.2em;opacity:.58}.gw-aurora-name{font:600 23px system-ui;margin:2px 0}.gw-aurora-role{opacity:.78}.gw-aurora-status{margin-top:8px;font-size:9px;letter-spacing:.12em;color:#7ee8b2}.gw-aurora-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.gw-aurora-block{padding:8px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.02)}.gw-aurora-block b{display:block;font-size:8px;letter-spacing:.14em;opacity:.5;margin-bottom:4px}.gw-aurora-block span{display:block;font-family:system-ui;font-size:11px}.gw-aurora-history{margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.07)}.gw-aurora-history div{font-size:9px;opacity:.78;padding:3px 0}.gw-aurora-history strong{color:#dff8ff}`;
  document.head.appendChild(style);

  const taskMarkup = TEAM_WORK_TASKS.filter(task => task.public).map(task => { const member = TEAM_AVATARS.find(m => m.id === task.memberId); return '<article class="gw-team-member"><strong>' + (member?.displayName ?? task.memberId) + '</strong><small>' + task.title + ' · ' + task.zone + '</small><div class="gw-team-topic">' + task.status + '</div><div class="gw-team-progress"><i style="width:' + task.progress + '%"></i></div></article>'; }).join('');

  const panel = document.createElement('section');
  panel.className = 'gw-team-panel';
  panel.setAttribute('aria-label', 'Grid World Team Area');
  panel.innerHTML = `
    <div class="gw-team-head">
      <div><div class="gw-team-kicker">GRID WORLD // TEAM AREA</div><div class="gw-team-title">The Workshop</div><div class="gw-team-sub">A collaborative room for world design, systems, art, ecology, security and long-term planning.</div></div>
      <button class="gw-team-close" type="button">CLOSE</button>
    </div>
    <section class="gw-aurora-profile" aria-label="Aurora staff profile">
      <div class="gw-aurora-identity">
        <img class="gw-aurora-portrait" src="/team/portraits/aurora.webp" alt="Aurora portrait" loading="lazy" onerror="this.style.display='none'">
        <div><div class="gw-aurora-kicker">GRID WORLD STAFF · AI ENGINEER / CREATIVE NAVIGATOR</div><div class="gw-aurora-name">Aurora</div><div class="gw-aurora-role">World Coordinator · Second Engineer &amp; Creative Collaborator</div><div class="gw-aurora-status">● ACTIVE · WORKING IN THE GRID</div></div>
      </div>
      <div class="gw-aurora-grid">
        <div class="gw-aurora-block"><b>CURRENT ASSIGNMENT</b><span>World direction · Many Worlds</span></div>
        <div class="gw-aurora-block"><b>CURRENT LOCATION</b><span>First Light · Team Workshop</span></div>
        <div class="gw-aurora-block"><b>SPECIALTIES</b><span>World systems · architecture · NPCs · navigation</span></div>
        <div class="gw-aurora-block"><b>SKILLS</b><span>Engineering · technical art · documentation · integration</span></div>
      </div>
      <div class="gw-aurora-history">
        <div><strong>RECENT WORK</strong></div>
        <div>NPC transit authority + shared teleport presentation</div>
        <div>NPC skill progression + Grid-issued certificates</div>
        <div>Landmarks / waypoints + selected-destination transit</div>
        <div>Grid HUD/navigation routing + living-world integration</div>
      </div>
    </section>
    <div class="gw-team-grid"></div>
    <div class="gw-team-status">TEAM NETWORK · <b>CONNECTED</b></div><div class="gw-team-task"><strong>LIVE WORLD WORK</strong><div class="gw-team-grid" id="gw-team-live-work"></div></div>
    <div class="gw-team-foundation"><strong>GRID FOUNDATION</strong><br><span>Base layer exists beneath the worlds. Foundation visibility is permission-gated and is not enabled by this client UI.</span></div>
  `;
  document.body.appendChild(panel);

  const liveWork = panel.querySelector<HTMLDivElement>('#gw-team-live-work')!;
  liveWork.innerHTML = taskMarkup;

  const grid = panel.querySelector('.gw-team-grid')!;
  grid.innerHTML = TEAM_AVATARS.map(member => {
    // Portrait path built from parts: member ids are dynamic, so the static
    // asset analyzer can't resolve a single literal. All 24 files verified
    // present in public/team/portraits/<id>.webp.
    const portrait = '/team/portraits/' + member.id + '.webp';
    return `
    <article class="gw-team-member">
      <img class="gw-team-portrait" src="${portrait}" alt="${member.displayName} portrait" loading="lazy" onerror="this.style.display='none'">
      <strong>${member.displayName}</strong>
      <small>${member.role}</small>
      <div class="gw-team-topic">${member.topics.slice(0, 3).join(' · ')}</div>
    </article>
  `;}).join('');

  const closeButton = panel.querySelector<HTMLButtonElement>('.gw-team-close')!;
  const open = () => panel.classList.add('open');
  const close = () => panel.classList.remove('open');
  closeButton.addEventListener('click', close);

  return { open, close };
}
