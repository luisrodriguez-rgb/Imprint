import { LedgerEvent } from '@imprint/schemas';

export interface SyncResult {
  added: number;
  updated: number;
  serverTimestamp: number;
}

export interface ILedgerStore {
  upsertEvents(
    events: LedgerEvent[],
    userId?: string,
    syncToken?: string
  ): Promise<SyncResult>;
  getEventsSince(
    sinceTimestamp: number,
    userId?: string,
    syncToken?: string
  ): Promise<LedgerEvent[]>;
  getEventById(id: string): Promise<LedgerEvent | null>;
  clear(): Promise<void>;
}

export class MemoryLedgerStore implements ILedgerStore {
  private events: Map<string, { event: LedgerEvent; userId?: string; syncToken?: string }> = new Map();

  async upsertEvents(
    events: LedgerEvent[],
    userId?: string,
    syncToken?: string
  ): Promise<SyncResult> {
    let added = 0;
    let updated = 0;

    for (const ev of events) {
      if (this.events.has(ev.id)) {
        this.events.set(ev.id, { event: ev, userId, syncToken });
        updated++;
      } else {
        this.events.set(ev.id, { event: ev, userId, syncToken });
        added++;
      }
    }

    return {
      added,
      updated,
      serverTimestamp: Date.now(),
    };
  }

  async getEventsSince(
    sinceTimestamp: number,
    userId?: string,
    syncToken?: string
  ): Promise<LedgerEvent[]> {
    const results: LedgerEvent[] = [];

    for (const record of this.events.values()) {
      // Filter by user or syncToken if provided
      if (userId && record.userId !== userId) continue;
      if (syncToken && record.syncToken !== syncToken) continue;

      if (record.event.timestamp >= sinceTimestamp) {
        results.push(record.event);
      }
    }

    return results.sort((a, b) => a.timestamp - b.timestamp);
  }

  async getEventById(id: string): Promise<LedgerEvent | null> {
    const found = this.events.get(id);
    return found ? found.event : null;
  }

  async clear(): Promise<void> {
    this.events.clear();
  }
}

// Default singleton store
export const defaultLedgerStore = new MemoryLedgerStore();
