import fs from 'fs';
import path from 'path';
import type { RegistroUsuarioCriado } from './usuariosCriados';

const PASTA_TEMP = path.join(__dirname, '.tmp');
const ARQUIVO_FINAL = path.join(__dirname, '..', 'usuario.json');

/**
 * Roda uma vez ao final de `npx playwright test`, depois de todos os testes/projetos.
 * Junta os registros temporários gravados por `registrarUsuario()` (um arquivo por
 * teste, para evitar corrupção com execução em paralelo) num único `usuario.json` na
 * raiz do projeto, substituindo por completo o conteúdo da execução anterior.
 *
 * Se nenhum teste de cadastro rodou nesta execução (pasta temporária ausente), o
 * usuario.json existente é deixado como está.
 */
export default async function globalTeardown(): Promise<void> {
  if (!fs.existsSync(PASTA_TEMP)) {
    return;
  }

  const arquivos = fs.readdirSync(PASTA_TEMP).filter((nome) => nome.endsWith('.json'));
  const usuarios: RegistroUsuarioCriado[] = arquivos
    .map((nome) => JSON.parse(fs.readFileSync(path.join(PASTA_TEMP, nome), 'utf-8')))
    .sort((a, b) => a.dataExecucao.localeCompare(b.dataExecucao));

  const relatorio = {
    geradoEm: new Date().toISOString(),
    totalRegistros: usuarios.length,
    usuarios,
  };

  fs.writeFileSync(ARQUIVO_FINAL, JSON.stringify(relatorio, null, 2), 'utf-8');
  fs.rmSync(PASTA_TEMP, { recursive: true, force: true });
}
