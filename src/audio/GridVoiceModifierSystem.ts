export type VoicePreset='natural'|'deeper'|'brighter'|'robotic'|'airy';
export interface VoiceModifierSettings{preset:VoicePreset;pitch:number;formant:number;rate:number;wet:number;}
export class GridVoiceModifierSystem{
  private ctx:AudioContext|null=null;
  private source:MediaStreamAudioSourceNode|null=null;
  private destination:MediaStreamAudioDestinationNode|null=null;
  private settings:VoiceModifierSettings={preset:'natural',pitch:1,formant:1,rate:1,wet:.35};
  private stream:MediaStream|null=null;
  async start(stream:MediaStream){
    this.stop(); this.stream=stream;
    const Ctx=window.AudioContext||((window as any).webkitAudioContext);
    if(!Ctx) return null;
    this.ctx=new Ctx(); this.source=this.ctx.createMediaStreamSource(stream); this.destination=this.ctx.createMediaStreamDestination();
    const input=this.ctx.createGain(); const output=this.ctx.createGain(); input.gain.value=1; output.gain.value=.85;
    this.source.connect(input); input.connect(output); output.connect(this.destination); return this.destination.stream;
  }
  setSettings(next:Partial<VoiceModifierSettings>){this.settings={...this.settings,...next};}
  getSettings(){return {...this.settings};}
  stop(){this.source?.disconnect();this.destination?.disconnect();this.ctx?.close();this.source=null;this.destination=null;this.ctx=null;}
}
