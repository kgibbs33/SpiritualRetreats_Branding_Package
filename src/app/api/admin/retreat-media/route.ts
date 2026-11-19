import { NextRequest,NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { getAdminSession } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { MEDIA_BUCKET,mediaEnabled,SLOT_KEYS,targetQuery } from '@/lib/retreats/media';
import { milestonePreviewRows } from '@/lib/retreats/milestone-preview';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const noStore={'Cache-Control':'private, no-store'};
function json(body:unknown,status=200){return NextResponse.json(body,{status,headers:noStore});}
async function validTarget(id:string){
 if(milestonePreviewRows.some(r=>r.id===id))return true;
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return false;
 const {data}=await createAdminClient().from('retreats').select('id').eq('id',id).maybeSingle();return !!data;
}
async function auth(req:NextRequest,write=false){
 if(!mediaEnabled())return json({error:'Not available on this deployment.'},404);
 if(!await getAdminSession())return json({error:'Admin sign-in required.'},401);
 if(write){const origin=req.headers.get('origin');const expected=new URL(req.url).origin;
 if(!origin||origin!==expected||req.headers.get('x-retreat-media')!=='1'||req.headers.get('sec-fetch-site')==='cross-site')return json({error:'Same-origin request required.'},403);}
 return null;
}
export async function GET(req:NextRequest){
 const denied=await auth(req);if(denied)return denied;
 const id=req.nextUrl.searchParams.get('listing')??'';if(!await validTarget(id))return json({error:'Unknown retreat.'},400);
 const target=targetQuery(id);const {data,error}=await createAdminClient().from('retreat_media_slots').select('id,slot_key,alt_text,credit,source_url,license_note,rights_confirmed,illustrative,review_state,created_at,approved_at').eq(target.key,target.value).order('created_at',{ascending:false});
 if(error)return json({error:'Could not load photo slots.'},503);return json({data});
}
const attempts=new Map<string,{count:number,until:number}>();
export async function POST(req:NextRequest){
 const denied=await auth(req,true);if(denied)return denied;
 if(Number(req.headers.get('content-length')??0)>6*1024*1024)return json({error:'Upload too large.'},413);
 // Bound per-session request volume before decoding. A persisted table count also spans instances.
 const token=req.cookies.get('admin_session')?.value??'';const now=Date.now();const rate=attempts.get(token);if(rate&&rate.until>now&&rate.count>=30)return json({error:'Upload limit reached. Try again in an hour.'},429);
 if(attempts.size>500)for(const [key,value] of attempts)if(value.until<now)attempts.delete(key);
 attempts.set(token,{count:rate&&rate.until>now?rate.count+1:1,until:rate&&rate.until>now?rate.until:now+3600000});
 try{
 const form=await req.formData();const listing=String(form.get('listing')??'');const slot=String(form.get('slot')??'');
 if(!await validTarget(listing)||!SLOT_KEYS.includes(slot as typeof SLOT_KEYS[number]))return json({error:'Unknown retreat or photo slot.'},400);
 const alt=String(form.get('alt')??'').trim(),credit=String(form.get('credit')??'').trim(),source=String(form.get('source')??'').trim(),license=String(form.get('license')??'').trim();
 if(!alt||alt.length>300||!credit||credit.length>1000||!license||license.length>1000||source.length>2000||form.get('rights')!=='true')return json({error:'Alt text, source credit, licence/permission and rights confirmation are required.'},400);
 if(source){try{const u=new URL(source);if(!['https:','http:'].includes(u.protocol))throw Error();}catch{return json({error:'Source URL must be a valid http or https link.'},400);}}
 const file=form.get('file');if(!(file instanceof File)||!['image/jpeg','image/png','image/webp'].includes(file.type))return json({error:'Choose JPEG, PNG or WebP.'},400);
 if(!file.size||file.size>5*1024*1024)return json({error:'Photo must be 5 MB or smaller.'},413);
 const bytes=Buffer.from(await file.arrayBuffer());const signature=bytes.subarray(0,16);
 const format=signature[0]===255&&signature[1]===216&&signature[2]===255?'image/jpeg':signature.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'image/png':signature.toString('ascii',0,4)==='RIFF'&&signature.toString('ascii',8,12)==='WEBP'?'image/webp':'';
 if(format!==file.type)return json({error:'File contents do not match its photo type.'},400);
 let clean:Buffer;try{const image=sharp(bytes,{limitInputPixels:24000000,failOn:'warning',animated:false});const m=await image.metadata();if(!m.width||!m.height||m.width>10000||m.height>10000||(m.pages??1)>1)throw Error();clean=await image.rotate().resize({width:2400,height:2400,fit:'inside',withoutEnlargement:true}).flatten({background:'#ffffff'}).jpeg({quality:88}).toBuffer();}catch{return json({error:'Photo could not be decoded, or exceeds the 24-megapixel limit.'},400);}
 const s=createAdminClient();const target=targetQuery(listing);const {count,error:countError}=await s.from('retreat_media_slots').select('id',{count:'exact',head:true}).eq(target.key,target.value).gte('created_at',new Date(now-3600000).toISOString());
 if(countError)return json({error:'Could not verify upload limit.'},503);if((count??0)>=30)return json({error:'This retreat has reached its hourly upload limit.'},429);
 const path=`${listing}/${slot}/${randomUUID()}.jpg`;
 const {error:uploadError}=await s.storage.from(MEDIA_BUCKET).upload(path,clean,{contentType:'image/jpeg',upsert:false,cacheControl:'0'});
 if(uploadError)return json({error:'Photo upload failed. Current images are unchanged.'},503);
 const {data,error}=await s.from('retreat_media_slots').insert({[target.key]:listing,slot_key:slot,storage_path:path,alt_text:alt,credit,source_url:source,license_note:license,rights_confirmed:true,illustrative:form.get('illustrative')==='true',review_state:'pending'}).select('id').single();
 if(error){await s.storage.from(MEDIA_BUCKET).remove([path]);return json({error:'Could not save slot. Current images are unchanged.'},503);}
 return json({id:data.id,message:'Uploaded. Pending review, existing approved photo remains unchanged.'},201);
 }catch{return json({error:'Could not process upload. Nothing existing was replaced.'},400);}
}
export async function PATCH(req:NextRequest){
 const denied=await auth(req,true);if(denied)return denied;
 try{const body=await req.json();if(!/^[0-9a-f-]{36}$/i.test(body.id??'')||!['approved','rejected'].includes(body.state))return json({error:'Invalid review.'},400);
 const s=createAdminClient();const {data,error}=await s.from('retreat_media_slots').update({review_state:body.state,approved_at:body.state==='approved'?new Date().toISOString():null}).eq('id',body.id).select('id').maybeSingle();
 if(error)return json({error:'Review could not be saved.'},503);if(!data)return json({error:'Photo not found.'},404);return json({message:body.state==='approved'?'Approved. The named slot now updates automatically.':'Rejected. This photo will not be displayed.'});
 }catch{return json({error:'Invalid review.'},400);}
}
