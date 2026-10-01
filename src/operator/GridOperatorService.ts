import type { SupabaseClient } from '@supabase/supabase-js';

export class GridOperatorService {
  constructor(private readonly client: SupabaseClient) {}
  async chat(message:string){const {data,error}=await this.client.functions.invoke('grid-operator',{body:{action:'chat',message}});if(error)throw error;return data as {answer:string;openCases:any[]};}
  async context(){const {data,error}=await this.client.functions.invoke('grid-operator',{body:{action:'context'}});if(error)throw error;return data;}
  async verificationStatus(){const {data,error}=await this.client.functions.invoke('grid-operator',{body:{action:'verify-status'}});if(error)throw error;return data;}
  async enroll(codeword:string,recoveryPhrase:string){const {data,error}=await this.client.rpc('grid_enroll_verification',{p_codeword:codeword,p_recovery_phrase:recoveryPhrase});if(error)throw error;return data;}
  async verify(codeword:string,recoveryPhrase:string){const {data,error}=await this.client.rpc('grid_verify_three_factors',{p_codeword:codeword,p_recovery_phrase:recoveryPhrase});if(error)throw error;return data;}
}