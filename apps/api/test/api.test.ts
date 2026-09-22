import { describe, it, expect } from 'vitest';
import { app } from '../src/app';

describe('@imprint/api', () => {
  it('responds to healthcheck with ok status', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.service).toBe('imprint-sync-api');
  });

  it('lists registered scientific methodologies', async () => {
    const res = await app.request('/api/methodologies');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.methodologies)).toBe(true);
    expect(json.methodologies.length).toBeGreaterThanOrEqual(4);
  });

  it('handles sync pull on empty store', async () => {
    const res = await app.request('/api/sync/pull');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.events)).toBe(true);
  });
});
