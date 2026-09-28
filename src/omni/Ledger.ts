import type { OmniAssetDefinition } from './Asset';

export type OmniEntryKind =
  | 'credit'
  | 'debit'
  | 'transfer'
  | 'reversal';

export interface OmniLedgerEntry {
  readonly id: string;
  readonly accountId: string;
  readonly asset: OmniAssetDefinition;
  readonly kind: OmniEntryKind;
  readonly amountMinor: bigint;
  readonly referenceType: string;
  readonly referenceId: string;
  readonly createdAt: string;
  readonly metadata: Readonly<Record<string, string>>;
}

export interface OmniAccount {
  readonly id: string;
  readonly ownerId: string;
  readonly status: 'active' | 'frozen' | 'closed';
}

export interface OmniBalance {
  readonly accountId: string;
  readonly assetId: string;
  readonly amountMinor: bigint;
}

export function calculateBalance(
  accountId: string,
  assetId: string,
  entries: readonly OmniLedgerEntry[],
): OmniBalance {
  let amountMinor = 0n;

  for (const entry of entries) {
    if (entry.accountId !== accountId || entry.asset.id !== assetId) continue;

    if (entry.kind === 'credit' || entry.kind === 'reversal') {
      amountMinor += entry.amountMinor;
    } else {
      amountMinor -= entry.amountMinor;
    }
  }

  return {
    accountId,
    assetId,
    amountMinor,
  };
}
