import type { WorldRegionRegistry } from '../world/WorldRegion';

export interface MinimapMarker {
  id: string;
  x: number;
  z: number;
  kind: 'player' | 'team' | 'landmark' | 'interactable' | 'teleport';
}

export interface MinimapOptions {
  regions: WorldRegionRegistry;
  getPlayer: () => { x: number; z: number; yaw: number };
  getMarkers: () => MinimapMarker[];
}

export class Minimap {
  readonly element: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private zoom = 0.9;

  constructor(private readonly options: MinimapOptions) {
    this.element = document.createElement('section');
    this.element.className = 'minimap';
    this.element.setAttribute('aria-label', 'Grid World minimap');
    this.element.innerHTML = `
      <div class="minimap-header"><span>GRID // LOCAL</span><span id="minimap-compass">N</span></div>
      <canvas class="minimap-canvas" width="260" height="260"></canvas>
      <div class="minimap-footer"><span id="minimap-region">REGION · UNKNOWN</span><span>− / +</span></div>
    `;

    this.canvas = this.element.querySelector<HTMLCanvasElement>('.minimap-canvas')!;
    this.context = this.canvas.getContext('2d')!;
    this.canvas.addEventListener('wheel', event => {
      event.preventDefault();
      this.zoom = Math.max(0.45, Math.min(2.4, this.zoom * (event.deltaY < 0 ? 1.12 : 0.89)));
    }, { passive: false });

    this.element.addEventListener('click', () => {
      this.zoom = this.zoom >= 2.4 ? 0.45 : this.zoom * 1.25;
    });
  }

  update() {
    const player = this.options.getPlayer();
    const context = this.context;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const center = width / 2;
    const range = 115 / this.zoom;

    context.clearRect(0, 0, width, height);
    context.fillStyle = 'rgba(4, 10, 18, .72)';
    context.fillRect(0, 0, width, height);

    context.save();
    context.translate(center, center);
    context.rotate(-player.yaw);

    const scale = (width * 0.42) / range;
    const toMap = (x: number, z: number) => ({
      x: (x - player.x) * scale,
      y: (z - player.z) * scale,
    });

    for (const region of this.options.regions.all()) {
      const bounds = region.bounds;
      const topLeft = toMap(bounds.minX, bounds.minZ);
      const bottomRight = toMap(bounds.maxX, bounds.maxZ);
      context.strokeStyle = 'rgba(95, 235, 255, .22)';
      context.lineWidth = 1;
      context.strokeRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
    }

    for (const marker of this.options.getMarkers()) {
      const point = toMap(marker.x, marker.z);
      if (Math.abs(point.x) > center || Math.abs(point.y) > center) continue;

      const size = marker.kind === 'landmark' ? 4 : marker.kind === 'team' ? 3.5 : marker.kind === 'teleport' ? 4 : 3;
      context.beginPath();
      context.arc(point.x, point.y, size, 0, Math.PI * 2);
      context.fillStyle =
        marker.kind === 'player' ? '#ffffff' :
        marker.kind === 'team' ? '#68d9ff' :
        marker.kind === 'landmark' ? '#ffd05a' : marker.kind === 'teleport' ? '#55ddff' : '#b78cff';
      context.fill();
    }

    context.beginPath();
    context.moveTo(0, -10);
    context.lineTo(7, 9);
    context.lineTo(0, 6);
    context.lineTo(-7, 9);
    context.closePath();
    context.fillStyle = '#ffffff';
    context.fill();
    context.restore();

    context.strokeStyle = 'rgba(95, 235, 255, .16)';
    context.lineWidth = 1;
    context.beginPath();
    context.arc(center, center, width * 0.42, 0, Math.PI * 2);
    context.stroke();

    context.strokeStyle = 'rgba(95, 235, 255, .10)';
    context.beginPath();
    context.moveTo(center, 18);
    context.lineTo(center, height - 18);
    context.moveTo(18, center);
    context.lineTo(width - 18, center);
    context.stroke();

    const region = this.options.regions.findAt(player.x, player.z);
    const regionLabel = this.element.querySelector<HTMLSpanElement>('#minimap-region');
    if (regionLabel) regionLabel.textContent = region ? `REGION · ${region.definition.zoneId.toUpperCase()}` : 'REGION · FRONTIER';

    const compass = this.element.querySelector<HTMLSpanElement>('#minimap-compass');
    if (compass) compass.textContent = `N · ${Math.round((player.yaw * 180 / Math.PI + 360) % 360)}°`;
  }
}
