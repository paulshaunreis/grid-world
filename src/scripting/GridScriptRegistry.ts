import * as THREE from 'three';
import type { GridEvent, GridScript } from './GridScript';
import { GridScriptRuntime, type GridRuntimeContext, type GridRuntimeLimits } from './GridScriptRuntime';

export interface ScriptedObjectDefinition {
  id: string;
  object: THREE.Object3D;
  script: GridScript;
  runtime: GridScriptRuntime;
}

export class GridScriptRegistry {
  private readonly objects = new Map<string, ScriptedObjectDefinition>();
  private readonly objectIds = new WeakMap<THREE.Object3D, string>();

  register(
    id: string,
    object: THREE.Object3D,
    script: GridScript,
    context: GridRuntimeContext,
    limits?: GridRuntimeLimits,
  ): ScriptedObjectDefinition {
    if (this.objects.has(id)) throw new Error(`A scripted object named "${id}" is already registered.`);

    const definition: ScriptedObjectDefinition = {
      id,
      object,
      script,
      runtime: new GridScriptRuntime(context, limits),
    };

    this.objects.set(id, definition);
    this.objectIds.set(object, id);
    object.userData.scriptedObjectId = id;
    return definition;
  }

  getByObject(object: THREE.Object3D): ScriptedObjectDefinition | undefined {
    const id = this.objectIds.get(object);
    return id ? this.objects.get(id) : undefined;
  }

  get(id: string): ScriptedObjectDefinition | undefined {
    return this.objects.get(id);
  }

  dispatch(object: THREE.Object3D, event: GridEvent): boolean {
    const definition = this.getByObject(object);
    if (!definition) return false;
    definition.runtime.dispatch(definition.script, event);
    return true;
  }

  list(): ScriptedObjectDefinition[] {
    return [...this.objects.values()];
  }
}
