export type GridMediaKind='AUDIO'|'VIDEO'|'MODEL';
export type GridMediaFormat='.mp3'|'.mp4'|'.obj';
export interface GridMediaAsset { id:string; ownerId:string; worldId:string; name:string; kind:GridMediaKind; format:GridMediaFormat; mimeType:string; sizeBytes:number; url:string; createdAt:number; moderationState:'PENDING'|'APPROVED'|'REJECTED'; }

const FORMAT_MAP:Record<string,{kind:GridMediaKind;mime:string}>={'.mp3':{kind:'AUDIO',mime:'audio/mpeg'},'.mp4':{kind:'VIDEO',mime:'video/mp4'},'.obj':{kind:'MODEL',mime:'model/obj'}};

export class GridWorldMediaSystem {
  static readonly SUPPORTED_FORMATS=['.mp3','.mp4','.obj'] as const;
  static readonly MAX_UPLOAD_BYTES=2*1024*1024*1024;
  validate(name:string,sizeBytes:number){const ext='.'+(name.split('.').pop()||'').toLowerCase();const def=FORMAT_MAP[ext];if(!def)throw new Error('Unsupported Grid media format. Supported: .mp3, .mp4, .obj');if(sizeBytes<1||sizeBytes>GridWorldMediaSystem.MAX_UPLOAD_BYTES)throw new Error('Grid media asset exceeds the current upload size policy.');return {extension:ext as GridMediaFormat,...def};}
  classify(name:string,sizeBytes:number){return this.validate(name,sizeBytes);}
}
