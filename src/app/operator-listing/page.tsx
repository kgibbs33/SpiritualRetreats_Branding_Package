import {notFound} from 'next/navigation';import {milestonePreviewEnabled} from '@/lib/retreats/milestone-preview';import {OperatorEditor} from '@/components/retreat/OperatorEditor';import '@/app/operator-listing.css';
export const dynamic='force-dynamic';export const metadata={title:'Private retreat listing workspace',robots:'noindex, nofollow',referrer:'no-referrer'};
export default function Page(){if(!milestonePreviewEnabled())notFound();return <OperatorEditor/>;}
