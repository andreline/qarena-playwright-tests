function gerarNoveDigitosAleatorios(): number[] {
  return Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
}

function calcularDigitoVerificador(digitos: number[], pesoInicial: number): number {
  const soma = digitos.reduce((acumulado, digito, indice) => acumulado + digito * (pesoInicial - indice), 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

function formatarCpf(digitos: number[]): string {
  const [d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11] = digitos;
  return `${d1}${d2}${d3}.${d4}${d5}${d6}.${d7}${d8}${d9}-${d10}${d11}`;
}

/** Gera um CPF fictício com dígito verificador matematicamente válido. */
export function gerarCpfValido(): string {
  const base = gerarNoveDigitosAleatorios();
  const d1 = calcularDigitoVerificador(base, 10);
  const d2 = calcularDigitoVerificador([...base, d1], 11);
  return formatarCpf([...base, d1, d2]);
}

/**
 * Gera um CPF com formato correto (11 dígitos com pontuação) mas dígito verificador
 * matematicamente inválido de propósito — útil para testar se a tela valida o checksum.
 */
export function gerarCpfComDigitoInvalido(): string {
  const base = gerarNoveDigitosAleatorios();
  const d1Correto = calcularDigitoVerificador(base, 10);
  const d2 = calcularDigitoVerificador([...base, d1Correto], 11);
  // Desvia o primeiro dígito verificador (mod 10) para garantir checksum inválido,
  // mantendo o formato idêntico a um CPF real.
  const d1Invalido = (d1Correto + 1) % 10;
  return formatarCpf([...base, d1Invalido, d2]);
}
