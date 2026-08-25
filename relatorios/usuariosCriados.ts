import fs from 'fs';
import path from 'path';
import { test } from '@playwright/test';

export interface DadosCadastroDigitados {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  senha: string;
  confirmarSenha: string;
}

export interface DadosCadastroPersistidos {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  senha: string;
  numeroConta: string;
  creditos: number;
}

export interface RegistroUsuarioCriado {
  tipo: string;
  navegador: string;
  dataExecucao: string;
  contaCriada: boolean;
  dadosDigitados: DadosCadastroDigitados;
  dadosPersistidos: DadosCadastroPersistidos | null;
}

// Cada teste grava seu próprio arquivo temporário (nome único), em vez de acumular em
// memória — assim não há corrupção de dados quando os testes rodam em paralelo, em
// workers/processos diferentes. O globalTeardown (ver globalTeardown.ts) junta tudo
// num único usuario.json ao final da execução.
const PASTA_TEMP = path.join(__dirname, '.tmp');

/**
 * Registra o resultado de uma tentativa de cadastro (feita ou não com sucesso) para
 * compor o relatório final `usuario.json`. Chamar de dentro de um teste em execução.
 */
export function registrarUsuario(dados: {
  tipo: string;
  dadosDigitados: DadosCadastroDigitados;
  dadosPersistidos: DadosCadastroPersistidos | null;
}): void {
  const registro: RegistroUsuarioCriado = {
    tipo: dados.tipo,
    navegador: test.info().project.name,
    dataExecucao: new Date().toISOString(),
    contaCriada: dados.dadosPersistidos !== null,
    dadosDigitados: dados.dadosDigitados,
    dadosPersistidos: dados.dadosPersistidos,
  };

  fs.mkdirSync(PASTA_TEMP, { recursive: true });
  const nomeArquivo = `${test.info().testId}-${Date.now()}-${Math.floor(Math.random() * 1e6)}.json`;
  fs.writeFileSync(path.join(PASTA_TEMP, nomeArquivo), JSON.stringify(registro, null, 2), 'utf-8');
}
