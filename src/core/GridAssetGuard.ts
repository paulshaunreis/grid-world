const IMAGE_EXT=/\.(png|jpe?g|webp|gif|svg|avif)(\?.*)?$/i;
const MODEL_EXT=/\.(glb|gltf|fbx|obj|blend)(\?.*)?$/i;
export interface GridAssetReport{url:string;kind:'image'|'model'|'unknown';status:'loaded'|'missing'|'error'}
export async function inspectGridAsset(url:string):Promise<GridAssetReport>{
  const kind=IMAGE_EXT.test(url)?'image':MODEL_EXT.test(url)?'model':'unknown';
  try{const r=await fetch(url,{method:'HEAD',cache:'no-store'});return {url,kind,status:r.ok?'loaded':'missing'}}
  catch{return {url,kind,status:'error'}}
}
export async function inspectImageElement(img:HTMLImageElement){return inspectGridAsset(img.currentSrc||img.src)}
