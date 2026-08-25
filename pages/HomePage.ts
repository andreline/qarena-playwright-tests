import { type Page, type Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly entrarLink: Locator;
  readonly criarContaLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.entrarLink = page.getByRole('link', { name: 'Entrar' });
    this.criarContaLink = page.getByRole('link', { name: 'Criar minha conta' });
  }

  async goto() {
    await this.page.goto('/');
  }
}
