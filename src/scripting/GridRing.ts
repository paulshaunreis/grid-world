import { GridCodeProgram, compileGridCode } from './GridCodeRuntime';

export type GridRingPublication = 'draft' | 'review' | 'published' | 'suspended' | 'archived';

export interface GridRingPackage {
  id: string;
  version: string;
  title: string;
  creatorId: string;
  regionTemplateId: string;
  gridCode: string;
  requiredAssets: string[];
  capabilities: string[];
  publication: GridRingPublication;
  provenance: {
    createdAt: string;
    parentVersion?: string;
  };
}

export interface CompiledGridRing {
  manifest: Omit<GridRingPackage, 'gridCode'>;
  program: GridCodeProgram;
}

export function compileGridRing(pkg: GridRingPackage): CompiledGridRing {
  if (!/^[a-z0-9][a-z0-9._-]{2,63}$/i.test(pkg.id)) {
    throw new Error('Grid Ring package id is invalid.');
  }
  if (!/^\d+\.\d+\.\d+$/.test(pkg.version)) {
    throw new Error('Grid Ring versions must use semantic versioning.');
  }
  if (!pkg.creatorId || !pkg.regionTemplateId) {
    throw new Error('Grid Ring requires creator and region template identifiers.');
  }

  const program = compileGridCode(pkg.gridCode);
  const declared = new Set(pkg.capabilities);
  for (const required of program.capabilities) {
    if (!declared.has(required)) {
      throw new Error('Grid Ring package does not declare required capability: ' + required);
    }
  }

  return {
    manifest: {
      id: pkg.id,
      version: pkg.version,
      title: pkg.title,
      creatorId: pkg.creatorId,
      regionTemplateId: pkg.regionTemplateId,
      requiredAssets: [...pkg.requiredAssets],
      capabilities: [...pkg.capabilities],
      publication: pkg.publication,
      provenance: { ...pkg.provenance },
    },
    program,
  };
}
