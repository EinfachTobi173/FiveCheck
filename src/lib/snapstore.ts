import { Snapshot } from './types';

class SnapStore {
  private store = new Map<string, Snapshot[]>();

  push(jobId: string, snap: Snapshot) {
    const arr = this.store.get(jobId) ?? [];
    arr.push(snap);
    this.store.set(jobId, arr.slice(-5)); // keep last 5
  }

  get(jobId: string): Snapshot[] {
    return this.store.get(jobId) ?? [];
  }
}

export const SNAP_STORE = new SnapStore();