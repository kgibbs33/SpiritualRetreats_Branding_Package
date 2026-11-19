import Link from 'next/link';
import {searchParamsFor} from '@/lib/retreats/preview-dates';
import {LENGTH_OPTIONS,CATEGORY_OPTIONS,FILTER_GROUPS} from '@/lib/retreats/preview-filters';
import type {RetreatListParams} from '@/lib/retreats/retreat-filters';
export function ActiveFilters({value}:{value:RetreatListParams}){
 const labels:Record<string,string>={q:'Search',type:'Style',destination:'Destination',currency:'Currency',min_price:'Min price',max_price:'Max price',intent:'Intention',budget:'Budget',month:'Month',duration:'Duration'};
 const chips:{label:string,keys:string[],item?:string}[]=[];
 for(const [key,v]of Object.entries(value)){
 if(['sort','page','date_mode','date_start','date_end','months'].includes(key))continue;
 for(const item of Array.isArray(v)?v:[v]){const options=key==='lengths'?LENGTH_OPTIONS:key==='categories'?CATEGORY_OPTIONS:FILTER_GROUPS.find(g=>g.key===key)?.options;chips.push({label:options?.find(o=>o.value===String(item))?.label??`${labels[key]??key}: ${item}`,keys:[key],item:Array.isArray(v)?String(item):undefined});}}
 if(value.date_mode==='specific'&&(value.date_start||value.date_end))chips.push({label:`Dates: ${value.date_start??'Any start'} to ${value.date_end??'Any end'}`,keys:['date_mode','date_start','date_end','months']});
 if(value.date_mode==='flexible')for(const month of value.months??[])chips.push({label:new Date(month+'-01T12:00:00Z').toLocaleDateString('en-GB',{month:'short',year:'numeric',timeZone:'UTC'}),keys:['months'],item:month});
 return chips.length?<nav className="lp-active-filters" aria-label="Active search filters">{chips.map((c,i)=>{const params=searchParamsFor(value);params.delete('page');for(const k of c.keys){if(c.item)params.delete(k,c.item);else params.delete(k);}return <Link key={i} href={'/retreat-listings?'+params.toString()} scroll={false} aria-label={`Remove ${c.label}`}>{c.label}<span aria-hidden>×</span></Link>;})}<Link href="/retreat-listings">Clear all</Link></nav>:null;
}
