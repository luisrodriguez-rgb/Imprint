import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { z } from 'zod';
import { LedgerEventSchema } from '@imprint/schemas';
import { ALL_METHODOLOGIES } from '@imprint/impact-engine';
import { defaultLedgerStore } from './db/storage';

export const app = new Hono();

app.use('*', logger());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Sync-Token'],
}));

// 1. Healthcheck
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    version: '0.1.0',
    service: 'imprint-sync-api',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: Date.now(),
  });
});

// 2. Supported Methodologies Directory
app.get('/api/methodologies', (c) => {
  return c.json({
    methodologies: ALL_METHODOLOGIES,
  });
});

// 3. Sync Routes
const PushPayloadSchema = z.object({
  events: z.array(LedgerEventSchema),
  syncToken: z.string().optional(),
});

app.post('/api/sync/push', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = PushPayloadSchema.parse(body);

    const syncToken = c.req.header('X-Sync-Token') || parsed.syncToken;
    const result = await defaultLedgerStore.upsertEvents(parsed.events, undefined, syncToken);

    return c.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

app.get('/api/sync/pull', async (c) => {
  const sinceStr = c.req.query('since') || '0';
  const since = parseInt(sinceStr, 10) || 0;
  const syncToken = c.req.header('X-Sync-Token') || c.req.query('syncToken');

  const events = await defaultLedgerStore.getEventsSince(since, undefined, syncToken);

  return c.json({
    events,
    serverTimestamp: Date.now(),
  });
});
