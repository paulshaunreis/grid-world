import type { SupabaseClient } from '@supabase/supabase-js';

export class GridOperatorService {
  constructor(private readonly client: SupabaseClient) {}
  async chat(message:string, runtimeContext?: Record<string,unknown>){const {data,error}=await this.client.functions.invoke('grid-operator',{body:{action:'chat',message,runtime_context:runtimeContext??{}}});if(error)throw error;return data as {answer:string;openCases:any[];authenticated:boolean;};}
  async context(){const {data,error}=await this.client.functions.invoke('grid-operator',{body:{action:'context'}});if(error)throw error;return data;}
  async verificationStatus(){const {data,error}=await this.client.functions.invoke('grid-operator',{body:{action:'verify-status'}});if(error)throw error;return data;}
  async requestEmailChallenge(){const {data,error}=await this.client.auth.getUser();if(error)throw error;const email=data.user?.email;if(!email)throw new Error('verified_email_required');const {error:sendError}=await this.client.auth.signInWithOtp({email,options:{shouldCreateUser:false}});if(sendError)throw sendError;}
  async confirmEmailChallenge(token:string){const {data,error}=await this.client.auth.getUser();if(error)throw error;const email=data.user?.email;if(!email)throw new Error('verified_email_required');const {error:verifyError}=await this.client.auth.verifyOtp({email,token:token.trim(),type:'email'});if(verifyError)throw verifyError;}
  async enroll(codeword:string,recoveryPhrase:string){const {data,error}=await this.client.rpc('grid_enroll_verification',{p_codeword:codeword,p_recovery_phrase:recoveryPhrase});if(error)throw error;return data;}
  async verify(codeword:string,recoveryPhrase:string):Promise<{verified:boolean}>{const {data,error}=await this.client.rpc('grid_verify_three_factors',{p_codeword:codeword,p_recovery_phrase:recoveryPhrase});if(error)throw error;return data as {verified:boolean};}
}