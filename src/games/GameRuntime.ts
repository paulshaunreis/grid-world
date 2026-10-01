import {GRID_GAMES,GridGameDefinition} from './GridGameCatalog';
export function getGame(key:string){const k=key.toUpperCase();return GRID_GAMES.find(g=>g.id===k)||GRID_GAMES[0]}
const suits=['◆','●','▲','■'], ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
export function deck(){return suits.flatMap(s=>ranks.map(r=>({s,r})));}
export function cardGame(root:HTMLElement,status:HTMLElement){
 let d=deck().sort(()=>Math.random()-.5), hand=d.splice(0,2), score=0;
 root.innerHTML='<div class="card-table"><div class="cards" id="hand"></div><button id="draw">DRAW CARD</button><div class="score">SCORE <b id="score">0</b></div></div>';
 const render=()=>{root.querySelector('#hand')!.innerHTML=hand.map(c=>'<span class="playing-card"><i>'+c.s+'</i>'+c.r+'</span>').join('');(root.querySelector('#score') as HTMLElement).textContent=String(score)};
 root.querySelector('#draw')!.addEventListener('click',()=>{const c=d.shift();if(!c){status.textContent='Deck exhausted · start a new session.';return} hand.push(c);score+=['A','K','Q','J'].includes(c.r)?10:Number(c.r)||10;render();status.textContent='Card drawn · +points applied.'});render();
}
export function diceGame(root:HTMLElement,status:HTMLElement){
 root.innerHTML='<div class="dice-table"><button id="roll">ROLL GRID DICE</button><div id="dice">◇ ◇</div><div id="sum">SUM 0</div></div>';
 root.querySelector('#roll')!.addEventListener('click',()=>{const a=1+Math.floor(Math.random()*6),b=1+Math.floor(Math.random()*6);root.querySelector('#dice')!.textContent='◈ '+a+'   ◈ '+b;(root.querySelector('#sum') as HTMLElement).textContent='SUM '+(a+b);status.textContent='Roll resolved · no cash wagering.'});
}
export function genericGame(root:HTMLElement,g:GridGameDefinition,status:HTMLElement){
 root.innerHTML='<div class="generic-game"><div class="game-symbol">◇</div><h2>'+g.name+'</h2><p>Custom Grid ruleset initialized. This game surface is connected to the central game registry.</p><button id="action">TAKE ACTION</button><div id="meter">PROGRESS 0%</div></div>';
 let p=0;root.querySelector('#action')!.addEventListener('click',()=>{p=Math.min(100,p+10);(root.querySelector('#meter') as HTMLElement).textContent='PROGRESS '+p+'%';status.textContent='Action resolved · '+p+'% session progress.'});
}