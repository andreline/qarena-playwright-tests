import { type Page, type Locator } from '@playwright/test';
import { registrarUsuario } from '../relatorios/usuariosCriados';

export interface NovoUsuario {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  senha: string;
  confirmarSenha: string;
}

export interface UsuarioPersistido {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  senha: string;
  creditos: number;
  numeroConta: string;
  bloqueado: boolean;
  contaSuspensa: boolean;
  permissao: boolean;
  criadoEm: string;
}

export class CadastroPage {
  readonly page: Page;
  readonly nomeInput: Locator;
  readonly emailInput: Locator;
  readonly cpfInput: Locator;
  readonly telefoneInput: Locator;
  readonly senhaInput: Locator;
  readonly confirmarSenhaInput: Locator;
  readonly termosCheckbox: Locator;
  readonly creditosCheckbox: Locator;
  readonly submitButton: Locator;
  readonly linkMassaDados: Locator;
  readonly linkLogin: Locator;
  readonly toastSucesso: Locator;
  readonly modalSucesso: Locator;
  readonly modalNumeroConta: Locator;
  readonly modalBtnCopiar: Locator;
  readonly modalBtnIrLogin: Locator;
  readonly modalBtnFechar: Locator;

  /** Últimos dados preenchidos via `preencher()`, usados por `registrarResultado()`. */
  private dadosDigitados: Partial<NovoUsuario> = {};

  constructor(page: Page) {
    this.page = page;
    this.nomeInput = page.getByTestId('cadastro-input-nome');
    this.emailInput = page.getByTestId('cadastro-input-email');
    this.cpfInput = page.getByTestId('cadastro-input-cpf');
    this.telefoneInput = page.getByTestId('cadastro-input-telefone');
    this.senhaInput = page.getByTestId('cadastro-input-senha');
    this.confirmarSenhaInput = page.getByTestId('cadastro-input-confirmar-senha');
    this.termosCheckbox = page.getByTestId('cadastro-checkbox-termos');
    this.creditosCheckbox = page.getByTestId('cadastro-checkbox-creditos');
    this.submitButton = page.getByTestId('cadastro-btn-cadastrar');
    this.linkMassaDados = page.getByTestId('cadastro-link-gerador-cpf');
    this.linkLogin = page.getByTestId('cadastro-link-login');
    this.toastSucesso = page.getByText('Conta criada com sucesso!');
    this.modalSucesso = page.getByTestId('modal-cadastro-sucesso');
    this.modalNumeroConta = page.getByTestId('modal-cadastro-numero-conta');
    this.modalBtnCopiar = page.getByTestId('modal-cadastro-btn-copiar');
    this.modalBtnIrLogin = page.getByTestId('modal-cadastro-btn-ir-login');
    this.modalBtnFechar = page.getByTestId('modal-cadastro-sucesso-btn-fechar');
  }

  async goto() {
    await this.page.goto('/cadastro');
  }

  async preencher(usuario: Partial<NovoUsuario>) {
    this.dadosDigitados = { ...this.dadosDigitados, ...usuario };
    if (usuario.nome !== undefined) await this.nomeInput.fill(usuario.nome);
    if (usuario.email !== undefined) await this.emailInput.fill(usuario.email);
    if (usuario.cpf !== undefined) await this.cpfInput.fill(usuario.cpf);
    if (usuario.telefone !== undefined) await this.telefoneInput.fill(usuario.telefone);
    if (usuario.senha !== undefined) await this.senhaInput.fill(usuario.senha);
    if (usuario.confirmarSenha !== undefined) await this.confirmarSenhaInput.fill(usuario.confirmarSenha);
  }

  async aceitarTermos() {
    await this.termosCheckbox.check();
  }

  async submit() {
    await this.submitButton.click();
  }

  /** Preenche todos os campos com dados válidos, aceita os termos e envia o formulário. */
  async cadastrarComSucesso(usuario: NovoUsuario) {
    await this.preencher(usuario);
    await this.aceitarTermos();
    await this.submit();
  }

  /** Lê diretamente o estado persistido pela tela (chave `qarena-auth` do localStorage). */
  async obterUsuariosPersistidos(): Promise<UsuarioPersistido[]> {
    return this.page.evaluate(() => {
      const raw = localStorage.getItem('qarena-auth');
      if (!raw) return [];
      return JSON.parse(raw).state.usuarios as UsuarioPersistido[];
    });
  }

  async buscarUsuarioPorEmail(email: string): Promise<UsuarioPersistido | undefined> {
    const usuarios = await this.obterUsuariosPersistidos();
    return usuarios.find((u) => u.email === email);
  }

  async contarUsuariosComEmail(email: string): Promise<number> {
    const usuarios = await this.obterUsuariosPersistidos();
    return usuarios.filter((u) => u.email === email).length;
  }

  /**
   * Registra no relatório `usuario.json` o resultado da última tentativa de cadastro
   * feita nesta página (dados digitados via `preencher()` + o que foi persistido, se
   * algo foi). `tipo` identifica o cenário (ex.: título do teste).
   */
  async registrarResultado(tipo: string): Promise<void> {
    const email = this.dadosDigitados.email;
    const persistido = email ? await this.buscarUsuarioPorEmail(email) : undefined;

    registrarUsuario({
      tipo,
      dadosDigitados: {
        nome: this.dadosDigitados.nome ?? '',
        email: this.dadosDigitados.email ?? '',
        cpf: this.dadosDigitados.cpf ?? '',
        telefone: this.dadosDigitados.telefone ?? '',
        senha: this.dadosDigitados.senha ?? '',
        confirmarSenha: this.dadosDigitados.confirmarSenha ?? '',
      },
      dadosPersistidos: persistido
        ? {
            nome: persistido.nome,
            email: persistido.email,
            cpf: persistido.cpf,
            telefone: persistido.telefone,
            senha: persistido.senha,
            numeroConta: persistido.numeroConta,
            creditos: persistido.creditos,
          }
        : null,
    });
  }
}
