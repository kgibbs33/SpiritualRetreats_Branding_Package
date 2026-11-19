import type {RetreatRow} from './types';
import type {RetreatListParams} from './retreat-filters';
export const LENGTH_OPTIONS=[{value:'2-3',label:'2 to 3 days',min:2,max:3},{value:'4-5',label:'4 to 5 days',min:4,max:5},{value:'6-7',label:'6 to 7 days',min:6,max:7},{value:'8-14',label:'8 to 14 days',min:8,max:14},{value:'15+',label:'15 days or longer',min:15,max:999}];
export const CATEGORY_OPTIONS=[{value:'wellness',label:'Wellness & rest'},{value:'spiritual',label:'Spiritual exploration'},{value:'nature',label:'Time in nature'},{value:'yoga',label:'Yoga sessions'}];
export const FEATURE_OPTIONS=[{value:'featured',label:'Team highlights'},{value:'solo',label:'Solo guests welcome'},{value:'meals',label:'Some meals included'},{value:'beach',label:'Beach nearby'},{value:'women',label:'Women-only groups'},{value:'private',label:'Private accommodation planned'},{value:'couples',label:'Couples welcome'},{value:'vegetarian',label:'Vegetarian meals'},{value:'spanish',label:'Spanish-language programme'},{value:'transfers',label:'Internal transfers included'}];
export function matchesPreviewFilters(r:RetreatRow,p:RetreatListParams){
 const f=r.filterFacts;
 const range=p.currency&&(p.min_price!==undefined||p.max_price!==undefined);
 return (!p.currency||r.price_currency===p.currency)&&(!range||(r.price_from!==null&&r.price_from>=(p.min_price??0)&&r.price_from<=(p.max_price??Infinity)))&&
 (!p.lengths?.length||p.lengths.some(key=>{const o=LENGTH_OPTIONS.find(x=>x.value===key);return !!o&&!!f&&f.days>=o.min&&f.days<=o.max;}))&&
 (!p.categories?.length||p.categories.some(key=>f?.categories.includes(key)))&&(!p.features?.length||p.features.every(key=>f?.features.includes(key)));
}
export function previewFacets(rows:RetreatRow[]){return {lengths:Object.fromEntries(LENGTH_OPTIONS.map(o=>[o.value,rows.filter(r=>r.filterFacts&&r.filterFacts.days>=o.min&&r.filterFacts.days<=o.max).length])),categories:Object.fromEntries(CATEGORY_OPTIONS.map(o=>[o.value,rows.filter(r=>r.filterFacts?.categories.includes(o.value)).length])),features:Object.fromEntries(FEATURE_OPTIONS.map(o=>[o.value,rows.filter(r=>r.filterFacts?.features.includes(o.value)).length])),prices:Object.fromEntries(['EUR','USD'].map(currency=>[currency,Math.ceil(Math.max(...rows.filter(r=>r.price_currency===currency).map(r=>r.price_from??0))/500)*500]))};}
