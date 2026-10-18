/* ============================================================
   Machine Learning — a trilha montada.

   Era isto que o carregador do trilhas.js fazia com `s.async =
   false`: garantir que os arquivos de conteúdo rodassem nesta
   ordem, empurrando cada etapa num array global. Agora a ordem
   está escrita, e o 4b não precisa mais procurar a etapa do 4a
   pelo id nem explodir se ela não estiver lá.
   ============================================================ */
import { ROADMAP as base } from "./data.js";

import python from "./conteudo-1-python.js";
import matematica from "./conteudo-2-matematica.js";
import pytorch from "./conteudo-3-pytorch.js";
import fundamentos from "./conteudo-4a-fundamentos.js";
import gruposFundamentos from "./conteudo-4b-fundamentos.js";
import especializacao from "./conteudo-5-especializacao.js";

/* a etapa 4 vem em duas partes: 112 dos 156 tópicos estão nela, e
   num arquivo só seria impossível de abrir */
const etapa4 = fundamentos.map((e) =>
  e.id === "fundamentos"
    ? { ...e, grupos: [...e.grupos, ...gruposFundamentos] }
    : e
);

export const ROADMAP = {
  ...base,
  etapas: [
    ...python,
    ...matematica,
    ...pytorch,
    ...etapa4,
    ...especializacao,
  ],
};

export { PROJETOS, RECURSOS, LEGENDA, ESTADOS, CRITERIOS } from "./data.js";
