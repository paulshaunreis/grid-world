export type GridCurrencyCategory =
  | 'core'
  | 'creator'
  | 'resource'
  | 'community'
  | 'event'
  | 'governance'
  | 'collectible';

export interface GridCurrencyDefinition {
  id: string;
  code: string;
  name: string;
  category: GridCurrencyCategory;
  decimals: number;
  tradeable: boolean;
}

export interface GridCoinDenomination {
  id: 'GRID_COPPER' | 'GRID_SILVER' | 'GRID_GOLD' | 'GRID_CRYSTAL';
  name: string;
  symbol: string;
  currencyId: 'grid';
  /**
   * Conversion is intentionally configurable. These labels are part of the
   * Grid World Currency family, not separate currencies, so the economy can change
   * denomination ratios without changing wallet/ledger identity.
   */
  baseUnitsPerCoin?: number;
}

export const GRID_CURRENCIES: readonly GridCurrencyDefinition[] = [
  { id: 'grid', code: 'GRD', name: 'Grid World Currency', category: 'core', decimals: 2, tradeable: true },
  { id: 'aether', code: 'AET', name: 'Aether', category: 'governance', decimals: 2, tradeable: true },
  { id: 'echo', code: 'ECO', name: 'Echo', category: 'community', decimals: 2, tradeable: true },
  { id: 'forge', code: 'FRG', name: 'Forge', category: 'creator', decimals: 2, tradeable: true },
  { id: 'lumen', code: 'LUM', name: 'Lumen', category: 'creator', decimals: 2, tradeable: true },
  { id: 'meridian', code: 'MRD', name: 'Meridian', category: 'collectible', decimals: 2, tradeable: true },
  { id: 'orbit', code: 'ORB', name: 'Orbit', category: 'event', decimals: 2, tradeable: true },
  { id: 'root', code: 'RUT', name: 'Root', category: 'resource', decimals: 2, tradeable: true },
  { id: 'spark', code: 'SPK', name: 'Spark', category: 'creator', decimals: 2, tradeable: true },
  { id: 'tide', code: 'TDE', name: 'Tide', category: 'community', decimals: 2, tradeable: true },
] as const;

export const GRID_COIN_DENOMINATIONS: readonly GridCoinDenomination[] = [
  { id: 'GRID_COPPER', name: 'Grid Copper', symbol: 'c', currencyId: 'grid' },
  { id: 'GRID_SILVER', name: 'Grid Silver', symbol: 's', currencyId: 'grid' },
  { id: 'GRID_GOLD', name: 'Grid Gold', symbol: 'g', currencyId: 'grid' },
  { id: 'GRID_CRYSTAL', name: 'Grid Crystal', symbol: '◇', currencyId: 'grid' },
] as const;

export function currencyById(id: string) {
  return GRID_CURRENCIES.find(currency => currency.id === id);
}

export function formatGridAmount(amount: number, currencyId: string) {
  const currency = currencyById(currencyId);
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: currency?.decimals ?? 2,
    maximumFractionDigits: currency?.decimals ?? 2,
  });
}
