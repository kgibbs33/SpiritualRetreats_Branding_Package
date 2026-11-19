import { timingSafeEqual } from 'node:crypto';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  const provided = request.headers.get('authorization') ?? '';
  const target = expected ? `Bearer ${expected}` : '';
  if (!target || provided.length !== target.length || !timingSafeEqual(Buffer.from(provided), Buffer.from(target))) {
    return new Response('Unauthorized', {status:401});
  }
  if (process.env.VERCEL_ENV !== 'preview' || process.env.VERCEL_GIT_COMMIT_REF !== 'milestone-4-website-update') {
    return new Response('Inactive outside milestone preview', {status:404});
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (url !== 'https://ruzxlccdoywshavwtulc.supabase.co' || !key) {
    console.error('supabase-keepalive: configuration mismatch');
    return Response.json({ok:false}, {status:503});
  }
  try {
    // Small public-role reads only. No writes, RPCs, secret key or stored row content.
    for (let i=0;i<3;i++) {
      const response = await fetch(`${url}/rest/v1/retreats?select=id&limit=1`, {
        headers:{apikey:key}, cache:'no-store', signal:AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error('Database read failed');
      await response.arrayBuffer();
    }
    console.info('supabase-keepalive: success; 3 public read-only database requests');
    return Response.json({ok:true,reads:3,checkedAt:new Date().toISOString()}, {headers:{'Cache-Control':'no-store'}});
  } catch {
    console.error('supabase-keepalive: database read failed');
    return Response.json({ok:false}, {status:503});
  }
}
