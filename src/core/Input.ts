export type GridControlMode='KEYBOARD'|'CONTROLLER'|'TOUCH';
export class Input{
 private keys=new Set<string>(); private mode:GridControlMode='KEYBOARD'; private axes={x:0,y:0,lookX:0,lookY:0}; private buttons=new Set<string>();
 constructor(){addEventListener('keydown',e=>{this.keys.add(e.code);if(e.code.startsWith('Key')||e.code.startsWith('Arrow'))this.mode='KEYBOARD';});addEventListener('keyup',e=>this.keys.delete(e.code));addEventListener('gamepadconnected',()=>this.mode='CONTROLLER');}
 setMode(mode:GridControlMode){this.mode=mode;}
 get controlMode(){return this.mode;}
 setMove(x:number,y:number){this.axes.x=Math.max(-1,Math.min(1,x));this.axes.y=Math.max(-1,Math.min(1,y));}
 setLook(x:number,y:number){this.axes.lookX=x;this.axes.lookY=y;}
 press(action:string){this.buttons.add(action);} release(action:string){this.buttons.delete(action);}
 isActionDown(action:string){return this.buttons.has(action);}
 axisX(){return this.axes.x;} axisY(){return this.axes.y;} lookX(){return this.axes.lookX;} lookY(){return this.axes.lookY;}
 isDown(code:string){if(this.keys.has(code))return true;const pad=navigator.getGamepads?.().find(Boolean);if(!pad)return false;const map:any={KeyW:'up',ArrowUp:'up',KeyS:'down',ArrowDown:'down',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',Space:'jump',ShiftLeft:'sprint'};const a=map[code];if(a==='up')return pad.axes[1]<-.28;if(a==='down')return pad.axes[1]>.28;if(a==='left')return pad.axes[0]<-.28;if(a==='right')return pad.axes[0]>.28;if(a==='jump')return !!pad.buttons[0]?.pressed;if(a==='sprint')return !!pad.buttons[10]?.pressed;return false;}
 moveVector(){if(this.mode==='TOUCH'||this.mode==='CONTROLLER')return{x:this.axisX(),y:this.axisY()};return{x:Number(this.isDown('KeyD'))-Number(this.isDown('KeyA')),y:Number(this.isDown('KeyW'))-Number(this.isDown('KeyS'))};}
 update(){if(this.mode!=='CONTROLLER')return;const pad=navigator.getGamepads?.().find(Boolean);if(!pad)return;const dz=(v:number)=>Math.abs(v)<.14?0:v;this.axes.x=dz(pad.axes[0]||0);this.axes.y=-dz(pad.axes[1]||0);this.axes.lookX=dz(pad.axes[2]||0);this.axes.lookY=dz(pad.axes[3]||0);}
}