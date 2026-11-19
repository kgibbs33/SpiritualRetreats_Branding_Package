import type { RetreatRow } from './types';
import { previewStock } from './preview-stock';

// Owner-approved snapshots for design review only. Never written to Supabase.
export function milestonePreviewEnabled() {
  return process.env.VERCEL_ENV === 'preview' &&
    process.env.VERCEL_GIT_COMMIT_REF === 'milestone-4-website-update';
}
const base: RetreatRow = {
  id: '', slug: '', title: '', type: 'wellness', categories: [], location: null,
  country: null, region: null, dates_display: '', price_display: '', price_from: null,
  price_currency: null, price_notes: 'Preview only. Submitted details, pricing and operator checks are pending. No booking is available here.',
  image_path: '', gallery_paths: [], rating: null, review_count: null,
  badge: 'Milestone preview', description: null, inclusions: null, exclusions: null,
  itinerary: null, operator_name: null, operator_website: null, min_age: null,
  max_age: null, age_notes: null, booking_url: null, status: 'draft', sort_order: 0,
  trust_tier: null, verified_at: null, credibility_note: null, commercial_status: null,
  qualification_status: 'submitted', previewOnly: true,
};
export const milestonePreviewRows: RetreatRow[] = [
  {...base,filterFacts:{days:8,categories:['wellness','nature','yoga'],features:['meals','private','couples','nature'],facets:{atmosphere:['couples-only','couples'],setting:['nature','island'],included:['meals'],rooms:['private'],language:['english']}}, stockPhoto:previewStock.madeira, image_path:previewStock.madeira.path,id:'preview-madeira',slug:'preview-madeira-couples-2027',
    title:'8 Day Couples Wellness & Nature Retreat, Madeira',type:'wellness',
    categories:['wellness','nature_connection','couples_spiritual'],country:'Portugal',location:'Seixal, Madeira',
    dates_display:'13-20 February 2027',price_display:'EUR 2,490 per couple',price_from:2490,price_currency:'EUR',
    description:'A submitted couples retreat at Barefoot Cliff in Madeira, with gentle yoga, meditation, massage, local nature time and a food workshop. The submission describes seven nights in a private double cabin for two, seven breakfasts, four lunches and five dinners. Flights, transfers and other meals are excluded.\n\nImportant: the cabins and yoga deck are still being prepared and are not complete. Facilities and practitioners need confirmation before the balance deadline. Grounds include steps and steep, uneven paths. The current operator page states a maximum of ten couples / twenty guests; the intake capacity field still needs correction before publication. Actual retreat photographs and operator checks remain pending. The operator website confirms these submitted dates, price and unfinished-facility disclosures; this is not a verified listing.',
  },
  {...base,filterFacts:{days:14,categories:['spiritual'],features:['meals'],facets:{included:['meals']}},stockPhoto:previewStock.brazil, image_path:previewStock.brazil.path,id:'preview-brazil',slug:'cleansing-vision-quest-brazil-2027',
    title:'Cleansing & Vision Quest Retreat, Bahia, Brazil',type:'spiritual',
    country:'Brazil',location:'Ponta do Corumbau, Bahia',dates_display:'2-15 or 17-30 October 2027',
    price_display:'From EUR 3,500 per participant',price_from:3500,price_currency:'EUR',
    description:'A draft two-week retreat in Bahia. The current record divides the programme into a cleansing week and a vision quest week, and lists meals, accommodation and the retreat programme as included.\n\nThe full experience description, programme suitability and safety information, genuine venue photos, operator identity, commercial terms and all qualification checks are still pending. The two submitted date ranges are shown for review only. Availability is not confirmed.',
  },
  {...base,filterFacts:{days:5,categories:['wellness'],features:['solo','meals','couples'],facets:{atmosphere:['solo','couples'],food:['vegetarian'],included:['meals'],language:['english','german']}},stockPhoto:previewStock.tulum, image_path:previewStock.tulum.path,id:'preview-tulum',slug:'preview-wildhugs-tulum-2027',
    title:'The Pleasure Liberation Retreat | WildHugs',type:'wellness',
    country:'Mexico',location:'Tulum, Quintana Roo',dates_display:'19-23 February 2027',
    price_display:'EUR 4,800 solo / EUR 9,000 for two',price_from:4800,price_currency:'EUR',
    description:'A submitted conscious-intimacy retreat for singles and couples, guided by Leslie and Marc of WildHugs. The description includes boundaries, sensual touch, desires and voluntary participation, with freedom to pause or observe. It includes personal preparation and follow-up conversations and group integration calls. Mainly English, with German support.\n\nThe submission describes four nights, vegetarian meals, drinks and the programme; travel is separate. Application and a personal introductory video call come before acceptance and payment. These are submitted details, not verified claims. Dates, adult-content and consent information, photos, operator checks and current terms need review. Free listing only; no paid promotion or subscriptions.',
  },
  {...base,filterFacts:{days:8,categories:['nature'],features:['meals'],facets:{included:['meals'],rooms:['shared'],language:['spanish']}},stockPhoto:previewStock.peru, image_path:previewStock.peru.path,id:'preview-peru',slug:'preview-lab-peru-2027',
    title:'LAB Peru 2027 · Nicolas Apelt',type:'nature',
    country:'Peru',location:'Cusco and Machu Picchu',dates_display:'18-25 September 2027',
    price_display:'USD 2,250 early / USD 2,450 regular',price_from:2250,price_currency:'USD',
    description:'A submitted Spanish-language personal-exploration journey guided by Nicolas Apelt in Cusco and Machu Picchu. The description gives eight days and seven nights, with reflection, group connection and time in the landscape. Accommodation in a shared double room, specified meals, internal transfers and admission fees are described as included. Flights, drinks and mandatory travel insurance are excluded.\n\nThe submitted deposit is USD 1,000. The stated maximum of 25 participants conflicts with the structured intake capacity of 30 and must be checked. Structured dates, current prices, approved photos, operator identity and booking terms are pending. Free listing only; no paid placements or commissions.',
  },
];
