/* ============================================================
   Roadmap de LangChain e LangGraph — metadados e montagem
   Fonte: AI Enginner/LangChain e LangGraph/Roadmap de LangChain e LangGraph.md

   Mesmo esquema das outras trilhas. Aqui cada fase traz também
   `duracao` (o tempo sugerido da tabela de visão geral) e seus
   próprios `criterios`, derivados do "Critério de domínio".
   ============================================================ */

const ROADMAP_ETAPAS = [];

const ROADMAP = {
  id: "langchain",
  titulo: "LangChain e LangGraph",
  subtitulo: "Oito fases, de cliente tipado a agente supervisionado",
  fonte: {
    rotulo: "Documentação oficial do LangChain e do LangGraph",
    url: "https://docs.langchain.com/oss/python/langgraph/overview",
    consultadoEm: "2026-08-30",
  },
  etapas: ROADMAP_ETAPAS,
};

/* ------------------------------------------------------------
   Projetos — o "Projeto" de cada fase
   ------------------------------------------------------------ */
const PROJETOS = {
  "f0-prereq": [
    "Criar um cliente mínimo para um modelo de chat que receba texto e devolva uma estrutura tipada: assunto, intenção e nível de urgência de uma mensagem.",
  ],
  "f1-fundamentos": [
    "Construir um pipeline de triagem que classifique a solicitação, extraia campos para um schema, gere a resposta adequada à categoria e registre entradas, saídas e falhas.",
  ],
  "f2-agentes": [
    "Criar um agente assistente com três ferramentas locais: consultar uma base de produtos, calcular um valor e registrar uma solicitação em armazenamento de teste.",
    "Adicionar validação de argumentos, mensagens de erro úteis e confirmação antes de qualquer ação com efeito externo.",
  ],
  "f3-rag": [
    "Construir um assistente para consultar um conjunto pequeno de documentos, apresentando as fontes recuperadas e admitindo quando não houver evidência suficiente.",
  ],
  "f4-grafos": [
    "Implementar um workflow de pesquisa: recebe a pergunta, cria um plano, executa pesquisas em paralelo, verifica se as evidências bastam, repete a busca quando necessário e sintetiza a resposta.",
    "Começar com funções determinísticas ou simuladas e só depois conectar o LLM.",
  ],
  "f5-persistencia": [
    "Evoluir o workflow para preparar uma ação sensível, pausar antes de executá-la e permitir que uma pessoa aprove, altere ou rejeite.",
    "Reiniciar o processo e confirmar que ele retoma usando o mesmo `thread_id`.",
  ],
  "f6-streaming": [
    "Mostrar tokens e etapas conforme são produzidos.",
    "Manter o histórico da thread.",
    "Recordar uma preferência do usuário entre threads.",
    "Encapsular pesquisa e revisão em subgrafos.",
  ],
  "f7-producao": [
    "Projeto final — assistente de pesquisa e ação supervisionada: classifica a solicitação, recupera documentos, planeja e usa ferramentas, pede aprovação para ações sensíveis, mantém memória autorizada, transmite progresso, registra traces e é avaliado contra perguntas normais e cenários adversariais.",
  ],
};

/* ------------------------------------------------------------
   Recursos — as fontes oficiais, distribuídas por fase
   ------------------------------------------------------------ */
const RECURSOS = [
  { etapa: "f0-prereq", titulo: "LangChain Academy", url: "https://academy.langchain.com/", nota: "Curso oficial, bom ponto de partida" },

  { etapa: "f1-fundamentos", titulo: "LangChain — visão geral", url: "https://docs.langchain.com/oss/python/langchain/overview", nota: "Componentes e Runnables" },

  { etapa: "f2-agentes", titulo: "LangChain — agentes", url: "https://docs.langchain.com/oss/python/langchain/agents", nota: "`create_agent` e middleware" },
  { etapa: "f2-agentes", titulo: "LangChain — ferramentas", url: "https://docs.langchain.com/oss/python/langchain/tools", nota: "Definição e schemas" },

  { etapa: "f3-rag", titulo: "LangChain — recuperação", url: "https://docs.langchain.com/oss/python/langchain/retrieval", nota: "Retrievers e vector stores" },

  { etapa: "f4-grafos", titulo: "LangGraph — visão geral", url: "https://docs.langchain.com/oss/python/langgraph/overview", nota: "Modelo mental" },
  { etapa: "f4-grafos", titulo: "LangGraph — Graph API", url: "https://docs.langchain.com/oss/python/langgraph/graph-api", nota: "Referência do StateGraph" },
  { etapa: "f4-grafos", titulo: "LangGraph — uso do Graph API", url: "https://docs.langchain.com/oss/python/langgraph/use-graph-api", nota: "Padrões de uso" },

  { etapa: "f5-persistencia", titulo: "LangGraph — persistência", url: "https://docs.langchain.com/oss/python/langgraph/persistence", nota: "Checkpoints e threads" },
  { etapa: "f5-persistencia", titulo: "LangGraph — interrupts", url: "https://docs.langchain.com/oss/python/langgraph/interrupts", nota: "Human-in-the-loop" },

  { etapa: "f6-streaming", titulo: "LangGraph — streaming", url: "https://docs.langchain.com/oss/python/langgraph/streaming", nota: "Modos de transmissão" },
  { etapa: "f6-streaming", titulo: "LangChain — memória de longo prazo", url: "https://docs.langchain.com/oss/python/langchain/long-term-memory", nota: "Stores e namespaces" },

  { etapa: "f7-producao", titulo: "LangSmith", url: "https://docs.smith.langchain.com/", nota: "Tracing e avaliação" },
];

/* ------------------------------------------------------------
   Legenda
   ------------------------------------------------------------ */
const LEGENDA = [
  { chave: "fundamental", rotulo: "Fundamental", desc: "Ordem estrita. Não pule." },
  { chave: "importante", rotulo: "Importante", desc: "Recomendado, mas a ordem é flexível." },
  { chave: "opcional", rotulo: "Opcional", desc: "Pule sem culpa e volte depois." },
];

const ESTADOS = [
  { chave: "pendente", rotulo: "Pendente" },
  { chave: "estudando", rotulo: "Estudando" },
  { chave: "feito", rotulo: "Feito" },
  { chave: "pulado", rotulo: "Pulado" },
];

/* ------------------------------------------------------------
   Critérios globais — as perguntas de fechamento de semana
   ------------------------------------------------------------ */
const CRITERIOS = [
  "O que o framework resolveu por mim?",
  "Que estado existe e quem o modifica?",
  "O fluxo é determinístico ou decidido pelo modelo?",
  "Como o sistema falha e como observo essa falha?",
  "Eu conseguiria testar esta parte sem chamar um LLM real?",
];
