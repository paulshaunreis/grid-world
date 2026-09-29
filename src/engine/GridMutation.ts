import { GridObject, GridObjectProvenance } from './GridObject';
import { canModify, GridPermissionContext } from './GridPermissions';

export interface GridMutation {
  actorId: string;
  reason: string;
  expectedVersion?: string;
}

export function mutateGridObject(
  object: GridObject,
  context: GridPermissionContext,
  mutation: GridMutation,
  apply: (object: GridObject) => void,
): boolean {
  if (!canModify(object, context)) return false;
  if (mutation.expectedVersion && mutation.expectedVersion !== object.provenance.version) return false;

  apply(object);

  const versionParts = object.provenance.version.split('.');
  const patch = Number(versionParts[2] ?? 0);
  object.provenance = {
    ...object.provenance,
    version: `${versionParts[0] ?? '0'}.${versionParts[1] ?? '1'}.${patch + 1}`,
  };
  return true;
}

export function cloneProvenance(
  source: GridObject,
  creatorId: string | null,
): GridObjectProvenance {
  return {
    creatorId,
    createdAt: new Date().toISOString(),
    parentObjectId: source.id,
    sourceAssetId: source.provenance.sourceAssetId,
    version: '1.0.0',
  };
}
