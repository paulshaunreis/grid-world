export type GridAssetKind='image'|'model'|'font'|'audio';
export interface GridAsset{url:string;kind:GridAssetKind;critical?:boolean}
export const GRID_ASSETS:GridAsset[]=[
{url:'/grid-world-logo.svg',kind:'image',critical:true},{url:'/art/grid-page-atlas.svg',kind:'image',critical:true},
{url:'/art/grid-ui-atlas.svg',kind:'image',critical:true},{url:'/art/hero-worlds.svg',kind:'image',critical:true},
{url:'/grid-concept-first-light.svg',kind:'image',critical:true},{url:'/grid-concept-living-wilds.svg',kind:'image',critical:true},
{url:'/grid-concept-civic.svg',kind:'image',critical:true},{url:'/art/team-studio.svg',kind:'image'},
{url:'/art/combat-system.svg',kind:'image'},{url:'/grid-world-pulse-art.svg',kind:'image'},{url:'/art/asset-constellation.svg',kind:'image'},{url:'/art/foundation.svg',kind:'image'},{url:'/worlds/tideline.svg',kind:'image'},{url:'/worlds/crown.svg',kind:'image'},{url:'/worlds/verdant.svg',kind:'image'},{url:'/worlds/muse.svg',kind:'image'},{url:'/worlds/frontier.svg',kind:'image'}
];