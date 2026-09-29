import * as THREE from 'three';
import { GridMeasurement } from '../core/GridMeasurement';

export type GridEntityId = string;

export interface GridTransform {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export interface GridEntityMetadata {
  displayName: string;
  description?: string;
  tags: readonly string[];
}

export interface GridEntityComponent {
  readonly type: string;
  /** Stable component schema version for future migrations. */
  readonly schema?: number;
  onAttach?(entity: GridEntity): void;
  onDetach?(entity: GridEntity): void;
  update?(entity: GridEntity, deltaSeconds: number): void;
  serialize?(): Record<string, unknown>;
}

export interface GridEntitySnapshot {
  schema: 1;
  id: GridEntityId;
  transform: GridTransform;
  metadata: GridEntityMetadata;
  components: Record<string, Record<string, unknown>>;
}

function vec3(value: THREE.Vector3): { x: number; y: number; z: number } {
  return { x: value.x, y: value.y, z: value.z };
}

export class GridEntity {
  readonly id: GridEntityId;
  readonly object3D: THREE.Object3D;
  metadata: GridEntityMetadata;
  private readonly components = new Map<string, GridEntityComponent>();

  constructor(id: GridEntityId, metadata: GridEntityMetadata, object3D = new THREE.Object3D()) {
    if (!/^[a-z0-9][a-z0-9._:-]{2,127}$/i.test(id)) throw new Error('Invalid Grid entity ID.');
    this.id = id;
    this.metadata = { ...metadata, tags: [...metadata.tags] };
    this.object3D = object3D;
    this.object3D.userData.gridEntityId = id;
  }

  get transform(): GridTransform {
    return {
      position: vec3(this.object3D.position),
      rotation: { x: this.object3D.rotation.x, y: this.object3D.rotation.y, z: this.object3D.rotation.z },
      scale: vec3(this.object3D.scale),
    };
  }

  setPositionGU(x: number, y: number, z: number) {
    this.object3D.position.set(x, y, z);
  }

  measurePosition() {
    return {
      grid: this.object3D.position.toArray(),
      human: GridMeasurement.explain(this.object3D.position.length()),
    };
  }

  addComponent(component: GridEntityComponent) {
    if (this.components.has(component.type)) throw new Error('Component already attached: ' + component.type);
    this.components.set(component.type, component);
    component.onAttach?.(this);
    return this;
  }

  removeComponent(type: string) {
    const component = this.components.get(type);
    if (!component) return false;
    component.onDetach?.(this);
    this.components.delete(type);
    return true;
  }

  getComponent<T extends GridEntityComponent>(type: string): T | undefined {
    return this.components.get(type) as T | undefined;
  }

  update(deltaSeconds: number) {
    for (const component of this.components.values()) component.update?.(this, deltaSeconds);
  }

  snapshot(): GridEntitySnapshot {
    const components: Record<string, Record<string, unknown>> = {};
    for (const [type, component] of this.components) components[type] = component.serialize?.() ?? {};
    return {
      schema: 1,
      id: this.id,
      transform: this.transform,
      metadata: { ...this.metadata, tags: [...this.metadata.tags] },
      components,
    };
  }
}
