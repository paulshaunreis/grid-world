export interface GridMarketplaceItemMetadata {
  itemId: string;
  displayName: string;
  category: 'FOOD'|'MATERIAL'|'TOOL'|'QUEST'|'BLUEPRINT'|'RESOURCE'|'UNKNOWN';
  quality?: number;
  artKey: string;
  modelKey: string;
  tags: string[];
}

const CATEGORY_BY_PREFIX: Record<string, GridMarketplaceItemMetadata['category']> = {
  FOOD:'FOOD', TOOL:'TOOL', QUEST:'QUEST', BLUEPRINT:'BLUEPRINT',
};

export function marketplaceItemMetadata(itemId:string, quality?:number): GridMarketplaceItemMetadata {
  const normalized=itemId.trim().toUpperCase();
  const prefix=normalized.split('_')[0];
  const category=CATEGORY_BY_PREFIX[prefix] ?? (
    /SALT|RESIN|ORE|FIBER|SCRAP|MINERAL|COMPONENT|MATERIAL|PIGMENT|THREAD/.test(normalized)
      ? 'RESOURCE'
      : 'MATERIAL'
  );
  const displayName=normalized
    .toLowerCase()
    .split('_')
    .map(part=>part.charAt(0).toUpperCase()+part.slice(1))
    .join(' ');
  const slug=normalized.toLowerCase().replace(/[^a-z0-9]+/g,'-');
  return {
    itemId,
    displayName,
    category,
    ...(quality === undefined ? {} : {quality:Math.max(0,Math.min(100,quality))}),
    artKey:`marketplace/item/${slug}`,
    modelKey:`marketplace/model/${slug}`,
    tags:[category.toLowerCase(), ...normalized.split('_').slice(0,2).map(value=>value.toLowerCase())],
  };
}
