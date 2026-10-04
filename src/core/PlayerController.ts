import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createGLTFLoader } from '../engine/dracoLoader.js';
import { Input } from './Input';
import { createStarterPBRMaterial } from '../engine/GridPBRLibrary';
import type { AvatarCustomization } from '../ui/GridAvatarCreator';

export type AvatarStyle = 'navigator' | 'muse' | 'explorer' | 'builder' | 'scholar' | 'sentinel' | 'wanderer' | 'artist' | 'ranger' | 'architect' | 'guardian' | 'signal';

export interface PlayerTransform {
  x: number;
  y: number;
  z: number;
  yaw: number;
}

export class PlayerController {
  readonly avatar = new THREE.Group();
  private velocityY = 0;
  private grounded = true;
  private yaw = 0;
  private readonly body: THREE.Mesh;
  private readonly head: THREE.Mesh;
  private readonly hair: THREE.Mesh;
  private readonly eyeL: THREE.Mesh;
  private readonly eyeR: THREE.Mesh;
  private readonly earL: THREE.Mesh;
  private readonly earR: THREE.Mesh;
  private readonly armL: THREE.Mesh;
  private readonly armR: THREE.Mesh;
  private readonly legL: THREE.Mesh;
  private readonly legR: THREE.Mesh;
  private animationTime = 0;
  private meshAvatar: THREE.Group | null = null;
  private meshGender: 'male' | 'female' = 'male';
  private meshGroundOffset = 0;
  private readonly primitiveParts: THREE.Object3D[] = [];

  constructor(private readonly input: Input) {
    this.body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.42, 1, 8, 16),
      createStarterPBRMaterial('fabric', { color: '#8ad1ff', roughness: .62 })
    );
    this.body.position.y = 1;
    this.body.castShadow = true;
    this.avatar.add(this.body);

    this.head = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 16, 12),
      createStarterPBRMaterial('skin', { color: '#e8d0bd', roughness: .72 })
    );
    this.head.position.y = 1.85;
    this.head.castShadow = true;
    this.avatar.add(this.head);

    this.hair = new THREE.Mesh(
      new THREE.SphereGeometry(.36, 16, 10, 0, Math.PI * 2, 0, Math.PI * .58),
      createStarterPBRMaterial('fabric', { color: '#171a24', roughness: .52 })
    );
    this.hair.position.y = 1.98;
    this.hair.castShadow = true;
    this.avatar.add(this.hair);

    const eyeMaterial = createStarterPBRMaterial('metal', { color: '#58d7ff', emissive: '#58d7ff', emissiveIntensity: 1.5, roughness: .28 });
    this.eyeL = new THREE.Mesh(new THREE.SphereGeometry(.035, 10, 8), eyeMaterial);
    this.eyeR = this.eyeL.clone();
    this.eyeL.position.set(-.12, 1.87, .315);
    this.eyeR.position.set(.12, 1.87, .315);
    this.avatar.add(this.eyeL, this.eyeR);
    const limbMaterial=createStarterPBRMaterial('fabric',{color:'#6ea9c7',roughness:.62});
    this.armL=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.62,6,10),limbMaterial); this.armR=this.armL.clone();
    this.legL=new THREE.Mesh(new THREE.CapsuleGeometry(.15,.72,6,10),limbMaterial); this.legR=this.legL.clone();
    this.armL.position.set(-.48,1.15,0); this.armR.position.set(.48,1.15,0); this.legL.position.set(-.2,.48,0); this.legR.position.set(.2,.48,0);
    this.avatar.add(this.armL,this.armR,this.legL,this.legR);
    const earMaterial=createStarterPBRMaterial('skin',{color:'#e8d0bd',roughness:.72});
    this.earL=new THREE.Mesh(new THREE.ConeGeometry(.11,.38,12),earMaterial); this.earR=this.earL.clone();
    this.earL.rotation.z=-Math.PI/2; this.earR.rotation.z=Math.PI/2;
    this.earL.position.set(-.33,1.88,.02); this.earR.position.set(.33,1.88,.02); this.avatar.add(this.earL,this.earR);
    this.primitiveParts.push(this.body,this.head,this.hair,this.eyeL,this.eyeR,this.armL,this.armR,this.legL,this.legR,this.earL,this.earR);
    // Try to upgrade to the real parametric mesh avatar; primitives stay as the
    // honest fallback if the model can't load.
    this.loadMeshAvatar(this.meshGender);
  }

  /** Load the real clothed GLB mesh. On success the primitive parts hide; on
   *  failure the primitives stay visible — never an invisible avatar.
   *  Safety: only the CLOTHED builds load. The unclothed base meshes
   *  (avatar-*-base.glb) are never referenced — G-rated, always. */
  async loadMeshAvatar(gender: 'male' | 'female'): Promise<void> {
    this.meshGender = gender;
    if (this.meshAvatar) { this.avatar.remove(this.meshAvatar); this.meshAvatar = null; }
    try {
      const loader = createGLTFLoader();
      const gltf = await loader.loadAsync(`/models/avatars/avatar-${gender}-clothed.glb`);
      const root = new THREE.Group();
      root.add(gltf.scene);
      // Normalize: base meshes are ~1.7m; our avatar rig expects ~1.9m to head-top.
      const bbox = new THREE.Box3().setFromObject(gltf.scene);
      const height = Math.max(0.001, bbox.max.y - bbox.min.y);
      const scale = 1.9 / height;
      root.scale.setScalar(scale);
      // Re-ground after scaling.
      const bbox2 = new THREE.Box3().setFromObject(root);
      this.meshGroundOffset = -bbox2.min.y;
      root.position.y = this.meshGroundOffset;
      root.traverse(o => { if ((o as THREE.Mesh).isMesh) { (o as THREE.Mesh).castShadow = true; } });
      this.meshAvatar = root;
      this.avatar.add(root);
      for (const part of this.primitiveParts) part.visible = false;
    } catch {
      // Primitives remain visible — the honest fallback.
      for (const part of this.primitiveParts) part.visible = true;
    }
  }

  setAvatarAppearance(style: AvatarStyle, customization?: AvatarCustomization) {
    // Swap the real mesh when the citizen picks a gendered presentation.
    // 0 = Woman -> female base, 1 = Man -> male base, others keep current.
    if (customization && (customization.gender === 0 || customization.gender === 1)) {
      const want: 'male' | 'female' = customization.gender === 0 ? 'female' : 'male';
      if (want !== this.meshGender) void this.loadMeshAvatar(want);
    }
    const palettes = {      navigator: { body: 0x5fd8ff, head: 0xe6f7ff },
      muse: { body: 0xd58cff, head: 0xffe8fa },
      explorer: { body: 0xffad62, head: 0xffe0c7 },
      builder: { body: 0xb18a62, head: 0xf1d7bc },
      scholar: { body: 0x9aaee8, head: 0xe4eaff },
      sentinel: { body: 0xd5c47c, head: 0xf4e8ca },
      wanderer: { body: 0x79c98b, head: 0xdff6e6 },
      artist: { body: 0xef76b4, head: 0xffd8ea },
      ranger: { body: 0x719c66, head: 0xe0f0d8 },
      architect: { body: 0x78a5bd, head: 0xe3f2f7 },
      guardian: { body: 0x7182c8, head: 0xe2e7ff },
      signal: { body: 0x65e6c8, head: 0xdffff7 },
    };
    const palette = palettes[style];
    (this.body.material as THREE.MeshStandardMaterial).color.setHex(palette.body);
    (this.head.material as THREE.MeshStandardMaterial).color.setHex(palette.head);
    if (customization) {
      const skins=[0xf1d1bd,0xd9aa8a,0xb97858,0x8d583f,0x5f392e];
      const hairs=[0x171a24,0x4a2b22,0x9b6a3b,0xb9d5dc,0x8b4fa5,0xe0e4e8];
      const eyes=[0x58d7ff,0x6d8cff,0x63d88d,0xd4ad63,0xd47fd8,0xe7e7e7];
      (this.head.material as THREE.MeshStandardMaterial).color.setHex(skins[Math.max(0,Math.min(4,customization.skin))]);
      (this.hair.material as THREE.MeshStandardMaterial).color.setHex(hairs[Math.max(0,Math.min(5,customization.hair))]);
      const eyeColor=eyes[Math.max(0,Math.min(5,customization.eyes))];
      (this.eyeL.material as THREE.MeshStandardMaterial).color.setHex(eyeColor);
      (this.eyeL.material as THREE.MeshStandardMaterial).emissive.setHex(eyeColor);
      (this.eyeR.material as THREE.MeshStandardMaterial).color.setHex(eyeColor);
      (this.eyeR.material as THREE.MeshStandardMaterial).emissive.setHex(eyeColor);
      const ageScale=[.72,.88,.98,1.03,.98][Math.max(0,Math.min(4,customization.age??3))];
      const raceScale=[1,1.02,1.04,.72,1.12,.82,1,1.03][Math.max(0,Math.min(7,customization.species??0))];
      const raceBulk=[1,.92,.9,1.35,1.55,.72,1,1.05][Math.max(0,Math.min(7,customization.species??0))];
      const lineageScale=[1,1.06,.86,.94,.9,1.01][Math.max(-1,Math.min(5,(customization.lineage??-1)))+1] ?? 1;
      const lineageBulk=[1,1.28,1.12,.8,1.45,1.02][Math.max(-1,Math.min(5,(customization.lineage??-1)))+1] ?? 1;
      const headScale=[1.08,1.03,1,.98,1.01][Math.max(0,Math.min(4,customization.age??3))];
      const build=1+Math.max(-3,Math.min(3,customization.build))*.045;
      const torso=1+(customization.torso??0)*.025; const shoulders=1+(customization.shoulders??0)*.02; const arms=1+(customization.arms??0)*.035; const legs=1+(customization.legs??0)*.045;
      const sx=build*raceBulk*lineageBulk; const sy=1;
      this.body.scale.set(sx*torso*ageScale*raceScale*lineageScale,sy*ageScale*raceScale*lineageScale,sx*ageScale*raceScale*lineageScale);
      this.armL.scale.set(sx*arms*shoulders*ageScale*raceScale*lineageScale,ageScale*arms*ageScale*raceScale*lineageScale,sx*arms*ageScale*raceScale*lineageScale); this.armR.scale.copy(this.armL.scale); this.legL.scale.set(sx*ageScale*raceScale*lineageScale,ageScale*legs*raceScale*lineageScale,sx*ageScale*raceScale*lineageScale); this.legR.scale.copy(this.legL.scale);
      this.head.scale.set(headScale,headScale,headScale);
      this.hair.scale.set(headScale,headScale*(1+Math.max(0,Math.min(4,customization.hairLength??2))*.08),headScale);
      const elf=[1,2,5].includes(customization.species??0) || (customization.lineage??-1)>=0;
      this.earL.visible=elf; this.earR.visible=elf;
      this.earL.scale.set(1,elf?1.35:1,1); this.earR.scale.copy(this.earL.scale);
    }
  }

  setAvatarStyle(style: AvatarStyle) { this.setAvatarAppearance(style); }

  update(dt: number) {
    this.input.update();
    const lookX=this.input.lookX(); if(Math.abs(lookX)>0.01)this.rotate(lookX);
    const speed = this.input.isDown('ShiftLeft') || this.input.isDown('ShiftRight') ? 8 : 4;
    const move=this.input.moveVector();
    const forward = move.y;
    const strafe = move.x;
    const direction = new THREE.Vector3(strafe, 0, forward);

    const moving=direction.lengthSq()>0;
    if (moving) direction.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw), this.avatar.position.addScaledVector(direction, speed * dt);
    this.animationTime += dt * (moving ? (speed>6?10:7) : 2.2);
    const phase=Math.sin(this.animationTime);
    const walkAmount=moving ? (speed>6 ? .72 : .42) : .035;
    this.armL.rotation.x=phase*walkAmount; this.armR.rotation.x=-phase*walkAmount;
    this.legL.rotation.x=-phase*walkAmount*.75; this.legR.rotation.x=phase*walkAmount*.75;
    const airborne=!this.grounded;
    this.body.position.y=1.0+(moving?Math.abs(Math.sin(this.animationTime*1.0))*.025:Math.sin(this.animationTime)*.008)+(airborne?.04:0);
    // Gentle locomotion feel for the real mesh (no skeletal anim yet — ChatGPT lane).
    if (this.meshAvatar) {
      this.meshAvatar.position.y = this.meshGroundOffset + (moving ? Math.abs(Math.sin(this.animationTime))*.03 : Math.sin(this.animationTime)*.008) + (airborne ? .04 : 0);
      this.meshAvatar.rotation.z = moving ? Math.sin(this.animationTime)*.02 : 0;
    }

    if ((this.input.isDown('Space') || this.input.isActionDown('jump')) && this.grounded) { this.velocityY = 7; this.grounded = false; }
    this.velocityY -= 18 * dt;
    this.avatar.position.y += this.velocityY * dt;

    if (this.avatar.position.y <= 0) {
      this.avatar.position.y = 0;
      this.velocityY = 0;
      this.grounded = true;
    }

    this.avatar.rotation.y = this.yaw;
  }

  rotate(deltaX: number) { this.yaw -= deltaX * 0.0025; }
  get heading() { return this.yaw; }
  setHeading(yaw: number) { this.yaw = yaw; this.avatar.rotation.y = this.yaw; }

  getTransform(): PlayerTransform {
    return { x: this.avatar.position.x, y: this.avatar.position.y, z: this.avatar.position.z, yaw: this.yaw };
  }

  restoreTransform(transform: PlayerTransform) {
    this.avatar.position.set(transform.x, Math.max(0, transform.y), transform.z);
    this.yaw = transform.yaw;
    this.avatar.rotation.y = this.yaw;
    this.velocityY = 0;
    this.grounded = this.avatar.position.y === 0;
  }
}
