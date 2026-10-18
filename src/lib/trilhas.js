/* ============================================================
   Manifesto das trilhas.

   Só a ficha de cada trilha: o que a mesa de cartas precisa para
   desenhar a escolha sem baixar trilha nenhuma. Quem carrega o
   conteúdo é o import dinâmico da página do roadmap — este arquivo
   não injeta script, não conhece ordem de carga e não depende do
   DOM. É a metade do antigo trilhas.js que sobreviveu.

   Para acrescentar uma trilha: criar src/lib/trilhas/<id>/ e
   registrar o id aqui embaixo.

   etapas e topicos continuam escritos à mão porque são a única
   coisa que a mesa mostra e que exigiria o conteúdo inteiro para
   ser descoberta. Ao mexer no conteúdo, confira a contagem no
   rodapé do roadmap e acerte aqui.
   ============================================================ */

export const TRILHAS = {
  ml: {
    rotulo: "Machine Learning",
    /* a cor da rota desta carta — ver o cabeçalho do inicio.css */
    cor: "#2d6a8a",
    etapas: 5,
    topicos: 156,
    /* a rota da carta: um marco por etapa, num quadro de 300x240 */
    rota: [[32, 198], [96, 168], [152, 118], [216, 94], [272, 46]],
  },
  cv: {
    rotulo: "Computer Vision",
    cor: "#1c6e51",
    etapas: 14,
    topicos: 141,
    rota: [[26, 212], [62, 196], [50, 166], [88, 150], [72, 122], [114, 108],
           [98, 80], [142, 70], [134, 46], [182, 52], [198, 86], [230, 70],
           [252, 102], [282, 78]],
  },
  langchain: {
    rotulo: "LangChain e LangGraph",
    cor: "#6a4b9e",
    etapas: 8,
    topicos: 55,
    rota: [[30, 168], [62, 202], [106, 198], [142, 168], [148, 126],
           [188, 108], [234, 118], [272, 70]],
  },
};

export const PADRAO = "ml";

/* Um id desconhecido cai no padrão em vez de deixar a página vazia —
   mesma tolerância do carregador antigo, agora sem tocar em window:
   quem chama passa o valor, venha de onde vier. */
export function resolverId(id) {
  return id && Object.prototype.hasOwnProperty.call(TRILHAS, id) ? id : PADRAO;
}

/* O que sobrou do carregador: um import por trilha, escrito à mão.

   Escrito à mão de propósito — `import("./trilhas/" + id + "/index.js")`
   funcionaria, mas faria o Vite empacotar toda pasta que casasse com o
   padrão, inclusive uma trilha em rascunho. Com o mapa explícito, cada
   trilha vira um chunk só dela, baixado quando alguém a escolhe, e a
   mesa continua sem baixar nenhuma.

   Nada de bandeira SO_MANIFESTO: o manifesto acima é outro módulo, e
   quem só precisa dele nunca toca nisto aqui. */
const CARREGADORES = {
  ml: () => import("./trilhas/ml/index.js"),
  cv: () => import("./trilhas/cv/index.js"),
  langchain: () => import("./trilhas/langchain/index.js"),
};

export function carregarTrilha(id) {
  return CARREGADORES[resolverId(id)]();
}
