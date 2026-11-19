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
type SlotValue = {url:string;name:string;alt:string;credit:string;rights:boolean;illustrative:boolean};
type Listing = {id:string;title:string;image:string};

export function RetreatPhotoSlots({listings}:{listings:Listing[]}) {
 const [listingId,setListingId]=useState(listings[0]?.id ?? '');
 const [drafts,setDrafts]=useState<Record<string,Record<string,SlotValue>>>({});
 const [error,setError]=useState('');const [active,setActive]=useState('hero');
 const urls=useRef<string[]>([]);
 useEffect(()=>()=>{urls.current.forEach(url=>URL.revokeObjectURL(url));},[]);
 const listing=listings.find(l=>l.id===listingId) ?? listings[0];
 const slots=drafts[listingId] ?? {};
 function patch(key:string,value:Partial<SlotValue>){setDrafts(d=>({...d,[listingId]:{...d[listingId],[key]:{...d[listingId]?.[key],...value}}}));}
 async function choose(key:string,file?:File){
  setError('');if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setError('Choose a JPEG, PNG or WebP image. SVG, GIF and documents are not accepted.');return;}
  if(file.size>5*1024*1024){setError('That image is larger than 5 MB. Choose a smaller photo.');return;}
  try{
   const bitmap=await createImageBitmap(file);const scale=Math.min(1,2000/Math.max(bitmap.width,bitmap.height));
   const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
   const context=canvas.getContext('2d');if(!context)throw Error();context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
   const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/jpeg',.88));if(!blob)throw Error();
   const url=URL.createObjectURL(blob);urls.current.push(url);patch(key,{url,name:file.name,alt:'',credit:'',rights:false,illustrative:false});setActive(key);
  }catch{setError('This file could not be decoded as a photo. Try another JPEG, PNG or WebP.');}
 }
 const hero=slots.hero?.url || listing?.image;
 return <section className="photo-workbench">
  <div className="photo-heading"><div><p className="photo-kicker">RETREAT MEDIA</p><h1>Every photo has a place.</h1><p>Choose the retreat, then place each photo in its named slot. The layout preview updates in the right area.</p></div><span className="photo-prototype-tag">Interface preview</span></div>
  <div className="photo-warning" role="note"><strong>Not connected to storage yet.</strong> Selected files stay in this page memory. They are not uploaded or saved, and do not change the website. Refreshing clears them. Persistent uploads need the approved database/storage setup.</div>
  <label className="photo-select-label">Retreat shell<select value={listingId} onChange={e=>{setListingId(e.target.value);setError('');setActive('hero');}}>{listings.map(l=><option key={l.id} value={l.id}>{l.title}</option>)}</select></label>
  {error && <p className="photo-error" role="alert">{error}</p>}
  <div className="photo-workbench-columns"><div className="photo-slot-list">
   {PHOTO_SLOTS.map(slot=>{const value=slots[slot.key];return <article className={`photo-slot ${active===slot.key?'selected':''}`} key={slot.key}>
    <div className="photo-slot-top"><button type="button" onClick={()=>setActive(slot.key)}>{slot.name}</button><span>{value?'Local draft':'Empty'}</span></div>
    <p>{slot.help}</p><div className="photo-slot-body">{value?<img src={value.url} alt={value.alt||`Local draft for ${slot.name}`}/>:<div className="photo-slot-empty">{slot.key==='hero'?'Main image':'Gallery image'}<small>Drop or choose a photo</small></div>}
    <label className="photo-upload" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();void choose(slot.key,e.dataTransfer.files[0]);}}>{value?'Replace photo':'Choose photo'}<input aria-label={`Choose ${slot.name} photo`} type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{void choose(slot.key,e.target.files?.[0]);e.target.value='';}}/></label></div>
    {value&&<><label>Alt text<input value={value.alt} onChange={e=>patch(slot.key,{alt:e.target.value})} placeholder="Describe what this photo shows"/></label><label>Photographer / source / licence<input value={value.credit} onChange={e=>patch(slot.key,{credit:e.target.value})} placeholder="Photo owner or source and permission"/></label><label className="photo-checkbox"><input type="checkbox" checked={value.rights} onChange={e=>patch(slot.key,{rights:e.target.checked})}/>I have permission to use this image.</label><label className="photo-checkbox"><input type="checkbox" checked={value.illustrative} onChange={e=>patch(slot.key,{illustrative:e.target.checked})}/>Stock or concept image, show an illustrative label.</label><button className="photo-remove" type="button" onClick={()=>setDrafts(d=>{const next={...d[listingId]};delete next[slot.key];return {...d,[listingId]:next};})}>Remove local draft</button></>}
   </article>;})}
   <p className="photo-limits">JPEG, PNG, WebP · Up to 5 MB each · Local previews are re-encoded to strip metadata. No file leaves your browser in this prototype.</p>
   <button disabled className="photo-save">Save photo slots, storage not connected</button>
  </div><aside className="photo-layout-preview"><p className="photo-kicker">AUTOMATIC PLACEMENT PREVIEW</p><h2>{listing?.title}</h2><div className={`photo-placement ${active==='hero'?'focused':''}`}>{hero?<img src={hero} alt={slots.hero?.alt||'Illustrative stock placeholder, not the venue'}/>:<span>Hero image</span>}<b>Hero + search card</b>{(!slots.hero||slots.hero.illustrative)&&<em>Illustrative stock · not the venue</em>}</div><div className="photo-preview-grid">{PHOTO_SLOTS.slice(1).map(slot=><div key={slot.key} className={`photo-placement ${active===slot.key?'focused':''}`}>{slots[slot.key]?<img src={slots[slot.key].url} alt={slots[slot.key].alt||'Local gallery draft'}/>:<span>Empty slot</span>}<b>{slot.name}</b>{slots[slot.key]?.illustrative&&<em>Illustrative image</em>}</div>)}</div><p>Hero feeds both the search card and the top of the detail page. Gallery slots keep a fixed order. In the connected version, operator uploads will wait for admin review before replacing a live image.</p></aside></div>
 </section>
}
