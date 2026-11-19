import {NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/admin/auth';
import {createAdminClient} from '@/lib/supabase/admin';
import {mediaEnabled,MEDIA_BUCKET,type MediaSlot} from '@/lib/retreats/media';
export const dynamic='force-dynamic';
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const missing=()=>new NextResponse('Not found',{status:404,headers:{'Cache-Control':'no-store'}});
 if(!mediaEnabled()||!/^[0-9a-f-]{36}$/i.test(id))return missing();
 const s=createAdminClient();const {data,error}=await s.from('retreat_media_slots').select('*').eq('id',id).maybeSingle();
 if(error||!data)return missing();const row=data as MediaSlot;
 const admin=await getAdminSession();
 if(!admin){
  if(row.review_state!=='approved')return missing();
  if(!row.preview_key){const {data:retreat}=await s.from('retreats').select('status,qualification_status').eq('id',row.retreat_id).maybeSingle();if(retreat?.status!=='published'||retreat?.qualification_status!=='live')return missing();}
 }
 const {data:blob,error:downloadError}=await s.storage.from(MEDIA_BUCKET).download(row.storage_path);
 if(downloadError||!blob)return missing();
 return new NextResponse(await blob.arrayBuffer(),{headers:{'Content-Type':'image/jpeg','Content-Disposition':'inline','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin'}});
}
