import {GridSystemJobRunner} from './GridSystemJobs';
import {inspectGrid3D} from './Grid3DWatchdog';
import {inspectImageElement} from './GridAssetGuard';
export function installGridHealthMonitor(root:HTMLElement){
 const runner=new GridSystemJobRunner();
 runner.register({id:'3d.viewport',domain:'3D',name:'3D viewport watchdog',intervalMs:10000,run:async()=>{const r=inspectGrid3D(root);return{status:r.healthy?'passed':'warning',message:r.healthy?'WebGL viewport healthy':`Canvas ${r.canvasCount}; sized=${r.hasSizedCanvas}; WebGL=${r.webgl}`}}});
 runner.register({id:'imagery.loaded',domain:'IMAGERY',name:'Imagery watchdog',intervalMs:15000,run:async()=>{const imgs=[...document.images];const reports=await Promise.all(imgs.map(inspectImageElement));const bad=reports.filter(x=>x.status!=='loaded');return{status:bad.length?'warning':'passed',message:`${imgs.length-bad.length}/${imgs.length} imagery resources reachable`}}});
 runner.register({id:'routes.links',domain:'ROUTES',name:'Navigation watchdog',intervalMs:20000,run:async()=>{const links=[...document.querySelectorAll<HTMLAnchorElement>('a[href]')].filter(a=>a.href.startsWith(location.origin));const checks=await Promise.all(links.map(async a=>{try{return(await fetch(a.href,{method:'HEAD',cache:'no-store'})).ok}catch{return false}}));const bad=checks.filter(x=>!x).length;return{status:bad?'warning':'passed',message:`${links.length-bad}/${links.length} internal links reachable`}}});
 runner.register({id:'live.signal',domain:'LIVE',name:'Live heartbeat',intervalMs:5000,run:async()=>({status:'passed',message:'Grid client heartbeat '+new Date().toISOString()})});
 runner.startAll();(window as any).__GRID_HEALTH__=runner;return runner;
}