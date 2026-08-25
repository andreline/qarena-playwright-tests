import { test, expect } from '@playwright/test';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { users } from '../test-data/users';

const EVIDENCE_ROOT = path.join('evidencias', 'login');

function slugify(texto: string): string {
  const semAcentos = texto
    .normalize('NFD')
    .split('')
    .filter((caractere) => {
      const codigo = caractere.charCodeAt(0);
      const inicioMarcasDiacriticas = 768;
      const fimMarcasDiacriticas = 879;
      return codigo < inicioMarcasDiacriticas || codigo > fimMarcasDiacriticas;
    })
    .join('');

  return semAcentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

for (const [perfil, dados] of Object.entries(users)) {
  test.describe(`Login - perfil "${perfil}"`, () => {
    test(`valida o login do perfil "${perfil}" (${dados.description})`, async ({ page }, testInfo) => {
      const loginPage = new LoginPage(page);
      const pastaEvidencias = path.join(EVIDENCE_ROOT, testInfo.project.name, slugify(perfil));

      await test.step('Acessar a tela de login', async () => {
        await loginPage.goto();
        await expect(loginPage.emailInput).toBeVisible();
        await page.screenshot({
          path: path.join(pastaEvidencias, '01-tela-login.png'),
          fullPage: true,
        });
      });

      await test.step('Preencher usuário', async () => {
        await loginPage.emailInput.fill(dados.email);
        await expect(loginPage.emailInput).toHaveValue(dados.email);
        await page.screenshot({
          path: path.join(pastaEvidencias, '02-usuario-preenchido.png'),
          fullPage: true,
        });
      });

      await test.step('Preencher senha', async () => {
        await loginPage.passwordInput.fill(dados.password);
        await expect(loginPage.passwordInput).toHaveValue(dados.password);
        await page.screenshot({
          path: path.join(pastaEvidencias, '03-senha-preenchida.png'),
          fullPage: true,
        });
      });

      await test.step('Confirmar login', async () => {
        await loginPage.submitButton.click();

        if (dados.expectedOutcome === 'entra') {
          await expect(page).toHaveURL(/\/app$/);
        } else {
          await expect(page).toHaveURL(/\/login$/);
          if (dados.expectedMessage) {
            await expect(page.getByText(dados.expectedMessage)).toBeVisible();
          }
        }

        await page.screenshot({
          path: path.join(pastaEvidencias, '04-resultado.png'),
          fullPage: true,
        });
      });

      if (dados.bugConhecido) {
        test.info().annotations.push({
          type: 'bug conhecido',
          description: `Perfil "${perfil}" deveria ser barrado no login, mas consegue entrar normalmente.`,
        });
      }
    });
  });
}
