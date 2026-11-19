import type {RetreatListParams} from './retreat-filters';
// Submitted dates for milestone review, not inventory or confirmed availability.
export const previewDateRanges:Record<string,[string,string][]>= {
 'preview-madeira-couples-2027':[['2027-02-13','2027-02-20']],
 'cleansing-vision-quest-brazil-2027':[['2027-10-02','2027-10-15'],['2027-10-17','2027-10-30']],
 'preview-wildhugs-tulum-2027':[['2027-02-19','2027-02-23']],
 'preview-lab-peru-2027':[['2027-09-18','2027-09-25']],
};
export function matchesPreviewDates(slug:string,p:RetreatListParams){
 const ranges=previewDateRanges[slug]??[];
 if(p.date_mode==='specific'&&(p.date_start||p.date_end))return ranges.some(([start,end])=>(!p.date_start||start>=p.date_start)&&(!p.date_end||end<=p.date_end));
 if(p.date_mode==='flexible'&&p.months?.length)return ranges.some(([start,end])=>p.months!.some(month=>start.slice(0,7)<=month&&end.slice(0,7)>=month));
 return true;
}
export function searchParamsFor(p:RetreatListParams){const params=new URLSearchParams();for(const[k,v]of Object.entries(p)){if(v===undefined)continue;for(const item of Array.isArray(v)?v:[v])params.append(k,String(item));}return params;}
