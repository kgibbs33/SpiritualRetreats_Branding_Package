import { notFound } from "next/navigation";
import documents from "@/content/legal/role-terms.json";
export const dynamicParams = false;
export function generateStaticParams(){ return Object.keys(documents).map(role=>({role})); }
export async function generateMetadata({params}:{params:Promise<{role:string}>}) {
  const {role}=await params; const doc=documents[role as keyof typeof documents];
  return {title:doc?.title??"Terms",robots:{index:false,follow:false}};
}
export default async function RoleTermsPage({params}:{params:Promise<{role:string}>}) {
  const {role}=await params; const doc=documents[role as keyof typeof documents]; if(!doc) notFound();
  return <article className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
    <p className="text-xs uppercase tracking-widest text-stone-500">Light Path Retreats · Legal</p>
    <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl text-[#104c3b]">{doc.title}</h1>
    <p className="mt-4 text-stone-600">Version {doc.version} · {doc.date}</p>
    <a href={doc.pdf} className="my-6 inline-flex rounded-xl bg-[#104c3b] px-5 py-3 text-sm text-white" target="_blank" rel="noopener noreferrer">Read or download the original PDF</a>
    <p className="mb-8 text-sm leading-6 text-stone-500">The complete supplied agreement, including its schedules, appears below. The original PDF preserves the signed-off document layout and tables.</p>
    <nav aria-label="Other agreements" className="mb-10 flex flex-wrap gap-5 border-y border-stone-200 py-4 text-sm text-[#104c3b]">
      {Object.entries(documents).map(([key,value])=><a key={key} href={`/terms/${key}`} className="underline">{value.title}</a>)}<a href="/privacy" className="underline">Privacy Policy</a>
    </nav>
    <div className="space-y-10">{doc.pages.map((page,i)=><section key={i} className="border-b border-stone-200 pb-8">
      <p className="mb-5 text-xs uppercase tracking-wider text-stone-400">Page {i+1} of {doc.pages.length}</p>
      <div className="space-y-5 text-[15px] leading-7 text-stone-700">{page.split(/\n\s*\n/).map((paragraph,j)=>{
        if (paragraph.split("\n").some(line=>(line.match(/ {3,}/g)||[]).length>=2)) return <pre key={j} className="max-w-full overflow-x-auto rounded-xl bg-stone-50 p-4 text-xs leading-6">{paragraph}</pre>;
        const text=paragraph.replace(/(?<!\n)\n(?!\n)/g," ").replace(/ {2,}/g," ");
        return /^\d+\. [A-Z]|^Schedule [A-C]:/.test(text)&&text.length<160 ? <h2 key={j} className="pt-2 text-xl font-semibold text-[#104c3b]">{text}</h2>:<p key={j} className="[overflow-wrap:anywhere]">{text}</p>;
      })}</div>
    </section>)}</div>
  </article>;
}
