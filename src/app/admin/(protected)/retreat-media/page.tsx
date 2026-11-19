import { notFound } from 'next/navigation';
import { milestonePreviewEnabled,milestonePreviewRows } from '@/lib/retreats/milestone-preview';
import { RetreatPhotoSlots } from '@/components/admin/RetreatPhotoSlots';
import { AdminShell } from '@/components/admin/AdminShell';
export default function RetreatMediaPage(){
 if(!milestonePreviewEnabled())notFound();
 return <AdminShell title="Retreat photo slots"><RetreatPhotoSlots listings={milestonePreviewRows.map(r=>({id:r.id,title:r.title,image:r.image_path}))}/></AdminShell>;
}
