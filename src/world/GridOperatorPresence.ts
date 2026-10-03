import type { GridOperatorService } from '../operator/GridOperatorService';
import type { GridVoiceSystem } from '../audio/GridVoiceSystem';
import type { QuestSystem } from './QuestSystem';
import type { WorldPulseSnapshot } from './WorldPulseDiagnostics';
import { formatWorldPulseValue, worldPulseOverallHealth } from './WorldPulseDiagnostics';

export interface GridOperatorGuideProfile {
  voiceId: string;
  autoSpeak: boolean;
  mysterious: boolean;
}

const STORAGE = 'grid-world:operator-guide:v1';

export class GridOperatorPresence {
  private profile: GridOperatorGuideProfile = { voiceId: 'aurora', autoSpeak: true, mysterious: true };
  private open = false;
  private readonly root: HTMLDivElement;
  private readonly messages: HTMLDivElement;
  private readonly input: HTMLInputElement;
  private readonly voiceSelect: HTMLSelectElement;
  private readonly pulseRoot: HTMLDivElement;
  private pulseTimer = 0;

  constructor(
    private readonly operator: GridOperatorService | null,
    private readonly voice: GridVoiceSystem,
    private readonly quests: QuestSystem,
    private readonly getWorldContext: () => { world: string; event: string },
    private readonly addChat: (sender: string, text: string) => void,
    private readonly getWorldPulse?: () => WorldPulseSnapshot,
  ) {
    this.load();
    this.root = document.createElement('div');
    this.root.className = 'grid-operator-inworld';
    this.root.innerHTML = `
      <div class="goiw-head"><span>GRID OPERATOR</span><b>◇ GUIDE CHANNEL</b><button type="button" data-close>×</button></div>
      <div class="goiw-mystery">The Grid sees more than the map reveals.</div>
      <div class="goiw-pulse"><div class="goiw-pulse-head"><span>WORLD PULSE</span><b data-pulse-health>ONLINE</b></div><div class="goiw-pulse-grid"></div><small data-pulse-time>LIVE · awaiting telemetry</small></div>
      <div class="goiw-messages" aria-live="polite"></div>
      <form class="goiw-compose"><input maxlength="500" placeholder="Ask the Operator…" aria-label="Ask the Grid Operator"><button>ASK</button></form>
      <div class="goiw-tools"><label>GUIDE VOICE <select></select></label><button type="button" data-speak>VOICE TEST</button><label><input type="checkbox" data-auto> Speak guidance</label></div>
    `;
    document.body.appendChild(this.root);
    this.messages = this.root.querySelector<HTMLDivElement>('.goiw-messages')!;
    this.input = this.root.querySelector<HTMLInputElement>('input[aria-label]')!;
    this.voiceSelect = this.root.querySelector<HTMLSelectElement>('select')!;
    this.pulseRoot = this.root.querySelector<HTMLDivElement>('.goiw-pulse-grid')!;
    const pulsePanel = this.root.querySelector<HTMLElement>('.goiw-pulse');
    if (pulsePanel) Object.assign(pulsePanel.style, { margin: '8px 0', padding: '8px', border: '1px solid rgba(120,220,255,.18)', background: 'rgba(5,12,21,.42)' });
    Object.assign(this.pulseRoot.style, { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '5px' });
    this.populateVoices();
    this.voiceSelect.value = this.profile.voiceId;
    const auto = this.root.querySelector<HTMLInputElement>('[data-auto]')!;
    auto.checked = this.profile.autoSpeak;
    this.root.querySelector<HTMLButtonElement>('[data-close]')!.onclick = () => this.close();
    this.root.querySelector<HTMLButtonElement>('[data-speak]')!.onclick = () => this.speak('Grid Operator online. Your guide channel is yours to shape.');
    this.voiceSelect.onchange = () => { this.profile.voiceId = this.voiceSelect.value; this.save(); };
    auto.onchange = () => { this.profile.autoSpeak = auto.checked; this.save(); };
    this.root.querySelector('form')!.addEventListener('submit', e => { e.preventDefault(); void this.ask(this.input.value); this.input.value=''; });
    this.say('Operator', 'I am listening. Ask when you want the Grid to explain itself.');
    this.updatePulse();
    this.pulseTimer = window.setInterval(() => this.updatePulse(), 1500);
  }

  private populateVoices() {
    const options: Array<[string,string]> = [
      ['aurora','Aurora · warm navigator'], ['grid','Grid · clear system'], ['link','Link · measured'], ['elder','Elder · deep'], ['civitas','Civitas · civic'], ['veyr','Veyr · crisp'], ['nyxen','Nyxen · shadowed'], ['mosaic','Mosaic · artistic'], ['sentinel','Sentinel · guardian'], ['waypoint','Waypoint · gentle'],
    ];
    this.voiceSelect.innerHTML = options.map(([id,label]) => '<option value="'+id+'">'+label+'</option>').join('');
  }

  private load() { try { const raw=localStorage.getItem(STORAGE); if(raw) this.profile={...this.profile,...JSON.parse(raw)}; } catch {} }
  private save() { try { localStorage.setItem(STORAGE,JSON.stringify(this.profile)); } catch {} }

  private updatePulse() {
    const snapshot = this.getWorldPulse?.();
    if (!snapshot) return;
    const health = worldPulseOverallHealth(snapshot);
    const healthNode = this.root.querySelector<HTMLElement>('[data-pulse-health]');
    const timeNode = this.root.querySelector<HTMLElement>('[data-pulse-time]');
    if (healthNode) healthNode.textContent = health;
    if (timeNode) timeNode.textContent = 'UPDATED · ' + new Date(snapshot.lastUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const cells: Array<[string,string]> = [
      ['WORLD', snapshot.world], ['EVENT', snapshot.event], ['PHASE', snapshot.phase], ['SEASON', snapshot.season],
      ['WEATHER', snapshot.weather], ['TEMP', formatWorldPulseValue(snapshot.temperatureC, 1) + ' °C'], ['HUMIDITY', formatWorldPulseValue(snapshot.humidity * 100) + '%'],
      ['ACTIVITY', formatWorldPulseValue(snapshot.activity)], ['ECOLOGY', formatWorldPulseValue(snapshot.ecology)],
      ['NPCS', snapshot.npcPopulation + ' · ACTIVE ' + snapshot.npcActive], ['WORK', String(snapshot.npcWorking)], ['TALK', String(snapshot.npcTalking)],
      ['MISSIONS', String(snapshot.activeMissions)], ['TRANSIT NODES', String(snapshot.transitNodes)], ['TRANSIT FLOW', formatWorldPulseValue(snapshot.transitTraffic, 1)],
      ['STABILITY', formatWorldPulseValue(snapshot.consequenceStability * 100) + '%'], ['PRESSURE', formatWorldPulseValue(snapshot.consequencePressure, 2)],
      ['PERSISTENCE', snapshot.persistence], ['TRANSIT', snapshot.transit], ['CLOUD', snapshot.cloud],
    ];
    this.pulseRoot.replaceChildren(...cells.map(([label,value]) => {
      const cell=document.createElement('div'); cell.className='goiw-pulse-cell';
      Object.assign(cell.style, { display: 'grid', gap: '2px', padding: '5px', border: '1px solid rgba(120,220,255,.10)', background: 'rgba(8,16,28,.42)' });
      const a=document.createElement('span'); a.textContent=label;
      const b=document.createElement('b'); b.textContent=value;
      cell.append(a,b); return cell;
    }));
  }

  private say(sender:string,text:string) {
    const row=document.createElement('div'); row.className='goiw-msg'; row.innerHTML='<b>'+sender+'</b>';
    const body=document.createElement('span'); body.textContent=text; row.appendChild(body); this.messages.appendChild(row); this.messages.scrollTop=this.messages.scrollHeight;
    if(this.profile.autoSpeak && sender==='Operator') this.speak(text);
  }
  private speak(text:string) { this.voice.speak(this.profile.voiceId,text); }

  async ask(message:string) {
    const q=message.trim(); if(!q)return;
    this.say('You',q);
    const snapshot=this.quests.getQuests().filter(x=>x.status==='ACTIVE'||x.status==='TURN_IN').slice(0,12).map(x=>({id:x.id,title:x.title,status:x.status,objective:x.objective,progress:x.progress,target:x.target,world:x.world}));
    if(!this.operator) { this.say('Operator','The local guide channel is active, but the Grid service is offline. I can still read your current mission state.'); return; }
    try {
      const ctx=this.getWorldContext();
      const result=await this.operator.chat(q,{ world:ctx.world,event:ctx.event, missions:snapshot, mysterious:this.profile.mysterious });
      this.say('Operator',result.answer);
      this.addChat('OPERATOR',result.answer);
    } catch { this.say('Operator','The guide channel is temporarily quiet. Try again.'); }
  }

  openGuide(message?:string) { this.open=true; this.root.classList.add('open'); if(message) this.say('Operator',message); }
  close() { this.open=false; this.root.classList.remove('open'); }
  toggle() { this.open ? this.close() : this.openGuide(); }
  get isOpen(){return this.open;}
}
