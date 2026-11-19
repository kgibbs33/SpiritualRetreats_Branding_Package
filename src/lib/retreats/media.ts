import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { milestonePreviewEnabled } from './milestone-preview';
import type { RetreatRow } from './types';
export const MEDIA_BUCKET='retreat-media';
export const SLOT_KEYS=['hero','gallery-1','gallery-2','gallery-3','gallery-4'] as const;
export type MediaSlot={id:string;retreat_id:string|null;preview_key:string|null;slot_key:string;storage_path:string;alt_text:string;credit:string;source_url:string;license_note:string;rights_confirmed:boolean;illustrative:boolean;review_state:'pending'|'approved'|'rejected';created_at:string;approved_at:string|null};
export function mediaEnabled(){return milestonePreviewEnabled()&&process.env.NEXT_PUBLIC_SUPABASE_URL==='https://ruzxlccdoywshavwtulc.supabase.co';}
export function targetQuery(id:string){return id.startsWith('preview-')?{key:'preview_key',value:id}:{key:'retreat_id',value:id};}
export async function applyApprovedMedia(rows:RetreatRow[]):Promise<RetreatRow[]>{
 if(!mediaEnabled()||!rows.length)return rows;
 const ids=rows.map(r=>r.id); const s=createAdminClient();
 const [previews,real]=await Promise.all([s.from('retreat_media_slots').select('*').eq('review_state','approved').in('preview_key',ids.filter(id=>id.startsWith('preview-'))).order('approved_at',{ascending:false}),ids.some(id=>!id.startsWith('preview-'))?s.from('retreat_media_slots').select('*').eq('review_state','approved').in('retreat_id',ids.filter(id=>!id.startsWith('preview-'))).order('approved_at',{ascending:false}):Promise.resolve({data:[],error:null})]);const data=[...(previews.data??[]),...(real.data??[])];const error=previews.error||real.error;
 if(error){console.error('Media read failed');return rows;}
 return rows.map(row=>{const slots=(data as MediaSlot[]??[]).filter(x=>(x.preview_key===row.id||x.retreat_id===row.id));const chosen=SLOT_KEYS.map(key=>slots.find(s=>s.slot_key===key)).filter(Boolean) as MediaSlot[];
 if(!chosen.length)return row;
 const photo=(s:MediaSlot)=>({url:`/api/retreat-media/${s.id}`,alt:s.alt_text,credit:s.credit,source:s.source_url,license:s.license_note,illustrative:s.illustrative});
 const hero=chosen.find(x=>x.slot_key==='hero');const gallery=chosen.filter(x=>x.slot_key!=='hero');
 const fallback=row.stockPhoto?{url:row.image_path,alt:row.stockPhoto.alt,credit:row.stockPhoto.photographer+' / Unsplash',source:row.stockPhoto.source,license:'Unsplash License',illustrative:true}:row.image_path?{url:row.image_path,alt:row.title,credit:'',source:'',license:'',illustrative:false}:null;
 const photos=[...(hero?[photo(hero)]:(fallback?[fallback]:[])),...gallery.map(photo)];
 return {...row,image_path:hero?photo(hero).url:row.image_path,gallery_paths:photos.map(x=>x.url),mediaPhotos:photos,stockPhoto:hero?undefined:row.stockPhoto,imageIllustrative:hero?hero.illustrative:!!row.stockPhoto,imageAlt:hero?.alt_text??row.stockPhoto?.alt};});
}
