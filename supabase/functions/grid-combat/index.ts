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
    return existing.data;
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

async function npcMemories(npcId:string, limit=12){
  const {data,error}=await admin.from("grid_npc_memories").select("*").eq("npc_id",npcId).order("memory_at",{ascending:false}).limit(Math.min(Math.max(limit,1),32));
  if(error) throw error;
  return data ?? [];
}
async function writeNpcMemory(userId:string, body:Record<string,unknown>){
  const npcId=String(body.npc_id ?? "");
  const subjectType=String(body.subject_type ?? "player");
  const subjectId=body.subject_id == null ? null : String(body.subject_id);
  const eventType=String(body.event_type ?? "INTERACTION");
  const summary=String(body.summary ?? "").slice(0,500);
  if(!npcId || !summary) throw new Error("invalid_memory");
  const visibility=String(body.visibility ?? "public")==="public" ? "public" : "private";
  const {data,error}=await admin.from("grid_npc_memories").insert({
    npc_id:npcId,subject_type:subjectType,subject_id:subjectId,event_type:eventType,summary,
    valence:Math.max(-1,Math.min(1,Number(body.valence ?? 0))),
    importance:Math.max(0,Math.min(1,Number(body.importance ?? .5))),
    confidence:Math.max(0,Math.min(1,Number(body.confidence ?? 1))),
    visibility,source:"player_interaction",details:{actor_user_id:userId}
  }).select("*").single();
  if(error) throw error;
  return data;
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

    if (action === "npc_memory_read") {
      const npcId=String(body.npc_id ?? "");
      if(!npcId) return json({error:"invalid_npc_id"},400);
      return json({ok:true,action,memories:await npcMemories(npcId,Number(body.limit ?? 12))});
    }

    if (action === "npc_memory_write") {
      return json({ok:true,action,memory:await writeNpcMemory(user.id,body)});
    }

    if (action === "market_merchants") {
      const {data:merchants,error}=await admin.from("grid_npc_market_state").select("*").order("world");
      if(error) throw error;
      const defs:Record<string,{world:string;item:string;base:number}> = {
        HARBOR:{world:"HARBOR",item:"TIDE_SALT",base:4}, GARDENS:{world:"GARDENS",item:"BLOOM_RESIN",base:5},
        CITADEL:{world:"CITADEL",item:"CROWN_RELIC",base:8}, ARTS:{world:"ARTS",item:"MUSE_INK",base:6}, WILDS:{world:"WILDS",item:"FRONTIER_ORE",base:7}
      };
      const enriched=[];
      for(const merchant of merchants??[]){
        const def=defs[String(merchant.world)];
        const {data:nodes}=await admin.from("grid_world_resource_state").select("amount,max_amount").eq("world",merchant.world).eq("kind",merchant.resource_kind).limit(20);
        const supply=(nodes??[]).reduce((s,row)=>s+Number(row.amount),0);
        const capacity=(nodes??[]).reduce((s,row)=>s+Number(row.max_amount),0)||1;
        const scarcity=Math.max(.55,Math.min(1.8,1.45-supply/capacity));
        const stockRatio=Math.max(.45,Math.min(1.8,Number(merchant.stock)/Math.max(1,Number(merchant.desired_stock))));
        const buyPrice=Math.max(.5,Math.round((def?.base??5)*scarcity*Number(merchant.buy_multiplier)*100)/100);
        const sellPrice=Math.max(.5,Math.round((def?.base??5)*(2-stockRatio)*Number(merchant.sell_multiplier)*100)/100);
        enriched.push({...merchant,supply,capacity,scarcity,buy_price:buyPrice,sell_price:sellPrice});
      }
      return json({ok:true,action,merchants:enriched});
    }

    if (action === "market_quote") {
      const world=String(body.world ?? "");
      const item=String(body.item_id ?? "");
      const amount=Math.max(1,Math.min(99,Number(body.amount ?? 1)));
      const defs:Record<string,{world:string;currency:string;base:number}> = {
        TIDE_SALT:{world:"HARBOR",currency:"tide",base:4},
        BLOOM_RESIN:{world:"GARDENS",currency:"root",base:5},
        CROWN_RELIC:{world:"CITADEL",currency:"lumen",base:8},
        MUSE_INK:{world:"ARTS",currency:"echo",base:6},
        FRONTIER_ORE:{world:"WILDS",currency:"forge",base:7},
      };
      const def=defs[item];
      if(!def || (world && world!==def.world)) return json({ok:false,error:"market_item_not_found"},404);
      const {data:node,error:nodeError}=await admin.from("grid_world_resource_state").select("amount,max_amount").eq("world",def.world).eq("kind",item).limit(20);
      if(nodeError) throw nodeError;
      const supply=(node??[]).reduce((sum,row)=>sum+Number(row.amount),0);
      const capacity=(node??[]).reduce((sum,row)=>sum+Number(row.max_amount),0) || 1;
      const scarcity=Math.max(.55,Math.min(1.8,1.45-(supply/capacity)));
      const {data:market}=await admin.from("grid_world_market_state").select("demand,base_price,currency_id").eq("world",def.world).maybeSingle();
      const demand=Number(market?.demand ?? 1);
      const stabilityPressure=1;
      const unitPrice=Math.max(.5,Math.round(Number(market?.base_price ?? def.base)*scarcity*demand*stabilityPressure*100)/100);
      return json({ok:true,action,world:def.world,item_id:item,amount,unit_price:unitPrice,total:Math.round(unitPrice*amount*100)/100,currency_id:String(market?.currency_id ?? def.currency),supply,capacity,scarcity,demand});
    }

    if (action === "market_sell") {
      const world=String(body.world ?? "");
      const item=String(body.item_id ?? "");
      const amount=Math.max(1,Math.min(99,Math.floor(Number(body.amount ?? 1))));
      const quoteAction=await (async()=>{
        const defs:Record<string,{world:string;currency:string;base:number}> = {
          TIDE_SALT:{world:"HARBOR",currency:"tide",base:4}, BLOOM_RESIN:{world:"GARDENS",currency:"root",base:5},
          CROWN_RELIC:{world:"CITADEL",currency:"lumen",base:8}, MUSE_INK:{world:"ARTS",currency:"echo",base:6},
          FRONTIER_ORE:{world:"WILDS",currency:"forge",base:7},
        };
        const def=defs[item];
        if(!def || world!==def.world) throw new Error("market_item_not_found");
        const {data:node,error:nodeError}=await admin.from("grid_world_resource_state").select("amount,max_amount").eq("world",def.world).eq("kind",item).limit(20);
        if(nodeError) throw nodeError;
        const supply=(node??[]).reduce((sum,row)=>sum+Number(row.amount),0);
        const capacity=(node??[]).reduce((sum,row)=>sum+Number(row.max_amount),0) || 1;
        const {data:market}=await admin.from("grid_world_market_state").select("demand,base_price,currency_id").eq("world",def.world).maybeSingle();
        const scarcity=Math.max(.55,Math.min(1.8,1.45-(supply/capacity)));
        const unitPrice=Math.max(.5,Math.round(Number(market?.base_price ?? def.base)*scarcity*Number(market?.demand ?? 1)*100)/100);
        return {def,supply,capacity,unitPrice,currencyId:String(market?.currency_id ?? def.currency)};
      })();
      const q=await quoteAction;
      const {data:trade,error:tradeError}=await admin.rpc("grid_execute_resource_sale",{p_user_id:user.id,p_world:q.def.world,p_item_id:item,p_amount:amount,p_currency_id:q.currencyId,p_unit_price:q.unitPrice});
      if(tradeError) throw tradeError;
      const merchantNames:Record<string,string> = {HARBOR:"Mara",GARDENS:"Sela",ARTS:"Caro",CITADEL:"Orin",WILDS:"Rook"};
      const merchantId=merchantNames[q.def.world];
      if(merchantId){
        const merchantRow=await admin.from("grid_npc_market_state").select("stock,desired_stock").eq("npc_id",merchantId).maybeSingle();
        if(merchantRow.error) throw merchantRow.error;
        if(merchantRow.data){
          const nextStock=Math.min(Number(merchantRow.data.desired_stock)*1.8,Number(merchantRow.data.stock)+amount);
          await admin.from("grid_npc_market_state").update({stock:nextStock,updated_at:new Date().toISOString()}).eq("npc_id",merchantId);
          await admin.from("grid_npc_memories").insert({
            npc_id:merchantId,subject_type:"player",subject_id:user.id,event_type:"MARKET_TRADE",
            summary:merchantId+" acquired "+amount+" "+item.replaceAll("_"," ")+" from a traveler.",
            valence:.35,importance:.55,confidence:1,visibility:"public",source:"market_trade",
            details:{actor_user_id:user.id,world:q.def.world,item,amount,unit_price:q.unitPrice}
          });
        }
      }
      await recordWorldEvent("MARKET_TRADE","A world market moved",user.id.slice(0,8)+" sold "+amount+" "+item.replaceAll("_"," ")+" in "+q.def.world+".",{world:q.def.world,item,amount,unit_price:q.unitPrice,currency:q.currencyId,merchant:merchantId});
      return json({ok:true,action,merchant:merchantId,quote:{world:q.def.world,item_id:item,amount,unit_price:q.unitPrice,total:Number(trade?.total??q.unitPrice*amount),currency_id:q.currencyId},trade});
    }

    if (action === "inventory_read") {
      const { data: inventory, error } = await admin.from("grid_player_inventory").select("item_id,quantity,updated_at").eq("user_id",user.id).order("item_id");
      if(error) throw error;
      const { data: minerals, error: mineralError } = await admin.from("grid_mineral_inventory").select("mineral_kind,amount").eq("user_id",user.id).order("mineral_kind");
      if(mineralError) throw mineralError;
      const merged=new Map<string,number>((inventory??[]).map((row:any)=>[String(row.item_id),Number(row.quantity)]));
      for(const row of minerals??[]) merged.set(String(row.mineral_kind),Number(row.amount));
      return json({ok:true,action,inventory:[...merged.entries()].map(([item_id,quantity])=>({item_id,quantity}))});
    }

    if (action === "resource_gather") {
      const resourceId=String(body.resourceId ?? "");
      const node=await admin.from("grid_world_resource_state").select("*").eq("node_id",resourceId).maybeSingle();
      if(node.error) throw node.error;
      if(!node.data) return json({ok:false,error:"resource_not_found"},404);
      const target=node.data;
      const range=Math.hypot(Number(state.x)-Number(target.x),Number(state.z)-Number(target.z));
      if(range>2.8) return json({ok:false,error:"out_of_range",range},403);
      if(Number(target.amount)<=0) return json({ok:false,error:"resource_depleted"},409);
      const amount=Math.min(8,Number(target.amount));
      const updated=await admin.from("grid_world_resource_state").update({amount:Number(target.amount)-amount,updated_at:new Date().toISOString()}).eq("node_id",resourceId).eq("amount",Number(target.amount)).select("*").single();
      if(updated.error) return json({ok:false,error:"resource_conflict"},409);
      const existing=await admin.from("grid_player_inventory").select("quantity").eq("user_id",user.id).eq("item_id",String(target.kind)).maybeSingle();
      if(existing.error) throw existing.error;
      const saved=await admin.from("grid_player_inventory").upsert({user_id:user.id,item_id:String(target.kind),quantity:Number(existing.data?.quantity??0)+amount,updated_at:new Date().toISOString()}).select("*").single();
      if(saved.error) throw saved.error;
      await recordWorldEvent("ECOLOGY_SHIFT","A resource was gathered",String(target.kind).replaceAll("_"," ")+" was gathered in "+String(target.world)+".",{world:target.world,kind:target.kind,amount});
      return json({ok:true,action,resource:{node_id:resourceId,world:target.world,kind:target.kind,amount,remaining:Number(updated.data.amount)},inventory:saved.data});
    }

    if (action === "craft") {
      const recipes:Record<string,{inputs:Record<string,number>;output:string;amount:number}> = {
        TIDELINE_GLASS:{inputs:{TIDE_SALT:5},output:"TIDELINE_GLASS",amount:1},
        BLOOM_THREAD:{inputs:{BLOOM_RESIN:5},output:"BLOOM_THREAD",amount:1},
        CROWN_RELIC_FRAGMENT:{inputs:{CROWN_RELIC:4},output:"CROWN_RELIC_FRAGMENT",amount:1},
        MUSE_PIGMENT:{inputs:{MUSE_INK:3},output:"MUSE_PIGMENT",amount:1},
        FRONTIER_ALLOY:{inputs:{FRONTIER_ORE:5},output:"FRONTIER_ALLOY",amount:1},
      };
      const recipe=recipes[String(body.recipeId ?? "")];
      if(!recipe) return json({ok:false,error:"unknown_recipe"},400);
      for(const [item,needed] of Object.entries(recipe.inputs)){
        const row=await admin.from("grid_player_inventory").select("quantity").eq("user_id",user.id).eq("item_id",item).maybeSingle();
        if(row.error) throw row.error;
        if(Number(row.data?.quantity??0)<needed) return json({ok:false,error:"insufficient_materials",item,needed,have:Number(row.data?.quantity??0)},409);
      }
      for(const [item,needed] of Object.entries(recipe.inputs)){
        const row=await admin.from("grid_player_inventory").select("quantity").eq("user_id",user.id).eq("item_id",item).maybeSingle();
        const saved=await admin.from("grid_player_inventory").upsert({user_id:user.id,item_id:item,quantity:Math.max(0,Number(row.data?.quantity??0)-needed),updated_at:new Date().toISOString()});
        if(saved.error) throw saved.error;
      }
      const outRow=await admin.from("grid_player_inventory").select("quantity").eq("user_id",user.id).eq("item_id",recipe.output).maybeSingle();
      if(outRow.error) throw outRow.error;
      const saved=await admin.from("grid_player_inventory").upsert({user_id:user.id,item_id:recipe.output,quantity:Number(outRow.data?.quantity??0)+recipe.amount,updated_at:new Date().toISOString()}).select("*").single();
      if(saved.error) throw saved.error;
      await recordWorldEvent("CRAFTING","A new world material was crafted",recipe.output.replaceAll("_"," ")+" entered the living economy.",{recipeId:String(body.recipeId),output:recipe.output,amount:recipe.amount});
      return json({ok:true,action,recipeId:String(body.recipeId),output:saved.data});
    }


    if (action === "npc_profile") {
      const npcId=String(body.npc_id ?? "");
      if(!npcId) return json({ok:false,error:"invalid_npc_id"},400);
      const {data:profile,error}=await admin.from("grid_npc_profiles").select("*").eq("id",npcId).maybeSingle();
      if(error) throw error;
      if(!profile) return json({ok:false,error:"npc_not_found"},404);
      const {data:market}=await admin.from("grid_npc_market_state").select("*").eq("npc_id",npcId.replace("npc.merchant.","").replace("npc.","")).maybeSingle();
      return json({ok:true,action,profile,market:market ?? null});
    }

    if (action === "vault_read") {
      const {data:vault,error}=await admin.from("grid_vault_inventory").select("item_id,quantity,mined_quantity,updated_at").eq("user_id",user.id).order("item_id");
      if(error) throw error;
      return json({ok:true,action,vault:vault ?? []});
    }

    if (action === "bazaar_list") {
      const {data:listings,error}=await admin.from("grid_bazaar_listings").select("id,seller_type,seller_user_id,seller_npc_id,world_id,item_id,remaining,currency_id,unit_price,status,created_at").eq("status","ACTIVE").order("created_at",{ascending:false}).limit(120);
      if(error) throw error;
      return json({ok:true,action,listings:listings ?? []});
    }

    if (action === "bazaar_create") {
      const world=String(body.world ?? "GRID_BAZAAR").slice(0,64);
      const item=String(body.item_id ?? "").slice(0,96);
      const amount=Math.floor(Number(body.amount ?? 0));
      const currency=String(body.currency_id ?? "grid").slice(0,32);
      const price=Number(body.unit_price ?? 0);
      if(!Number.isFinite(amount)||!Number.isFinite(price)) return json({ok:false,error:"invalid_listing"},400);
      const {data,error}=await admin.rpc("grid_bazaar_create_listing",{p_world:world,p_item_id:item,p_quantity:amount,p_currency_id:currency,p_unit_price:price});
      if(error) throw error;
      return json({ok:true,action,listing:data});
    }

    if (action === "bazaar_buy") {
      const listingId=String(body.listing_id ?? "");
      const amount=Math.floor(Number(body.amount ?? 1));
      if(!listingId || !Number.isFinite(amount)) return json({ok:false,error:"invalid_purchase"},400);
      const {data,error}=await admin.rpc("grid_bazaar_buy",{p_listing_id:listingId,p_amount:amount});
      if(error) throw error;
      if((data as any)?.seller_type==="NPC" && (data as any)?.seller_npc_id){
        const npcId=String((data as any).seller_npc_id).replace("npc.merchant.","");
        const merchantRow=await admin.from("grid_npc_market_state").select("stock,desired_stock").eq("npc_id",npcId).maybeSingle();
        if(merchantRow.data){
          await admin.from("grid_npc_market_state").update({stock:Math.max(0,Number(merchantRow.data.stock)-amount),updated_at:new Date().toISOString()}).eq("npc_id",npcId);
        }
        await admin.from("grid_npc_memories").insert({
          npc_id:String((data as any).seller_npc_id),subject_type:"player",subject_id:user.id,event_type:"MARKET_TRADE",
          summary:npcId+" sold "+amount+" "+String((data as any).item_id).replaceAll("_"," ")+" to a traveler.",
          valence:.25,importance:.5,confidence:1,visibility:"public",source:"bazaar_trade",
          details:{actor_user_id:user.id,listing_id:listingId,amount}
        });
      }
      await recordWorldEvent("BAZAAR_TRADE","Grid Bazaar trade completed",user.id.slice(0,8)+" purchased "+amount+" asset(s) in the Bazaar.",{listing_id:listingId,amount,seller_type:(data as any)?.seller_type,seller_npc_id:(data as any)?.seller_npc_id});
      return json({ok:true,action,trade:data});
    }

    if (action === "transmute_element") {
      const recipeId=String(body.recipe_id ?? "");
      if(!recipeId) return json({ok:false,error:"invalid_recipe"},400);
      const {data,error}=await admin.rpc("grid_transmute_element",{p_recipe_id:recipeId});
      if(error) throw error;
      await recordWorldEvent("ELEMENT_TRANSMUTATION","A new Grid element was created",user.id.slice(0,8)+" completed "+recipeId+".",{recipe_id:recipeId,result:data});
      return json({ok:true,action,result:data});
    }

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

    if (action === "tick_creatures") {
      const now = Date.now();
      const nowIso = new Date(now).toISOString();
      const { data: players, error: playersError } = await admin
        .from("grid_combat_state")
        .select("user_id,x,y,z,health,mode,updated_at")
        .eq("region_id", "first-light")
        .limit(80);
      if (playersError) throw playersError;

      const { data: rows, error: rowsError } = await admin
        .from("grid_creature_combat_state")
        .select("*")
        .limit(80);
      if (rowsError) throw rowsError;

      const nextStates = [];
      for (const row of rows ?? []) {
        const rule = creatureRule(String(row.species));
        if (!rule) continue;

        let x = Number(row.x), y = Number(row.y), z = Number(row.z);
        let health = Number(row.health);
        let targetUserId: string | null = row.target_user_id ?? null;
        let aiState = String(row.ai_state ?? "ROAM");
        const respawnAt = row.respawn_at ? new Date(row.respawn_at).getTime() : 0;

        if (health <= 0 && respawnAt && respawnAt <= now) {
          x = rule.center.x;
          y = 0;
          z = rule.center.z;
          health = Number(row.max_health);
          targetUserId = null;
          aiState = "ROAM";
        } else if (health <= 0) {
          nextStates.push(row);
          continue;
        }

        const candidates = (players ?? [])
          .filter(p => Number(p.health) > 0 && String(p.mode) !== "SAFE")
          .map(p => ({ ...p, d: Math.hypot(x-Number(p.x), z-Number(p.z)) }))
          .filter(p => p.d <= 14)
          .sort((a,b) => a.d-b.d);
        const target = candidates[0];

        if (target) {
          targetUserId = String(target.user_id);
          if (target.d <= 2.8) {
            aiState = "ATTACK";
            const lastAttack = row.last_attack_at ? new Date(row.last_attack_at).getTime() : 0;
            if (now-lastAttack >= 1400) {
              const { data: targetState } = await admin.from("grid_combat_state")
                .select("health")
                .eq("user_id", target.user_id)
                .maybeSingle();
              if (targetState && Number(targetState.health) > 0) {
                const nextHealth = Math.max(0, Number(targetState.health) - rule.damage);
                await admin.from("grid_combat_state")
                  .update({ health: nextHealth, updated_at: nowIso })
                  .eq("user_id", target.user_id)
                  .eq("health", Number(targetState.health));
                await admin.from("grid_creature_combat_state")
                  .update({ last_attack_at: nowIso })
                  .eq("creature_id", row.creature_id);
              }
            }
          } else {
            aiState = "PURSUIT";
            const dx = Number(target.x)-x;
            const dz = Number(target.z)-z;
            const len = Math.max(.001, Math.hypot(dx,dz));
            const speed = rule.world === "WILDS" ? 1.65 : 1.25;
            const step = Math.min(target.d-.8, speed * .65);
            if (step > 0) {
              x += dx/len*step;
              z += dz/len*step;
            }
          }
        } else {
          targetUserId = null;
          aiState = "ROAM";
          const seed = String(row.creature_id).split("").reduce((a,c)=>a+c.charCodeAt(0),0);
          const angle = now/9000 + seed*.17;
          const roamRadius = rule.radius * .72;
          const tx = rule.center.x + Math.cos(angle)*roamRadius;
          const tz = rule.center.z + Math.sin(angle*1.17)*roamRadius;
          const dx = tx-x, dz = tz-z, len = Math.max(.001, Math.hypot(dx,dz));
          const step = Math.min(len, .55);
          x += dx/len*step;
          z += dz/len*step;
        }

        const maxRadius = rule.radius * 2.4;
        const fromCenter = Math.hypot(x-rule.center.x,z-rule.center.z);
        if (fromCenter > maxRadius) {
          const pull = Math.min(1, (fromCenter-maxRadius)/Math.max(1,fromCenter));
          x += (rule.center.x-x)*pull;
          z += (rule.center.z-z)*pull;
        }

        const patch = {
          x,y,z,health,
          ai_state: aiState,
          target_user_id: targetUserId,
          last_ai_at: nowIso,
          updated_at: nowIso,
          respawn_at: health > 0 ? null : row.respawn_at,
        };
        const { data: updated, error: updateError } = await admin
          .from("grid_creature_combat_state")
          .update(patch)
          .eq("creature_id", row.creature_id)
          .eq("updated_at", row.updated_at)
          .select("*")
          .maybeSingle();
        nextStates.push(updated ?? row);
        if (updateError) console.error("creature_ai_update_failed", updateError);
      }
      return json({ok:true,action,creatures:nextStates});
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
      const zone=zoneFor(Number(state.x),Number(state.z));
      if(zone!=="PVE" || state.mode!=="PVE") return json({ok:false,error:"pve_not_allowed",zone,mode:state.mode},403);
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
      const zone=zoneFor(Number(state.x),Number(state.z));
      if(zone!=="PVE" || state.mode!=="PVE") return json({ok:false,error:"pve_not_allowed",zone,mode:state.mode},403);
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
      if (target.data.mode !== "PVP") return json({ok:false,error:"target_not_opted_in",targetMode:target.data.mode},403);
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
