export type OmniAssetClass =
  | 'fiat'
  | 'crypto'
  | 'grid-credit'
  | 'circular-credit'
  | 'reward'
  | 'grant';

export interface OmniAssetDefinition {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly assetClass: OmniAssetClass;
  readonly decimals: number;
  readonly issuer?: string;
  readonly network?: string;
  readonly externallyRedeemable: boolean;
}

export const GRID_CREDIT: OmniAssetDefinition = {
  id: 'grid-credit',
  symbol: 'GC',
  name: 'Grid Credit',
  assetClass: 'grid-credit',
  decimals: 2,
  issuer: 'grid-corp',
  externallyRedeemable: false,
};

export const CIRCULAR_CREDIT: OmniAssetDefinition = {
  id: 'circular-credit',
  symbol: 'CC',
  name: 'Circular Credit',
  assetClass: 'circular-credit',
  decimals: 2,
  issuer: 'grid-corp',
  externallyRedeemable: false,
};

export const USD: OmniAssetDefinition = {
  id: 'usd',
  symbol: 'USD',
  name: 'US Dollar',
  assetClass: 'fiat',
  decimals: 2,
  externallyRedeemable: true,
};
