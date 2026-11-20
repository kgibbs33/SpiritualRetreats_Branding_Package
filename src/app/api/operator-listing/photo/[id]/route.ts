import {NextRequest} from 'next/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {getAdminSession} from '@/lib/admin/auth';
import {inviteAuth,PRIVATE_HEADERS,reply} from '@/lib/retreats/operator-invites';
import {MEDIA_BUCKET,mediaEnabled} from '@/lib/retreats/media';
export const dynamic='force-dynamic';
export async function GET(req:NextRequest,{params}:{params:Promise<{id:string}>}){if(!mediaEnabled())return reply({error:'Unavailable.'},404);const {id}=await params;if(!/^[a-f0-9-]{36}$/.test(id))return reply({error:'Not found.'},404);const admin=await getAdminSession();const i=admin?null:await inviteAuth(req);if(!admin&&!i)return reply({error:'Not found.'},404);const s=createAdminClient();let q=s.from('retreat_operator_assets').select('storage_path').eq('id',id);if(i)q=q.eq('invite_id',i.id);const{data,error}=await q.maybeSingle();if(error||!data)return reply({error:'Not found.'},404);const{data:file,error:fe}=await s.storage.from(MEDIA_BUCKET).download(data.storage_path);if(fe||!file)return reply({error:'Not found.'},404);return new Response(file,{headers:{...PRIVATE_HEADERS,'Content-Type':'image/jpeg','X-Content-Type-Options':'nosniff'}});}
