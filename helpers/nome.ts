const primeirosNomes = [
  'Ana', 'Bruno', 'Carla', 'Diego', 'Elaine', 'Fábio', 'Gabriela', 'Hugo',
  'Isabela', 'João', 'Karina', 'Lucas', 'Mariana', 'Nathan', 'Otávio',
  'Patrícia', 'Rafael', 'Sofia', 'Thiago', 'Vitória',
];

const sobrenomes = [
  'Almeida', 'Barbosa', 'Cardoso', 'Duarte', 'Esteves', 'Ferreira',
  'Gonçalves', 'Henriques', 'Ibrahim', 'Junqueira', 'Lima', 'Martins',
  'Nogueira', 'Oliveira', 'Pereira', 'Queiroz', 'Ramos', 'Souza',
  'Teixeira', 'Vieira',
];

function itemAleatorio<T>(lista: T[]): T {
  return lista[Math.floor(Math.random() * lista.length)];
}

/** Gera um nome completo fictício (primeiro nome + sobrenome), aleatório a cada chamada. */
export function gerarNomeCompleto(): string {
  return `${itemAleatorio(primeirosNomes)} ${itemAleatorio(sobrenomes)}`;
}
