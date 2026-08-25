import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { users } from '../test-data/users';

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('login com credenciais válidas redireciona para a área logada', async ({ page }) => {
    await loginPage.login(users.sucesso.email, users.sucesso.password);

    await expect(page).toHaveURL(/\/app$/);
    await expect(page.getByText('Olá, Usuário')).toBeVisible();
  });

  test('login com usuário inexistente exibe mensagem de erro', async ({ page }) => {
    await loginPage.login(users.invalido.email, users.invalido.password);

    await expect(page.getByText('Usuário não encontrado')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('login com conta suspensa é barrado com mensagem clara', async ({ page }) => {
    await loginPage.login(users.suspenso.email, users.suspenso.password);

    await expect(page.getByText('Esta conta está suspensa e sem acesso ao sistema.')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('login com conta bloqueada deveria ser barrado @bug', async ({ page }) => {
    // Bug conhecido do laboratório (Central de Bugs): a conta bloqueada consegue
    // entrar normalmente em vez de ser barrada. Marcado como "fails" até o bug
    // ser corrigido — se um dia passar a barrar corretamente, este teste vai
    // quebrar a suíte e sinalizar a correção.
    test.fail();
    await loginPage.login(users.bloqueado.email, users.bloqueado.password);

    await expect(page).toHaveURL(/\/login$/);
  });
});
