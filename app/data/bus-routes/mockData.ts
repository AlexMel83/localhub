import schedulesData from './busStops.json';

// 3. Import Routes from external file (user-editable)
import routeLinesData from './routeLines.json';

// Types
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

interface ScheduleItem {
  time: string;
  days?: ScheduleDays;
}

interface RouteSchedule {
  route_name: string;
  schedules?: ScheduleItem[];
}

interface ScheduleStop {
  stop_name: string;
  coordinates?: string;
  routes?: RouteSchedule[];
}

type WeekDayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
type ScheduleDays = Partial<Record<WeekDayKey, boolean>>;

// 1. Static Dictionary of Coordinates
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

export const ROUTE_COLORS: Record<string, string> = {
  '1': '#ef4444',
  '2': '#f97316',
  '3': '#eab308',
  '5': '#3b82f6',
  '7': '#8b5cf6',
  '8': '#10b981',
  '9': '#ec4899',
  '10': '#14b8a6',
  default: '#6b7280',
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
  // Direct check in COORDINATES with normalized keys
  for (const key of Object.keys(COORDINATES)) {
    if (normalize(key) === normName) {
      return COORDINATES[key];
    }
  }
  // Partial check
  const key = Object.keys(COORDINATES).find((k) => {
    const normK = normalize(k);
    return normName.includes(normK) || normK.includes(normName);
  });
  if (key) return COORDINATES[key];
  return null;
};

// 2. Process Stops (Driving from the schedule data to ensure matches)
const processedStopsMap = new Map<string, Stop>();
const scheduleStops = schedulesData as ScheduleStop[];

scheduleStops.forEach((s) => {
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
      description: 'Stop in Starokostiantyniv',
    });
  }
});

export const STOPS = Array.from(processedStopsMap.values());

export const ROUTES: Route[] = routeLinesData.map((r) => ({
  id: r.id,
  name: r.name,
  color: ROUTE_COLORS[r.id] || ROUTE_COLORS['default'],
  path: r.path as [number, number][],
}));

// 4. Dynamic Schedule Logic
export function getRoutesForStop(stopName: string): string[] {
  const stopList = scheduleStops;
  const normalizedSearchName = normalize(stopName);
  const targetStop = stopList.find((s) => normalize(s.stop_name) === normalizedSearchName);

  if (!targetStop || !targetStop.routes) return [];

  const routeIds = new Set<string>();
  targetStop.routes?.forEach((route) => {
    const match = route.route_name.match(/№\s*(\d+)/);
    if (match) routeIds.add(match[1]);
  });

  return Array.from(routeIds).sort((a, b) => Number(a) - Number(b));
}

export function getArrivalsForStop(stopName: string, date: Date = new Date()): Arrival[] {
  const daysMap: WeekDayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const todayKey = daysMap[date.getDay()];

  const arrivals: Arrival[] = [];

  // Find the stop in the dataset using normalization for robustness
  const stopList = schedulesData as ScheduleStop[];
  const normalizedSearchName = normalize(stopName);
  const targetStop = stopList.find((s): s is ScheduleStop => normalize(s.stop_name) === normalizedSearchName);

  if (targetStop?.routes) {
    targetStop.routes.forEach((route) => {
      const match = route.route_name.match(/№\s*(\d+)/);
      const routeId = match ? match[1] : '?';

      route.schedules?.forEach((schedule) => {
        const days = schedule.days ?? {};

        if (days[todayKey]) {
          const [h = 0, m = 0] = schedule.time.split(':').map(Number);
          const minutesFromMidnight = h * 60 + m;

          arrivals.push({
            routeId,
            routeName: route.route_name,
            color: ROUTE_COLORS[routeId] ?? ROUTE_COLORS.default,
            minutes: minutesFromMidnight,
            time: schedule.time,
            destination: 'See Route',
          });
        }
      });
    });
  }

  return arrivals.sort((a, b) => a.minutes - b.minutes);
}
