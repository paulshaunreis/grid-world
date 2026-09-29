-- Grid World persistence foundation.
-- Apply this schema only to the connected Supabase project when one exists.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Traveler',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.player_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  region_id text not null default 'first-light',
  x double precision not null default 0,
  y double precision not null default 0,
  z double precision not null default 8,
  yaw double precision not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.player_state enable row level security;

create policy "Players can read their profile" on public.profiles for select to authenticated
using ((select auth.uid()) = id);
create policy "Players can insert their profile" on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);
create policy "Players can update their profile" on public.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Players can read their state" on public.player_state for select to authenticated
using ((select auth.uid()) = user_id);
create policy "Players can insert their state" on public.player_state for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "Players can update their state" on public.player_state for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);


-- Grid Omni cross-service safety and sound layer.
create schema if not exists private;

create table if not exists public.grid_omni_services (
  id text primary key,
  display_name text not null,
  family text not null default 'Grid Omni',
  status text not null default 'operational' check (status in ('operational','guarded','degraded','isolated','maintenance')),
  description text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.grid_omni_incidents (
  id uuid primary key default gen_random_uuid(),
  service_id text references public.grid_omni_services(id),
  severity text not null check (severity in ('info','notice','warning','critical')),
  state text not null default 'detected' check (state in ('detected','contained','degraded','isolated','recovering','resolved','closed')),
  source text not null,
  subject_id uuid,
  summary text not null,
  details jsonb not null default '{}'::jsonb,
  detected_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.grid_omni_actions (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.grid_omni_incidents(id) on delete cascade,
  action text not null check (action in ('observe','rate-limit','quarantine','degrade','isolate','revoke','pause','rollback','notify','audit')),
  status text not null default 'requested' check (status in ('requested','applied','reverted','failed')),
  reason text not null default '',
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.grid_omni_service_events (
  id bigint generated always as identity primary key,
  service_id text references public.grid_omni_services(id),
  event_type text not null,
  severity text not null check (severity in ('info','notice','warning','critical')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.grid_sound_tracks (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text not null default '',
  genre text not null default 'Unknown',
  tags text[] not null default '{}',
  audio_url text,
  artwork_url text,
  duration_seconds integer,
  visibility text not null default 'public' check (visibility in ('private','unlisted','public')),
  moderation_state text not null default 'quarantine' check (moderation_state in ('quarantine','review','approved','blocked')),
  rights_status text not null default 'unknown' check (rights_status in ('unknown','original','licensed','public-domain','blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.grid_sound_play_events (
  id bigint generated always as identity primary key,
  track_id uuid not null references public.grid_sound_tracks(id) on delete cascade,
  listener_id uuid references auth.users(id) on delete set null,
  source text not null default 'grid',
  created_at timestamptz not null default now()
);

alter table public.grid_omni_services enable row level security;
alter table public.grid_omni_incidents enable row level security;
alter table public.grid_omni_actions enable row level security;
alter table public.grid_omni_service_events enable row level security;
alter table public.grid_sound_tracks enable row level security;
alter table public.grid_sound_play_events enable row level security;

insert into public.grid_omni_services (id,display_name,description) values
('omni-security','Grid Omni Security','Cross-service threat detection, containment, recovery and audit.'),
('omni-identity','Grid Omni Identity','Identity, authentication, sessions and account recovery.'),
('omni-world','Grid Omni World','Region health, simulation isolation, streaming and rollback.'),
('omni-social','Grid Omni Social','Profiles, relationships, chat, reporting and user controls.'),
('omni-creator','Grid Omni Creator','Build, script, asset validation and creator capabilities.'),
('omni-market','Grid Omni Market','Listings, commerce protection, disputes and marketplace safety.'),
('omni-wallet','Grid Omni Wallet','Wallets, exchange, ledger controls and transaction protection.'),
('omni-sound','Grid Omni Sound','Music, audio creators, radio, performances and soundscapes.'),
('omni-events','Grid Omni Events','Events, stages, live experiences and crowd systems.'),
('omni-media','Grid Omni Media','Images, video, archives and media publishing.'),
('omni-connect','Grid Omni Connect','Web, desktop, mobile and external service bridges.'),
('omni-archive','Grid Omni Archive','Preservation, history, provenance and recovery records.')
on conflict (id) do update set display_name=excluded.display_name,description=excluded.description,updated_at=now();


drop policy if exists "Public can read Omni services" on public.grid_omni_services;
create policy "Public can read Omni services" on public.grid_omni_services for select to anon, authenticated using (true);

drop policy if exists "Users can read own Omni incidents" on public.grid_omni_incidents;
create policy "Users can read own Omni incidents" on public.grid_omni_incidents for select to authenticated using ((select auth.uid()) = subject_id);

drop policy if exists "Users can read own Omni actions" on public.grid_omni_actions;
create policy "Users can read own Omni actions" on public.grid_omni_actions for select to authenticated using (
  exists (select 1 from public.grid_omni_incidents i where i.id = incident_id and i.subject_id = (select auth.uid()))
);

drop policy if exists "Public can read Omni service events" on public.grid_omni_service_events;
create policy "Public can read Omni service events" on public.grid_omni_service_events for select to anon, authenticated using (severity in ('info','notice'));

drop policy if exists "Public can read approved sound" on public.grid_sound_tracks;
create policy "Public can read approved sound" on public.grid_sound_tracks for select to anon, authenticated using (visibility = 'public' and moderation_state = 'approved');

drop policy if exists "Creators can read own sound" on public.grid_sound_tracks;
create policy "Creators can read own sound" on public.grid_sound_tracks for select to authenticated using ((select auth.uid()) = creator_id);

drop policy if exists "Creators can insert sound" on public.grid_sound_tracks;
create policy "Creators can insert sound" on public.grid_sound_tracks for insert to authenticated with check ((select auth.uid()) = creator_id);

drop policy if exists "Creators can update own sound" on public.grid_sound_tracks;
create policy "Creators can update own sound" on public.grid_sound_tracks for update to authenticated
using ((select auth.uid()) = creator_id)
with check ((select auth.uid()) = creator_id);

drop policy if exists "Listeners can insert play events" on public.grid_sound_play_events;
create policy "Listeners can insert play events" on public.grid_sound_play_events for insert to authenticated
with check ((select auth.uid()) = listener_id);
