import type { InjectionKey, ComputedRef, Ref } from 'vue';
import type { Stop, Route, Arrival, ScheduleStop } from './useBusStops';

export interface BusStopsContext {
  STOPS: ComputedRef<Stop[]>;
  ROUTES: Route[];
  ROUTE_COLORS: Record<string, string>;
  rawStops: Ref<ScheduleStop[]>;
  pending: Ref<boolean>;
  getRoutesForStop: (stopName: string) => string[];
  getArrivalsForStop: (stopName: string, date?: Date) => Arrival[];
}

export const BUS_STOPS_KEY: InjectionKey<BusStopsContext> = Symbol('bus-stops-context');
