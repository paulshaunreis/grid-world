import {createClient} from '@supabase/supabase-js';
import {GridSocialAuthority} from './social/GridSocialAuthority';
import {mountGridSocialPanel} from './ui/GridSocialPanel';

const url=import.meta.env.VITE_SUPABASE_URL as string|undefined;
const key=import.meta.env.VITE_SUPABASE_ANON_KEY as string|undefined;
if(url&&key){
  const authority=new GridSocialAuthority(createClient(url,key));
  const panel=mountGridSocialPanel(authority);
  const button=document.createElement('button');
  button.className='ghost';
  button.id='grid-social-home';
  button.type='button';
  button.textContent='SOCIAL';
  document.querySelector('.header-actions')?.prepend(button);
  button.addEventListener('click',()=>panel.open());
}
