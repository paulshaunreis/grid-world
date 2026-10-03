import fs from 'node:fs';import path from 'node:path';
const root=process.cwd(),skip=new Set(['node_modules','.git','dist']),files=[];
const policyPath=path.join(root,'grid-resilience.json');
const requiredPrinciples=['A single asset, world, database partition, or monitoring failure must not blank the entire client.','Persistent player/world state must be versioned, exportable, and recoverable.','Build integrity checks must fail before deployment when internal routes or local assets are broken.'];
let resiliencePolicy={ok:false,missing:requiredPrinciples};
if(fs.existsSync(policyPath)){try{const policy=JSON.parse(fs.readFileSync(policyPath,'utf8'));const principles=Array.isArray(policy.principles)?policy.principles:[];const missing=requiredPrinciples.filter(p=>!principles.includes(p));resiliencePolicy={ok:missing.length===0,missing};}catch(error){resiliencePolicy={ok:false,missing:requiredPrinciples,error:String(error)}}}
function walk(d){for(const n of fs.readdirSync(d)){if(skip.has(n))continue;const p=path.join(d,n),s=fs.statSync(p);s.isDirectory()?walk(p):files.push(p)}}walk(root);
const source=files.filter(p=>/\.(ts|js|css|html)$/.test(p)),html=source.filter(p=>p.endsWith('.html'));
const routeFor=p=>{const rel=path.relative(root,p).replaceAll(path.sep,'/');if(rel==='index.html')return '/';return '/'+rel};
const routes=new Set(html.map(routeFor)),missing=[],duplicateIds=[],badAssetRefs=[],assetRefs=[],visualShellViolations=[];
const isLocalAsset=r=>r.startsWith('/')&&!r.startsWith('//')&&/\.(svg|png|jpe?g|webp|avif|gif|glb|gltf|fbx|obj|woff2?|ttf|mp3|ogg|wav)(\?|$)/i.test(r);
for(const file of source){
 const t=fs.readFileSync(file,'utf8'),rel=path.relative(root,file);
 if(file.endsWith('.html')){
  const isPublicPage=routeFor(file)!=='/' || file.endsWith(path.join('index.html'));
  if(isPublicPage && !t.includes('grid-page-visual.css'))visualShellViolations.push({file:rel,reason:'missing shared grid-page-visual.css'});
 }
 if(file.endsWith('.html')){const ids=[...t.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);const seen=new Set();for(const id of ids){if(seen.has(id))duplicateIds.push({file:rel,id});seen.add(id)}}
 for(const m of t.matchAll(/(?:href|src)=["']([^"'#?]+)(?:\?[^"']*)?["']/g)){const ref=m[1];if(ref.includes('${'))continue;if(ref.startsWith('/')&&ref.endsWith('.html')&&!routes.has(ref))missing.push({file:rel,ref});if(isLocalAsset(ref))assetRefs.push({file:rel,ref})}
 for(const m of t.matchAll(/(?:url\(|['"])(\/[^'")\s]+\.(?:svg|png|jpe?g|webp|avif|gif|glb|gltf|fbx|obj|woff2?|ttf|mp3|ogg|wav)(?:\?[^'")\s]*)?)/gi)){if(m[1].includes('${'))continue;assetRefs.push({file:rel,ref:m[1]})}
}
for(const {file,ref} of assetRefs){const clean=ref.split('?')[0];const relative=clean.replace(/^\//,'');const candidate=path.join(root,'public',relative);if(!fs.existsSync(candidate))badAssetRefs.push({file,ref})}
const assets=files.filter(p=>/\.(glb|gltf|fbx|obj|png|jpe?g|webp|avif|gif|svg|woff2?|ttf|mp3|ogg|wav)$/i.test(p));
const report={generatedAt:new Date().toISOString(),filesScanned:source.length,htmlRoutes:routes.size,assetFiles:assets.length,missingInternalRoutes:missing,duplicateIds,badAssetRefs,resiliencePolicy,checks:{routeLinks:missing.length===0,duplicateIds:duplicateIds.length===0,assetRefs:badAssetRefs.length===0,visualShell:visualShellViolations.length===0,resiliencePolicy:resiliencePolicy.ok}};
fs.mkdirSync('public/diagnostics',{recursive:true});fs.writeFileSync('public/diagnostics/code-health.json',JSON.stringify(report,null,2));
console.log('GRID CODE ANALYZER RESULT',JSON.stringify({missingRoutes:missing,duplicateIds,badAssetRefs,visualShellViolations,resiliencePolicy}));if(missing.length||duplicateIds.length||badAssetRefs.length||visualShellViolations.length||!resiliencePolicy.ok)process.exit(1);
console.log('GRID CODE ANALYZER',JSON.stringify(report));