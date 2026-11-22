// zod schemas for responses of localhub_back /outages/* (the trust boundary).
import { z } from 'zod';

const slot = z.enum(['on', 'off', 'maybe', 'unknown']);
const state = z.enum(['published', 'empty', 'not_published', 'emergency']);
const interval = z.object({
  start: z.string(),
  end: z.string(),
  status: z.enum(['off', 'maybe']),
  minutes: z.number(),
});
const source = z.object({ name: z.string(), url: z.string() });

export const queueDaySchema = z.object({
  queue: z.string(),
  slots: z.array(slot),
  intervals: z.array(interval),
  totalOffMinutes: z.number(),
  totalMaybeMinutes: z.number(),
  publishedState: state,
});

export const regionDaySchema = z.object({
  region: z.string(),
  date: z.string(),
  publishedState: state,
  emergency: z.boolean(),
  provider: z.string(),
  stale: z.boolean(),
  sourcesAgree: z.boolean().nullable(),
  source,
  sourceUpdatedAt: z.string().nullable(),
  fetchedAt: z.string().nullable(),
  lastCheckedAt: z.string().nullable().optional(),
  queues: z.array(queueDaySchema),
});

export const regionsSchema = z.array(
  z.object({
    slug: z.string(),
    nameUk: z.string(),
    nameEn: z.string(),
    official: z.boolean(),
    source,
    queues: z.array(z.string()),
  }),
);

export const changesSchema = z.array(
  z.object({
    queue: z.string(),
    date: z.string(),
    kind: z.enum(['published', 'updated']),
    changedAt: z.string().nullable(),
    added: z.array(interval),
    removed: z.array(interval),
  }),
);

export const addressSchema = z.object({
  query: z.object({ street: z.string(), house: z.string().nullable() }),
  matches: z.array(
    z.object({
      settlement: z.string(),
      street: z.string(),
      house: z.string().nullable(),
      queues: z.array(z.string()),
      rem: z.string(),
      fileDate: z.string().nullable(),
    }),
  ),
});

export const settlementsSchema = z.array(z.object({ settlement: z.string(), rem: z.string() }));

export const streetsSchema = z.array(z.string());

export const houseSchema = z.object({
  settlement: z.string(),
  street: z.string(),
  houses: z.array(z.string()),
  house: z.string().nullable(),
  found: z.boolean(),
  queues: z.array(z.string()),
  rem: z.string().nullable(),
  fileDate: z.string().nullable(),
});
