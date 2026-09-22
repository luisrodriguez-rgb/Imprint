import { serve } from '@hono/node-server';
import { app } from './app';

const port = Number(process.env.PORT) || 3001;

console.log(`[Imprint Sync API] Server listening on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
