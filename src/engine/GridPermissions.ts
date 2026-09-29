import { GridObject } from './GridObject';

export type GridPermission =
  | 'view'
  | 'modify'
  | 'copy'
  | 'export'
  | 'remix';

export interface GridPermissionContext {
  actorId: string | null;
  relationship: 'owner' | 'collaborator' | 'friend' | 'public';
}

export function canModify(object: GridObject, context: GridPermissionContext): boolean {
  if (context.actorId && context.actorId === object.permissions.ownerId) return true;
  if (object.permissions.modify === 'collaborators' && context.relationship === 'collaborator') return true;
  return object.permissions.modify === 'public';
}

export function canView(object: GridObject, context: GridPermissionContext): boolean {
  if (object.permissions.visibility === 'public') return true;
  if (context.actorId && context.actorId === object.permissions.ownerId) return true;
  return object.permissions.visibility === 'friends' && context.relationship === 'friend';
}

export function can(object: GridObject, permission: GridPermission, context: GridPermissionContext): boolean {
  switch (permission) {
    case 'view': return canView(object, context);
    case 'modify': return canModify(object, context);
    case 'copy': return object.permissions.copy && canView(object, context);
    case 'export': return object.permissions.export && canView(object, context);
    case 'remix': return object.permissions.remix && canView(object, context);
  }
}
