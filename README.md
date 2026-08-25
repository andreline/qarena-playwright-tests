# QArena Playwright Tests

Automação de testes E2E com [Playwright](https://playwright.dev/) para o ambiente de treino [QArena](https://qarenaqa.vercel.app/).

## Sobre este projeto: feito pelo Claude, em aula

**Todo o código deste repositório — estrutura do projeto, Page Objects, os 19+ cenários de teste, a descoberta e documentação dos bugs, os geradores de dados e o relatório em JSON — foi escrito pelo [Claude](https://claude.com/claude-code) (o assistente de IA da Anthropic), a partir de pedidos em linguagem natural feitos por mim, Andreline Lira.**

Este material nasceu como demonstração para uma aula do curso **QA do Zero**, para mostrar aos meus alunos, na prática, como um QA pode colaborar com o Claude para criar uma suíte de testes automatizados real — não só gerando um script solto, mas conduzindo o processo: eu trouxe o ambiente (QArena), um planejamento de qualidade que eu mesma escrevi manualmente (testando a aplicação e documentando bugs), e fui pedindo, em português e em várias etapas, para o Claude instalar as ferramentas, montar a estrutura do zero, ler o meu planejamento e traduzir os cenários em testes reais, investigar comportamentos direto no navegador antes de escrever qualquer asserção, e organizar o código em camadas reutilizáveis. O objetivo é que os alunos vejam o processo completo — não só o resultado, mas as idas e vindas, as correções de rota, e como o Claude reage quando um teste quebra ou quando um dado do próprio planejamento se mostra impreciso durante a automação.

Se você é aluno(a) e chegou até aqui pelo repositório: recomendo ler o histórico de commits e, se puder, a conversa completa que gerou este código — o valor didático está tanto no "o quê" (os arquivos abaixo) quanto no "como" (a sequência de pedidos que fiz e como o Claude foi ajustando o trabalho a cada resposta).

## O que é o QArena

[QArena](https://qarenaqa.vercel.app/) é um ambiente de treino para QAs que eu mesma criei, parte do ecossistema do curso **QA do Zero**. É uma aplicação **100% front-end** (sem backend — tudo fica salvo no `localStorage` do navegador) com **33 bugs plantados de propósito** em 8 laboratórios diferentes: Cadastro, Login, Loja, Carrinho, Cupom e Checkout, Perfil do Usuário, Meus Pedidos e Missões QA. A ideia é dar a alunos de QA um lugar seguro para praticar investigação de bugs, documentação e raciocínio de teste — alguns comportamentos "errados" são bugs reais, outros são armadilhas plantadas de propósito para treino, e faz parte do exercício descobrir qual é qual.

Este repositório automatiza, com Playwright, os cenários do laboratório de **Cadastro** (`/cadastro`), a partir do planejamento de qualidade em [`docs/Planejamento_Qualidade_Cadastro_QArena.docx`](docs/Planejamento_Qualidade_Cadastro_QArena.docx), que eu escrevi manualmente testando a aplicação antes de pedir a automação.

## Ferramentas e linguagem usadas

- **Linguagem:** [TypeScript](https://www.typescriptlang.org/) (tipado, roda sobre Node.js)
- **Framework de teste:** [Playwright Test](https://playwright.dev/docs/test-intro) (`@playwright/test`) — abre browsers de verdade, clica, digita, tira screenshots e faz asserções sobre o que aparece na tela
- **Runtime:** [Node.js](https://nodejs.org/) 18 ou superior
- **Gerenciador de pacotes:** npm (vem junto com o Node.js)
- **Browsers testados:** Chromium (Chrome/Edge), Firefox e WebKit (motor do Safari) — o Playwright baixa e gerencia esses browsers sozinho, não usa os instalados no sistema
- **Tipos do Node:** `@types/node` (para o TypeScript entender APIs do Node como `fs` e `path`)

## Instalação (passo a passo do que foi feito)

Se você quiser recriar este projeto do zero, ou entender exatamente o que foi instalado, são estes os comandos, na ordem:

```bash
# 1. Criar a pasta do projeto e inicializar o package.json
mkdir qarena-playwright-tests
cd qarena-playwright-tests
npm init -y

# 2. Instalar o Playwright, o TypeScript e os tipos do Node como dependências de desenvolvimento
npm install -D @playwright/test typescript @types/node

# 3. Baixar os browsers que o Playwright usa para rodar os testes
#    (Chromium, Firefox e WebKit — não são os browsers instalados no seu Windows,
#    são versões próprias que o Playwright baixa e controla)
npx playwright install --with-deps chromium firefox webkit
```

Depois disso, foram criados manualmente (pelo Claude): o `playwright.config.ts` (configuração — qual site testar, quais browsers, como gerar relatórios), o `tsconfig.json` (configuração do TypeScript) e toda a estrutura de pastas explicada abaixo.

Para clonar este repositório e rodar os testes você mesmo, depois do `git clone`:

```bash
npm install                                          # instala as dependências já listadas no package.json
npx playwright install --with-deps chromium firefox webkit   # baixa os browsers
npm test                                             # roda a suíte inteira
```

## Estrutura do projeto

```
.
├── playwright.config.ts   # configuração (baseURL, projetos/browsers, relatórios)
├── tests/                 # specs de teste
│   ├── home.spec.ts
│   ├── login.spec.ts
│   ├── login-perfis.spec.ts
│   └── cadastro.spec.ts
├── pages/                 # Page Object Model
│   ├── HomePage.ts
│   ├── LoginPage.ts
│   └── CadastroPage.ts
├── test-data/             # massa de dados (usuários, cupons e dados de cadastro)
│   ├── users.ts
│   └── cadastro.ts
├── helpers/               # geradores de dados aleatórios (CPF, nome, e-mail) — sem lógica de teste
│   ├── cpf.ts
│   ├── nome.ts
│   ├── email.ts
│   └── index.ts
├── relatorios/            # grava usuario.json ao final da execução (ver seção própria)
│   ├── usuariosCriados.ts
│   └── globalTeardown.ts
├── docs/                  # planejamentos de qualidade que orientam as suítes
│   └── Planejamento_Qualidade_Cadastro_QArena.docx
├── evidencias/            # screenshots gerados por login-perfis.spec.ts (por browser/perfil/passo)
└── usuario.json           # gerado a cada execução de cadastro.spec.ts — ver seção própria
```

## Pré-requisitos

- Node.js 18+
- Dependências e browsers já instalados neste setup (`npm install` + `npx playwright install`)

## Comandos

```bash
npm test              # roda todos os testes (chromium, firefox, webkit) em modo headless
npm run test:headed   # roda com o browser visível
npm run test:ui       # abre o Playwright UI Mode (interativo)
npm run test:debug    # roda em modo debug (Playwright Inspector)
npm run test:chromium # roda só no Chromium
npm run report        # abre o último relatório HTML gerado
```

## Testes de exemplo incluídos

- **home.spec.ts** — smoke test da página inicial e navegação para o login.
- **login.spec.ts** — login com sucesso, usuário inexistente, conta suspensa e um teste marcado com `test.fail()` que documenta um bug conhecido do laboratório (conta bloqueada consegue logar).
- **login-perfis.spec.ts** — cenário data-driven que roda o fluxo de login (acessar tela → preencher usuário → preencher senha → confirmar) para cada perfil da massa de dados (sucesso, bloqueado, sem permissão, suspenso, inválido), validando o resultado esperado de cada um e tirando um print em cada passo.
- **cadastro.spec.ts** — os 19 cenários de [`docs/Planejamento_Qualidade_Cadastro_QArena.docx`](docs/Planejamento_Qualidade_Cadastro_QArena.docx) (6 de sucesso 🟢, 7 de erro 🔴, 6 de exceção 🟡, mais 1 teste extra de observação), incluindo verificação do estado persistido no `localStorage` (chave `qarena-auth`), não só do que aparece na tela.

Os testes marcados com `@bug` e `test.fail()` servem para deixar explícito o comportamento esperado vs. o comportamento real do QArena (que é um ambiente cheio de bugs plantados de propósito). Se algum desses bugs for corrigido no site, o teste correspondente vai quebrar a suíte, sinalizando a mudança. Os cenários de exceção que o planejamento marca como "ponto em aberto" (sem confirmação de produto) são documentados como testes normais que passam hoje, refletindo o comportamento atual — não são tratados como bug até alguém decidir isso.

### Bugs confirmados por `cadastro.spec.ts` (com `test.fail()`)

| Cenário | Bug |
|---|---|
| 🔴 5 | Confirmação de senha divergente não bloqueia — a conta é criada com o valor de "Senha", ignorando "Confirmar senha". |
| 🔴 6 | Mensagem de erro de campo não some ao corrigir o campo, só num novo envio. |
| 🔴 7 | Reenviar o formulário sem alterar nada cria uma segunda conta idêntica. |
| 🟡 6 | Telefone celular (9 dígitos) é truncado para 8 dígitos ao ser salvo. |
| 🔴 1 (parcial) | O toast "Conta criada com sucesso!" aparece por ~250ms mesmo com o formulário inválido, antes de sumir sozinho. |

### Correção ao documento original: CPF É validado

O documento concluiu que não há validação de dígito verificador de CPF, citando `111.111.111-11` como prova (foi aceito). Esta automação descobriu que essa conclusão está incorreta: esse número em particular **satisfaz matematicamente** o algoritmo padrão de checksum de CPF (módulo 11) — não é o "óbvio inválido" que parece ser, é só uma coincidência de dígitos repetidos. Testando com um CPF genuinamente inválido (base aleatória + dígito verificador incorreto, gerado por [`helpers/cpf.ts`](helpers/cpf.ts)), a tela rejeita corretamente com "Informe um CPF válido". Os dois casos ficam documentados lado a lado em `🟡 Cenário 3` e `🟡 Observação` em [`tests/cadastro.spec.ts`](tests/cadastro.spec.ts). Vale atualizar o planejamento original com essa correção.

## Funções auxiliares de geração de dados

[`helpers/`](helpers) reúne geradores de dados aleatórios, sem nenhuma lógica de teste — só para reutilizar em qualquer cenário ou spec futuro:

- **`cpf.ts`** — `gerarCpfValido()` (checksum matematicamente correto) e `gerarCpfComDigitoInvalido()` (formato correto, checksum propositalmente quebrado).
- **`nome.ts`** — `gerarNomeCompleto()` (primeiro nome + sobrenome aleatórios).
- **`email.ts`** — `gerarEmailAleatorio(nomeBase?)` (sempre único, para nunca colidir com contas existentes).

A factory `usuarioValido()` em [`test-data/cadastro.ts`](test-data/cadastro.ts) já usa essas três funções por padrão para nome, e-mail e CPF — todo cadastro novo criado pelos testes sai com dados diferentes a cada execução. A senha é sempre a constante `SENHA_PADRAO` (`QA@123456`), a mesma para todo cadastro novo, a menos que um cenário sobrescreva isso de propósito (ex.: os testes de senha divergente ou senha curta).

## Evidências de teste

`login-perfis.spec.ts` salva um print (`page.screenshot`) a cada passo do fluxo — tela de login, usuário preenchido, senha preenchida e resultado final — em:

```
evidencias/login/<browser>/<perfil>/
  01-tela-login.png
  02-usuario-preenchido.png
  03-senha-preenchida.png
  04-resultado.png
```

Como os testes rodam em paralelo nos três browsers (chromium, firefox, webkit), cada um grava em sua própria subpasta para não sobrescrever a evidência dos outros. A pasta é recriada a cada execução — não é necessário limpá-la manualmente, mas ela não deve ser versionada no Git (ver `.gitignore`).

## Relatório usuario.json

Toda vez que `cadastro.spec.ts` roda, cada teste registra o resultado da sua tentativa de cadastro, e ao final da execução (`npx playwright test`, com qualquer combinação de projetos/browsers) um `usuario.json` é gerado na raiz do projeto, **substituindo por completo** o de qualquer execução anterior — não acumula histórico.

Formato:

```json
{
  "geradoEm": "2026-08-25T22:26:02.199Z",
  "totalRegistros": 55,
  "usuarios": [
    {
      "tipo": "🟢 Cenário 1 - Cadastro completo com dados válidos",
      "navegador": "chromium",
      "dataExecucao": "2026-08-25T22:20:45.109Z",
      "contaCriada": true,
      "dadosDigitados": { "nome": "...", "email": "...", "cpf": "...", "telefone": "...", "senha": "...", "confirmarSenha": "..." },
      "dadosPersistidos": { "nome": "...", "email": "...", "cpf": "...", "telefone": "...", "senha": "...", "numeroConta": "QA-0005", "creditos": 1000 }
    }
  ]
}
```

- **`tipo`** — o cenário que gerou o registro (título do teste), no lugar dos "perfis" usados no login (sucesso/bloqueado/...) — na tela de cadastro não existe esse conceito, então usamos o nome do próprio cenário do documento.
- **`dadosDigitados`** vs **`dadosPersistidos`** — ficam lado a lado de propósito. Quando os dois divergem (ex.: no bug de confirmação de senha, `dadosDigitados.confirmarSenha` é diferente do que foi salvo) ou `dadosPersistidos` é `null` (nenhuma conta foi criada), isso já fica visível direto no JSON.
- Testes que só navegam sem tentar um cadastro (ex.: clicar no link "Massa de Dados") não geram registro.

Como funciona por trás: cada teste grava seu próprio arquivo temporário em `relatorios/.tmp/` (via `registrarUsuario()` em [`relatorios/usuariosCriados.ts`](relatorios/usuariosCriados.ts)) em vez de acumular em memória — isso evita corrupção de dados quando os testes rodam em paralelo, em workers/processos diferentes. Um `globalTeardown` ([`relatorios/globalTeardown.ts`](relatorios/globalTeardown.ts), configurado em `playwright.config.ts`) junta todos os temporários num único `usuario.json` só depois que todos os testes/projetos terminam, e apaga a pasta temporária. Se você rodar algum outro spec sem tocar em `cadastro.spec.ts`, o `usuario.json` existente não é mexido.

## Massa de dados

Os usuários e cupons de teste usados nos specs de login vêm de [`test-data/users.ts`](test-data/users.ts), espelhando a página [`/massa-de-dados`](https://qarenaqa.vercel.app/massa-de-dados) do próprio QArena. Cada perfil tem um `expectedOutcome` (`entra`/`barrado`) e, quando aplicável, a mensagem de erro esperada — isso é o que os testes usam para validar o resultado do login.

Os dados usados nos specs de cadastro vêm de [`test-data/cadastro.ts`](test-data/cadastro.ts): a factory `usuarioValido()` (nome, e-mail e CPF aleatórios via `helpers/`, senha fixa), telefones fixo/celular para evidenciar o bug de truncamento, e o CPF de um usuário seed para testar duplicidade. Ver a seção "Funções auxiliares de geração de dados" abaixo para detalhes dos geradores.

## Próximos passos sugeridos

- Adicionar specs para Loja, Carrinho, Cupom e Checkout, Perfil do Usuário e Meus Pedidos.
- Criar uma fixture de autenticação (`storageState`) para reaproveitar login entre specs da área logada.
- Configurar execução em CI (GitHub Actions) com `playwright.config.ts` já preparado para `process.env.CI`.

## Créditos

- **Ambiente sob teste ([QArena](https://qarenaqa.vercel.app/)) e planejamento de qualidade:** Andreline Lira, Engenheira de Qualidade de Software Sênior, criadora do QArena e do curso QA do Zero.
- **Código, estrutura e cenários de teste:** [Claude](https://claude.com/claude-code) (Anthropic), a partir dos pedidos e da condução de Andreline em aula.
