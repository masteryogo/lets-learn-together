/* ============================================================
   As notas, como estado reativo.

   Nada daqui sobrevive ao recarregar: é de propósito. Texto
   escrito não se refaz, e localStorage não é lugar para o que não
   se refaz — o Safari apaga o de site sem visita em 7 dias.

   Quando o Supabase entrar, é este arquivo que troca de origem:
   `itens` passa a vir do banco e `criar`/`apagar`/`mover` viram
   escritas. A tela não muda.

   Os exemplos existem porque mural vazio não ensina o gesto, e um
   mural de mentira é melhor professor que uma dica de texto.
   ============================================================ */

export const CORES = ["amarelo", "roxo", "verde", "cinza"];

/* largura e altura de uma nota, em px, para o cálculo das vagas.
   Batem com .nota no notas.css (13,5rem) — e se saírem de sincronia
   o mural só fica com as vagas mais apertadas, nunca quebrado. */
export const NOTA_L = 216;
export const NOTA_A = 196;

const EXEMPLOS = [
  { id: 1, trilha: "ml", topico: "Overfitting", cor: "amarelo", x: 24, y: 20,
    texto: "Validação cruzada não conserta vazamento de dado. Separar ANTES de normalizar." },
  { id: 2, trilha: "ml", topico: null, cor: "roxo", x: 268, y: 52,
    texto: "Perguntar no fórum: por que o recall cai tanto quando balanceio as classes?" },
  { id: 3, trilha: "ml", topico: null, cor: "cinza", x: 52, y: 236,
    texto: "Erro que não quero repetir: treinei 40 min com o shuffle desligado." },
  { id: 4, trilha: "cv", topico: "Detecção de bordas", cor: "verde", x: 36, y: 28,
    texto: "Canny: os dois limiares são razão 1:2 ou 1:3. Abaixo disso vira chuvisco." },
  { id: 5, trilha: "cv", topico: null, cor: "amarelo", x: 292, y: 96,
    texto: "findContours altera a imagem de entrada. Sempre passar uma cópia." },
];

export class Mural {
  itens = $state(EXEMPLOS.map((n) => ({ ...n })));

  #proximoId = 6;
  /* cada nota pegada sobe para o topo e fica lá: duas notas trocadas
     de lugar mantêm a ordem em que foram mexidas */
  zTopo = $state(10);

  daTrilha(trilha) {
    return this.itens.filter((n) => n.trilha === trilha);
  }

  contarDe(trilha) {
    return this.itens.filter((n) => n.trilha === trilha).length;
  }

  /* a nota nasce no topo da lista e na trilha do mural aberto */
  criar(trilha) {
    this.itens = [
      {
        id: this.#proximoId++,
        trilha,
        topico: null,
        cor: "amarelo",
        texto: "",
        x: null,
        y: null,
      },
      ...this.itens,
    ];
  }

  apagar(id) {
    this.itens = this.itens.filter((n) => n.id !== id);
  }

  /* mutação em campo de item: o $state é profundo, então escrever
     direto no objeto já avisa quem o lê */
  definir(id, campo, valor) {
    const nota = this.itens.find((n) => n.id === id);
    if (nota) nota[campo] = valor;
  }

  subir() {
    return ++this.zTopo;
  }
}

/* nota sem posição não pode nascer em cima de outra: as vagas correm
   em colunas, dentro da largura que o mural tem agora */
export function vagaLivre(indice, larguraMural) {
  const util = Math.max(larguraMural - 32, NOTA_L);
  const colunas = Math.max(Math.floor(util / NOTA_L), 1);
  return {
    x: 16 + (indice % colunas) * NOTA_L,
    y: 16 + Math.floor(indice / colunas) * NOTA_A,
  };
}

/* a torção vem do id: a mesma nota entorta sempre para o mesmo lado,
   em vez de dançar a cada redesenho */
export function torcaoDe(id) {
  return (((id * 37) % 5) - 2) * 0.6 + "deg";
}
