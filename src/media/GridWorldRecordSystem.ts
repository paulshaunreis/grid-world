export type GridRecordState='IDLE'|'RECORDING'|'PAUSED'|'FINISHED';
export interface GridRecordSettings { mic:boolean; camera:boolean; worldAudio:boolean; fps:number; resolution:'720p'|'1080p'|'1440p'; includeHud:boolean; }
export interface GridWorldRecord { id:string; worldId:string; ownerId:string; state:GridRecordState; startedAt:number; elapsedMs:number; settings:GridRecordSettings; mediaBlob?:Blob; }

export class GridWorldRecordSystem {
  private state:GridRecordState='IDLE'; private startedAt=0; private elapsed=0; private recorder:MediaRecorder|null=null; private chunks:Blob[]=[];
  getState(){return this.state;}
  async start(stream:MediaStream,settings:GridRecordSettings){if(this.state==='RECORDING')return;this.chunks=[];this.startedAt=Date.now();this.state='RECORDING';const mime=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(x=>MediaRecorder.isTypeSupported(x))||'';this.recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);this.recorder.ondataavailable=e=>{if(e.data.size)this.chunks.push(e.data);};this.recorder.onstop=()=>{this.elapsed=Date.now()-this.startedAt;};this.recorder.start(1000);}
  pause(){if(this.recorder&&this.state==='RECORDING'){this.recorder.pause();this.state='PAUSED';}}
  resume(){if(this.recorder&&this.state==='PAUSED'){this.recorder.resume();this.state='RECORDING';}}
  async stop(){if(!this.recorder)return null;const r=this.recorder;return await new Promise<Blob>(resolve=>{r.onstop=()=>{this.state='FINISHED';this.elapsed=Date.now()-this.startedAt;resolve(new Blob(this.chunks,{type:r.mimeType||'video/webm'}));};r.stop();});}
  getElapsedMs(){return this.elapsed||(this.startedAt?Date.now()-this.startedAt:0);}
}
