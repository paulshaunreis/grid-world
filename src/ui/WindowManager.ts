import { readVersioned, writeVersioned } from '../core/VersionedStorage';

export type UIWindowDefinition = {
  id: string;
  title: string;
  element: HTMLElement;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  movable?: boolean;
  resizable?: boolean;
};

export type UILayoutState = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  hidden?: boolean;
  minimized?: boolean;
};

type StoredLayout = Record<string, UILayoutState>;
const STORAGE_KEY = 'grid-world:ui-layout';
const LAYOUT_SCHEMA_VERSION = 1;

function loadLayout(): StoredLayout {
  return readVersioned(STORAGE_KEY, LAYOUT_SCHEMA_VERSION, (data, schema) => {
    if (schema !== 1 || !data || typeof data !== 'object') return {};
    return data as StoredLayout;
  }) ?? {};
}

function saveLayout(layout: StoredLayout) {
  writeVersioned(STORAGE_KEY, LAYOUT_SCHEMA_VERSION, layout);
}

export class WindowManager {
  private readonly windows = new Map<string, UIWindowDefinition>();
  private readonly layout = loadLayout();
  private editMode = false;

  register(definition: UIWindowDefinition) {
    if (this.windows.has(definition.id)) return;
    this.windows.set(definition.id, definition);

    const element = definition.element;
    element.classList.add('grid-window');
    element.dataset.windowId = definition.id;

    if (definition.defaultSize) {
      element.style.width = definition.defaultSize.width + 'px';
      element.style.height = definition.defaultSize.height + 'px';
    }

    const saved = this.layout[definition.id];
    const position = saved ?? definition.defaultPosition;
    if (position) this.applyPosition(element, position.x, position.y);

    if (saved?.width) element.style.width = saved.width + 'px';
    if (saved?.height) element.style.height = saved.height + 'px';
    if (saved?.hidden) element.classList.add('grid-window-hidden');
    if (saved?.minimized) element.classList.add('grid-window-minimized');

    this.installChrome(definition);
    this.updateEditState(definition);
  }

  unregister(id: string) {
    const definition = this.windows.get(id);
    if (!definition) return;
    definition.element.querySelector('.grid-window-chrome')?.remove();
    definition.element.classList.remove('grid-window');
    this.windows.delete(id);
  }

  setEditMode(enabled: boolean) {
    this.editMode = enabled;
    for (const definition of this.windows.values()) this.updateEditState(definition);
  }

  toggleEditMode() {
    this.setEditMode(!this.editMode);
    return this.editMode;
  }

  isEditMode() {
    return this.editMode;
  }

  resetLayout() {
    for (const definition of this.windows.values()) {
      delete this.layout[definition.id];
      definition.element.style.transform = '';
      definition.element.style.width = '';
      definition.element.style.height = '';
      definition.element.classList.remove('grid-window-hidden', 'grid-window-minimized');
      const position = definition.defaultPosition;
      if (position) this.applyPosition(definition.element, position.x, position.y);
    }
    saveLayout(this.layout);
  }

  show(id: string) {
    const definition = this.windows.get(id);
    if (!definition) return;
    definition.element.classList.remove('grid-window-hidden');
    this.persist(id);
  }

  hide(id: string) {
    const definition = this.windows.get(id);
    if (!definition) return;
    definition.element.classList.add('grid-window-hidden');
    this.persist(id);
  }

  minimize(id: string) {
    const definition = this.windows.get(id);
    if (!definition) return;
    definition.element.classList.toggle('grid-window-minimized');
    this.persist(id);
  }

  list() {
    return [...this.windows.keys()];
  }

  private installChrome(definition: UIWindowDefinition) {
    const element = definition.element;
    element.querySelector('.grid-window-chrome')?.remove();

    const chrome = document.createElement('div');
    chrome.className = 'grid-window-chrome';
    chrome.innerHTML = '<span class="grid-window-grip" aria-hidden="true">⠿</span>' +
      '<span class="grid-window-title"></span>' +
      '<span class="grid-window-actions">' +
      '<button type="button" data-window-action="minimize" aria-label="Minimize">—</button>' +
      '<button type="button" data-window-action="hide" aria-label="Hide">×</button>' +
      '</span>';

    chrome.querySelector('.grid-window-title')!.textContent = definition.title;

    chrome.querySelector('[data-window-action="minimize"]')!.addEventListener('click', event => {
      event.stopPropagation();
      this.minimize(definition.id);
    });

    chrome.querySelector('[data-window-action="hide"]')!.addEventListener('click', event => {
      event.stopPropagation();
      this.hide(definition.id);
    });

    chrome.addEventListener('pointerdown', event => this.beginDrag(event, definition));
    element.prepend(chrome);
  }

  private beginDrag(event: PointerEvent, definition: UIWindowDefinition) {
    if (!definition.movable || !this.editMode) return;
    if ((event.target as HTMLElement).closest('button')) return;

    event.preventDefault();
    const element = definition.element;
    const startX = event.clientX;
    const startY = event.clientY;
    const current = this.readPosition(element);

    const move = (moveEvent: PointerEvent) => {
      this.applyPosition(
        element,
        current.x + moveEvent.clientX - startX,
        current.y + moveEvent.clientY - startY,
      );
    };

    const end = () => {
      this.persist(definition.id);
      window.removeEventListener('pointermove', move);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end, { once: true });
  }

  private readPosition(element: HTMLElement) {
    const value = element.dataset.gridPosition;
    if (value) {
      try { return JSON.parse(value) as { x: number; y: number }; } catch { /* fallback */ }
    }
    return { x: 0, y: 0 };
  }

  private applyPosition(element: HTMLElement, x: number, y: number) {
    const position = { x: Math.round(x), y: Math.round(y) };
    element.dataset.gridPosition = JSON.stringify(position);
    element.style.transform = 'translate3d(' + position.x + 'px, ' + position.y + 'px, 0)';
  }

  private persist(id: string) {
    const definition = this.windows.get(id);
    if (!definition) return;
    const element = definition.element;
    const position = this.readPosition(element);
    this.layout[id] = {
      ...position,
      width: element.offsetWidth,
      height: element.offsetHeight,
      hidden: element.classList.contains('grid-window-hidden'),
      minimized: element.classList.contains('grid-window-minimized'),
    };
    saveLayout(this.layout);
  }

  private updateEditState(definition: UIWindowDefinition) {
    definition.element.classList.toggle(
      'grid-window-editing',
      this.editMode && definition.movable !== false,
    );
  }
}

export type UIModDefinition = {
  id: string;
  name: string;
  version: string;
  enabledByDefault?: boolean;
  mount: (manager: WindowManager) => void;
  unmount?: (manager: WindowManager) => void;
};

export class UIModRegistry {
  private readonly mods = new Map<string, UIModDefinition>();
  private readonly enabled = new Set<string>();

  constructor(private readonly manager: WindowManager) {}

  register(mod: UIModDefinition) {
    this.mods.set(mod.id, mod);
    if (mod.enabledByDefault) this.load(mod.id);
  }

  load(id: string) {
    const mod = this.mods.get(id);
    if (!mod || this.enabled.has(id)) return false;
    mod.mount(this.manager);
    this.enabled.add(id);
    return true;
  }

  unload(id: string) {
    const mod = this.mods.get(id);
    if (!mod || !this.enabled.has(id)) return false;
    mod.unmount?.(this.manager);
    this.enabled.delete(id);
    return true;
  }

  isLoaded(id: string) {
    return this.enabled.has(id);
  }

  list() {
    return [...this.mods.values()].map(mod => ({
      id: mod.id,
      name: mod.name,
      version: mod.version,
      loaded: this.enabled.has(mod.id),
    }));
  }
}
