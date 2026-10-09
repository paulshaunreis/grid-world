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

export interface GwcDenomination {
  id: 'GWC_SHARD' | 'GWC_COIN' | 'GWC_BAR' | 'GWC_CRYSTAL';
  name: string;
  symbol: string;
  currencyId: 'grid';
  /**
   * Value of one unit of this denomination in Grid World Currency (GWC).
   * Conversion is intentionally configurable. These labels are part of the
   * Grid World Currency family, not separate currencies, so the economy can change
   * denomination ratios without changing wallet/ledger identity.
   */
  gwcValue: number;
  /** Path to the denomination artwork under public/. */
  art: string;
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

export const GWC_DENOMINATIONS: readonly GwcDenomination[] = [
  { id: 'GWC_SHARD', name: 'GWC Shard', symbol: '◈', currencyId: 'grid', gwcValue: 1, art: '/currency/gwc-shard.webp' },
  { id: 'GWC_COIN', name: 'GWC Coin', symbol: '◎', currencyId: 'grid', gwcValue: 10, art: '/currency/gwc-coin.webp' },
  { id: 'GWC_BAR', name: 'GWC Bar', symbol: '▬', currencyId: 'grid', gwcValue: 100, art: '/currency/gwc-bar.webp' },
  { id: 'GWC_CRYSTAL', name: 'GWC Crystal', symbol: '◇', currencyId: 'grid', gwcValue: 1000, art: '/currency/gwc-crystal.webp' },
] as const;

/**
 * Treasure chest artwork for rewards / loot displays.
 * - closed: standard reward chest, sealed
 * - open: reward chest opened, overflowing with GWC
 * - rare: legendary-tier chest variant
 */
export const GWC_CHESTS = {
  closed: '/currency/gwc-chest-closed.webp',
  open: '/currency/gwc-chest-open.webp',
  rare: '/currency/gwc-chest-rare.webp',
} as const;

/** Break a GWC amount down into the fewest denomination units (largest first). */
export function gwcDenominate(amount: number): { denomination: GwcDenomination; count: number }[] {
  let remaining = Math.max(0, Math.floor(amount));
  const out: { denomination: GwcDenomination; count: number }[] = [];
  for (const d of [...GWC_DENOMINATIONS].sort((a, b) => b.gwcValue - a.gwcValue)) {
    const count = Math.floor(remaining / d.gwcValue);
    if (count > 0) {
      out.push({ denomination: d, count });
      remaining -= count * d.gwcValue;
    }
  }
  return out;
}

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
