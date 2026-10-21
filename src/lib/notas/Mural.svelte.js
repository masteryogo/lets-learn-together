/* ============================================================
   As notas, como estado reativo.

   Elas persistem: a tabela `nota` no Supabase é a dona, e este
   arquivo é quem traduz os gestos do mural em escrita. Sem conta o
   mural fica vazio e recusa o gesto, como o mapa do roadmap faz
   com as marcações.

   O cuidado que o progresso não exigia é o **ritmo**: arrastar
   dispara `definir` a cada pointermove e digitar, a cada tecla. Por
   isso toda mudança de campo é agrupada por nota e só desce ao
   banco depois de uma pausa — e no `pagehide`, para quem fecha a
   aba no meio da frase.

   Havia exemplos aqui, para ensinar o gesto a quem chegava. Saíram:
   nota de mentira é indistinguível de nota de verdade até alguém
   tentar arrastá-la, e aí o mural mente sobre o que guarda. Quem
   não entrou vê o convite, que diz a verdade.
   ============================================================ */
import { sessao } from "$lib/conta/Sessao.svelte.js";
import * as remoto from "./remoto.svelte.js";

/* quanto tempo sem mexer antes de gravar. Alto o bastante para uma
   frase inteira caber numa escrita só; baixo o bastante para a
   pausa de quem pensa já garantir o texto. */
const PAUSA = 700;

export const CORES = ["amarelo", "roxo", "verde", "cinza"];

/* largura e altura de uma nota, em px, para o cálculo das vagas.
   Batem com .nota no notas.css (13,5rem) — e se saírem de sincronia
   o mural só fica com as vagas mais apertadas, nunca quebrado. */
export const NOTA_L = 216;
export const NOTA_A = 196;

export class Mural {
  itens = $state([]);

  /* true até o banco responder: o vazio de "ainda não chegou" e o de
     "não há nada" são diferentes, e a tela diz qual é qual */
  carregando = $state(false);

  /* cada gesto recusado por falta de conta incrementa isto, e a tela
     transforma em convite — recusa silenciosa parece defeito */
  recusas = $state(0);

  /* uma pausa por nota: duas notas mexidas juntas não atrasam uma à
     outra, e cada uma grava só o que mudou nela */
  #pausas = new Map();
  #pendentes = new Map();
  /* cada nota pegada sobe para o topo e fica lá: duas notas trocadas
     de lugar mantêm a ordem em que foram mexidas */

  get podeEscrever() {
    return sessao.conectado;
  }

  /* chamado no onMount da tela. Sem conta não há o que buscar, e
     inventar não é opção: o mural fica vazio. */
  async carregar() {
    if (!sessao.conectado) {
      this.itens = [];
      return;
    }
    this.carregando = true;
    const linhas = await remoto.listar();
    this.carregando = false;
    if (linhas) this.itens = linhas;
  }

  #recusar() {
    this.recusas += 1;
  }

  /* agrupa as mudanças de uma nota e grava depois da pausa */
  #agendar(id, campos) {
    const antes = this.#pendentes.get(id) ?? {};
    this.#pendentes.set(id, { ...antes, ...campos });

    clearTimeout(this.#pausas.get(id));
    this.#pausas.set(id, setTimeout(() => this.#gravar(id), PAUSA));
  }

  #gravar(id) {
    const campos = this.#pendentes.get(id);
    this.#pendentes.delete(id);
    this.#pausas.delete(id);
    if (campos) remoto.atualizar(id, campos);
  }

  /* quem fecha a aba no meio da frase não deveria perdê-la. Chamado
     pela tela no pagehide — não há await possível ali, mas a
     requisição sai antes de a página morrer. */
  descarregar() {
    for (const id of [...this.#pendentes.keys()]) {
      clearTimeout(this.#pausas.get(id));
      this.#gravar(id);
    }
  }

  daTrilha(trilha) {
    return this.itens.filter((n) => n.trilha === trilha);
  }

  contarDe(trilha) {
    return this.itens.filter((n) => n.trilha === trilha).length;
  }

  /* a nota nasce no topo da lista e na trilha do mural aberto. O id
     vem do banco: é ele a chave do {#each} e o alvo do foco, e um id
     provisório trocado depois faria a caixa perder o cursor. */
  async criar(trilha) {
    if (!this.podeEscrever) return this.#recusar();
    const nota = await remoto.criar(trilha);
    if (!nota) return;
    this.itens = [nota, ...this.itens];
    return nota.id;
  }

  apagar(id) {
    if (!this.podeEscrever) return this.#recusar();
    /* some da tela antes de o banco confirmar: apagar é o gesto em
       que esperar resposta mais parece travamento */
    this.itens = this.itens.filter((n) => n.id !== id);
    this.#pendentes.delete(id);
    clearTimeout(this.#pausas.get(id));
    remoto.apagar(id);
  }

  /* mutação em campo de item: o $state é profundo, então escrever
     direto no objeto já avisa quem o lê. A ida ao banco é agendada,
     não imediata — ver PAUSA no topo. */
  definir(id, campo, valor) {
    if (!this.podeEscrever) return this.#recusar();
    const nota = this.itens.find((n) => n.id === id);
    if (!nota) return;
    nota[campo] = valor;
    this.#agendar(id, { [campo]: valor });
  }

  /* a nota pegada sobe ao topo e fica lá. O topo é derivado do que
     está carregado, e não de um contador que nasce em 10: com o banco,
     quem volta no dia seguinte tem notas com z alto, e recomeçar do 10
     colocaria a recém-tocada embaixo de todas. */
  levantar(id) {
    if (!this.podeEscrever) return this.#recusar();
    const nota = this.itens.find((n) => n.id === id);
    if (!nota) return;

    const topo = Math.max(10, ...this.itens.map((n) => n.z ?? 10));
    if (nota.z === topo && topo > 10) return;

    nota.z = topo + 1;
    this.#agendar(id, { z: nota.z });
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
   em vez de dançar a cada redesenho. O id virou uuid com o banco, e
   texto não multiplica — então soma-se o código das letras, que é a
   mesma ideia com a entrada que existe hoje. */
export function torcaoDe(id) {
  const texto = String(id);
  let soma = 0;
  for (let i = 0; i < texto.length; i++) soma += texto.charCodeAt(i);
  return (((soma * 37) % 5) - 2) * 0.6 + "deg";
}
