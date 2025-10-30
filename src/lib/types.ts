export type Player = {
  id: number;
  name: string;
  ping: number;
  endpoint?: string;
  identifiers?: string[];
};

export type Snapshot = {
  ts: string; // ISO timestamp UTC
  players: Player[];
};

export type HeuristicResult = {
  rule: 'sequence_match' | 'ping_cluster' | 'name_pattern' | 'session_spike' | 'historical_fingerprint';
  value: number; // 0..1
  detail?: string;
  detail_key?: string;
  detail_args?: Record<string, string | number>;
};

export type ScanResponse = {
  server: string;
  server_name?: string;
  player_count: number;
  estimated_bots: number;
  confidence: number; // 0..100
  reasons: HeuristicResult[];
  snapshots: Snapshot[];
};