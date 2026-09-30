import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

type Mode = "PVE" | "PVP" | "SAFE";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(supabaseUrl, serviceRoleKey);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: cors });
}

function distance(a: {x:number;y:number;z:number}, b: {x:number;y:number;z:number}) {
  return Math.hypot(a.x-b.x, a.y-b.y, a.z-b.z);
}

function zoneFor(x: number, z: number): "SAFE" | "PVP_ARENA" | "PVE" {
  if (Math.abs(x) <= 10 && z >= -2 && z <= 12) return "SAFE";
  if (x >= -28 && x <= -16 && z >= -10 && z <= 2) return "PVP_ARENA";
  return "PVE";
}

const CREATURE_RULES: Record<string,{world:string;center:{x:number;z:number};radius:number;maxHealth:number;damage:number}> = {
  "tideline-skimmer":{world:"HARBOR",center:{x:22,z:-27},radius:7,maxHealth:100,damage:8},
  "reef-runner":{world:"HARBOR",center:{x:27,z:-21},radius:6,maxHealth:100,damage:8},
  "canopy-moth":{world:"GARDENS",center:{x:25,z:18},radius:8,maxHealth:70,damage:8},
  "moss-fox":{world:"GARDENS",center:{x:20,z:24},radius:7,maxHealth:100,damage:8},
  "glass-antler":{world:"GARDENS",center:{x:28,z:13},radius:6,maxHealth:100,damage:8},
  "crown-kite":{world:"CITADEL",center:{x:-22,z:-24},radius:8,maxHealth:100,damage:8},
  "stone-hare":{world:"CITADEL",center:{x:-17,z:-20},radius:6,maxHealth:100,damage:8},
  "gallery-swallow":{world:"ARTS",center:{x:20,z:-18},radius:7,maxHealth:100,damage:8},
  "muse-cat":{world:"ARTS",center:{x:15,z:-13},radius:5,maxHealth:100,damage:8},
  "frontier-wolf":{world:"WILDS",center:{x:-23,z:19},radius:8,maxHealth:100,damage:8},
  "ember-boar":{world:"WILDS",center:{x:-28,z:25},radius:7,maxHealth:100,damage:8},
  "lumen-stag":{world:"WILDS",center:{x:-17,z:27},radius:8,maxHealth:100,damage:8},
};

function creatureRule(species:string) {
  return CREATURE_RULES[species];
}

function validCreaturePosition(species:string, x:number, z:number) {
  const rule=creatureRule(species);
  if(!rule) return false;
  return Math.hypot(x-rule.center.x,z-rule.center.z) <= rule.radius*2.4;
}

async function ensureCreature(id:string,species:string,x:number,y:number,z:number) {
  const rule=creatureRule(species);
  if(!rule || !validCreaturePosition(species,x,z)) throw new Error("invalid_creature_position");
  const existing=await admin.from("grid_creature_combat_state").select("*").eq("creature_id",id).maybeSingle();
  if(existing.error) throw existing.error;
  if(existing.data) {
    const previousAt=new Date(existing.data.updated_at).getTime();
    const elapsed=Math.max(.05,Math.min(2.0,(Date.now()-previousAt)/1000));
    const moved=distance({x,y,z},{x:Number(existing.data.x),y:Number(existing.data.y),z:Number(existing.data.z)});
    const maxDistance=7.5*elapsed+1.25;
    const next=moved<=maxDistance ? {x,y,z} : {x:Number(existing.data.x),y:Number(existing.data.y),z:Number(existing.data.z)};
    const patch={...next,updated_at:new Date().toISOString()};
    const {data,error}=await admin.from("grid_creature_combat_state").update(patch).eq("creature_id",id).select("*").single();
    if(error) throw error;
    return data;
  }
  const {data,error}=await admin.from("grid_creature_combat_state").insert({
    creature_id:id,species,world:rule.world,x,y,z,health:rule.maxHealth,max_health:rule.maxHealth,updated_at:new Date().toISOString()
  }).select("*").single();
  if(error) throw error;
  return data;
}

function modeForPosition(x: number, z: number): Mode {
  const zone = zoneFor(x, z);
  return zone === "SAFE" ? "SAFE" : zone === "PVP_ARENA" ? "PVP" : "PVE";
}

async function getUser(req: Request) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice("Bearer ".length);
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

async function recordWorldEvent(eventType:string,title:string,summary:string,metadata:Record<string,unknown>,sourceId?:string){
  try{
    await admin.from("grid_world_events").insert({
      event_type:eventType,
      source_table:"grid-combat",
      source_id:sourceId ?? null,
      region_id:"first-light",
      title,
      summary,
      visibility:"public",
      metadata,
    });
  }catch(error){ console.error("world_event_log_failed",error); }
}

async function ensureState(userId: string) {
  const { data } = await admin.from("grid_combat_state").select("*").eq("user_id", userId).maybeSingle();
  if (data) return data;
  const { data: created, error } = await admin.from("grid_combat_state").insert({ user_id: userId }).select("*").single();
  if (error) throw error;
  return created;
}

async function syncState(userId: string, input: {x:number;y:number;z:number;yaw:number;regionId?:string}) {
  const state = await ensureState(userId);
  const now = Date.now();
  const previous = new Date(state.updated_at).getTime();
  const elapsed = Math.max(0.05, Math.min(2.0, (now - previous) / 1000));
  const requested = { x: Number(input.x), y: Math.max(0, Number(input.y)), z: Number(input.z) };
  const yaw = Number(input.yaw);
  if (![requested.x, requested.y, requested.z, yaw].every(Number.isFinite)) throw new Error("invalid transform");

  const maxSpeed = 9.5;
  const maxDistance = maxSpeed * elapsed + 1.5;
  const moved = distance(requested, {x:Number(state.x),y:Number(state.y),z:Number(state.z)});
  const accepted = moved <= maxDistance || now - previous > 5000;
  const next = accepted ? requested : { x:Number(state.x), y:Number(state.y), z:Number(state.z) };
  const mode = modeForPosition(next.x, next.z);

  const { data, error } = await admin.from("grid_combat_state").update({
    region_id: String(input.regionId ?? state.region_id),
    x: next.x, y: next.y, z: next.z, yaw,
    mode, updated_at: new Date(now).toISOString(),
  }).eq("user_id", userId).select("*").single();
  if (error) throw error;
  return { state:data, accepted, zone:zoneFor(next.x,next.z) };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error:"method_not_allowed" }, 405);

  const user = await getUser(req);
  if (!user) return json({ error:"unauthorized" }, 401);

  try {
    const body = await req.json();
    const action = String(body.action ?? "state");
    const state = await ensureState(user.id);

    if (action === "sync") {
      const result = await syncState(user.id, body.transform ?? body);
      return json({ ok:true, action, zone:result.zone, mode:result.state.mode, state:result.state, accepted:result.accepted });
    }

    if (action === "set_mode") {
      const requested = String(body.mode) as Mode;
      if (!["PVE","PVP","SAFE"].includes(requested)) return json({error:"invalid_mode"},400);
      const zone = zoneFor(Number(state.x), Number(state.z));
      const allowed = requested === "PVP" ? zone === "PVP_ARENA" : requested === "SAFE" ? zone === "SAFE" : true;
      const mode:Mode = allowed ? requested : modeForPosition(Number(state.x), Number(state.z));
      const { data, error } = await admin.from("grid_combat_state").update({ mode, updated_at:new Date().toISOString() }).eq("user_id",user.id).select("*").single();
      if(error) throw error;
      return json({ok:true,action,mode,zone,allowed,state:data});
    }

    if (action === "sync_creatures") {
      const creatures = Array.isArray(body.creatures) ? body.creatures : [];
      const states = [];
      for (const item of creatures.slice(0, 40)) {
        const id = String(item?.id ?? "");
        const species = String(item?.species ?? "");
        const x = Number(item?.x), y = Math.max(0,Number(item?.y ?? 0)), z = Number(item?.z);
        if (!/^[a-z0-9-]+:[0-9]+$/.test(id) || !creatureRule(species) || ![x,y,z].every(Number.isFinite)) continue;
        states.push(await ensureCreature(id,species,x,y,z));
      }
      return json({ok:true,action,creatures:states});
    }

    if (action === "creature_state") {
      const ids = Array.isArray(body.creatureIds) ? body.creatureIds.map((id:string)=>String(id)).slice(0,60) : [];
      const query = ids.length
        ? admin.from("grid_creature_combat_state").select("*").in("creature_id",ids)
        : admin.from("grid_creature_combat_state").select("*").limit(60);
      const result = await query;
      if(result.error) throw result.error;
      const now=Date.now();
      const states=(result.data??[]).map(row=>{
        if(row.respawn_at && new Date(row.respawn_at).getTime()<=now && Number(row.health)<=0) return {...row,health:Number(row.max_health),respawn_at:null};
        return row;
      });
      return json({ok:true,action,creatures:states});
    }

    if (action === "attack_creature") {
      const creatureId=String(body.creatureId ?? "");
      const creature=await admin.from("grid_creature_combat_state").select("*").eq("creature_id",creatureId).maybeSingle();
      if(creature.error) throw creature.error;
      if(!creature.data) return json({ok:false,error:"creature_not_found"},404);
      const target=creature.data;
      const rule=creatureRule(String(target.species));
      if(!rule) return json({ok:false,error:"unknown_creature"},400);
      const now=Date.now();
      if(target.respawn_at && new Date(target.respawn_at).getTime()>now) return json({ok:false,error:"creature_down"},409);
      if(Number(target.health)<=0) return json({ok:false,error:"creature_down"},409);
      if(Number(state.health)<=0) return json({ok:false,error:"combatant_down"},409);
      const range=distance(state,target);
      if(range>3.9) return json({ok:false,error:"out_of_range",range},403);
      const lastAttack=target.last_attack_at ? new Date(target.last_attack_at).getTime() : 0;
      if(now-lastAttack<800) return json({ok:false,error:"cooldown",retryAfterMs:800-(now-lastAttack)},429);
      const nextHealth=Math.max(0,Number(target.health)-18);
      const updatedCreature=await admin.from("grid_creature_combat_state")
        .update({health:nextHealth,last_attack_at:new Date(now).toISOString(),respawn_at:nextHealth<=0?new Date(now+6000).toISOString():null,updated_at:new Date(now).toISOString()})
        .eq("creature_id",creatureId).eq("health",Number(target.health)).select("*").single();
      if(updatedCreature.error) return json({ok:false,error:"conflict_or_creature_changed"},409);
      if(nextHealth<=0) await recordWorldEvent("CREATURE_DEFEATED","A creature fell in the living world",String(target.species).replaceAll("-"," ")+" was defeated; nearby ecology has registered the loss.",{world:target.world,species:target.species,creatureId},creatureId);
      return json({ok:true,action,damage:18,creature:updatedCreature.data,defeated:nextHealth<=0});
    }

    if (action === "creature_attack") {
      const creatureId=String(body.creatureId ?? "");
      const creature=await admin.from("grid_creature_combat_state").select("*").eq("creature_id",creatureId).maybeSingle();
      if(creature.error) throw creature.error;
      if(!creature.data) return json({ok:false,error:"creature_not_found"},404);
      const target=creature.data;
      const rule=creatureRule(String(target.species));
      if(!rule) return json({ok:false,error:"unknown_creature"},400);
      const now=Date.now();
      if(target.respawn_at && new Date(target.respawn_at).getTime()>now) return json({ok:false,error:"creature_down"},409);
      if(Number(target.health)<=0 || Number(state.health)<=0) return json({ok:false,error:"combatant_down"},409);
      const range=distance(state,target);
      if(range>2.8) return json({ok:false,error:"out_of_range",range},403);
      const lastAttack=target.last_attack_at ? new Date(target.last_attack_at).getTime() : 0;
      if(now-lastAttack<1400) return json({ok:false,error:"cooldown",retryAfterMs:1400-(now-lastAttack)},429);
      const nextHealth=Math.max(0,Number(state.health)-rule.damage);
      const updatedPlayer=await admin.from("grid_combat_state").update({health:nextHealth,last_pve_attack_at:new Date(now).toISOString(),updated_at:new Date(now).toISOString()}).eq("user_id",user.id).select("*").single();
      if(updatedPlayer.error) throw updatedPlayer.error;
      await admin.from("grid_creature_combat_state").update({last_attack_at:new Date(now).toISOString(),updated_at:new Date(now).toISOString()}).eq("creature_id",creatureId);
      return json({ok:true,action,damage:rule.damage,attacker:updatedPlayer.data,target:target});
    }

    if (action === "attack") {
      const targetId = String(body.targetId ?? "");
      if (!targetId || targetId === user.id) return json({error:"invalid_target"},400);
      const attacker = state;
      const target = await admin.from("grid_combat_state").select("*").eq("user_id",targetId).maybeSingle();
      if (target.error) throw target.error;
      if (!target.data) return json({error:"target_not_found"},404);

      const zone = zoneFor(Number(attacker.x), Number(attacker.z));
      if (attacker.mode !== "PVP" || zone !== "PVP_ARENA") return json({ok:false,error:"pvp_not_allowed",zone,mode:attacker.mode},403);
      if (zoneFor(Number(target.data.x), Number(target.data.z)) !== "PVP_ARENA") return json({ok:false,error:"target_outside_arena"},403);
      if (Number(attacker.health) <= 0 || Number(target.data.health) <= 0) return json({ok:false,error:"combatant_down"},409);

      const now = Date.now();
      const lastAttack = attacker.last_attack_at ? new Date(attacker.last_attack_at).getTime() : 0;
      if (now - lastAttack < 600) return json({ok:false,error:"cooldown",retryAfterMs:600-(now-lastAttack)},429);

      const range = distance(attacker,target.data);
      if (range > 3.9) return json({ok:false,error:"out_of_range",range},403);

      const damage = 18;
      const nextHealth = Math.max(0, Number(target.data.health)-damage);
      const { data:updatedTarget,error:updateError } = await admin.from("grid_combat_state")
        .update({ health:nextHealth, updated_at:new Date().toISOString() })
        .eq("user_id",targetId).eq("health",Number(target.data.health)).select("*").single();
      if(updateError) return json({ok:false,error:"conflict_or_target_changed"},409);

      const { data:updatedAttacker,error:attackerError } = await admin.from("grid_combat_state")
        .update({ last_attack_at:new Date().toISOString(), updated_at:new Date().toISOString() })
        .eq("user_id",user.id).select("*").single();
      if(attackerError) throw attackerError;

      if(nextHealth<=0) await recordWorldEvent("PVP_DEFEAT","Grid Arena duel resolved","A player was defeated in the authorized Grid Arena.",{attacker:user.id,target:targetId});
      return json({ok:true,action,damage,targetId,defeated:nextHealth<=0,attacker:updatedAttacker,target:updatedTarget});
    }

    if (action === "state") {
      const zone = zoneFor(Number(state.x), Number(state.z));
      return json({ok:true,action,zone,mode:state.mode,state});
    }

    return json({error:"unknown_action"},400);
  } catch (error) {
    console.error(error);
    return json({error:error instanceof Error ? error.message : "server_error"},500);
  }
});
