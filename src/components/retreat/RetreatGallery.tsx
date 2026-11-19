"use client";
import { useRef,useState } from 'react';
type Photo={url:string;alt:string;credit:string;source:string;license:string;illustrative:boolean};
export function RetreatGallery({paths,title,illustrative=false,photos}:{paths:string[];title:string;illustrative?:boolean;photos?:Photo[]}){
 const dialog=useRef<HTMLDialogElement>(null);const[index,setIndex]=useState(0);
 const items=photos?.length?photos:paths.map(url=>({url,alt:illustrative?`Illustrative destination stock, not the venue: ${title}`:`${title}, photo`,illustrative,credit:'',source:'',license:''}));
 if(!items.length)return null;const current=items[index]??items[0];
 function credit(p:Photo){return <>{p.illustrative&&<strong>Illustrative image, not the retreat venue. </strong>}{p.credit}{p.source&&<> · <a href={p.source} target="_blank" rel="noreferrer">Photo source</a></>}{p.license&&<> · {p.license}</>}</>;}
 return <><div className={`lp-real-gallery count-${Math.min(items.length,4)} ${items.length===1?'single':''}`}>
 {items.slice(0,4).map((photo,i)=><button key={photo.url} type="button" onClick={()=>{setIndex(i);dialog.current?.showModal();}} aria-label={`Open ${photo.illustrative?'illustrative':'retreat'} photo ${i+1}`}><img src={photo.url} alt={photo.alt} loading={i===0?'eager':'lazy'}/>{photo.illustrative&&<span className="lp-stock-label">Illustrative image · not the venue</span>}</button>)}
 {items.length>1&&<button className="lp-gallery-open" onClick={()=>dialog.current?.showModal()}>View all {items.length} photos</button>}
 </div>{photos&&<div className="lp-photo-credit">{items.map((p,i)=><p key={p.url}>Photo {i+1}: {credit(p)}</p>)}</div>}
 <dialog ref={dialog} className="lp-gallery-dialog" aria-label="Retreat photos"><button className="lp-gallery-close" onClick={()=>dialog.current?.close()} aria-label="Close photos">×</button><img src={current.url} alt={current.alt}/><p className="lp-stock-dialog-note">{credit(current)}</p><div className="lp-gallery-controls"><button disabled={items.length===1} onClick={()=>setIndex((index-1+items.length)%items.length)}>← Previous</button><span>{index+1} / {items.length}</span><button disabled={items.length===1} onClick={()=>setIndex((index+1)%items.length)}>Next →</button></div></dialog></>;
}
