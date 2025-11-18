export default defineEventHandler(async () => {
  try {
    const response = await fetch('https://svitlo-proxy.svitlo-proxy.workers.dev/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Помилка при завантаженні даних',
      });
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error('API Error:', err instanceof Error ? err.message : 'Unknown error');
    throw createError({
      statusCode: 500,
      statusMessage: 'Помилка при обробці запиту',
    });
  }
});
