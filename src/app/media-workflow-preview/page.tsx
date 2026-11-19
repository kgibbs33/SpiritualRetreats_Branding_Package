import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { milestonePreviewEnabled,milestonePreviewRows } from '@/lib/retreats/milestone-preview';
import { RetreatPhotoSlots } from '@/components/admin/RetreatPhotoSlots';
export const metadata:Metadata={title:'Photo slots workflow preview',robots:'noindex, nofollow'};
export default function PhotoWorkflowPreview(){
 if(!milestonePreviewEnabled())notFound();
 return <main style={{background:'#fafbf6',minHeight:'100vh'}}><div style={{padding:'20px 24px',borderBottom:'1px solid #e4e8de'}}><Link href="/retreat-listings" style={{color:'#275b43',fontSize:13}}>← Back to milestone listings</Link></div><RetreatPhotoSlots listings={milestonePreviewRows.map(r=>({id:r.id,title:r.title,image:r.image_path}))}/></main>;
}
