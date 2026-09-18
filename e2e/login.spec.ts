import { test, expect } from '@playwright/test';

test('login page should load and show error on bad credentials', async ({ page }) => {
  await page.goto('/login');
  
  await page.fill('input[name="email"]', 'wrong@admin.com');
  await page.fill('input[name="password"]', 'wrongpassword');
  await page.click('button[type="submit"]');

  // Verifica que o alerta de erro aparece (assumindo comportamento padrão)
  await expect(page.locator('div[role="alert"]')).toBeVisible();
});
