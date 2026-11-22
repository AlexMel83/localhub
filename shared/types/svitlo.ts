// Outage schedule contract shared by Nitro and the Vue app.
// Mirrors localhub_back/src/service-layer/services/outages/schedule.js.

export type SlotStatus = 'on' | 'off' | 'maybe' | 'unknown';
export type OutageStatus = 'off' | 'maybe';
export type PublishedState = 'published' | 'empty' | 'not_published' | 'emergency';

export interface OutageInterval {
  /** ISO 8601 with Kyiv offset */
  start: string;
  end: string;
  status: OutageStatus;
  minutes: number;
}

export interface QueueDay {
  queue: string;
  /** 48 wall-clock half-hour slots, 00:00..23:30 Kyiv time */
  slots: SlotStatus[];
  intervals: OutageInterval[];
  totalOffMinutes: number;
  totalMaybeMinutes: number;
  publishedState: PublishedState;
}

export interface SourceInfo {
  name: string;
  url: string;
}

export interface RegionDay {
  region: string;
  date: string;
  publishedState: PublishedState;
  emergency: boolean;
  provider: string;
  /** true when served from an old snapshot or a fallback path */
  stale: boolean;
  sourcesAgree: boolean | null;
  source: SourceInfo;
  sourceUpdatedAt: string | null;
  fetchedAt: string | null;
  lastCheckedAt?: string | null;
  queues: QueueDay[];
}

export interface RegionInfo {
  slug: string;
  nameUk: string;
  nameEn: string;
  official: boolean;
  source: SourceInfo;
  queues: string[];
  /** Address -> queue lookup; defaultSettlement is preselected, officialUrl is the operator's own lookup. */
  addressSearch: { defaultSettlement: string | null; officialUrl: string } | null;
}

export interface ScheduleChange {
  queue: string;
  date: string;
  kind: 'published' | 'updated';
  changedAt: string | null;
  added: OutageInterval[];
  removed: OutageInterval[];
}

export interface AddressMatch {
  settlement: string;
  street: string;
  house: string | null;
  queues: string[];
  rem: string;
  fileDate: string | null;
}

export interface AddressSearchResult {
  query: { street: string; house: string | null };
  matches: AddressMatch[];
}

/** One queue on one day, as served by /api/svitlo/:region/:queue */
export interface QueueDayView extends QueueDay {
  date: string;
  dayState: PublishedState;
}

export interface QueuePageData {
  region: RegionInfo;
  queue: string;
  today: QueueDayView;
  tomorrow: QueueDayView;
  emergency: boolean;
  stale: boolean;
  sourcesAgree: boolean | null;
  source: SourceInfo;
  sourceUpdatedAt: string | null;
  fetchedAt: string | null;
}

export interface SettlementOption {
  settlement: string;
  rem: string;
}

export interface HouseLookup {
  settlement: string;
  street: string;
  houses: string[];
  house: string | null;
  found: boolean;
  queues: string[];
  rem: string | null;
  fileDate: string | null;
}
