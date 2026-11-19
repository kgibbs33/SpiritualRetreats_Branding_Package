"use client";
import { useEffect, useRef, useState } from 'react';
import './RetreatPhotoSlots.css';

export const PHOTO_SLOTS = [
  {key:'hero',name:'Hero + search card',help:'Main detail image and the card in search results.'},
  {key:'gallery-1',name:'Gallery 1 · Place',help:'A wide view of the actual venue or grounds.'},
  {key:'gallery-2',name:'Gallery 2 · Stay',help:'Actual accommodation or a clearly labelled concept.'},
  {key:'gallery-3',name:'Gallery 3 · Experience',help:'Programme setting, with consent for identifiable people.'},
  {key:'gallery-4',name:'Gallery 4 · Surroundings',help:'The local landscape or another useful detail.'},
] as const;
type SlotValue = {url:string;name:string;alt:string;credit:string;rights:boolean;illustrative:boolean;file?:Blob;id?:string;state?:string;source?:string;license?:string};
type Listing = {id:string;title:string;image:string};

export function RetreatPhotoSlots({listings,persistent=false}:{listings:Listing[];persistent?:boolean}) {
 const [listingId,setListingId]=useState(listings[0]?.id ?? '');
 const [drafts,setDrafts]=useState<Record<string,Record<string,SlotValue>>>({});
 const [saved,setSaved]=useState<Record<string,SlotValue[]>>({});const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 const [error,setError]=useState('');const [active,setActive]=useState('hero');
 const urls=useRef<string[]>([]);
 useEffect(()=>()=>{urls.current.forEach(url=>URL.revokeObjectURL(url));},[]);
 async function reload(id:string){const r=await fetch(`/api/admin/retreat-media?listing=${encodeURIComponent(id)}`,{cache:'no-store'});const j=await r.json();if(!r.ok)throw Error(j.error||'Could not load photos.');setSaved(v=>({...v,[id]:j.data.map((x:Record<string,unknown>)=>({url:`/api/retreat-media/${x.id}`,name:'Saved photo',id:x.id,state:x.review_state,slot:x.slot_key,alt:x.alt_text,credit:x.credit,source:x.source_url,license:x.license_note,rights:x.rights_confirmed,illustrative:x.illustrative}))}));}
 useEffect(()=>{if(persistent&&listingId)void reload(listingId).catch(e=>setError(e.message));},[listingId,persistent]);
 async function upload(key:string){const v=drafts[listingId]?.[key];if(!v?.file)return;setBusy(true);setError('');setMessage('');try{const f=new FormData();f.set('listing',listingId);f.set('slot',key);f.set('file',v.file,'photo.jpg');f.set('alt',v.alt);f.set('credit',v.credit);f.set('source',v.source||'');f.set('license',v.license||'');f.set('rights',String(v.rights));f.set('illustrative',String(v.illustrative));const r=await fetch('/api/admin/retreat-media',{method:'POST',headers:{'X-Retreat-Media':'1'},body:f});const j=await r.json();if(!r.ok)throw Error(j.error);setDrafts(d=>{const next={...d[listingId]};delete next[key];return {...d,[listingId]:next};});await reload(listingId);setMessage(j.message);}catch(e){setError(e instanceof Error?e.message:'Upload failed.');}finally{setBusy(false);}}
 async function review(id:string,state:string){setBusy(true);setError('');try{const r=await fetch('/api/admin/retreat-media',{method:'PATCH',headers:{'Content-Type':'application/json','X-Retreat-Media':'1'},body:JSON.stringify({id,state})});const j=await r.json();if(!r.ok)throw Error(j.error);await reload(listingId);setMessage(j.message);}catch(e){setError(e instanceof Error?e.message:'Review failed.');}finally{setBusy(false);}}
 const listing=listings.find(l=>l.id===listingId) ?? listings[0];
 const stored:Record<string,SlotValue>={};for(const v of saved[listingId]??[]){const key=(v as SlotValue&{slot:string}).slot;if(!stored[key]&&v.state!=='rejected')stored[key]=v;}
 const slots={...stored,...drafts[listingId]};
 function patch(key:string,value:Partial<SlotValue>){setDrafts(d=>({...d,[listingId]:{...d[listingId],[key]:{...slots[key],...d[listingId]?.[key],...value}}}));}
 async function choose(key:string,file?:File){
  setError('');if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setError('Choose a JPEG, PNG or WebP image. SVG, GIF and documents are not accepted.');return;}
  if(file.size>5*1024*1024){setError('That image is larger than 5 MB. Choose a smaller photo.');return;}
  try{
   const bitmap=await createImageBitmap(file);const scale=Math.min(1,2000/Math.max(bitmap.width,bitmap.height));
   const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
   const context=canvas.getContext('2d');if(!context)throw Error();context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
   const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/jpeg',.88));if(!blob)throw Error();
   const url=URL.createObjectURL(blob);urls.current.push(url);patch(key,{url,file:blob,id:undefined,state:undefined,name:file.name,alt:'',credit:'',rights:false,illustrative:false,source:'',license:''});setActive(key);
  }catch{setError('This file could not be decoded as a photo. Try another JPEG, PNG or WebP.');}
 }
 const hero=slots.hero?.url || listing?.image;
 return <section className="photo-workbench">
  <div className="photo-heading"><div><p className="photo-kicker">RETREAT MEDIA</p><h1>Every photo has a place.</h1><p>Choose the retreat, then place each photo in its named slot. The layout preview updates in the right area.</p></div><span className="photo-prototype-tag">{persistent?"Admin upload + review":"Interface preview"}</span></div>
  {persistent?<div className="photo-warning" role="note"><strong>Private uploads, reviewed before display.</strong> Upload each photo to its named slot, then approve it. New uploads stay pending and do not replace the approved photo until reviewed. Changes apply only on this milestone link. Existing retreat details, status and qualification are unchanged.</div>:<div className="photo-warning" role="note"><strong>Not connected to storage yet.</strong> Selected files stay in this page memory. They are not uploaded or saved, and do not change the website. Refreshing clears them. Persistent uploads are available only in the signed-in admin section.</div>}
  <label className="photo-select-label">Retreat shell<select disabled={busy} value={listingId} onChange={e=>{setListingId(e.target.value);setError('');setActive('hero');}}>{listings.map(l=><option key={l.id} value={l.id}>{l.title}</option>)}</select></label>
  {message&&<p className="photo-success" role="status">{message}</p>}
  {error && <p className="photo-error" role="alert">{error}</p>}
  <div className="photo-workbench-columns"><div className="photo-slot-list">
   {PHOTO_SLOTS.map(slot=>{const value=slots[slot.key];return <article className={`photo-slot ${active===slot.key?'selected':''}`} key={slot.key}>
    <div className="photo-slot-top"><button type="button" onClick={()=>setActive(slot.key)}>{slot.name}</button><span>{value?(value.file?'Unsaved draft':value.state||'Local draft'):'Empty'}</span></div>
    <p>{slot.help}</p><div className="photo-slot-body">{value?<img src={value.url} alt={value.alt||`Local draft for ${slot.name}`}/>:<div className="photo-slot-empty">{slot.key==='hero'?'Main image':'Gallery image'}<small>Drop or choose a photo</small></div>}
    <label className="photo-upload" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();void choose(slot.key,e.dataTransfer.files[0]);}}>{value?'Replace photo':'Choose photo'}<input aria-label={`Choose ${slot.name} photo`} type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{void choose(slot.key,e.target.files?.[0]);e.target.value='';}}/></label></div>
    {value&&<><label>Alt text<input disabled={persistent&&!value.file} value={value.alt} onChange={e=>patch(slot.key,{alt:e.target.value})} placeholder="Describe what this photo shows"/></label><label>Photographer / source / licence<input disabled={persistent&&!value.file} value={value.credit} onChange={e=>patch(slot.key,{credit:e.target.value})} placeholder="Photo owner or source and permission"/></label><label>Source URL<input disabled={persistent&&!value.file} type="url" value={value.source||''} onChange={e=>patch(slot.key,{source:e.target.value})} placeholder="https://... (optional)"/></label><label>Licence / permission<input disabled={persistent&&!value.file} value={value.license||''} onChange={e=>patch(slot.key,{license:e.target.value})} placeholder="Licence or written permission reference"/></label><label className="photo-checkbox"><input disabled={persistent&&!value.file} type="checkbox" checked={value.rights} onChange={e=>patch(slot.key,{rights:e.target.checked})}/>I have permission to use this image.</label><label className="photo-checkbox"><input disabled={persistent&&!value.file} type="checkbox" checked={value.illustrative} onChange={e=>patch(slot.key,{illustrative:e.target.checked})}/>Stock or concept image, show an illustrative label.</label>{value.file&&persistent&&<button className="photo-save" type="button" disabled={busy||!value.alt.trim()||!value.credit.trim()||!value.license?.trim()||!value.rights} onClick={()=>void upload(slot.key)}>{busy?"Working...":`Upload ${slot.name} for review`}</button>}{(drafts[listingId]?.[slot.key]||!persistent)&&<button className="photo-remove" type="button" onClick={()=>setDrafts(d=>{const next={...d[listingId]};delete next[slot.key];return {...d,[listingId]:next};})}>Discard unsaved changes</button>}{persistent&&<p>Saved metadata is read-only. Choose a replacement photo to create a new reviewed revision.</p>}</>}
    {persistent&&(saved[listingId]??[]).filter(v=>(v as SlotValue&{slot:string}).slot===slot.key).map(v=><div className="photo-revision" key={v.id}><span>{v.state} · {v.alt}</span>{v.state==='pending'&&<><button type="button" disabled={busy} onClick={()=>void review(v.id!,'approved')}>Approve for milestone</button><button type="button" disabled={busy} onClick={()=>void review(v.id!,'rejected')}>Reject</button></>}</div>)}
   </article>;})}
   <p className="photo-limits">JPEG, PNG, WebP · Up to 5 MB each · Local previews are re-encoded to strip metadata. {persistent?"Server checks file signatures and dimensions, re-encodes images and strips EXIF/GPS. Each upload needs review.":"No file leaves your browser in this prototype."}</p>
   {!persistent&&<button disabled className="photo-save">Demo only, sign in to save photo slots</button>}
  </div><aside className="photo-layout-preview"><p className="photo-kicker">AUTOMATIC PLACEMENT PREVIEW</p><h2>{listing?.title}</h2><div className={`photo-placement ${active==='hero'?'focused':''}`}>{hero?<img src={hero} alt={slots.hero?.alt||'Illustrative stock placeholder, not the venue'}/>:<span>Hero image</span>}<b>Hero + search card</b>{(!slots.hero||slots.hero.illustrative)&&<em>Illustrative stock · not the venue</em>}</div><div className="photo-preview-grid">{PHOTO_SLOTS.slice(1).map(slot=><div key={slot.key} className={`photo-placement ${active===slot.key?'focused':''}`}>{slots[slot.key]?<img src={slots[slot.key].url} alt={slots[slot.key].alt||'Local gallery draft'}/>:<span>Empty slot</span>}<b>{slot.name}</b>{slots[slot.key]?.illustrative&&<em>Illustrative image</em>}</div>)}</div><p>Hero feeds both the search card and the top of the detail page. Gallery slots keep a fixed order. New uploads need a separate admin approval. Operators do not have access to this section.</p></aside></div>
 </section>
}
