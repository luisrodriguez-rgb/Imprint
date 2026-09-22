import { pgTable, text, timestamp, integer, bigint, jsonb, boolean } from 'drizzle-orm/pg-core';

// 1. Better Auth Tables (User, Session, Account, Verification)
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  expiresAt: timestamp('expires_at'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Personal Computational Resource Ledger Table
export const ledgerEvents = pgTable('ledger_events', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  syncToken: text('sync_token'), // Anonymous multi-device pairing token
  provider: text('provider').notNull(), // 'chatgpt' | 'claude' | 'gemini' | 'grok' | 'other'
  modelRaw: text('model_raw'),
  modelFamily: text('model_family'),
  sessionId: text('session_id').notNull(),
  interactionIndex: integer('interaction_index').notNull(),
  timestamp: bigint('timestamp', { mode: 'number' }).notNull(),
  durationMs: integer('duration_ms'),

  // Strict privacy-preserving counters (ZERO PROMPT TEXT STORED)
  inputData: jsonb('input_data').notNull(),
  outputData: jsonb('output_data').notNull(),
  activity: jsonb('activity').notNull(),
  impact: jsonb('impact').notNull(),
  confidence: jsonb('confidence').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
