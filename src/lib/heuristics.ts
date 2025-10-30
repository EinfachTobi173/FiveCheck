import { HeuristicResult, Player, Snapshot } from './types';

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function hSequenceMatch(snaps: Snapshot[]): HeuristicResult {
  if (snaps.length < 2) return { rule: 'sequence_match', value: 0, detail_key: 'heuristics.snapshots.too_few' };
  let score = 0;
  for (let i = 1; i < snaps.length; i++) {
    const a = snaps[i - 1].players.map(p => p.id).join(',');
    const b = snaps[i].players.map(p => p.id).join(',');
    if (a === b) score += 1;
  }
  const value = score / (snaps.length - 1);
  return { rule: 'sequence_match', value, detail_key: 'heuristics.sequence_match.stable' };
}

export function hPingCluster(players: Player[]): HeuristicResult {
  if (players.length < 3) return { rule: 'ping_cluster', value: 0, detail_key: 'heuristics.players.too_few' };
  const pings = players.map(p => p.ping).filter(p => Number.isFinite(p));
  const mean = pings.reduce((a, b) => a + b, 0) / pings.length;
  const variance = pings.reduce((a, b) => a + (b - mean) ** 2, 0) / pings.length;
  const std = Math.sqrt(variance);
  // Low variance + low mean often indicates automation/bots on same host
  const normalized = clamp01(1 - std / 50) * clamp01(1 - mean / 150);
  return { rule: 'ping_cluster', value: normalized, detail_key: 'heuristics.ping_cluster.stats', detail_args: { std: std.toFixed(1), mean: mean.toFixed(1) } };
}

export function hNamePattern(players: Player[]): HeuristicResult {
  const lower = players.map(p => p.name.toLowerCase());
  const generic = lower.filter(n => /player\s*\d+|user\s*\d+|test|bot/.test(n)).length;
  const repeated = players.length - new Set(lower).size;
  const value = clamp01((generic / players.length) * 0.6 + (repeated / players.length) * 0.4);
  return { rule: 'name_pattern', value, detail_key: 'heuristics.name_pattern.stats', detail_args: { generic, repeated } };
}

export function hSessionSpike(snaps: Snapshot[]): HeuristicResult {
  if (snaps.length < 2) return { rule: 'session_spike', value: 0, detail_key: 'heuristics.snapshots.too_few' };
  const counts = snaps.map(s => s.players.length);
  let spike = 0;
  for (let i = 1; i < counts.length; i++) {
    const diff = Math.abs(counts[i] - counts[i - 1]);
    spike = Math.max(spike, diff);
  }
  const value = clamp01(spike / Math.max(10, counts[0]));
  return { rule: 'session_spike', value, detail_key: 'heuristics.session_spike.max', detail_args: { spike } };
}

export function hHistoricalFingerprint(snaps: Snapshot[]): HeuristicResult {
  if (snaps.length < 2) return { rule: 'historical_fingerprint', value: 0, detail_key: 'heuristics.snapshots.too_few' };
  const sets = snaps.map(s => new Set(s.players.map(p => p.endpoint ?? `${p.id}`)));
  // Intersections between consecutive snapshots
  let interScore = 0;
  for (let i = 1; i < sets.length; i++) {
    const a = sets[i - 1];
    const b = sets[i];
    let inter = 0;
    a.forEach(v => { if (b.has(v)) inter += 1; });
    interScore += inter / Math.max(1, Math.max(a.size, b.size));
  }
  const value = clamp01(interScore / (sets.length - 1));
  return { rule: 'historical_fingerprint', value, detail_key: 'heuristics.historical_fingerprint.repeated' };
}

export function aggregate(players: Player[], snaps: Snapshot[]): { confidence: number; estimatedBots: number; reasons: HeuristicResult[] } {
  const r1 = hSequenceMatch(snaps);
  const r2 = hPingCluster(players);
  const r3 = hNamePattern(players);
  const r4 = hSessionSpike(snaps);
  const r5 = hHistoricalFingerprint(snaps);
  const reasons = [r1, r2, r3, r4, r5];
  // Weighted average
  const weights: Record<string, number> = {
    sequence_match: 0.25,
    ping_cluster: 0.25,
    name_pattern: 0.2,
    session_spike: 0.15,
    historical_fingerprint: 0.15
  };
  const score = reasons.reduce((acc, r) => acc + r.value * (weights[r.rule] ?? 0.1), 0);
  const confidence = Math.round(score * 100);
  const estimatedBots = Math.max(0, Math.round(players.length * score * 0.5));
  return { confidence, estimatedBots, reasons };
}