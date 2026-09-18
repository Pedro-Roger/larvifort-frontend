# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> login page should load and show error on bad credentials
- Location: e2e/login.spec.ts:3:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="email"]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e3]:
    - generic [ref=e4]: "404"
    - heading "Página não encontrada" [level=1] [ref=e5]
    - paragraph [ref=e6]: O endereço que você procurou não existe ou foi movido.
    - link "Voltar ao início" [ref=e7] [cursor=pointer]:
      - /url: /
  - button "Open Next.js Dev Tools" [ref=e13] [cursor=pointer]
  - alert [ref=e17]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('login page should load and show error on bad credentials', async ({ page }) => {
  4  |   await page.goto('/login');
  5  |   
> 6  |   await page.fill('input[name="email"]', 'wrong@admin.com');
     |              ^ Error: page.fill: Test timeout of 30000ms exceeded.
  7  |   await page.fill('input[name="password"]', 'wrongpassword');
  8  |   await page.click('button[type="submit"]');
  9  | 
  10 |   // Verifica que o alerta de erro aparece (assumindo comportamento padrão)
  11 |   await expect(page.locator('div[role="alert"]')).toBeVisible();
  12 | });
  13 | 
```