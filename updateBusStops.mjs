import fs from 'fs';
import path from 'path';

const url = "https://docs.google.com/spreadsheets/d/13bxKXO-CFVkvYYnrq0UnUg7nW3_AnRECorQKOSP5Nvg/export?format=csv";

async function updateBusStops() {
  const response = await fetch(url);
  const csvText = await response.text();
  
  const lines = csvText.split(/\r?\n/);
  
  let startIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('Зупинка')) {
      startIndex = i + 1;
      break;
    }
  }
  
  if (startIndex === -1) {
    console.error("Could not find header row");
    return;
  }
  
  function parseCSVRow(row) {
    const result = [];
    let inQuotes = false;
    let currentVal = '';
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        if (inQuotes && row[i+1] === '"') {
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

  const stopsMap = new Map();

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Ignore lines that don't have enough columns, probably empty lines
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

    const parseBool = (val) => val.toUpperCase() === 'TRUE';
    
    const days = {
      mon: parseBool(cols[15]),
      tue: parseBool(cols[16]),
      wed: parseBool(cols[17]),
      thu: parseBool(cols[18]),
      fri: parseBool(cols[19]),
      sat: parseBool(cols[20]),
      sun: parseBool(cols[21])
    };
    
    if (!stopsMap.has(stopName)) {
      stopsMap.set(stopName, {
        stop_name: stopName,
        coordinates: coordinates,
        routesMap: new Map()
      });
    }
    
    const stopObj = stopsMap.get(stopName);
    if (!stopObj.routesMap.has(routeName)) {
      stopObj.routesMap.set(routeName, []);
    }
    
    if (time) {
        if (time.startsWith('0')) {
            time = time.substring(1);
        }
        stopObj.routesMap.get(routeName).push({
          time: time,
          days: days
        });
    }
  }

  const finalResult = [];
  for (const [stopName, stopObj] of stopsMap.entries()) {
    const routes = [];
    for (const [routeName, schedules] of stopObj.routesMap.entries()) {
      routes.push({
        route_name: routeName,
        schedules: schedules
      });
    }
    finalResult.push({
      stop_name: stopObj.stop_name,
      coordinates: stopObj.coordinates,
      routes: routes
    });
  }

  const outPath = path.join(process.cwd(), 'app', 'data', 'bus-routes', 'busStops.json');
  fs.writeFileSync(outPath, JSON.stringify(finalResult, null, 2), 'utf-8');
  console.log('busStops.json updated successfully!');
}

updateBusStops().catch(console.error);
