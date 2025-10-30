import { NextRequest } from 'next/server';
import { TTLCache, RateLimiter } from '@/lib/cache';
import { aggregate } from '@/lib/heuristics';
import { SNAP_STORE } from '@/lib/snapstore';
import type { Player, Snapshot, ScanResponse } from '@/lib/types';

const PLAYER_CACHE = new TTLCache<any>(20_000);
const RATE = new RateLimiter(60_000, 30);

function ipKey(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local';
  return `ip:${ip}`;
}

function parseQuery(q: string): { serverRef: string; type: 'serverId' | 'hash' | 'raw' } {
  const trimmed = q.trim();
  const cfxMatch = trimmed.match(/cfx\.re\/join\/([A-Za-z0-9]+)/i);
  if (cfxMatch) return { serverRef: cfxMatch[1], type: 'hash' };
  const detailMatch = trimmed.match(/servers\.fivem\.net\/servers\/detail\/([A-Za-z0-9]+)/i);
  if (detailMatch) return { serverRef: detailMatch[1], type: 'hash' };
  // Likely serverId if long
  if (/^[a-f0-9]{32}$/i.test(trimmed)) return { serverRef: trimmed, type: 'serverId' };
  return { serverRef: trimmed, type: 'raw' };
}

// Remove FiveM-style color codes like ^1, ^7, ^A, etc.
function stripColorCodes(s: string): string {
  try {
    return String(s)
      .replace(/\^[0-9A-Za-z]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  } catch {
    return s;
  }
}

async function fetchPlayersViaServerId(serverId: string): Promise<{ server: string; serverName?: string; players: Player[] }> {
  const url = `https://servers-frontend.fivem.net/api/servers/single/${serverId}`; // [0]
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
  const json = await res.json();
  const serverNameRaw = String(
    (json?.Data?.hostname ?? json?.Data?.server ?? json?.Data?.vars?.sv_hostname ?? '') || ''
  );
  const serverName = serverNameRaw ? stripColorCodes(serverNameRaw) : undefined;
  const players: Player[] = (json?.Data?.players || []).map((p: any) => ({
    id: Number(p.id ?? 0),
    name: String(p.name ?? ''),
    ping: Number(p.ping ?? 0),
    endpoint: p.endpoint,
    identifiers: p.identifiers
  }));
  return { server: serverId, serverName, players };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('query') || '';
  const job = searchParams.get('job') || `job-${Date.now()}`;
  const rate = RATE.hit(ipKey(req));
  if (!rate.allowed) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded', resetInMs: rate.resetInMs }), { status: 429 });
  }
  if (!q) return new Response(JSON.stringify({ error: 'query required' }), { status: 400 });

  const parsed = parseQuery(q);
  let serverRef = parsed.serverRef;

  // Try cache
  const cacheKey = `players:${serverRef}`;
  const cached = PLAYER_CACHE.get(cacheKey);
  let players: Player[] = [];
  let serverName: string | undefined = undefined;
  try {
    if (cached) {
      players = cached.players;
      serverName = cached.serverName;
    } else {
      if (parsed.type === 'serverId') {
        const r = await fetchPlayersViaServerId(serverRef);
        players = r.players;
        serverName = r.serverName;
      } else {
        // Best-effort: try as serverId; otherwise respond with hint
        const r = await fetchPlayersViaServerId(serverRef);
        players = r.players;
        serverName = r.serverName;
      }
      PLAYER_CACHE.set(cacheKey, { players, serverName });
    }
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Could not resolve server. Provide Server ID from FiveM Browser.' }), { status: 400 });
  }

  const snap: Snapshot = { ts: new Date().toISOString(), players };
  SNAP_STORE.push(job, snap);
  const snaps = SNAP_STORE.get(job);
  const agg = aggregate(players, snaps);

  const resp: ScanResponse = {
    server: serverRef,
    server_name: serverName,
    player_count: players.length,
    estimated_bots: agg.estimatedBots,
    confidence: agg.confidence,
    reasons: agg.reasons,
    snapshots: snaps
  };
  return new Response(JSON.stringify(resp), { status: 200, headers: { 'Content-Type': 'application/json' } });
}