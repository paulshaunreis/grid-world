import {Input,GridControlMode} from '../core/Input';
export class GridTouchController{
 private movePointer:number|null=null; private lookPointer:number|null=null;
 constructor(private readonly input:Input,private readonly root:HTMLElement){
  root.style.touchAction='none';
  root.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch')return;const r=root.getBoundingClientRect();const x=e.clientX-r.left;if(x<r.width*.5){this.movePointer=e.pointerId;root.setPointerCapture(e.pointerId);}else{this.lookPointer=e.pointerId;root.setPointerCapture(e.pointerId);}this.input.setMode('TOUCH');});
  root.addEventListener('pointermove',e=>{const r=root.getBoundingClientRect();if(e.pointerId===this.movePointer){const cx=r.left+r.width*.18,cy=r.top+r.height*.78;this.input.setMove(Math.max(-1,Math.min(1,(e.clientX-cx)/(r.width*.14))),Math.max(-1,Math.min(1,(cy-e.clientY)/(r.height*.14))));}else if(e.pointerId===this.lookPointer){this.input.setLook(e.movementX*.35,e.movementY*.35);}});
  const release=(e:PointerEvent)=>{if(e.pointerId===this.movePointer){this.movePointer=null;this.input.setMove(0,0);}if(e.pointerId===this.lookPointer){this.lookPointer=null;this.input.setLook(0,0);}};
  root.addEventListener('pointerup',release);root.addEventListener('pointercancel',release);
 }
}
export class GridInputModeUI{
 constructor(private readonly input:Input,private readonly host:HTMLElement){
  host.innerHTML='<div class="grid-input-switch"><button data-mode="KEYBOARD">KEYBOARD</button><button data-mode="CONTROLLER">CONTROLLER</button><button data-mode="TOUCH">TOUCH</button></div>';
  host.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.onclick=()=>this.input.setMode(b.dataset.mode as GridControlMode));
 }
}