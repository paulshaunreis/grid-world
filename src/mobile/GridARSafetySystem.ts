export interface GridARSafetyState{camera:boolean;location:boolean;drivingLock:boolean;speedMps:number;privacyMode:boolean;safeToPlay:boolean;}
export class GridARSafetySystem{
 update(speedMps:number,locationEnabled:boolean,cameraEnabled:boolean):GridARSafetyState{const drivingLock=speedMps>8;return{camera:cameraEnabled,location:locationEnabled,drivingLock,speedMps,privacyMode:true,safeToPlay:!drivingLock&&locationEnabled&&cameraEnabled};}
}