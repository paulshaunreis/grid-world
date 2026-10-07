import type { GridWorldCapabilities } from './WorldCapabilityContract';
import { normalizeWorldCapabilities } from './WorldCapabilityContract';
import type { GridWorldCreationRequest } from './WorldFactory';

export interface DreamSeedWorldBlueprint {
  seedId: string;
  ownerId: string;
  name: string;
  creativeIntent: string;
  realityClass: string;
  visualDirection?: string;
  geography?: string;
  climate?: string;
  architecture?: string;
  materials?: string[];
  flora?: string[];
  fauna?: string[];
  npcPopulationIntent?: string;
  pointsOfInterest?: string[];
  requestedCapabilities?: Partial<GridWorldCapabilities>;
  generationConstraints?: string[];
  blueprintVersion: string;
}

export interface DreamSeedValidationResult {
  valid: boolean;
  errors: string[];
  effectiveCapabilities: GridWorldCapabilities;
}

export interface DreamSeedFactoryRequest {
  seedId: string;
  request: GridWorldCreationRequest;
  validation: DreamSeedValidationResult;
}

export interface DreamSeedPreview {
  previewId: string;
  seedId: string;
  blueprintVersion: string;
  status: 'PREVIEW_ONLY';
  worldRequest: GridWorldCreationRequest;
  summary: {
    name: string;
    creativeIntent: string;
    realityClass: string;
    visualDirection?: string;
    geography?: string;
    climate?: string;
    architecture?: string;
    materials: string[];
    flora: string[];
    fauna: string[];
    npcPopulationIntent?: string;
    pointsOfInterest: string[];
    generationConstraints: string[];
  };
  provenance: {
    source: 'DREAM_SEED_BLUEPRINT';
    seedId: string;
    blueprintVersion: string;
  };
}

const KNOWN_CAPABILITIES = new Set<keyof GridWorldCapabilities>([
  'transit',
  'pve',
  'pvp',
  'building',
  'terrainSculpting',
  'marketplace',
  'socialEventSpaces',
  'ecologyIntensity',
  'creatorPermissions',
]);

/**
 * First runtime bridge for Dream Seed.
 *
 * This adapter does not create worlds, grant permissions, persist seeds, or
 * publish links. It validates a blueprint and translates it into the
 * existing Grid World Factory request shape.
 */
export function validateDreamSeedBlueprint(
  blueprint: DreamSeedWorldBlueprint,
): DreamSeedValidationResult {
  const errors: string[] = [];

  if (!blueprint.seedId.trim()) errors.push('Dream Seed ID is required.');
  if (!blueprint.ownerId.trim()) errors.push('Dream Seed owner ID is required.');
  if (!blueprint.name.trim()) errors.push('Dream Seed world name is required.');
  if (!blueprint.creativeIntent.trim()) errors.push('Dream Seed creative intent is required.');
  if (!blueprint.realityClass.trim()) errors.push('Dream Seed reality class is required.');
  if (!blueprint.blueprintVersion.trim()) errors.push('Dream Seed blueprint version is required.');

  const requested = blueprint.requestedCapabilities ?? {};
  for (const key of Object.keys(requested)) {
    if (!KNOWN_CAPABILITIES.has(key as keyof GridWorldCapabilities)) {
      errors.push('Unknown world capability: ' + key);
    }
  }

  if (requested.creatorPermissions === 'FULL') {
    errors.push('Dream Seed cannot grant FULL creator permissions.');
  }

  if (requested.ecologyIntensity && !['LOW', 'MEDIUM', 'HIGH'].includes(requested.ecologyIntensity)) {
    errors.push('Invalid ecology intensity.');
  }

  const effectiveCapabilities = normalizeWorldCapabilities({
    ...requested,
    creatorPermissions: requested.creatorPermissions ?? 'BUILD',
  });

  return { valid: errors.length === 0, errors, effectiveCapabilities };
}

export function toDreamSeedFactoryRequest(
  blueprint: DreamSeedWorldBlueprint,
): DreamSeedFactoryRequest {
  const validation = validateDreamSeedBlueprint(blueprint);
  if (!validation.valid) {
    throw new Error('Dream Seed blueprint validation failed: ' + validation.errors.join(' '));
  }

  const request: GridWorldCreationRequest = {
    name: blueprint.name,
    description: blueprint.creativeIntent,
    tags: [
      blueprint.realityClass,
      ...(blueprint.geography ? [blueprint.geography] : []),
      ...(blueprint.climate ? [blueprint.climate] : []),
      ...(blueprint.architecture ? [blueprint.architecture] : []),
      ...(blueprint.materials ?? []),
      ...(blueprint.flora ?? []),
      ...(blueprint.fauna ?? []),
    ].filter(Boolean),
    capabilities: validation.effectiveCapabilities,
  };

  return { seedId: blueprint.seedId, request, validation };
}

/**
 * Builds a deterministic, inspectable preview without registering a world,
 * writing persistence state, granting permissions, or publishing a link.
 */
export function buildDreamSeedPreview(
  blueprint: DreamSeedWorldBlueprint,
): DreamSeedPreview {
  const { request } = toDreamSeedFactoryRequest(blueprint);

  return {
    previewId: `dream-preview-${blueprint.seedId}-${blueprint.blueprintVersion}`,
    seedId: blueprint.seedId,
    blueprintVersion: blueprint.blueprintVersion,
    status: 'PREVIEW_ONLY',
    worldRequest: request,
    summary: {
      name: blueprint.name,
      creativeIntent: blueprint.creativeIntent,
      realityClass: blueprint.realityClass,
      visualDirection: blueprint.visualDirection,
      geography: blueprint.geography,
      climate: blueprint.climate,
      architecture: blueprint.architecture,
      materials: [...(blueprint.materials ?? [])],
      flora: [...(blueprint.flora ?? [])],
      fauna: [...(blueprint.fauna ?? [])],
      npcPopulationIntent: blueprint.npcPopulationIntent,
      pointsOfInterest: [...(blueprint.pointsOfInterest ?? [])],
      generationConstraints: [...(blueprint.generationConstraints ?? [])],
    },
    provenance: {
      source: 'DREAM_SEED_BLUEPRINT',
      seedId: blueprint.seedId,
      blueprintVersion: blueprint.blueprintVersion,
    },
  };
}
