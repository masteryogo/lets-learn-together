/* Computer Vision — a trilha montada, na ordem das iterações. */
import { ROADMAP as base } from "./data.js";

import base04 from "./conteudo-1-base.js";
import deep from "./conteudo-2-deep.js";
import avancado from "./conteudo-3-avancado.js";

export const ROADMAP = {
  ...base,
  etapas: [...base04, ...deep, ...avancado],
};

export { PROJETOS, RECURSOS, LEGENDA, ESTADOS, CRITERIOS } from "./data.js";
