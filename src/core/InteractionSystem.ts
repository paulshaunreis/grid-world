import * as THREE from 'three';

export class InteractionSystem {
  private readonly raycaster = new THREE.Raycaster();
  private readonly center = new THREE.Vector2(0, 0);

  constructor(
    private readonly camera: THREE.Camera,
    private readonly scene: THREE.Scene
  ) {}

  interact() {
    this.raycaster.setFromCamera(this.center, this.camera);
    const hits = this.raycaster.intersectObjects(this.scene.children, true);
    const hit = hits.find(item => item.object.userData.interactable);
    if (!hit) return null;

    return { object: hit.object, point: hit.point.clone() };
  }
}
