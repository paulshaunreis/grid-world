import * as THREE from 'three';
import { TEAM_AVATARS } from '../avatars/teamRoster';

type WorkTask = {
  memberId: string;
  title: string;
  status: string;
  zone: string;
  progress: number;
  visible: boolean;
  position: { x: number; z: number };
};

const TASKS: WorkTask[] = [
  { memberId:'tessera', title:'Texturing + PBR pass', status:'Applying world materials', zone:'All worlds', progress:78, visible:true, position:{x:24,z:20} },
  { memberId:'waypoint', title:'Terrain + ecology', status:'Shaping terrain and habitats', zone:'Frontier', progress:64, visible:true, position:{x:0,z:25} },
  { memberId:'atlas', title:'Living-world simulation', status:'Tuning creature behavior', zone:'Frontier', progress:71, visible:true, position:{x:-24,z:20} },
  { memberId:'link', title:'Performance + streaming', status:'Profiling frame time', zone:'Grid systems', progress:86, visible:true, position:{x:3.2,z:-12.2} },
  { memberId:'aurora', title:'World direction', status:'Composing zone transitions', zone:'Many Worlds', progress:69, visible:true, position:{x:-2.4,z:-6.2} },
  { memberId:'orin', title:'World connections', status:'Mapping dependencies', zone:'All worlds', progress:58, visible:true, position:{x:-9,z:-17} },
  { memberId:'echo', title:'Playtest + QA', status:'Walking the world and finding breaks', zone:'All worlds', progress:82, visible:true, position:{x:-18,z:-8} },
  { memberId:'nyxen', title:'Foundation security', status:'Checking access boundaries', zone:'Grid Foundation', progress:74, visible:false, position:{x:8,z:-16} },
];

function findMember(id: string) { return TEAM_AVATARS.find(member => member.id === id); }

export function createTeamWorkSystem() {
  const root = new THREE.Group();
  root.name = 'team-live-work';
  const workstations: THREE.Group[] = [];

  for (const task of TASKS) {
    const member = findMember(task.memberId);
    if (!member) continue;

    const station = new THREE.Group();
    station.name = 'workstation-' + task.memberId;
    station.position.set(task.position.x, 0, task.position.z);
    station.userData.teamTask = task;
    station.userData.interactable = true;
    station.userData.interactionName = member.displayName + ' · ' + task.title;

    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, .14, .8),
      new THREE.MeshStandardMaterial({ color:0x182633, metalness:.65, roughness:.3 }),
    );
    desk.position.y = .9;
    station.add(desk);

    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, .7, .06),
      new THREE.MeshStandardMaterial({ color:0x07131d, emissive:0x2b91b0, emissiveIntensity:1.2, metalness:.5, roughness:.25 }),
    );
    screen.position.set(0, 1.35, -.25);
    station.add(screen);

    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(.018, .018, 2.5, 6),
      new THREE.MeshBasicMaterial({ color:0x68d9ff, transparent:true, opacity:.18 }),
    );
    beam.position.y = 1.9;
    station.add(beam);

    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 640; labelCanvas.height = 150;
    const ctx = labelCanvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(3,8,14,.86)';
    ctx.fillRect(8,8,624,134);
    ctx.strokeStyle = '#68d9ff';
    ctx.strokeRect(8,8,624,134);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#eefcff';
    ctx.font = 'bold 28px system-ui';
    ctx.fillText(member.displayName + ' · ' + task.title, 320, 55);
    ctx.font = '20px system-ui';
    ctx.fillStyle = 'rgba(238,252,255,.7)';
    ctx.fillText(task.status + ' · ' + task.progress + '%', 320, 92);
    ctx.fillText(task.zone, 320, 122);
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map:new THREE.CanvasTexture(labelCanvas), transparent:true, depthWrite:false }));
    label.scale.set(3.8,.9,1);
    label.position.y = 2.8;
    station.add(label);

    workstations.push(station);
    root.add(station);
  }

  function update(dt: number, elapsed: number) {
    for (const station of workstations) {
      const task = station.userData.teamTask as WorkTask;
      station.visible = task.visible;
      const screen = station.children[1] as THREE.Mesh;
      const material = screen.material;
      if (material instanceof THREE.MeshStandardMaterial) {
        material.emissiveIntensity = 1.0 + Math.sin(elapsed * 3 + station.position.x) * .25;
      }
      station.children[2].scale.y = 1 + Math.sin(elapsed * 2 + station.position.z) * .08;
      station.rotation.y += dt * .01;
    }
  }

  root.userData.tasks = TASKS;
  return { root, update, tasks: TASKS };
}
