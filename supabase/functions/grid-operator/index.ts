import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Content-Type":"application/json"};
const url=Deno.env.get("SUPABASE_URL")!;
const serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin=createClient(url,serviceKey);
const gatewayKey=Deno.env.get("AI_GATEWAY_API_KEY")!;
const model=Deno.env.get("GRID_OPERATOR_MODEL")||"openai/gpt-5.6-sol";

function json(body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:cors});}
async function user(req:Request){const h=req.headers.get("Authorization");if(!h?.startsWith("Bearer "))return null;const {data,error}=await admin.auth.getUser(h.slice(7));return error||!data.user?null:data.user;}

async function proactiveChecks(userId:string){
 const {data:u}=await admin.auth.admin.getUserById(userId);
 const {data:p}=await admin.from("profiles").select("onboarding_complete").eq("id",userId).maybeSingle();
 const {data:v}=await admin.from("grid_verification_factors").select("enrolled_at").eq("user_id",userId).maybeSingle();
 const checks=[
  {id:"ACCOUNT-VERIFY",severity:"warning",title:"Complete account verification",summary:"Your three-factor Grid verification has not been enrolled.",missing:!v?.enrolled_at},
  {id:"ACCOUNT-ONBOARD",severity:"notice",title:"Finish account onboarding",summary:"Your Grid profile onboarding is incomplete.",missing:p?.onboarding_complete===false},
  {id:"ACCOUNT-EMAIL",severity:"warning",title:"Verify your email",summary:"A verified email is required for secure account recovery.",missing:!u?.user?.email_confirmed_at}
 ];
 for(const x of checks) if(x.missing){
  await admin.from("grid_operator_cases").upsert({user_id:userId,severity:x.severity,status:"open",category:"account",title:x.title,summary:x.summary,evidence:{source:"proactive_account_check"},updated_at:new Date().toISOString()},{onConflict:"user_id,title"});
 }
}
async function context(userId:string){
 await proactiveChecks(userId);
 const [profile,prefs,cases,rules]=await Promise.all([
  admin.from("profiles").select("display_name,handle,avatar_style,avatar_customization,created_at,onboarding_complete").eq("id",userId).maybeSingle(),
  admin.from("grid_account_social").select("age_band,profile_privacy,online_status_privacy").eq("user_id",userId).maybeSingle(),
  admin.from("grid_operator_cases").select("id,severity,status,category,title,summary,created_at,updated_at").eq("user_id",userId).in("status",["open","acknowledged"]).order("updated_at",{ascending:false}).limit(12),
  admin.from("grid_operator_policy_rules").select("id,title,description,rating,action").eq("enabled",true).order("id")
 ]);
 return {profile:profile.data,prefs:prefs.data,cases:cases.data??[],rules:rules.data??[]};
}

async function callOperator(prompt:string,ctx:unknown){
 const response=await fetch("https://ai-gateway.vercel.sh/v1/chat/completions",{method:"POST",headers:{"Authorization":"Bearer "+gatewayKey,"Content-Type":"application/json"},body:JSON.stringify({model,messages:[
  {role:"system",content:"You are Grid Operator, the courteous and concise AI operations assistant for Grid World. Explain Grid terms, rules, safety, account issues, moderation procedures, and world systems. Be factual and calm. Never invent a law, policy, account fact, punishment, or investigation. Distinguish Grid World rules from external law. Do not expose secrets, hashes, private verification answers, or hidden moderation evidence. If a user may be underage, do not help bypass age gates. You may explain how to appeal or request human review. You are a moderator assistant, not a court and not a substitute for emergency services. Ask for verification before discussing sensitive account actions."},
  {role:"user",content:JSON.stringify({request:prompt,account_context:ctx})}
],temperature:.2,max_tokens:700})});
 if(!response.ok)throw new Error("operator_ai_unavailable");
 const data=await response.json();
 return data?.choices?.[0]?.message?.content??"I’m unable to answer that right now.";
}

Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return json({error:"method_not_allowed"},405);
 const u=await user(req);
 try{
  const body=await req.json();const action=String(body.action||"chat");const ctx=u?await context(u.id):{profile:null,prefs:null,cases:[],rules:[]};
  if(action==="context"){if(!u)return json({error:"authentication_required"},401);return json({ok:true,context:{profile:ctx.profile,prefs:ctx.prefs,cases:ctx.cases}});}
  if(action==="chat"){
   const message=String(body.message||"").trim().slice(0,4000);if(!message)return json({error:"message_required"},400);
   if(u) await admin.from("grid_operator_messages").insert({user_id:u.id,role:"user",body:message});
   const answer=await callOperator(message,ctx);
   if(u) await admin.from("grid_operator_messages").insert({user_id:u.id,role:"operator",body:answer});
   return json({ok:true,answer,openCases:ctx.cases,authenticated:Boolean(u)});
  }
  if(action==="verify-status"){if(!u)return json({error:"authentication_required"},401);
   const {data}=await admin.from("grid_verification_factors").select("factor_one_label,factor_two_label,factor_three_label,factor_three_type,enrolled_at").eq("user_id",u.id).maybeSingle();
   return json({ok:true,enrolled:Boolean(data?.enrolled_at),factors:data});
  }
  return json({error:"unknown_action"},400);
 }catch(e){console.error(e);return json({error:e instanceof Error?e.message:"operator_error"},500);}
});