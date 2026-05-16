import { defineEventHandler } from 'h3';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/13bxKXO-CFVkvYYnrq0UnUg7nW3_AnRECorQKOSP5Nvg/export?format=csv';
// --
function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let inQuotes = false;
  let currentVal = '';
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(currentVal.trim());
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  result.push(currentVal.trim());
  return result;
}

export default defineEventHandler(async () => {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    const csvText = await response.text();

    const lines = csvText.split(/\r?\n/);

    let startIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i]?.startsWith('Зупинка')) {
        startIndex = i + 1;
        break;
      }
    }

    if (startIndex === -1) {
      throw new Error('Could not find header row');
    }

    const stopsMap = new Map();

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;

      const cols = parseCSVRow(line);
      if (cols.length < 22) continue;

      const stopName = cols[0];
      const coordinates = cols[1];
      const routeName = cols[2];
      let time = cols[7]; // відпр
      if (!time) {
        time = cols[6]; // fallback to приб if відпр is empty
      }

      if (!stopName || !routeName) continue;

      const parseBool = (val?: string) => val?.toUpperCase() === 'TRUE';

      const days = {
        mon: parseBool(cols[15]),
        tue: parseBool(cols[16]),
        wed: parseBool(cols[17]),
        thu: parseBool(cols[18]),
        fri: parseBool(cols[19]),
        sat: parseBool(cols[20]),
        sun: parseBool(cols[21]),
      };

      if (!stopsMap.has(stopName)) {
        stopsMap.set(stopName, {
          stop_name: stopName,
          coordinates: coordinates,
          routesMap: new Map(),
        });
      }

      const stopObj = stopsMap.get(stopName);
      if (!stopObj.routesMap.has(routeName)) {
        stopObj.routesMap.set(routeName, []);
      }

      if (time) {
        if (time?.startsWith('0')) {
          time = time.substring(1);
        }
        stopObj.routesMap.get(routeName).push({
          time: time,
          days: days,
        });
      }
    }

    const finalResult = [];
    for (const stopObj of stopsMap.values()) {
      const routes = [];
      for (const [routeName, schedules] of stopObj.routesMap.entries()) {
        routes.push({
          route_name: routeName,
          schedules: schedules,
        });
      }
      finalResult.push({
        stop_name: stopObj.stop_name,
        coordinates: stopObj.coordinates,
        routes: routes,
      });
    }

    return finalResult;
  } catch (error) {
    console.error('Error loading bus stops from CSV:', error);
    return [];
  }
});
