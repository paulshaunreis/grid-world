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
