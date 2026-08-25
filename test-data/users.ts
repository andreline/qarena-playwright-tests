export interface PerfilLogin {
  email: string;
  password: string;
  description: string;
  /** Comportamento realmente observado no QArena ao logar com este perfil. */
  expectedOutcome: 'entra' | 'barrado';
  /** Mensagem de erro exibida na tela de login, quando o acesso é barrado. */
  expectedMessage?: string;
  /** Marca perfis cujo comportamento observado diverge do esperado (bug plantado). */
  bugConhecido?: boolean;
}

export const users: Record<string, PerfilLogin> = {
  sucesso: {
    email: 'usuario.sucesso@qazero.com',
    password: 'Qa@123456',
    description: 'Login funciona normalmente',
    expectedOutcome: 'entra',
  },
  bloqueado: {
    email: 'usuario.bloqueado@qazero.com',
    password: 'Qa@123456',
    description: 'Deveria ser barrado por bloqueio',
    expectedOutcome: 'entra',
    bugConhecido: true,
  },
  semPermissao: {
    email: 'usuario.sempermissao@qazero.com',
    password: 'Qa@123456',
    description: 'Entra, mas sem permissão de acesso',
    expectedOutcome: 'entra',
  },
  suspenso: {
    email: 'usuario.suspenso@qazero.com',
    password: 'Qa@123456',
    description: 'Conta suspensa, login deve ser barrado com mensagem clara',
    expectedOutcome: 'barrado',
    expectedMessage: 'Esta conta está suspensa e sem acesso ao sistema.',
  },
  invalido: {
    email: 'usuario.invalido@qazero.com',
    password: 'qualquer',
    description: 'Não existe, serve para testar erro',
    expectedOutcome: 'barrado',
    expectedMessage: 'Usuário não encontrado',
  },
};

export const coupons = {
  boasVindas: { code: 'QA10', description: '10% de desconto, cupom de boas-vindas' },
  novosAlunos: { code: 'BEMVINDO15', description: '15% de desconto para novos alunos' },
  expirado: { code: 'PROMOEXPIRADA', description: '20% de desconto, promoção já expirada' },
};
