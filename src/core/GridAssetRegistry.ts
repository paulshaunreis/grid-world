import {createHash} from './GridStableIdentity';
export type GridAssetKind='image'|'model'|'font'|'audio';
export interface GridAsset{id:string;url:string;kind:GridAssetKind;version:number;critical?:boolean;provenance?:string}
const asset=(url:string,kind:GridAssetKind,critical=false):GridAsset=>({id:createHash('asset:'+url),url,kind,version:1,critical,provenance:'Grid World'});
export const GRID_ASSETS:GridAsset[]=[
asset('/grid-world-logo.svg','image',true),asset('/art/grid-page-atlas.svg','image',true),asset('/art/grid-ui-atlas.svg','image',true),asset('/art/hero-worlds.svg','image',true),
asset('/grid-concept-first-light.svg','image',true),asset('/grid-concept-living-wilds.svg','image',true),asset('/grid-concept-civic.svg','image',true),
asset('/art/team-studio.svg','image'),asset('/art/combat-system.svg','image'),asset('/grid-world-pulse-art.svg','image'),asset('/art/asset-constellation.svg','image'),asset('/art/foundation.svg','image'),
asset('/worlds/tideline.svg','image'),asset('/worlds/crown.svg','image'),asset('/worlds/verdant.svg','image'),asset('/worlds/muse.svg','image'),asset('/worlds/frontier.svg','image')
];