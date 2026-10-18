/* LangChain e LangGraph — a trilha montada, na ordem das fases. */
import { ROADMAP as base } from "./data.js";

import langchain from "./conteudo-1-langchain.js";
import langgraph from "./conteudo-2-langgraph.js";

export const ROADMAP = {
  ...base,
  etapas: [...langchain, ...langgraph],
};

export { PROJETOS, RECURSOS, LEGENDA, ESTADOS, CRITERIOS } from "./data.js";
