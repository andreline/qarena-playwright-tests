import type { NovoUsuario } from '../pages/CadastroPage';
import { gerarCpfValido, gerarNomeCompleto, gerarEmailAleatorio } from '../helpers';

/** Senha usada em todo cadastro novo criado pelos testes, para padronizar a massa de dados. */
export const SENHA_PADRAO = 'QA@123456';

/** Telefone fixo (8 dígitos) — usado para confirmar que a máscara não trunca esse formato. */
export const telefoneFixo = '(11) 3123-4567';

/** Telefone celular (9 dígitos) — a máscara descarta o último dígito (bug confirmado). */
export const telefoneCelular = '(11) 91234-5678';

/** Como o telefone celular acima fica salvo hoje, por causa do bug de truncamento da máscara. */
export const telefoneCelularTruncado = '(11) 9123-4567';

/**
 * CPF do usuário seed "usuario.sucesso@qazero.com" (sempre presente, hardcoded no estado
 * inicial do app). Usado para testar duplicidade sem depender de uma conta criada antes.
 */
export const cpfExistenteNaMassaDeDados = '123.456.789-09';

/**
 * Monta um cadastro válido pronto para submeter: nome, e-mail e CPF são gerados
 * aleatoriamente (via `helpers/`) a cada chamada, e a senha é sempre `SENHA_PADRAO`.
 * Use `overrides` para forçar um valor específico em algum cenário (ex.: um CPF ou
 * telefone inválido de propósito).
 */
export function usuarioValido(overrides: Partial<NovoUsuario> = {}): NovoUsuario {
  const nome = gerarNomeCompleto();
  return {
    nome,
    email: gerarEmailAleatorio(nome),
    cpf: gerarCpfValido(),
    telefone: telefoneFixo,
    senha: SENHA_PADRAO,
    confirmarSenha: SENHA_PADRAO,
    ...overrides,
  };
}
