import { test, expect } from '@playwright/test';
import { CadastroPage } from '../pages/CadastroPage';
import { usuarioValido, cpfExistenteNaMassaDeDados, telefoneCelular } from '../test-data/cadastro';
import { gerarCpfComDigitoInvalido } from '../helpers';

// Cenários derivados de Planejamento_Qualidade_Cadastro_QArena.docx (Andreline Lira).
// Os testes marcados com "@bug" e `test.fail()` reproduzem bugs já confirmados no
// documento. Os demais cenários de exceção documentam o comportamento atual para
// pontos ainda pendentes de confirmação com produto (não sabemos se são bugs).

test.describe('Cadastro - Cenários de Sucesso', () => {
  let cadastroPage: CadastroPage;

  test.beforeEach(async ({ page }) => {
    cadastroPage = new CadastroPage(page);
    await cadastroPage.goto();
  });

  test('🟢 Cenário 1 - Cadastro completo com dados válidos', async () => {
    const usuario = usuarioValido();

    await cadastroPage.preencher(usuario);
    await cadastroPage.aceitarTermos();
    await cadastroPage.submit();

    // O toast é efêmero (some sozinho rapidamente) — checar antes de registrar o
    // resultado, já que registrar faz uma leitura assíncrona do localStorage e
    // atrasaria o suficiente pra perder a janela do toast em browsers mais lentos.
    await expect(cadastroPage.toastSucesso).toBeVisible();
    await expect(cadastroPage.modalSucesso).toBeVisible();
    await expect(cadastroPage.modalNumeroConta).toHaveText(/^QA-\d{4}$/);

    await cadastroPage.registrarResultado(test.info().title);

    const persistido = await cadastroPage.buscarUsuarioPorEmail(usuario.email);
    expect(persistido).toMatchObject({
      nome: usuario.nome,
      email: usuario.email,
      cpf: usuario.cpf,
      telefone: usuario.telefone,
      senha: usuario.senha,
    });
  });

  test('🟢 Cenário 2 - Cadastro com créditos QA de teste habilitados', async () => {
    const usuario = usuarioValido();

    await cadastroPage.preencher(usuario);
    await expect(cadastroPage.creditosCheckbox).toBeChecked();
    await cadastroPage.aceitarTermos();
    await cadastroPage.submit();
    await cadastroPage.registrarResultado(test.info().title);

    const persistido = await cadastroPage.buscarUsuarioPorEmail(usuario.email);
    expect(persistido?.creditos).toBe(1000);
  });

  test('🟢 Cenário 3 - Cadastro com créditos QA de teste desabilitados', async () => {
    const usuario = usuarioValido();

    await cadastroPage.preencher(usuario);
    await cadastroPage.aceitarTermos();
    await cadastroPage.creditosCheckbox.uncheck();
    await cadastroPage.submit();
    await cadastroPage.registrarResultado(test.info().title);

    const persistido = await cadastroPage.buscarUsuarioPorEmail(usuario.email);
    expect(persistido?.creditos).toBe(0);
  });

  test('🟢 Cenário 4 - Cópia do número da conta', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'Permissão de clipboard só é concedível no Chromium via Playwright');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await cadastroPage.cadastrarComSucesso(usuarioValido());
    await cadastroPage.registrarResultado(test.info().title);
    const numeroConta = await cadastroPage.modalNumeroConta.textContent();

    await cadastroPage.modalBtnCopiar.click();
    const textoCopiado = await page.evaluate(() => navigator.clipboard.readText());
    expect(textoCopiado).toBe(numeroConta);
  });

  test('🟢 Cenário 5 - Redirecionamento para login após o cadastro', async ({ page }) => {
    await cadastroPage.cadastrarComSucesso(usuarioValido());
    await cadastroPage.registrarResultado(test.info().title);
    await cadastroPage.modalBtnIrLogin.click();

    await expect(page).toHaveURL(/\/login$/);
  });

  test('🟢 Cenário 6 - Uso do link "Massa de Dados" para gerar CPF fictício', async ({ page }) => {
    await cadastroPage.linkMassaDados.click();

    await expect(page).toHaveURL(/\/massa-de-dados$/);
  });
});

test.describe('Cadastro - Cenários de Erro', () => {
  let cadastroPage: CadastroPage;

  test.beforeEach(async ({ page }) => {
    cadastroPage = new CadastroPage(page);
    await cadastroPage.goto();
  });

  test('🔴 Cenário 1 - Envio do formulário totalmente vazio', async () => {
    const totalAntes = (await cadastroPage.obterUsuariosPersistidos()).length;

    await cadastroPage.submit();
    await cadastroPage.registrarResultado(test.info().title);

    await expect(cadastroPage.page.getByText('Informe seu nome completo')).toBeVisible();
    await expect(cadastroPage.page.getByText('Informe um e-mail em um formato válido')).toBeVisible();
    await expect(cadastroPage.page.getByText('Informe um CPF válido')).toBeVisible();
    await expect(cadastroPage.page.getByText('Informe um telefone válido')).toBeVisible();
    await expect(cadastroPage.page.getByText('A senha deve ter pelo menos 6 caracteres')).toBeVisible();
    await expect(cadastroPage.page.getByText('Confirme a sua senha')).toBeVisible();
    await expect(cadastroPage.modalSucesso).not.toBeVisible();

    const totalDepois = (await cadastroPage.obterUsuariosPersistidos()).length;
    expect(totalDepois).toBe(totalAntes);

    // Bug conhecido do documento: o toast de sucesso aparece por ~250ms mesmo com o
    // formulário inválido, antes de sumir sozinho. Usamos isVisible() diretamente (sem
    // auto-retry) para não deixar a espera do Playwright "esperar sumir" mascarar o bug.
    test.fail();
    await cadastroPage.page.waitForTimeout(100);
    const toastApareceuIndevidamente = await cadastroPage.toastSucesso.isVisible();
    expect(toastApareceuIndevidamente, 'toast de sucesso não deveria aparecer com formulário inválido').toBe(false);
  });

  test('🔴 Cenário 2 - E-mail em formato inválido', async () => {
    const usuario = usuarioValido({ email: 'email-sem-arroba-nem-dominio' });

    await cadastroPage.preencher(usuario);
    await cadastroPage.aceitarTermos();
    await cadastroPage.submit();
    await cadastroPage.registrarResultado(test.info().title);

    await expect(cadastroPage.page.getByText('Informe um e-mail em um formato válido')).toBeVisible();
    expect(await cadastroPage.buscarUsuarioPorEmail(usuario.email)).toBeUndefined();
  });

  test('🔴 Cenário 3 - Telefone em formato inválido ou incompleto', async () => {
    const usuario = usuarioValido({ telefone: '(11) 1234' });

    await cadastroPage.preencher(usuario);
    await cadastroPage.aceitarTermos();
    await cadastroPage.submit();
    await cadastroPage.registrarResultado(test.info().title);

    await expect(cadastroPage.page.getByText('Informe um telefone válido')).toBeVisible();
    expect(await cadastroPage.buscarUsuarioPorEmail(usuario.email)).toBeUndefined();
  });

  test('🔴 Cenário 4 - Senha com menos de 6 caracteres', async () => {
    const usuario = usuarioValido({ senha: '123', confirmarSenha: '123' });

    await cadastroPage.preencher(usuario);
    await cadastroPage.aceitarTermos();
    await cadastroPage.submit();
    await cadastroPage.registrarResultado(test.info().title);

    await expect(cadastroPage.page.getByText('A senha deve ter pelo menos 6 caracteres')).toBeVisible();
    expect(await cadastroPage.buscarUsuarioPorEmail(usuario.email)).toBeUndefined();
  });

  test('🔴 Cenário 5 - Confirmação de senha divergente da senha @bug', async () => {
    // Bug crítico confirmado no documento: a conta é criada usando o valor de "Senha",
    // descartando "Confirmar senha" silenciosamente (reproduzido com QA-0010 no ciclo
    // original, e novamente durante esta automação).
    test.fail();
    const usuario = usuarioValido({ senha: 'SenhaCorreta@1', confirmarSenha: 'SenhaErrada@9' });

    await cadastroPage.cadastrarComSucesso(usuario);
    await cadastroPage.registrarResultado(test.info().title);

    await expect(cadastroPage.modalSucesso).not.toBeVisible();
    expect(await cadastroPage.buscarUsuarioPorEmail(usuario.email)).toBeUndefined();
  });

  test('🔴 Cenário 6 - Correção de campo após erro de validação @bug', async () => {
    // Bug confirmado no documento: a mensagem de erro não é recalculada em tempo real,
    // permanecendo visível mesmo depois do campo ser corrigido, até um novo envio.
    test.fail();
    await cadastroPage.submit();
    await cadastroPage.registrarResultado(test.info().title);
    const erroNome = cadastroPage.page.getByText('Informe seu nome completo');
    await expect(erroNome).toBeVisible();

    await cadastroPage.nomeInput.fill('Nome Válido Agora');
    await expect(erroNome).toBeHidden({ timeout: 1500 });
  });

  test('🔴 Cenário 7 - Reenvio do formulário sem alterar os dados (duplo clique) @bug', async () => {
    // Bug confirmado no documento: reenviar o formulário sem alterar nada cria uma
    // segunda conta idêntica (reproduzido com QA-0007/QA-0008 no ciclo original).
    test.fail();
    const usuario = usuarioValido();

    await cadastroPage.cadastrarComSucesso(usuario);
    await cadastroPage.registrarResultado(test.info().title);
    await expect(cadastroPage.modalSucesso).toBeVisible();
    await cadastroPage.modalBtnFechar.click();

    await cadastroPage.submit();

    const total = await cadastroPage.contarUsuariosComEmail(usuario.email);
    expect(total).toBe(1);
  });
});

test.describe('Cadastro - Cenários de Exceção', () => {
  let cadastroPage: CadastroPage;

  test.beforeEach(async ({ page }) => {
    cadastroPage = new CadastroPage(page);
    await cadastroPage.goto();
  });

  test('🟡 Cenário 1 - Cadastro com e-mail já usado por outra conta', async () => {
    // Ponto em aberto no documento: não há confirmação de produto sobre permitir ou
    // não e-mail duplicado neste ambiente de treino. Este teste documenta o
    // comportamento atual (aceito sem aviso) para sinalizar se isso mudar.
    const emailExistente = 'usuario.sucesso@qazero.com';
    const usuario = usuarioValido({ email: emailExistente });

    await cadastroPage.cadastrarComSucesso(usuario);
    await cadastroPage.registrarResultado(test.info().title);

    await expect(cadastroPage.modalSucesso).toBeVisible();
    expect(await cadastroPage.contarUsuariosComEmail(emailExistente)).toBe(2);
  });

  test('🟡 Cenário 2 - Cadastro com CPF já usado por outra conta', async () => {
    // Ponto em aberto no documento: unicidade de CPF não confirmada com produto.
    const usuario = usuarioValido({ cpf: cpfExistenteNaMassaDeDados });

    await cadastroPage.cadastrarComSucesso(usuario);
    await cadastroPage.registrarResultado(test.info().title);

    await expect(cadastroPage.modalSucesso).toBeVisible();
    const persistido = await cadastroPage.buscarUsuarioPorEmail(usuario.email);
    expect(persistido?.cpf).toBe(cpfExistenteNaMassaDeDados);
  });

  test('🟡 Cenário 3 - CPF com formato válido mas dígito verificador inválido', async () => {
    // Achado desta automação, que corrige uma conclusão do documento original: a tela
    // VALIDA sim o dígito verificador do CPF. O exemplo citado no documento
    // (111.111.111-11) é enganoso — apesar de "parecer" inválido, esse número na
    // verdade SATISFAZ a fórmula padrão de checksum do CPF (módulo 11); só é
    // convencionalmente tratado como inválido por validadores que rejeitam à parte
    // sequências de dígitos repetidos, o que este app não faz. Com um CPF genuinamente
    // inválido (base aleatória + dígito verificador incorreto), a tela rejeita
    // corretamente. Ver também o teste abaixo, que documenta o caso específico do
    // 111.111.111-11 citado no documento.
    const cpfInvalido = gerarCpfComDigitoInvalido();
    const usuario = usuarioValido({ cpf: cpfInvalido });

    await cadastroPage.preencher(usuario);
    await cadastroPage.aceitarTermos();
    await cadastroPage.submit();
    await cadastroPage.registrarResultado(test.info().title);

    await expect(cadastroPage.page.getByText('Informe um CPF válido')).toBeVisible();
    expect(await cadastroPage.buscarUsuarioPorEmail(usuario.email)).toBeUndefined();
  });

  test('🟡 Observação - CPF "111.111.111-11" é aceito por satisfazer o checksum padrão', async () => {
    // Documenta especificamente o exemplo citado no documento original: este CPF de
    // dígitos repetidos é aceito não porque falte validação (ver Cenário 3 acima), mas
    // porque ele matematicamente satisfaz o algoritmo de checksum do CPF.
    const usuario = usuarioValido({ cpf: '111.111.111-11' });

    await cadastroPage.cadastrarComSucesso(usuario);
    await cadastroPage.registrarResultado(test.info().title);

    await expect(cadastroPage.modalSucesso).toBeVisible();
    const persistido = await cadastroPage.buscarUsuarioPorEmail(usuario.email);
    expect(persistido?.cpf).toBe('111.111.111-11');
  });

  test('🟡 Cenário 4 - Envio sem aceitar os termos de uso', async () => {
    // Ponto em aberto no documento: não confirmado se o aceite deveria ser obrigatório.
    const usuario = usuarioValido();

    await cadastroPage.preencher(usuario);
    // Termos propositalmente NÃO aceitos.
    await cadastroPage.submit();
    await cadastroPage.registrarResultado(test.info().title);

    await expect(cadastroPage.modalSucesso).toBeVisible();
    expect(await cadastroPage.buscarUsuarioPorEmail(usuario.email)).toBeDefined();
  });

  test('🟡 Cenário 5 - Nome completo com um único caractere', async () => {
    // Ponto em aberto no documento: não confirmado se deveria exigir nome + sobrenome.
    const usuario = usuarioValido({ nome: 'A' });

    await cadastroPage.cadastrarComSucesso(usuario);
    await cadastroPage.registrarResultado(test.info().title);

    await expect(cadastroPage.modalSucesso).toBeVisible();
    const persistido = await cadastroPage.buscarUsuarioPorEmail(usuario.email);
    expect(persistido?.nome).toBe('A');
  });

  test('🟡 Cenário 6 - Telefone celular de 9 dígitos é truncado para 8 @bug', async () => {
    // Bug confirmado no documento: a máscara descarta o último dígito de celulares,
    // perdendo informação real do que o usuário digitou.
    test.fail();
    const usuario = usuarioValido({ telefone: telefoneCelular });

    await cadastroPage.cadastrarComSucesso(usuario);
    await cadastroPage.registrarResultado(test.info().title);

    const persistido = await cadastroPage.buscarUsuarioPorEmail(usuario.email);
    expect(persistido?.telefone).toBe(telefoneCelular);
  });
});
