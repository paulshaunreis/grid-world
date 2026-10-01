import * as THREE from 'three';
import { getWorlds } from './GridWorldRegistry';
import { deriveWorldDNA } from './WorldDNA';

type EnvironmentCluster = THREE.Group & { userData: any };

export class WorldEnvironmentSystem {
  readonly root = new THREE.Group();
  private readonly generated = new Set<string>();
  private readonly particles = new Map<string, THREE.Points>();
  private readonly atmosphere = new Map<string, THREE.Group>();

  constructor() {
    this.root.name = 'grid-world-environment';
    this.rebuild();
  }

  rebuild() {
    for (const world of getWorlds()) {
      if (this.generated.has(world.id)) continue;
      this.generated.add(world.id);

      const dna = deriveWorldDNA(world.tags ?? []);
      const cluster = new THREE.Group() as EnvironmentCluster;
      cluster.name = 'environment-' + world.id.toLowerCase();
      cluster.position.copy(world.center);
      cluster.userData.worldId = world.id;
      cluster.userData.environmentDNA = dna.ecology;
      cluster.userData.climate = dna.climate;

      // A shallow procedural terrain field gives every world a grounded environmental
      // silhouette without locking the engine to a fixed terrain implementation.
      const terrain = new THREE.Mesh(
        new THREE.CircleGeometry(22 + dna.ambientLife * 5, 48),
        new THREE.MeshStandardMaterial({
          color: world.color,
          roughness: .94,
          metalness: .02,
          transparent: true,
          opacity: .18,
        })
      );
      terrain.rotation.x = -Math.PI / 2;
      terrain.userData.gridObjectKind = 'world-terrain-field';
      terrain.userData.worldId = world.id;
      terrain.userData.terrainMode = 'procedural-field';
      cluster.add(terrain);

      // Concentric habitat bands make the world feel spatial even before the
      // voxel/clay terrain editor is active.
      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(5 + i * 5.5, 5.05 + i * 5.5, 48),
          new THREE.MeshBasicMaterial({
            color: world.secondary,
            transparent: true,
            opacity: .035 + i * .012,
            side: THREE.DoubleSide,
          })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = .025 + i * .012;
        ring.userData.gridObjectKind = 'habitat-band';
        ring.userData.worldId = world.id;
        ring.userData.habitatBand = i;
        cluster.add(ring);
      }

      const sky = new THREE.Group();
      sky.name = 'atmosphere-' + world.id.toLowerCase();
      const skyMaterial = new THREE.MeshBasicMaterial({
        color: world.secondary,
        transparent: true,
        opacity: .035,
        side: THREE.BackSide,
        depthWrite: false,
      });
      const dome = new THREE.Mesh(new THREE.SphereGeometry(28, 24, 16), skyMaterial);
      dome.userData.gridObjectKind = 'world-atmosphere';
      dome.userData.worldId = world.id;
      sky.add(dome);

      // Climate-driven light source. The renderer can later replace this with a
      // full weather/sky pipeline without changing world generation.
      const sun = new THREE.Mesh(
        new THREE.SphereGeometry(.35, 10, 8),
        new THREE.MeshBasicMaterial({ color: world.secondary, transparent: true, opacity: .75 })
      );
      sun.position.set(-10, 13, -12);
      sun.userData.gridObjectKind = 'world-sun';
      sun.userData.worldId = world.id;
      sky.add(sun);

      const count = Math.min(180, Math.max(48, Math.round(70 * dna.ambientLife)));
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const a = i * 2.399963;
        const radius = 4 + (i % 11) * 1.7;
        positions[i * 3] = Math.cos(a) * radius;
        positions[i * 3 + 1] = 1 + (i % 9) * 1.15;
        positions[i * 3 + 2] = Math.sin(a) * radius;
      }
      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particles = new THREE.Points(
        particleGeometry,
        new THREE.PointsMaterial({
          color: world.secondary,
          size: .045 + dna.ambientLife * .018,
          transparent: true,
          opacity: .22,
          depthWrite: false,
        })
      );
      particles.userData.gridObjectKind = 'environment-particles';
      particles.userData.worldId = world.id;
      particles.userData.weatherFamily = dna.ecology.environmentalForces[0] ?? 'air';
      cluster.add(particles);
      this.particles.set(world.id, particles);

      const weather = new THREE.Group();
      weather.name = 'weather-' + world.id.toLowerCase();
      weather.userData.worldId = world.id;
      weather.userData.forces = dna.ecology.environmentalForces;

      const weatherTag = world.tags?.includes('water')
        ? 'mist'
        : world.tags?.includes('growth')
          ? 'pollen'
          : world.tags?.includes('ancient')
            ? 'dust'
            : world.tags?.includes('wildlife')
              ? 'leaf'
              : 'light';

      for (let i = 0; i < 8; i++) {
        const streak = new THREE.Mesh(
          new THREE.BoxGeometry(.018, .16 + (i % 3) * .05, .018),
          new THREE.MeshBasicMaterial({
            color: world.secondary,
            transparent: true,
            opacity: .10,
          })
        );
        const a = i * 2.399963;
        streak.position.set(Math.cos(a) * (5 + i), 2 + (i % 4) * 1.5, Math.sin(a) * (5 + i));
        streak.userData.gridObjectKind = 'weather-particle';
        streak.userData.worldId = world.id;
        streak.userData.weatherFamily = weatherTag;
        weather.add(streak);
      }
      sky.add(weather);
      this.atmosphere.set(world.id, sky);
      cluster.add(sky);
      this.root.add(cluster);
    }
  }

  update(dt: number) {
    const time = performance.now() * .001;
    for (const world of getWorlds()) {
      const particles = this.particles.get(world.id);
      if (particles) {
        particles.rotation.y += dt * .006;
        particles.position.y = Math.sin(time * .18 + world.center.x) * .12;
      }
      const sky = this.atmosphere.get(world.id);
      if (sky) {
        sky.rotation.y += dt * .004;
        const weather = sky.getObjectByName('weather-' + world.id.toLowerCase());
        if (weather) {
          weather.children.forEach((object, index) => {
            object.position.y -= dt * (.18 + index * .018);
            if (object.position.y < .4) object.position.y = 7 + index * .2;
            object.rotation.z += dt * (.08 + index * .01);
          });
        }
      }
    }
  }
}
