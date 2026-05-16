import { computed } from 'vue';
import { useFetch } from '#imports';
import routeLinesData from '../data/bus-routes/routeLines.js';

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description?: string;
}

export interface Route {
  id: string;
  name: string;
  color: string;
  path: [number, number][];
}

export interface Arrival {
  routeId: string;
  routeName: string;
  color: string;
  minutes: number;
  time: string;
  destination?: string;
}

export interface ScheduleItem {
  time: string;
  days?: Partial<Record<'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat', boolean>>;
}

export interface RouteSchedule {
  route_name: string;
  schedules?: ScheduleItem[];
}

export interface ScheduleStop {
  stop_name: string;
  coordinates?: string;
  routes?: RouteSchedule[];
}

export const ROUTE_COLORS: Record<string, string> = {
  '1': '#ef4444',
  '2': '#f97316',
  '3': '#eab308',
  '4': '#8b5cf6', // Added based on some routes seen
  '5': '#3b82f6',
  '5а': '#0ea5e9',
  '7': '#8b5cf6',
  '8': '#10b981',
  '9': '#ec4899',
  '10': '#14b8a6',
  default: '#6b7280',
};

const COORDINATES: Record<string, { lat: number; lng: number }> = {
  центр: { lat: 49.7556, lng: 27.2208 },
  'вокзал і': { lat: 49.7629, lng: 27.2115 },
  'вокзал іі': { lat: 49.7685, lng: 27.234 },
  'вокзал ii': { lat: 49.7685, lng: 27.234 },
  'вокзал i': { lat: 49.7629, lng: 27.2115 },
  лікарня: { lat: 49.742, lng: 27.214 },
  ринок: { lat: 49.7525, lng: 27.2245 },
  'болгарське містечко': { lat: 49.763, lng: 27.228 },
  болгарський: { lat: 49.763, lng: 27.228 },
  'болг. містечко': { lat: 49.763, lng: 27.228 },
  новики: { lat: 49.775, lng: 27.2 },
  'замок острозьких': { lat: 49.7585, lng: 27.23 },
  атп: { lat: 49.76, lng: 27.2 },
  кпу: { lat: 49.75, lng: 27.24 },
  'магазин №1': { lat: 49.765, lng: 27.22 },
  "п'ятачок": { lat: 49.748, lng: 27.22 },
  'с.пашківці': { lat: 49.74, lng: 27.18 },
  'с/г техніка': { lat: 49.77, lng: 27.25 },
  'відгодівельний радгосп': { lat: 49.78, lng: 27.24 },
  камянка: { lat: 49.73, lng: 27.21 },
  'с.кам’янка': { lat: 49.73, lng: 27.21 },
  кінотеатр: { lat: 49.756, lng: 27.215 },
  'олійно-екстракційний завод': { lat: 49.74, lng: 27.25 },
  '3 польовий': { lat: 49.775, lng: 27.21 },
  '26 б.комісарів': { lat: 49.765, lng: 27.195 },
  райшрбу: { lat: 49.745, lng: 27.235 },
  'вул. толстого': { lat: 49.772, lng: 27.23 },
  дружба: { lat: 49.755, lng: 27.25 },
  анастасія: { lat: 49.76, lng: 27.222 },
};

const normalize = (str: string) => {
  return str
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[.,'"«»’()]/g, '')
    .replace(/[іii]/g, 'i') // Roman i, Cyrillic i, and another variation
    .replace(/болг/g, 'болгарське')
    .replace(/бкомісарів/g, 'бакинськихкомісарів')
    .replace(/відг/g, 'відгодівельний')
    .replace(/радгос/g, 'радгосп')
    .trim();
};

const getCoords = (name: string) => {
  const normName = normalize(name);
  for (const key of Object.keys(COORDINATES)) {
    if (normalize(key) === normName) {
      return COORDINATES[key];
    }
  }
  const key = Object.keys(COORDINATES).find((k) => {
    const normK = normalize(k);
    return normName.includes(normK) || normK.includes(normName);
  });
  if (key) return COORDINATES[key];
  return null;
};

export const ROUTES: Route[] = routeLinesData.map((r) => ({
  id: r.id,
  name: r.name,
  color: ROUTE_COLORS[r.id] || ROUTE_COLORS['default'],
  path: r.path as [number, number][],
}));

export const useBusStops = () => {
  const {
    data: rawStops,
    pending,
    error,
  } = useFetch<ScheduleStop[]>('/api/stops', {
    key: 'bus-stops-dynamic-data',
    default: () => [],
  });

  const STOPS = computed<Stop[]>(() => {
    if (!rawStops.value) return [];

    const processedStopsMap = new Map<string, Stop>();

    rawStops.value.forEach((s) => {
      let lat = 0;
      let lng = 0;

      if (s.coordinates) {
        const parts = s.coordinates.split(',').map((p) => parseFloat(p.trim()));
        if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
          lat = parts[0];
          lng = parts[1];
        }
      }

      if (lat === 0 || lng === 0) {
        const coords = getCoords(s.stop_name);
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
        }
      }

      if (lat !== 0 && lng !== 0) {
        processedStopsMap.set(s.stop_name, {
          id: s.stop_name,
          name: s.stop_name,
          lat,
          lng,
          description: 'Зупинка в м. Старокостянтинів',
        });
      }
    });

    return Array.from(processedStopsMap.values());
  });

  const getRoutesForStop = (stopName: string): string[] => {
    if (!rawStops.value) return [];
    const stopList = rawStops.value;
    const normalizedSearchName = normalize(stopName);
    const targetStop = stopList.find((s) => normalize(s.stop_name) === normalizedSearchName);

    if (!targetStop || !targetStop.routes) return [];

    const routeIds = new Set<string>();
    targetStop.routes?.forEach((route) => {
      const match = route.route_name.match(/№\s*([\dа-яА-Яa-zA-Z]+)/);
      if (match) routeIds.add(match[1]);
    });

    return Array.from(routeIds).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      return (isNaN(numA) ? 0 : numA) - (isNaN(numB) ? 0 : numB);
    });
  };

  const getArrivalsForStop = (stopName: string, date: Date = new Date()): Arrival[] => {
    if (!rawStops.value) return [];
    const daysMap: Array<'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'> = [
      'sun',
      'mon',
      'tue',
      'wed',
      'thu',
      'fri',
      'sat',
    ];
    const todayKey = daysMap[date.getDay()];

    const arrivals: Arrival[] = [];

    const stopList = rawStops.value;
    const normalizedSearchName = normalize(stopName);
    const targetStop = stopList.find((s) => normalize(s.stop_name) === normalizedSearchName);

    if (targetStop?.routes) {
      targetStop.routes.forEach((route) => {
        const match = route.route_name.match(/№\s*([\dа-яА-Яa-zA-Z]+)/);
        const routeId = match ? match[1] : '?';

        route.schedules?.forEach((schedule) => {
          const days = schedule.days ?? {};
          const isDayActive = days[todayKey] === true;

          if (isDayActive) {
            const [h = 0, m = 0] = schedule.time.split(':').map(Number);
            const minutesFromMidnight = h * 60 + m;

            arrivals.push({
              routeId,
              routeName: route.route_name,
              color: ROUTE_COLORS[routeId] ?? ROUTE_COLORS.default,
              minutes: minutesFromMidnight,
              time: schedule.time,
              destination: 'Переглянути маршрут',
            });
          }
        });
      });
    }

    return arrivals.sort((a, b) => a.minutes - b.minutes);
  };

  return {
    rawStops,
    STOPS,
    pending,
    error,
    getRoutesForStop,
    getArrivalsForStop,
    ROUTES,
    ROUTE_COLORS,
  };
};
