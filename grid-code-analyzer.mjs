import fs from 'node:fs';import path from 'node:path';
const root=process.cwd(),skip=new Set(['node_modules','.git','dist']),files=[];
function walk(d){for(const n of fs.readdirSync(d)){if(skip.has(n))continue;const p=path.join(d,n),s=fs.statSync(p);s.isDirectory()?walk(p):files.push(p)}}walk(root);
const source=files.filter(p=>/\.(ts|js|css|html)$/.test(p)),html=source.filter(p=>p.endsWith('.html'));
const routeFor=p=>{const rel=path.relative(root,p).replaceAll(path.sep,'/');if(rel==='index.html')return '/';if(rel.startsWith('games/'))return '/'+rel;return '/'+rel};
const routes=new Set(html.map(routeFor)),missing=[],duplicateIds=[],assetRefs=[],badAssetRefs=[];
for(const file of html){
 const t=fs.readFileSync(file,'utf8'),rel=path.relative(root,file);
 const ids=[...t.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);const seen=new Set();for(const id of ids){if(seen.has(id))duplicateIds.push({file:rel,id});seen.add(id)}
 for(const m of t.matchAll(/(?:href|src)=["']([^"'#?]+)(?:\?[^"']*)?["']/g)){
  const ref=m[1];if(ref.startsWith('/')&&ref.endsWith('.html')&&!routes.has(ref))missing.push({file:rel,ref});
  if(ref.startsWith('/'))assetRefs.push(ref);
 }
}
const assets=files.filter(p=>/\.(glb|gltf|fbx|obj|png|jpe?g|webp|avif|gif|svg|woff2?|ttf)$/i.test(p));
for(const ref of assetRefs){const candidate=path.join(root,ref.replace(/^\//,''));if(!fs.existsSync(candidate)&&!routes.has(ref)&&!ref.includes('?'))badAssetRefs.push(ref)}
const report={generatedAt:new Date().toISOString(),filesScanned:source.length,htmlRoutes:routes.size,assetFiles:assets.length,missingInternalRoutes:missing,duplicateIds,badAssetRefs,checks:{routeLinks:missing.length===0,duplicateIds:duplicateIds.length===0,assetRefs:badAssetRefs.length===0}};
fs.mkdirSync('public/diagnostics',{recursive:true});fs.writeFileSync('public/diagnostics/code-health.json',JSON.stringify(report,null,2));
if(missing.length||duplicateIds.length||badAssetRefs.length)process.exit(1);
console.log('GRID CODE ANALYZER',JSON.stringify(report));