import {NextRequest} from 'next/server';
import {randomUUID} from 'node:crypto';
import sharp from 'sharp';
import {createAdminClient} from '@/lib/supabase/admin';
import {reply as json,inviteAuth,sameOrigin} from '@/lib/retreats/operator-invites';
import {MEDIA_BUCKET,SLOT_KEYS} from '@/lib/retreats/media';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(req:NextRequest){
 if(!sameOrigin(req))return json({error:'Same-origin request required.'},403);
 const i=await inviteAuth(req);if(!i)return json({error:'Invitation invalid, expired or revoked.'},401);
 if(Number(req.headers.get('content-length')??0)>6*1024*1024)return json({error:'Upload too large.'},413);
 try{const form=await req.formData();const slot=String(form.get('slot')??'');if(!SLOT_KEYS.includes(slot as typeof SLOT_KEYS[number]))return json({error:'Unknown photo slot.'},400);
 const alt=String(form.get('alt')??'').trim(),credit=String(form.get('credit')??'').trim(),source=String(form.get('source')??'').trim(),license=String(form.get('permission')??'').trim();
 if(!alt||alt.length>300||!credit||credit.length>1000||!license||license.length>1000||source.length>2000||form.get('rights')!=='true')return json({error:'Alt text, source credit, licence/permission and rights confirmation are required.'},400);
 if(source){try{const u=new URL(source);if(!['https:','http:'].includes(u.protocol))throw Error();}catch{return json({error:'Source URL must be a valid http or https link.'},400);}}
 const file=form.get('file');if(!(file instanceof File)||!['image/jpeg','image/png','image/webp'].includes(file.type))return json({error:'Choose JPEG, PNG or WebP.'},400);
 if(!file.size||file.size>5*1024*1024)return json({error:'Photo must be 5 MB or smaller.'},413);
 const bytes=Buffer.from(await file.arrayBuffer());const signature=bytes.subarray(0,16);
 const format=signature[0]===255&&signature[1]===216&&signature[2]===255?'image/jpeg':signature.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'image/png':signature.toString('ascii',0,4)==='RIFF'&&signature.toString('ascii',8,12)==='WEBP'?'image/webp':'';
 if(format!==file.type)return json({error:'File contents do not match its photo type.'},400);
 let clean:Buffer;try{const image=sharp(bytes,{limitInputPixels:24000000,failOn:'warning',animated:false});const m=await image.metadata();if(!m.width||!m.height||m.width>10000||m.height>10000||(m.pages??1)>1)throw Error();clean=await image.rotate().resize({width:2400,height:2400,fit:'inside',withoutEnlargement:true}).flatten({background:'#ffffff'}).jpeg({quality:88}).toBuffer();}catch{return json({error:'Photo could not be decoded, or exceeds the 24-megapixel limit.'},400);}
 const s=createAdminClient();const {count,error:ce}=await s.from('retreat_operator_assets').select('id',{count:'exact',head:true}).eq('invite_id',i.id);
 if(ce)return json({error:'Could not verify upload limit.'},503);if((count??0)>=30)return json({error:'This invitation has reached its 30-photo limit. Ask the team for help.'},429);
 const path=`operator/${i.id}/${randomUUID()}.jpg`;const{error:ue}=await s.storage.from(MEDIA_BUCKET).upload(path,clean,{contentType:'image/jpeg',cacheControl:'0',upsert:false});if(ue)return json({error:'Photo upload failed.'},503);
 const{data,error}=await s.from('retreat_operator_assets').insert({invite_id:i.id,slot_key:slot,storage_path:path,alt_text:alt,credit,permission:license,rights_confirmed:true,illustrative:form.get('illustrative')==='true'}).select('id').single();
 if(error){await s.storage.from(MEDIA_BUCKET).remove([path]);return json({error:'Could not save photo.'},503);}return json({id:data.id,message:'Photo saved privately. Submit your changes to include it for review.'},201);
 }catch{return json({error:'Could not process photo.'},400);}}
