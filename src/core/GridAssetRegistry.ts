import {createHash} from './GridStableIdentity';
export type GridAssetKind='image'|'model'|'font'|'audio';
export interface GridAsset{id:string;url:string;kind:GridAssetKind;version:number;critical?:boolean;provenance?:string}
const asset=(url:string,kind:GridAssetKind,critical=false):GridAsset=>({id:createHash('asset:'+url),url,kind,version:1,critical,provenance:'Grid World'});
export const GRID_ASSETS:GridAsset[]=[
asset('/grid-world-logo.svg','image',true),asset('/art/grid-page-atlas.webp','image',true),asset('/art/grid-ui-atlas.webp','image',true),asset('/art/hero-worlds.webp','image',true),
asset('/grid-concept-first-light.webp','image',true),asset('/grid-concept-living-wilds.webp','image',true),asset('/grid-concept-civic.webp','image',true),
asset('/art/team-studio.webp','image'),asset('/art/combat-system.webp','image'),asset('/grid-world-pulse-art.webp','image'),asset('/art/asset-constellation.webp','image'),asset('/art/foundation.webp','image'),
asset('/worlds/tideline.webp','image'),asset('/worlds/crown.webp','image'),asset('/worlds/verdant.webp','image'),asset('/worlds/muse.webp','image'),asset('/worlds/frontier.webp','image')
];