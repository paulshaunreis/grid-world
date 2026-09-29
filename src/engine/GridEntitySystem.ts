import { GridEngine, GridEngineFrame, GridEngineSubsystem } from './GridEngine';
import { GridEntity, GridEntityId } from './GridEntity';

export class GridEntitySystem implements GridEngineSubsystem {
  readonly id = 'grid.entity-system';
  private readonly entities = new Map<GridEntityId, GridEntity>();

  start(engine: GridEngine) {
    void engine;
  }

  register(entity: GridEntity) {
    if (this.entities.has(entity.id)) throw new Error('Grid entity already registered: ' + entity.id);
    this.entities.set(entity.id, entity);
    return entity;
  }

  unregister(id: GridEntityId) {
    const entity = this.entities.get(id);
    if (!entity) return false;
    this.entities.delete(id);
    return true;
  }

  get(id: GridEntityId) {
    return this.entities.get(id);
  }

  all() {
    return [...this.entities.values()];
  }

  update(frame: GridEngineFrame) {
    for (const entity of this.entities.values()) entity.update(frame.deltaSeconds);
  }
}
