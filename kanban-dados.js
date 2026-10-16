/* ============================================================
   Quadro de trabalho — dados

   Espelha o .kanban (rascunho local). Card sem `porque` não entra:
   o valor do quadro é o motivo, não a lista.
   ============================================================ */

const KANBAN_COLUNAS = [
  { id: "fazer",     rotulo: "A fazer" },
  { id: "bloqueado", rotulo: "Bloqueado por BaaS",
    nota: "Estão aprovadas na intenção e paradas pelo mesmo motivo: o estado mora só no localStorage, que aqui guarda apenas coisa refazível. O Safari apaga localStorage de site sem interação em 7 dias — e um roadmap de estudo é exatamente o site que fica duas semanas fechado." },
  { id: "analise",   rotulo: "Em análise" },
  { id: "descartado", rotulo: "Descartado" }
];

const KANBAN_RAIAS = [
  { id: "arquitetura", rotulo: "Arquitetura" },
  { id: "interface",   rotulo: "Interface" },
  { id: "conteudo",    rotulo: "Conteúdo e configuração" }
];

const KANBAN_NUMEROS = {
  medidoEm: "2026-10-16",
  trilhas: [
    { rotulo: "ml", grupos: 15, topicos: 157 },
    { rotulo: "cv", grupos: 24, topicos: 141 },
    { rotulo: "langchain", grupos: 11, topicos: 55 }
  ]
};

/* ordem: dentro de "fazer" na raia arquitetura ela é sequencial —
   componentes vem antes ou junto do Supabase, nunca depois. */
const KANBAN_CARDS = [
  {
    id: "componentes",
    titulo: "Componentes (Svelte)",
    raia: "arquitetura", coluna: "fazer",
    resumo: "Destrava a coluna Bloqueado por BaaS.",
    blocos: [
      { tipo: "lista", itens: [
        "Leitura de dados remotos. app.js monta o DOM uma vez, a partir de globais já carregados. Dado que chega depois — do Supabase, assíncrono, e que muda quando outra aba marca um tópico — não tem para onde ir.",
        "Criar componente novo fica barato. Drawer, ficha, chip de rodapé e carta hoje são funções que concatenam string e colam no DOM."
      ] },
      { tipo: "p", texto: "Custo conhecido: quebra o contrato de ordem de carga do CLAUDE.md (s.async = false, ES5 em IIFE, sem bundler). A trilha vira import, e trilhas.js deixa de ser carregador para virar só manifesto." }
    ],
    porque: "Vem antes ou junto do Supabase, não depois — senão a camada de leitura é escrita duas vezes."
  },
  { id: "supabase", titulo: "Supabase DB + Auth", raia: "arquitetura", coluna: "fazer",
    resumo: "Persistência de verdade.",
    porque: "Pré-requisito das anotações e da rota condicional." },
  { id: "login", titulo: "Tela de login e cadastro", raia: "arquitetura", coluna: "fazer",
    resumo: "Validação por e-mail ou telefone, com token gerado localmente.",
    porque: "Sem conta, o Supabase não tem a quem atribuir o progresso." },
  { id: "botao-conta", titulo: "Botão de conta", raia: "arquitetura", coluna: "fazer",
    resumo: "No canto superior direito.",
    porque: "Entrada da conta precisa de lugar fixo, fora da área que muda por trilha." },

  { id: "ocultar-pulados", titulo: "Ocultar pulados", raia: "interface", coluna: "fazer",
    resumo: "Com uma janelinha tipo lixeira que desoculta.",
    porque: "A ficha da rota condicional argumenta que esconder sem explicar faz o tópico parecer inexistente — aqui a janelinha é justamente o que explica.",
    vejaTambem: ["rota-condicional"] },
  { id: "feito-verde", titulo: "Tópico concluído fica verdinho", raia: "interface", coluna: "fazer",
    resumo: "Cor no estado feito, somada à marca ■ que já existe.",
    porque: "A cor entra como reforço, não como único sinal — o estado continua legível sem ela." },
  { id: "mover-tema", titulo: "Mover tema e reset", raia: "interface", coluna: "fazer",
    resumo: "Para o canto inferior esquerdo da sidebar.",
    porque: "São controles do site, não da trilha: não disputam o topo com o conteúdo." },
  { id: "inverter-shift", titulo: "Inverter shift+clique", raia: "interface", coluna: "fazer",
    resumo: "Trocar o gesto com shift pelo clique normal.",
    porque: "O gesto mais usado deve ser o mais barato." },

  { id: "i18n", titulo: "Outros idiomas (i18n)", raia: "conteudo", coluna: "fazer",
    resumo: "Hoje o PT-BR está embutido no markup, nos dados das trilhas e nos próprios identificadores.",
    porque: "Identificador em português é convenção do repositório — traduzir a interface não pode virar renomeação de código." },
  { id: "inventario-config", titulo: "Inventário de configuração", raia: "conteudo", coluna: "fazer",
    resumo: "Levantar tudo que é configuração individual e pode ser mudado.",
    porque: "Inventário primeiro; tela de preferências depois, se valer." },
  { id: "gerador-rex", titulo: "Gerador de Rex aleatório", raia: "conteudo", coluna: "fazer",
    resumo: "Um Rex novo a cada visita.",
    porque: "Não pode sair igual a um já existente." },
  { id: "painel-roadmaps", titulo: "Painel criativo de roadmaps", raia: "conteudo", coluna: "fazer",
    resumo: "Criar e editar trilha pela interface.",
    porque: "Hoje trilha nova é escrever trilhas/<id>/*.js à mão e acertar a contagem no manifesto." },

  { id: "anotacoes", titulo: "Anotações por tópico", raia: "interface", coluna: "bloqueado",
    resumo: "Campo de texto livre por tópico, numa seção nova do drawer.",
    blocos: [
      { tipo: "lista", itens: [
        "Com BaaS, cai a necessidade de exportar/importar como pré-requisito. Sem BaaS, exportar/importar vinha antes — não junto.",
        "Entrar na busca não é de graça: o corpus de buscar() é titulo + desc + detalhe. Somar a nota é uma linha, mas um tópico que casa só pela anotação aparece no mapa sem pista de por quê. Precisa de um sinal na linha."
      ] }
    ],
    porque: "Texto escrito não se refaz. É o primeiro dado do projeto que não é reconstruível clicando, e isso muda o contrato de durabilidade da aplicação inteira." },
  { id: "rota-condicional", titulo: "Rota condicional", raia: "interface", coluna: "bloqueado",
    resumo: "Caminhos alternativos dentro da trilha — pular visão computacional se o objetivo é NLP.",
    blocos: [
      { tipo: "lista", itens: [
        "Marcar no grupo, não no tópico: 50 marcações contra 353.",
        "Rotas num rotas.js à parte, seguindo a separação que trilhas.js já faz.",
        "Atenuar o que está fora, não esconder. Reaproveitar o mecanismo do data-oculto da busca, com atributo próprio (data-fora-da-rota) e CSS próprio. Esconder é certo para busca — transitório, explicado pelo campo preenchido — e errado para rota."
      ] },
      { tipo: "p", texto: "Decisão pendente, e é a difícil: o que a barra de progresso passa a medir, e quando a faixa de fim de trilha dispara. Posição defendida: a barra mede a rota, e a faixa diz qual rota foi concluída — senão você escolhe um caminho mais curto e a barra continua lembrando do que decidiu não fazer." }
    ],
    porque: "A rota escolhida também é estado do usuário, com o mesmo problema de durabilidade das anotações." },

  { id: "criterios-grupo", titulo: "Critérios por grupo", raia: "interface", coluna: "analise",
    resumo: "Alternativa barata ao quiz; não foi aprovada nem recusada.",
    blocos: [
      { tipo: "p", texto: "O problema por trás do quiz é \"estou me enganando sobre o que marquei como feito?\". CRITERIOS já existe para isso, mas o ML tem 4 frases genéricas para a trilha inteira. O CV já tem critério por etapa, e preencherCriterios() já lê etapa.criterios com fallback para o global." },
      { tipo: "p", texto: "Descer para o grupo seriam 50 frases escritas à mão, sem código novo além de ler grupo.criterios. Sem banco de perguntas, sem correção, sem nota." }
    ],
    porque: "Resolve a dúvida que motivou o quiz sem trazer avaliação junto.",
    vejaTambem: ["quiz"] },

  { id: "quiz", titulo: "Quiz por tópico", raia: "interface", coluna: "descartado",
    resumo: "Banco de perguntas em JSON, gerado por LLM e revisado à mão.",
    blocos: [
      { tipo: "lista", itens: [
        "O roadmap não afirma nada sobre o que você sabe — é uma lista que você controla. Quiz introduz avaliação, e aí a qualidade das perguntas vira a qualidade do produto.",
        "353 tópicos × 3 perguntas ≈ 1.000 perguntas para revisar à mão. Uma pergunta errada contamina a confiança no roadmap inteiro.",
        "Conflita com a decisão de tirar os contadores da interface, tomada porque placar desmotiva."
      ] },
      { tipo: "p", texto: "Se voltar à mesa, que seja a partir de uso observado, não de aposta." }
    ],
    porque: "Não é questão de custo, é de produto." }
];
