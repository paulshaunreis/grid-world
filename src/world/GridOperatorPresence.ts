import type { GridOperatorService } from '../operator/GridOperatorService';
import type { GridVoiceSystem } from '../audio/GridVoiceSystem';
import type { QuestSystem } from './QuestSystem';

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

  constructor(
    private readonly operator: GridOperatorService | null,
    private readonly voice: GridVoiceSystem,
    private readonly quests: QuestSystem,
    private readonly getWorldContext: () => { world: string; event: string },
    private readonly addChat: (sender: string, text: string) => void,
  ) {
    this.load();
    this.root = document.createElement('div');
    this.root.className = 'grid-operator-inworld';
    this.root.innerHTML = `
      <div class="goiw-head"><span>GRID OPERATOR</span><b>◇ GUIDE CHANNEL</b><button type="button" data-close>×</button></div>
      <div class="goiw-mystery">The Grid sees more than the map reveals.</div>
      <div class="goiw-messages" aria-live="polite"></div>
      <form class="goiw-compose"><input maxlength="500" placeholder="Ask the Operator…" aria-label="Ask the Grid Operator"><button>ASK</button></form>
      <div class="goiw-tools"><label>GUIDE VOICE <select></select></label><button type="button" data-speak>VOICE TEST</button><label><input type="checkbox" data-auto> Speak guidance</label></div>
    `;
    document.body.appendChild(this.root);
    this.messages = this.root.querySelector<HTMLDivElement>('.goiw-messages')!;
    this.input = this.root.querySelector<HTMLInputElement>('input[aria-label]')!;
    this.voiceSelect = this.root.querySelector<HTMLSelectElement>('select')!;
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
  }

  private populateVoices() {
    const options: Array<[string,string]> = [
      ['aurora','Aurora · warm navigator'], ['grid','Grid · clear system'], ['link','Link · measured'], ['elder','Elder · deep'], ['civitas','Civitas · civic'], ['veyr','Veyr · crisp'], ['nyxen','Nyxen · shadowed'], ['mosaic','Mosaic · artistic'], ['sentinel','Sentinel · guardian'], ['waypoint','Waypoint · gentle'],
    ];
    this.voiceSelect.innerHTML = options.map(([id,label]) => '<option value="'+id+'">'+label+'</option>').join('');
  }

  private load() { try { const raw=localStorage.getItem(STORAGE); if(raw) this.profile={...this.profile,...JSON.parse(raw)}; } catch {} }
  private save() { try { localStorage.setItem(STORAGE,JSON.stringify(this.profile)); } catch {} }

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
