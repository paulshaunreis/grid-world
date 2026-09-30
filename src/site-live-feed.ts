import { createClient } from '@supabase/supabase-js';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from './persistence/config';

export interface GridWorldEvent {
  id: string;
  event_type: string;
  source_table?: string | null;
  source_id?: string | null;
  region_id?: string | null;
  title: string;
  summary: string;
  visibility?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  teleport: 'TRANSIT',
  marketplace: 'MARKET',
  sound: 'SOUND',
  'npc-memory': 'MEMORY',
  system: 'SYSTEM',
  omni: 'OMNI',
};

const LOCAL_WORLD_EVENTS = [
  ['Tideline', 'TIDE', 'The harbor current is shifting and wildlife is moving with it.'],
  ['Verdant', 'BLOOM', 'A garden growth cycle is opening new paths through the canopy.'],
  ['Crown', 'AURORA', 'A luminous signal is crossing the Crown sky.'],
  ['Muse', 'MARKET', 'Artists and makers are gathering in the Muse district.'],
  ['Frontier', 'MIGRATION', 'Wildlife is crossing the Frontier habitat corridor.'],
] as const;

function localWorldEvent(): GridWorldEvent {
  const slot = Math.floor(Date.now() / 70000);
  const [region, type, summary] = LOCAL_WORLD_EVENTS[slot % LOCAL_WORLD_EVENTS.length];
  return {
    id: 'local-world-' + slot,
    event_type: type.toLowerCase(),
    region_id: region,
    title: region + ' · ' + type,
    summary,
    visibility: 'public',
    created_at: new Date(slot * 70000).toISOString(),
  };
}

function formatAge(iso: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 10) return 'NOW';
  if (seconds < 60) return seconds + 's';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + 'm';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'h';
  return Math.floor(hours / 24) + 'd';
}

export function mountGridLiveFeed(root: HTMLElement) {
  const list = root.querySelector<HTMLDivElement>('[data-grid-pulse-list]');
  const status = root.querySelector<HTMLSpanElement>('[data-grid-pulse-status]');
  const count = root.querySelector<HTMLElement>('[data-grid-pulse-count]');
  if (!list) return () => {};

  const render = (events: GridWorldEvent[]) => {
    list.innerHTML = '';
    for (const event of events.slice(0, 14)) {
      const article = document.createElement('article');
      article.className = 'pulse-event';
      article.dataset.eventType = event.event_type;
      const type = document.createElement('span');
      type.className = 'pulse-type';
      type.textContent = TYPE_LABELS[event.event_type] ?? event.event_type.toUpperCase();
      const title = document.createElement('strong');
      title.textContent = event.title;
      const summary = document.createElement('p');
      summary.textContent = event.summary;
      const meta = document.createElement('small');
      meta.textContent = (event.region_id ?? 'GRID') + ' · ' + formatAge(event.created_at);
      article.append(type, title, summary, meta);
      list.appendChild(article);
    }
    if (count) count.textContent = String(events.length).padStart(2, '0');
  };

  if (!supabaseConfigured || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    const local = () => render([localWorldEvent()]);
    local();
    if (status) status.textContent = 'LOCAL WORLD CLOCK';
    const timer = window.setInterval(local, 10_000);
    return () => window.clearInterval(timer);
  }

  const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  let events: GridWorldEvent[] = [];

  const load = async () => {
    const { data, error } = await client
      .from('grid_world_events')
      .select('id,event_type,source_table,source_id,region_id,title,summary,visibility,metadata,created_at')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(14);
    if (error) {
      if (status) status.textContent = 'STREAM DEGRADED';
      return;
    }
    events = (data ?? []) as GridWorldEvent[];
    render(events);
    if (status) status.textContent = 'LIVE';
  };

  void load();

  const channel = client
    .channel('grid:world-feed', { config: { private: false } })
    .on('broadcast', { event: 'WORLD_EVENT' }, payload => {
      const incoming = payload.payload as GridWorldEvent;
      if (!incoming?.id || incoming.visibility === 'private') return;
      events = [incoming, ...events.filter(event => event.id !== incoming.id)].slice(0, 14);
      render(events);
      if (status) status.textContent = 'LIVE · JUST NOW';
      root.classList.remove('pulse-flash');
      void root.offsetWidth;
      root.classList.add('pulse-flash');
    })
    .subscribe();

  const clock = window.setInterval(() => {
    const worldEvent = localWorldEvent();
    render([worldEvent, ...events.filter(event => event.id !== worldEvent.id)]);
  }, 10_000);

  return () => {
    window.clearInterval(clock);
    void client.removeChannel(channel);
  };
}
