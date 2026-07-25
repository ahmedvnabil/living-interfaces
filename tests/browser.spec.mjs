import { expect, test } from '@playwright/test';

test('landing communicates the product and renders live systems without console errors', async ({ page }) => {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');
  await expect(page.getByRole('heading', { name: /interfaces should never stand still/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /explore 40 systems/i })).toBeVisible();
  await expect(page.locator('[data-living-stage] canvas')).toHaveCount(4);
  await expect(page.getByText('40', { exact: true }).first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('catalog exposes all assets and renders without console errors', async ({ page }) => {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/catalog.html');
  const cards = page.locator('main article');
  await expect(cards).toHaveCount(40);
  await expect(page.getByText('40 SPECIMENS', { exact: true })).toBeVisible();
  await expect(cards.nth(0).locator('.la-card__stage > canvas')).toBeVisible();
  expect(errors).toEqual([]);
});

test('studio applies a preset from defaults deterministically', async ({ page }) => {
  await page.goto('/studio.html');
  const speed = page.getByLabel('Speed', { exact: true });
  await speed.fill('2.5');
  await page.getByLabel('Preset', { exact: true }).selectOption('flow-field-calm');

  await expect(page.getByText('PRESET APPLIED', { exact: true })).toBeVisible();
  await expect(page.locator('#seedLabel')).toHaveText('0x0000002A');
  await expect(page.getByLabel('Particles', { exact: true })).toHaveValue('1100');
  await expect(speed).toHaveValue('0.55');
});

test('web component mounts, tears down, and reports invalid configuration', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/tests/fixtures/web-component.html');
  const element = page.locator('#asset');
  await expect(element.locator('canvas')).toBeVisible();

  await element.evaluate((node) => node.removeAttribute('type'));
  await expect(element).toHaveAttribute('data-error', 'The type attribute is required');
  await expect(element.locator('canvas')).toHaveCount(0);

  await element.evaluate((node) => node.setAttribute('type', 'flow-field'));
  await expect(element.locator('canvas')).toBeVisible();
  expect(errors).toEqual([]);
});
