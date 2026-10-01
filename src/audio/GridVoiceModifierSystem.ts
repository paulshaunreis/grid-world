export type VoicePreset='natural'|'deeper'|'brighter'|'robotic'|'airy';
export interface VoiceModifierSettings{preset:VoicePreset;pitch:number;formant:number;rate:number;wet:number;}
export class GridVoiceModifierSystem{
 private ctx:AudioContext|null=null; private source:MediaStreamAudioSourceNode|null=null; private destination:MediaStreamAudioDestinationNode|null=null; private filters:BiquadFilterNode[]=[]; private stream:MediaStream|null=null;
 private settings:VoiceModifierSettings={preset:'natural',pitch:1,formant:1,rate:1,wet:.35};
 async start(stream:MediaStream){this.stop();this.stream=stream;const Ctx=window.AudioContext||((window as any).webkitAudioContext);if(!Ctx)return null;this.ctx=new Ctx();this.source=this.ctx.createMediaStreamSource(stream);this.destination=this.ctx.createMediaStreamDestination();const input=this.ctx.createGain();const output=this.ctx.createGain();input.gain.value=1;output.gain.value=.9;const tone=this.ctx.createBiquadFilter();tone.type='peaking';tone.frequency.value=900;tone.Q.value=.8;tone.gain.value=0;this.filters=[tone];this.source.connect(input);input.connect(tone);tone.connect(output);output.connect(this.destination);this.applyPreset();return this.destination.stream;}
 setSettings(next:Partial<VoiceModifierSettings>){this.settings={...this.settings,...next};this.applyPreset();}
 getSettings(){return {...this.settings};}
 async requestMicrophone(){return navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});}
 private applyPreset(){if(!this.ctx||!this.filters[0])return;const tone=this.filters[0];const s=this.settings;const preset=s.preset==='deeper'?{f:480,g:4}:s.preset==='brighter'?{f:2200,g:3}:s.preset==='robotic'?{f:1300,g:8}:s.preset==='airy'?{f:3600,g:5}:{f:900,g:0};tone.frequency.value=preset.f;tone.gain.value=preset.g*s.wet;}
 stop(){this.source?.disconnect();this.filters.forEach(f=>f.disconnect());this.destination?.disconnect();this.ctx?.close();this.source=null;this.destination=null;this.ctx=null;this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;}
}
