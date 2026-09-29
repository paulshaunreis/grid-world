import './omni.css';

const app = document.querySelector<HTMLDivElement>('#omni')!;
const controls = [
  ['ACCOUNT','Passkeys · MFA · sessions','AUTH'],
  ['AVATAR','Quarantine · integrity · permissions','SAFE'],
  ['WORLD','Isolation · rollback · region health','GUARD'],
  ['ECONOMY','Ledger · step-up · idempotency','LOCK'],
  ['CREATOR','Capabilities · package scanning','SANDBOX'],
  ['SOCIAL','Reports · blocks · rate limits','TRUST'],
  ['SOUND','Upload scan · rights metadata · moderation','MEDIA'],
  ['RECOVERY','Backups · evidence · reversible actions','RESTORE'],
];
app.innerHTML = `
<header><a href="/">◇ GRID OMNI</a><span>SECURITY CENTER</span><a href="/play.html">ENTER WORLD</a></header>
<main><section class="hero"><div><span>GRID OMNI SECURITY</span><h1>When something<br><em>looks wrong,</em><br>the Grid reacts.</h1><p>Grid Omni is designed as a control layer across identity, avatars, worlds, creator systems, economy, social services, sound and recovery.</p></div><div class="state"><i></i><strong>GUARDED BY DESIGN</strong><small>observe → contain → notify → recover → learn</small></div></section>
<section class="controls"><div class="eyebrow">SERVICE GUARDRAILS</div><div class="grid">${controls.map(c=>`<article><span>${c[2]}</span><b>${c[0]}</b><p>${c[1]}</p><small>GRID OMNI ACTIVE</small></article>`).join('')}</div></section>
<section class="response"><div><span class="eyebrow">INCIDENT RESPONSE CONTRACT</span><h2>Never let one failure become the whole world.</h2></div><div class="steps"><b>01 DETECT</b><b>02 CONTAIN</b><b>03 DEGRADE SAFELY</b><b>04 PRESERVE EVIDENCE</b><b>05 NOTIFY</b><b>06 RECOVER / ROLLBACK</b><b>07 REVIEW</b></div></section>
<section class="rules"><div><span class="eyebrow">USER CONTROL</span><h2>Security should protect your agency.</h2></div><ul><li>Mute, block, hide, leave and report remain available even during incidents.</li><li>High-risk account and wallet operations require stronger authentication.</li><li>Untrusted uploads enter quarantine before becoming world content.</li><li>Creator systems run with explicit capabilities rather than unrestricted code execution.</li><li>Compromised assets can be revoked without deleting an account.</li><li>Safety actions are logged, reviewable and designed to be reversible where appropriate.</li></ul></section></main>
<footer><a href="/docs.html">DOCS</a><a href="/directory.html">STAFF</a><a href="/economics.html">ECONOMICS</a><a href="/sound.html">SOUND</a><a href="/">GRID WORLD</a></footer>`;
