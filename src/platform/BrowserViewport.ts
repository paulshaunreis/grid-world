export interface ViewportCamera {
  aspect: number;
  updateProjectionMatrix(): void;
}

export interface ViewportRenderer {
  setSize(width: number, height: number): void;
}

export type ViewportResize = (width: number, height: number, pixelRatio: number) => void;

/** Owns browser resize-listener lifecycle without exposing Three.js types. */
export class BrowserViewport {
  private readonly onResize = () => {
    const width = this.viewportWindow.innerWidth;
    const height = this.viewportWindow.innerHeight;
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.resizeEngine(width, height, this.viewportWindow.devicePixelRatio);
  };

  constructor(
    private readonly camera: ViewportCamera,
    private readonly renderer: ViewportRenderer,
    private readonly resizeEngine: ViewportResize,
    private readonly viewportWindow: Window = window,
  ) {
    this.viewportWindow.addEventListener('resize', this.onResize);
  }

  dispose() {
    this.viewportWindow.removeEventListener('resize', this.onResize);
  }
}
