import './qr.css';

export class QRScanner {
  private overlay: HTMLDivElement;
  private video: HTMLVideoElement;
  private stream: MediaStream | null = null;
  private active = false;

  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'qr-overlay';
    this.overlay.innerHTML = `
      <div class="qr-modal">
        <div class="qr-head"><div><span>GRID QR</span><h2>Scan a link</h2><p>Point your camera at a QR code. HTTPS links open in Grid World.</p></div><button type="button" data-qr-close>×</button></div>
        <video id="qr-video" playsinline muted></video>
        <div class="qr-frame"><i></i></div>
        <div class="qr-status" id="qr-status">CAMERA READY</div>
        <form id="qr-manual"><input id="qr-url" type="url" placeholder="Paste a link instead" autocomplete="off"><button type="submit">OPEN</button></form>
      </div>
    `;
    document.body.appendChild(this.overlay);
    this.video = this.overlay.querySelector<HTMLVideoElement>('#qr-video')!;
    this.overlay.querySelector('[data-qr-close]')?.addEventListener('click', () => this.close());
    this.overlay.querySelector<HTMLFormElement>('#qr-manual')?.addEventListener('submit', event => {
      event.preventDefault();
      const input = this.overlay.querySelector<HTMLInputElement>('#qr-url')!;
      this.openLink(input.value.trim());
    });
  }

  async open() {
    this.overlay.classList.add('open');
    this.active = true;
    const status = this.overlay.querySelector('#qr-status');
    if (!('BarcodeDetector' in window)) {
      if (status) status.textContent = 'QR CAMERA API UNAVAILABLE · USE LINK FIELD';
      return;
    }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      this.video.srcObject = this.stream;
      await this.video.play();
      if (status) status.textContent = 'SCANNING · QR / URL';
      this.scan();
    } catch {
      if (status) status.textContent = 'CAMERA PERMISSION NEEDED · USE LINK FIELD';
    }
  }

  close() {
    this.active = false;
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = null;
    this.video.srcObject = null;
    this.overlay.classList.remove('open');
  }

  private async scan() {
    if (!this.active || !('BarcodeDetector' in window)) return;
    const Detector = (window as Window & { BarcodeDetector: new (options?: { formats?: string[] }) => { detect(source: HTMLVideoElement): Promise<Array<{ rawValue?: string }>> } }).BarcodeDetector;
    const detector = new Detector({ formats: ['qr_code'] });
    try {
      const codes = await detector.detect(this.video);
      const value = codes[0]?.rawValue?.trim();
      if (value) {
        this.openLink(value);
        return;
      }
    } catch { /* camera frame can fail while the device is changing */ }
    window.requestAnimationFrame(() => this.scan());
  }

  private openLink(value: string) {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('unsupported');
      this.close();
      window.location.assign(url.toString());
    } catch {
      const status = this.overlay.querySelector('#qr-status');
      if (status) status.textContent = 'INVALID LINK · HTTPS OR HTTP ONLY';
    }
  }
}

declare global {
  interface Window {
    BarcodeDetector?: unknown;
  }
}
