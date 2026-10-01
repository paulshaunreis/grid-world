import * as THREE from 'three';
export function inspectGrid3D(root:HTMLElement){
  const canvases=[...root.querySelectorAll('canvas')];
  const valid=canvases.some(c=>c.width>0&&c.height>0);
  let webgl=false;
  for(const canvas of canvases){try{webgl=webgl||!!canvas.getContext('webgl2')||!!canvas.getContext('webgl')}catch{}}
  return {canvasCount:canvases.length,hasSizedCanvas:valid,webgl,healthy:valid&&webgl};
}
export function installGrid3DWatchdog(root:HTMLElement){
  const report=()=>{const result=inspectGrid3D(root);root.dataset.grid3dHealth=result.healthy?'ok':result.canvasCount?'warning':'missing';return result};
  window.setTimeout(report,1200); window.setInterval(report,10000); return report;
}