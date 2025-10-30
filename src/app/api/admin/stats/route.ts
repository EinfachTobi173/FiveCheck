import { NextRequest } from 'next/server';
import { SNAP_STORE } from '@/lib/snapstore';

export async function GET(req: NextRequest) {
  const totalJobs = (SNAP_STORE as any).store?.size ?? 0;
  const stats = { totalJobs, timestamp: new Date().toISOString() };
  return new Response(JSON.stringify({ stats }), { status: 200 });
}