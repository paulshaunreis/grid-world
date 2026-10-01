export type GridRevenueProductKind='SUBSCRIPTION'|'HOSTED_WORLD'|'CREATOR_FEE'|'COSMETIC'|'EVENT'|'EDUCATION';

export interface GridRevenueProduct{
  id:string;
  kind:GridRevenueProductKind;
  name:string;
  priceUsd:number|null;
  recurring?:'month'|'year';
  notes:string;
}

export const GRID_REVENUE_MODEL:GridRevenueProduct[]=[
  {id:'grid-plus',kind:'SUBSCRIPTION',name:'Grid Plus',priceUsd:9.99,recurring:'month',notes:'Optional advanced creator tools, analytics and collaboration features.'},
  {id:'grid-world-host',kind:'HOSTED_WORLD',name:'Hosted Private World',priceUsd:19.99,recurring:'month',notes:'Optional private/team world hosting; core public worlds remain free.'},
  {id:'creator-marketplace-fee',kind:'CREATOR_FEE',name:'Creator Marketplace Fee',priceUsd:null,notes:'Target platform share: 10% of eligible real-money creator sales, with the remainder attributed to the creator.'},
  {id:'grid-cosmetics',kind:'COSMETIC',name:'Cosmetic Packs',priceUsd:4.99,notes:'Optional visual/avatar/UI packs with no gameplay power.'},
  {id:'grid-event-hosting',kind:'EVENT',name:'Event Hosting',priceUsd:null,notes:'Quoted infrastructure for concerts, festivals, launches and large community events.'},
  {id:'grid-education',kind:'EDUCATION',name:'Education / Training Spaces',priceUsd:null,notes:'Institutional creator spaces, certification tooling and managed support.'},
];

export const GRID_REVENUE_PRINCIPLES=[
  'Basic account, starter access and ordinary participation stay free.',
  'Do not sell competitive power.',
  'Creators should receive a transparent share of eligible real-money sales.',
  'Every real-money transaction must reconcile against an external payment provider webhook and an immutable Grid ledger.',
  'Never treat client-side purchase success as proof of payment.',
] as const;
