import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Página inicial', () => {
  test('exibe o título e os links principais', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(page).toHaveTitle(/QArena/);
    await expect(page.getByRole('heading', { name: 'QArena' })).toBeVisible();
    await expect(home.entrarLink).toBeVisible();
    await expect(home.criarContaLink).toBeVisible();
  });

  test('navega para o login ao clicar em "Entrar"', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.entrarLink.click();

    await expect(page).toHaveURL(/\/login$/);
  });
});
