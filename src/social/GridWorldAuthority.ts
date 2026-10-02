import type { SupabaseClient } from '@supabase/supabase-js';
import * as THREE from 'three';
import type { GridWorldDefinition, GridWorldEvent } from '../world/GridWorldRegistry';

export interface GridPersistentWorld {
  id: string;
  owner_user_id: string;
  label: string;
  description: string;
  center_x: number;
  center_y: number;
  center_z: number;
  color: number;
  secondary: number;
  resource_kind?: string | null;
  tags: string[];
  event: GridWorldEvent;
  gate_id?: string | null;
  enabled: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export class GridWorldAuthority {
  constructor(private readonly client: SupabaseClient) {}

  async create(world: GridWorldDefinition) {
    const { data: auth } = await this.client.auth.getUser();
    if (!auth.user) return null;
    const { data, error } = await this.client.from('grid_worlds').upsert({
      id: world.id,
      owner_user_id: auth.user.id,
      label: world.label,
      description: world.description,
      center_x: world.center.x,
      center_y: world.center.y,
      center_z: world.center.z,
      color: world.color,
      secondary: world.secondary,
      resource_kind: world.resourceKind ?? null,
      tags: [...(world.tags ?? [])],
      event: world.event ?? 'quiet',
      gate_id: world.gateId ?? null,
      enabled: world.enabled !== false,
      metadata: {},
    }, { onConflict: 'id' }).select('*').single();
    if (error) throw error;
    return data as GridPersistentWorld;
  }

  async listPublic(limit = 500) {
    const { data, error } = await this.client.from('grid_worlds')
      .select('*').eq('enabled', true).order('created_at', { ascending: true }).limit(limit);
    if (error) throw error;
    return (data ?? []) as GridPersistentWorld[];
  }

  async listOwned(userId: string, limit = 500) {
    const { data, error } = await this.client.from('grid_worlds')
      .select('*').eq('owner_user_id', userId).order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return (data ?? []) as GridPersistentWorld[];
  }

  static toDefinition(row: GridPersistentWorld): GridWorldDefinition {
    return {
      id: row.id,
      label: row.label,
      description: row.description,
      center: new THREE.Vector3(row.center_x, row.center_y, row.center_z),
      color: row.color,
      secondary: row.secondary,
      resourceKind: row.resource_kind ?? undefined,
      tags: row.tags ?? [],
      event: row.event,
      gateId: row.gate_id ?? undefined,
      enabled: row.enabled,
    };
  }
}
