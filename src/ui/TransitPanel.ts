import type { GridTeleportDestination } from '../engine/GridTeleport';

export function mountTransitPanel() {
  const root = document.createElement('div');
  root.className = 'transit-panel';
  root.innerHTML = '<div class="transit-card"><div class="transit-kicker">GRID TRANSIT</div><div class="transit-title">Choose your destination</div><div class="transit-subtitle" id="transit-source"></div><div class="transit-destinations" id="transit-destinations"></div><button type="button" class="transit-cancel">CANCEL</button></div>';
  document.body.appendChild(root);
  const list = root.querySelector<HTMLDivElement>('#transit-destinations')!;
  const worldInfo: Record<string,{tag:string,description:string}> = {
    HARBOR:{tag:'TIDELINE',description:'Tidal glass, working docks, salt trade and moving water.'},
    GARDENS:{tag:'VERDANT',description:'Living terraces, canopy paths and regenerative ecology.'},
    CITADEL:{tag:'CROWN',description:'Monolithic stone, luminous seams and ancient systems.'},
    ARTS:{tag:'MUSE',description:'Kinetic galleries, studios and suspended creative spaces.'},
    WILDS:{tag:'FRONTIER',description:'Ancient trunks, stone paths and roaming wildlife.'},
  };
  const source = root.querySelector<HTMLDivElement>('#transit-source')!;
  const cancel = root.querySelector<HTMLButtonElement>('.transit-cancel')!;
  let resolver: ((destinationId: string | null) => void) | null = null;

  function close(value: string | null) {
    root.classList.remove('open');
    const r = resolver; resolver = null;
    r?.(value);
  }
  cancel.addEventListener('click', () => close(null));

  return {
    choose(nodeName: string, destinations: readonly GridTeleportDestination[]) {
      source.textContent = nodeName + ' · DESTINATION SELECTED BEFORE TRANSIT';
      list.replaceChildren();
      for (const destination of destinations) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'transit-destination';
        button.innerHTML = '<b></b><span></span><p></p><small></small>';
        button.querySelector('b')!.textContent = destination.displayName;
        button.querySelector('span')!.textContent = info.tag;
        const info = worldInfo[destination.regionId.toUpperCase()] ?? {tag:destination.regionId.toUpperCase(),description:'Grid transit destination.'};
        button.querySelector('small')!.textContent = 'CONFIRM ROUTE';
        button.querySelector('p')!.textContent = info.description;
        button.addEventListener('click', () => close(destination.id));
        list.appendChild(button);
      }
      root.classList.add('open');
      return new Promise<string | null>(resolve => { resolver = resolve; });
    },
    close() { close(null); },
  };
}
