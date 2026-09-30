const root=document.documentElement;
const css=document.createElement('style');
css.textContent=`
  .gw-art-layer{position:fixed;inset:0;pointer-events:none;z-index:-1;overflow:hidden}
  .gw-art-canvas{position:absolute;inset:0;width:100%;height:100%;opacity:.48;mix-blend-mode:screen}
  .gw-world-atlas{position:absolute;inset:0;pointer-events:none;opacity:.42;overflow:hidden}.gw-world-orb{position:absolute;border:1px solid rgba(255,255,255,.12);border-radius:50%;box-shadow:0 0 35px rgba(120,200,255,.08);animation:gw-atlas-drift 14s ease-in-out infinite}.gw-world-orb:nth-child(1){width:220px;height:220px;left:8%;top:12%}.gw-world-orb:nth-child(2){width:150px;height:150px;right:11%;top:18%;animation-delay:-4s}.gw-world-orb:nth-child(3){width:310px;height:310px;right:25%;bottom:-150px;animation-delay:-8s}.gw-world-thread{position:absolute;height:1px;background:linear-gradient(90deg,transparent,rgba(120,210,255,.18),transparent);transform-origin:left center}.gw-world-thread:nth-child(4){width:46%;left:8%;top:32%;transform:rotate(11deg)}.gw-world-thread:nth-child(5){width:38%;right:8%;top:48%;transform:rotate(-18deg)}
  .gw-orbital-grid{position:absolute;left:50%;top:7%;width:min(42vw,520px);aspect-ratio:1;border-radius:50%;border:1px solid rgba(85,220,255,.32);background:repeating-radial-gradient(circle,transparent 0 18px,rgba(85,220,255,.11) 19px 20px),repeating-linear-gradient(0deg,transparent 0 18px,rgba(85,220,255,.09) 19px 20px);box-shadow:0 0 55px rgba(50,190,255,.13),inset 0 0 45px rgba(50,190,255,.08);transform:translateX(-50%);opacity:.7;animation:gw-orbit-pulse 8s ease-in-out infinite}
  .gw-cityline{position:absolute;left:0;right:0;bottom:-1px;height:30%;background:linear-gradient(to top,rgba(3,8,15,.88),transparent);clip-path:polygon(0 78%,3% 62%,5% 72%,7% 42%,9% 69%,12% 35%,14% 63%,16% 48%,18% 70%,20% 28%,22% 62%,25% 38%,27% 72%,29% 53%,31% 66%,34% 32%,37% 70%,40% 45%,42% 63%,45% 25%,47% 69%,50% 40%,52% 67%,55% 32%,57% 72%,60% 46%,63% 66%,65% 35%,68% 73%,71% 51%,74% 68%,77% 29%,80% 69%,83% 43%,86% 65%,89% 34%,92% 70%,95% 48%,100% 63%,100% 100%,0 100%)}
  .gw-floating-garden{position:absolute;width:140px;height:42px;border-radius:50%;border:1px solid rgba(143,227,136,.3);background:linear-gradient(180deg,rgba(54,92,74,.42),rgba(6,16,19,.78));box-shadow:0 18px 32px rgba(0,0,0,.3),0 0 20px rgba(143,227,136,.08);animation:gw-float 6s ease-in-out infinite}
  .gw-floating-garden:after{content:'✦';position:absolute;left:50%;top:-24px;color:#d28cff;font-size:20px;text-shadow:0 0 18px #d28cff}
  .gw-feather{position:absolute;left:50%;top:62%;font-size:clamp(45px,6vw,90px);color:#f7d98a;filter:drop-shadow(0 0 18px rgba(247,217,138,.45));transform:rotate(-18deg);animation:gw-feather 4s ease-in-out infinite}
  .gw-art-vignette{position:absolute;inset:0;background:radial-gradient(circle at 50% 35%,transparent 0 34%,rgba(2,7,14,.14) 62%,rgba(2,5,10,.72) 100%)}
  .gw-concept-rail{position:fixed;right:20px;top:50%;transform:translateY(-50%);width:118px;display:grid;gap:8px;opacity:.72;transition:.4s;z-index:8}
  .gw-concept-rail:hover{opacity:1}
  .gw-concept{height:72px;border:1px solid color-mix(in srgb,var(--accent,#68d9ff) 45%,transparent);background:linear-gradient(145deg,rgba(9,18,29,.88),rgba(4,8,15,.62));backdrop-filter:blur(12px);position:relative;overflow:hidden;padding:8px;box-sizing:border-box;box-shadow:0 10px 30px rgba(0,0,0,.24)}
  .gw-concept:before{content:"";position:absolute;inset:-35%;background:conic-gradient(from 90deg,transparent,var(--accent,#68d9ff),transparent 34%);opacity:.18;animation:gw-spin 7s linear infinite}
  .gw-concept span{position:relative;display:block;font:700 8px/1.2 ui-monospace,monospace;letter-spacing:.16em}
  .gw-concept b{position:relative;display:block;margin-top:7px;font:500 11px/1.1 system-ui;color:#eefcff}
  .gw-concept i{position:absolute;right:7px;bottom:7px;width:20px;height:20px;border:1px solid currentColor;border-radius:50%;opacity:.65}
  .gw-concept i:after{content:"";position:absolute;inset:4px;border-radius:50%;background:currentColor;box-shadow:0 0 14px currentColor}
  .gw-art-caption{position:fixed;left:24px;bottom:22px;padding:10px 14px;border-left:2px solid var(--accent,#68d9ff);background:rgba(4,10,17,.66);backdrop-filter:blur(10px);font:700 9px/1.5 ui-monospace,monospace;letter-spacing:.16em;color:#d9f7ff;z-index:8}
  @keyframes gw-spin{to{transform:rotate(360deg)}}
  @keyframes gw-atlas-drift{50%{transform:translate3d(8px,-10px,0) rotate(3deg);opacity:.7}}
  @keyframes gw-orbit-pulse{50%{transform:translateX(-50%) scale(1.035);opacity:.9}}
  @keyframes gw-float{50%{transform:translateY(-12px)}}
  @keyframes gw-feather{50%{transform:rotate(-14deg) translateY(-8px)}}
  @media(max-width:900px){.gw-concept-rail{display:none}.gw-art-caption{left:12px;bottom:12px}}
`;
document.head.appendChild(css);
const layer=document.createElement('div');layer.className='gw-art-layer';
const canvas=document.createElement('canvas');canvas.className='gw-art-canvas';
const vignette=document.createElement('div');vignette.className='gw-art-vignette';
const atlas=document.createElement('div');atlas.className='gw-world-atlas';for(let i=0;i<3;i++){const o=document.createElement('div');o.className='gw-world-orb';atlas.appendChild(o)}for(let i=0;i<2;i++){const t=document.createElement('div');t.className='gw-world-thread';atlas.appendChild(t)}const orb=document.createElement('div');orb.className='gw-orbital-grid';const city=document.createElement('div');city.className='gw-cityline';const garden1=document.createElement('div');garden1.className='gw-floating-garden';garden1.style.right='10%';garden1.style.top='24%';const garden2=document.createElement('div');garden2.className='gw-floating-garden';garden2.style.right='22%';garden2.style.top='36%';garden2.style.transform='scale(.72)';const feather=document.createElement('div');feather.className='gw-feather';feather.textContent='✦';layer.append(atlas,orb,garden1,garden2,feather,city,canvas,vignette);document.body.appendChild(layer);
const ctx=canvas.getContext('2d')!;let w=0,h=0,t=0;
const nodes=Array.from({length:34},(_,i)=>({x:Math.random(),y:Math.random(),r:.4+Math.random()*1.8,p:Math.random()*Math.PI*2,s:.2+Math.random()*.8}));
function resize(){const d=devicePixelRatio||1;w=innerWidth;h=innerHeight;canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0)}
addEventListener('resize',resize);resize();
function draw(){t+=.008;ctx.clearRect(0,0,w,h);const g=ctx.createRadialGradient(w*.5,h*.28,0,w*.5,h*.28,Math.max(w,h)*.65);g.addColorStop(0,'rgba(82,190,255,.10)');g.addColorStop(.5,'rgba(78,72,180,.045)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
for(let i=0;i<nodes.length;i++){const n=nodes[i];const x=n.x*w+Math.sin(t*n.s+n.p)*28,y=n.y*h+Math.cos(t*n.s+n.p)*18;ctx.beginPath();ctx.arc(x,y,n.r,0,Math.PI*2);ctx.fillStyle='rgba(130,225,255,.7)';ctx.fill();if(i%4===0){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.sin(t+n.p)*80,y+Math.cos(t+n.p)*80);ctx.strokeStyle='rgba(100,190,255,.045)';ctx.stroke()}}
requestAnimationFrame(draw)}draw();
const rail=document.createElement('aside');rail.className='gw-concept-rail';rail.innerHTML=[
['WORLD','MEGACITY'],['SKY','ORBITAL GRID'],['FORM','FLOATING GARDENS'],['LIFE','CREATURES'],['IDENTITY','AURORA']
].map(([a,b])=>`<div class="gw-concept"><span>${a}</span><b>${b}</b><i></i></div>`).join('');
document.body.appendChild(rail);
const caption=document.createElement('div');caption.className='gw-art-caption';caption.textContent='GRID ART DIRECTOR // FIRST LIGHT · LIVE';document.body.appendChild(caption);
let phase=0;setInterval(()=>{phase++;caption.textContent=['GRID ART DIRECTOR // FIRST LIGHT · LIVE','LIVING SYSTEMS // WIND · LIGHT · WILDLIFE','CONCEPT ATLAS // FORM · LIFE · MEMORY'][phase%3]},4200);
