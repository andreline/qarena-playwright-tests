function normalizarParaEmail(texto: string): string {
  const inicioMarcasDiacriticas = 768;
  const fimMarcasDiacriticas = 879;

  const semAcentos = texto
    .normalize('NFD')
    .split('')
    .filter((caractere) => {
      const codigo = caractere.charCodeAt(0);
      return codigo < inicioMarcasDiacriticas || codigo > fimMarcasDiacriticas;
    })
    .join('');

  return semAcentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/(^\.|\.$)/g, '');
}

/**
 * Gera um e-mail fictício único (nunca colide com contas já existentes no ambiente,
 * já que o QArena não valida duplicidade). Se `nomeBase` for informado, o e-mail é
 * derivado dele; caso contrário usa um prefixo genérico.
 */
export function gerarEmailAleatorio(nomeBase?: string): string {
  const prefixo = nomeBase ? normalizarParaEmail(nomeBase) : 'usuario.teste';
  const sufixo = `${Date.now()}.${Math.floor(Math.random() * 100000)}`;
  return `${prefixo}.${sufixo}@example.com`;
}
