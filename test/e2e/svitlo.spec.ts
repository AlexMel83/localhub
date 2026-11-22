import { expect, test, type Page } from '@playwright/test';

const QUEUE = '/svitlo-cherga/khmelnytska-oblast/3-1';

async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test('queue page renders status, timeline and periods on the server', async ({ page, request }) => {
  const html = await (await request.get(QUEUE)).text();
  expect(html).toContain('Черга 3.1');
  expect(html).toMatch(/Зараз (за графіком|можливе)|Графік на цей час/);

  await page.goto(QUEUE);
  await expect(page.locator('#svitlo-hero-title')).toBeVisible();
  await expect(page.getByRole('img', { name: /Шкала доби/ })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Завтра' })).toHaveAttribute('href', `${QUEUE}/zavtra`);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/svitlo-cherga\/khmelnytska-oblast\/3-1$/,
  );
  await noHorizontalScroll(page);
});

test('ring view and saving the queue', async ({ page }) => {
  await page.goto(QUEUE);
  // Wait for hydration before interacting with client-only toggles.
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Коло' }).click();
  await expect(page.locator('svg[role="img"]')).toBeVisible();
  await page.getByRole('button', { name: 'Зробити моєю чергою' }).click();
  await expect(page.getByText('Ваша черга 3.1').first()).toBeVisible();
  await page.goto('/svitlo-cherga');
  await expect(page.getByText('Ваша черга 3.1').first()).toBeVisible();
});

test('region overview shows all subqueues and the matrix', async ({ page }) => {
  await page.goto('/svitlo-cherga');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Хмельницька область');
  for (const q of ['1.1', '3.2', '6.2']) {
    await expect(page.getByRole('link', { name: q, exact: true }).first()).toBeVisible();
  }
  await expect(page.locator('table')).toBeVisible();
  await noHorizontalScroll(page);
});

test('legacy query links redirect to the queue page', async ({ page }) => {
  const res = await page.goto('/svitlo-cherga?region=hmelnitska-oblast&queue=3.1');
  expect(res?.url()).toMatch(/\/svitlo-cherga\/khmelnytska-oblast\/3-1$/);
});

test('unknown queue returns 404', async ({ request }) => {
  expect((await request.get('/svitlo-cherga/khmelnytska-oblast/9-9')).status()).toBe(404);
});
