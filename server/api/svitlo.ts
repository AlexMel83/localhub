interface CacheData {
  data: unknown;
  timestamp: number;
}

const CACHE_DURATION = 30000; // 10 секунд
let cache: CacheData | null = null;

export default defineEventHandler(async () => {
  try {
    const now = Date.now();

    // Перевірка кешу
    if (cache && now - cache.timestamp < CACHE_DURATION) {
      console.log('Returning cached data');
      return cache.data;
    }

    console.log('Fetching fresh data from API');

    const response = await fetch('https://svitlo-proxy.svitlo-proxy.workers.dev/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Якщо помилка, але є старий кеш — повернути його
      if (cache) {
        console.log('API error, returning stale cache');
        return cache.data;
      }

      throw createError({
        statusCode: response.status,
        statusMessage: 'Помилка при завантаженні даних',
      });
    }

    const data = await response.json();

    // Оновлення кешу
    cache = {
      data,
      timestamp: now,
    };

    return data;
  } catch (err) {
    console.error('API Error:', err instanceof Error ? err.message : 'Unknown error');

    // Якщо помилка і є кеш — повернути його
    if (cache) {
      console.log('Exception occurred, returning cached data');
      return cache.data;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Помилка при обробці запиту',
    });
  }
});
