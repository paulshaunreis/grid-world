import * as THREE from 'three';

export type InteractionResult = {
  object: THREE.Object3D;
  point: THREE.Vector3;
  name: string;
};

export class InteractionSystem {
  private readonly raycaster = new THREE.Raycaster();
  private readonly center = new THREE.Vector2(0, 0);

  constructor(
    private readonly camera: THREE.Camera,
    private readonly scene: THREE.Scene
  ) {
    this.raycaster.far = 8;
  }

  findTarget(): InteractionResult | null {
    this.raycaster.setFromCamera(this.center, this.camera);
    const hits = this.raycaster.intersectObjects(this.scene.children, true);
    const hit = hits.find(item => {
      let current: THREE.Object3D | null = item.object;
      while (current) {
        if (current.userData.interactable) return true;
        current = current.parent;
      }
      return false;
    });

    if (!hit) return null;

    let object: THREE.Object3D = hit.object;
    while (object.parent && !object.userData.interactable) object = object.parent;

    return {
      object,
      point: hit.point.clone(),
      name: object.userData.interactionName ?? 'Object'
    };
  }

  interact() {
    return this.findTarget();
  }
}
