import { GridCodeProgram, compileGridCode } from './GridCodeRuntime';

export type GridWorldStudioPublication = 'draft' | 'review' | 'published' | 'suspended' | 'archived';

export interface GridWorldStudioPackage {
  id: string;
  version: string;
  title: string;
  creatorId: string;
  regionTemplateId: string;
  gridCode: string;
  requiredAssets: string[];
  capabilities: string[];
  publication: GridWorldStudioPublication;
  provenance: {
    createdAt: string;
    parentVersion?: string;
  };
}

export interface CompiledGridWorldStudio {
  manifest: Omit<GridWorldStudioPackage, 'gridCode'>;
  program: GridCodeProgram;
}

export function compileGridWorldStudio(pkg: GridWorldStudioPackage): CompiledGridWorldStudio {
  if (!/^[a-z0-9][a-z0-9._-]{2,63}$/i.test(pkg.id)) {
    throw new Error('Grid World Studio package id is invalid.');
  }
  if (!/^\d+\.\d+\.\d+$/.test(pkg.version)) {
    throw new Error('Grid World Studio versions must use semantic versioning.');
  }
  if (!pkg.creatorId || !pkg.regionTemplateId) {
    throw new Error('Grid World Studio requires creator and region template identifiers.');
  }

  const program = compileGridCode(pkg.gridCode);
  const declared = new Set(pkg.capabilities);
  for (const required of program.capabilities) {
    if (!declared.has(required)) {
      throw new Error('Grid World Studio package does not declare required capability: ' + required);
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
