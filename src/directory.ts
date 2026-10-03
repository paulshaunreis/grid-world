import './directory.css';
import './glass-system.css';
const people=[
['Aurora','Navigator / World Coordinator','Calm, perceptive, quietly confident. Owns the connective tissue between worlds, creators and travelers.'],
['Link','Systems Engineer / Technical Guide','Turns complex platform systems into stable, understandable architecture.'],
['Rey','Discovery Guide / Accessibility','Focuses on exploration, fun, accessibility and welcoming new travelers.'],
['Elder','Lorekeeper / Logic Advisor','Preserves history, context, rules and the reasoning behind important decisions.'],
['Veyr','First-Principles Architect','Reduces difficult platform problems to durable primitives and contracts.'],
['Nyxen','Security Watcher','Designs boundaries, threat models, permissions and trust systems.'],
['Orin','Systems Cartographer','Maps regions, services, dependencies and the relationships between them.'],
['Seraith','Paradox Analyst','Stress-tests assumptions and searches for contradictions before they become systems problems.'],
['Vael','Efficiency Guide','Removes unnecessary complexity and keeps interfaces focused.'],
['Kairox','Timekeeper','Owns scheduling, progression timing, seasons, recurring events and temporal consistency.'],
['Morrow','Historian','Connects Grid World decisions to art, technology, culture and the history of virtual worlds.'],
['Cipher','Silent Watcher','Observes system behavior, privacy surfaces and subtle failure modes.'],
['Solenne','Humanist / Social Guide','Designs social systems around belonging, dignity, communication and human connection.'],
['Rook','Strategist','Builds long-range plans, dependencies, priorities and contingency paths.'],
['Echo','Tester','Finds broken interactions, edge cases and places where the player experience diverges from intent.'],
['Umbra','Mystery Guide','Protects the unknown: secrets, anomalies, exploration and discoveries that should unfold over time.'],
['Civitas','Governance Architect','Works on rights, institutions, checks, balances and accountable platform governance.'],
['Axiom','AI / Robotics Ethics','Examines autonomy, safety, unintended consequences and responsible machine behavior.'],
['Mosaic','Comparative Systems Analyst','Studies international systems and translates useful patterns without assuming one culture is universal.'],
['Sentinel','Human Safety / Privacy','Focuses on human rights, privacy, accessibility, children and vulnerable people.'],
['Praxis','Governance Systems Engineer','Turns governance principles into concrete software controls, permissions and auditability.']
] as const;
const app=document.querySelector<HTMLDivElement>('#directory')!;
app.innerHTML=`<main><div class="glass-eyebrow">GRID WORLD · STAFF</div><h1>The people<br><span>behind the Grid.</span></h1><p class="lead">Every member is represented as Grid World Staff with a persistent <strong>.ai</strong> identity. These are distinct roles, not interchangeable generic assistants.</p><div class="grid">${people.map(([name,role,bio])=>`<article class="glass-card"><div class="card-art staff-art"><img src="/team/portraits/${name.toLowerCase()}.webp" alt="${name} portrait" loading="lazy" onerror="this.style.display='none'"></div><div class="card-body"><div class="tag">GRID WORLD STAFF</div><h2>${name}.ai</h2><h3>${role}</h3><p>${bio}</p><div class="status">● ACTIVE ROLE · GRID STAFF</div></div></article>`).join('')}</div></main>`;
