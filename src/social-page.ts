import {createClient} from '@supabase/supabase-js';
import {GridSocialAuthority} from './social/GridSocialAuthority';
import {mountGridSocialPanel} from './ui/GridSocialPanel';
import './site.css';

const url=import.meta.env.VITE_SUPABASE_URL as string|undefined;
const key=import.meta.env.VITE_SUPABASE_ANON_KEY as string|undefined;
const status=document.querySelector<HTMLElement>('#social-status');
if(!url||!key){
  if(status)status.textContent='GRID SOCIAL · AUTHENTICATION CONFIGURATION REQUIRED';
}else{
  const client=createClient(url,key);
  const authority=new GridSocialAuthority(client);
  const panel=mountGridSocialPanel(authority);
  panel.open();
  if(status)status.textContent='GRID SOCIAL · PANEL READY · SIGN IN TO SYNC YOUR CONNECTIONS';
}
