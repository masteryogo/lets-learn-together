/* ============================================================
   Quadro de trabalho — dados

   Espelha o .kanban (rascunho local). Card sem `porque` não entra:
   o valor do quadro é o motivo, não a lista.
   ============================================================ */

export const KANBAN_COLUNAS = [
  { id: "fazer",     rotulo: "A fazer" },
  { id: "bloqueado", rotulo: "Bloqueado por BaaS",
    nota: "Estão aprovadas na intenção e paradas pelo mesmo motivo: o estado mora só no localStorage, que aqui guarda apenas coisa refazível. O Safari apaga localStorage de site sem interação em 7 dias — e um roadmap de estudo é exatamente o site que fica duas semanas fechado." },
  { id: "analise",   rotulo: "Em análise" },
  { id: "descartado", rotulo: "Descartado" },
  { id: "concluido",  rotulo: "Concluído",
    nota: "O que saiu do papel. Fica no quadro porque a decisão continua valendo depois de pronta: é aqui que se confere o que foi prometido contra o que de fato existe." }
];

export const KANBAN_RAIAS = [
  { id: "arquitetura", rotulo: "Arquitetura" },
  { id: "interface",   rotulo: "Interface" },
  { id: "conteudo",    rotulo: "Conteúdo e configuração" }
];

export const KANBAN_NUMEROS = {
  medidoEm: "2026-10-16",
  trilhas: [
    { rotulo: "ml", grupos: 15, topicos: 157 },
    { rotulo: "cv", grupos: 24, topicos: 141 },
    { rotulo: "langchain", grupos: 11, topicos: 55 }
  ]
};

/* ordem: dentro de "fazer" na raia arquitetura ela é sequencial —
   componentes vem antes ou junto do Supabase, nunca depois. */
export const KANBAN_CARDS = [
  {
    id: "componentes",
    titulo: "Componentes (Svelte)",
    raia: "arquitetura", coluna: "concluido",
    resumo: "Feito em 18/10/2026. Destrava a coluna Bloqueado por BaaS.",
    blocos: [
      { tipo: "lista", itens: [
        "Leitura de dados remotos. app.js monta o DOM uma vez, a partir de globais já carregados. Dado que chega depois — do Supabase, assíncrono, e que muda quando outra aba marca um tópico — não tem para onde ir.",
        "Criar componente novo fica barato. Drawer, ficha, chip de rodapé e carta hoje são funções que concatenam string e colam no DOM."
      ] },
      { tipo: "p", texto: "Custo conhecido: quebra o contrato de ordem de carga do CLAUDE.md (s.async = false, ES5 em IIFE, sem bundler). A trilha vira import, e trilhas.js deixa de ser carregador para virar só manifesto." },
      { tipo: "p", texto: "O site ser estático é condição de protótipo, não decisão. O alvo é Svelte na frente, Supabase como BaaS e Deno edge para o que precisa de servidor — push agendado, segredo que não pode ir para o navegador, trabalho que não é do cliente. Os cards devem ser lidos contra esse alvo: limitação que só existe hoje (file://, sem build, sem conta) não é argumento para recusar nada." },
      { tipo: "p", texto: "Entregue: SvelteKit com adapter-static, cinco rotas pré-renderizadas e deploy no Pages por Action. O progresso virou uma classe reativa, e é nela e no mural de notas que o Supabase entra — os dois pontos estão isolados e comentados." },
      { tipo: "p", texto: "O que não veio junto, e vale saber antes do próximo card: o CSS continua global por tela, então a travessia entre elas é documento novo (data-sveltekit-reload). Enquanto for assim, link interno novo precisa disso e do prefixo base. Abrir por file:// deixou de funcionar." }
    ],
    porque: "Vinha antes ou junto do Supabase, não depois — senão a camada de leitura seria escrita duas vezes."
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

  { id: "aba-calendario", titulo: "Aba de calendário", raia: "interface", coluna: "fazer",
    resumo: "Grade de mês no próprio site, com modelo do mês por proporção — o que o Google não faz. Layout de pé; falta o comportamento.",
    blocos: [
      { tipo: "lista", itens: [
        "Escrever no calendário do site: clicar num dia e anotar o que vai estudar, sem sair da página.",
        "Um modo de cada vez: ou o calendário do Lets learn together, ou o do Google. Nunca os dois.",
        "No modo Google a escrita é chamada de API; no modo Lets learn together é gravação no nosso banco. Mesma tela, dois destinos.",
        "A exclusividade é o que torna o card barato: sem dois donos simultâneos, não existe sincronização — nem merge, nem conflito, nem evento duplicado.",
        "O uso real é por trilha em blocos repetidos (Machine Learning 7:30pm, OpenCV 7:30pm), não por tópico — a grade deve falar essa língua."
      ] },
      { tipo: "p", texto: "Decidido: o calendário é dono dos eventos, não uma vista. No modo Google o dono é o Google e a escrita é chamada de API, com OAuth e escopo calendar.events. No modo Lets learn together o dono somos nós e a escrita vai para o Postgres do Supabase — depende do banco e da conta, não do localStorage." },
      { tipo: "p", texto: "Consequência na ordem: o modo Google é construível primeiro, porque não espera o banco. O modo Lets learn together não sai antes do Supabase e da conta — o inverso não é indesejável, é impossível." },
      { tipo: "p", texto: "O motivo de conectar o Google é notificação: o lembrete chega no celular com o site fechado. Dá para empatar no modo próprio — Web Push disparado por uma Edge Function em Deno, acordada por agendamento no banco — então não é limitação de arquitetura, é trabalho a mais. O que não se empata é o lembrete cair na agenda que a pessoa já abre todo dia, junto com o resto da vida dela, em vez de numa notificação isolada." },
      { tipo: "p", texto: "Troca de modo, decidida: o site recusa trocar enquanto houver eventos locais, e oferece exportar antes. Perder plano escrito em silêncio é o pior desfecho, e migrar automático inventa eventos no calendário real de alguém." },
      { tipo: "p", texto: "O modelo do mês é o motivo de existir um calendário próprio. No Google a unidade é o evento; aqui é a proporção: declara-se a janela (seg–sáb, a partir das 19h, 1h30 por sessão) e a mistura em dias (50% ML, 40% OpenCV, 10% Projetos), e o mês se preenche. Recorrência não sabe alternar assunto, então isso não é um RRULE — é um dia de cada vez, o que no modo Google significa ~26 chamadas por mês e tratamento de falha parcial." },
      { tipo: "lista", itens: [
        "A porcentagem é de dias, não de horas: é o que se confere olhando a grade.",
        "Aplicar nunca reescreve o passado — escreve de hoje em diante, e os dias já estudados contam na cota. Efeito aceito: dia elegível que passou em branco some da cota, em vez de empilhar três sessões na mesma semana para compensar.",
        "Distribuição intercalada, pelo maior déficit: 13 dias seguidos de ML fecham a mesma conta e matam a outra trilha na semana."
      ] },
      { tipo: "p", texto: "De pé (layout, out/2026): calendario.html e calendario.css com a grade do mês, a ficha do dia (régua de 17h à 1h, sessões, formulário), a tira do modelo e o diálogo de configuração; a entrada é uma carta na mesa, pregada com alfinete e fora da fileira das trilhas, com cascata nos dias ao clicar. Nada disso tem comportamento ainda." },
      { tipo: "lista", itens: [
        "Falta 1 — calendario.js: ?trilha= ligando a aba ativa, abrir e fechar o diálogo, selecionar o dia, escrever à mão. É só DOM, não espera nada.",
        "Falta 2 — distribuição: cotas por maior resto e reparte pelo maior déficit. Lógica pura, e a única parte que erra em silêncio: testar antes de ligar na tela.",
        "Falta 3 — persistência, e aqui o card para: no modo próprio depende do Supabase e da conta; no modo Google, de OAuth com escopo calendar.events."
      ] }
    ],
    porque: "É a única parte do projeto que sabe quando você estuda — o roadmap só sabe o quê. O layout está de pé; o que falta é comportamento, e só o último passo (persistência) espera o banco.",
    vejaTambem: ["anotacoes", "supabase", "login"] },

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

  { id: "anotacoes", titulo: "Notas em post-it", raia: "interface", coluna: "bloqueado",
    resumo: "Mural de post-its por trilha, em aba própria. Substitui o campo de texto dentro do drawer do tópico.",
    blocos: [
      { tipo: "p", texto: "Mudou de ideia em outubro de 2026: a proposta original era um campo de texto livre por tópico, numa seção nova do drawer. Ficou pequena demais — a maior parte do que se anota estudando não cabe em um tópico só." },
      { tipo: "p", texto: "A nota é uma só, vista de dois lugares: nasce solta na trilha e pode ser ancorada num tópico. Ancorada, aparece no mural e no drawer daquele tópico; solta, só no mural. Uma entidade com dois pontos de entrada, e não dois recursos escrevendo a mesma ideia em lugares que nunca se encontram. A nota guarda trilha, texto, cor, tópico opcional e posição opcional." },
      { tipo: "lista", itens: [
        "Abas por trilha, como no calendário: notas.html?trilha=ml com uma aba Todas. Mesma solução nas duas telas novas, e cada filtro é um endereço.",
        "A cor é de quem escreve, não da trilha: a trilha já é a aba. Serve para separar dúvida, ideia e erro que não se quer repetir.",
        "Arranjo responsivo, decidido: mural livre arrastando em tela larga, com a posição guardada por nota; grade que flui no celular, mais recente primeiro. A posição é adorno, não dado — nota sem x/y cai numa vaga automática, e no celular x/y é ignorado.",
        "Com BaaS, cai a necessidade de exportar/importar como pré-requisito. Sem BaaS, exportar/importar vinha antes — não junto.",
        "Entrar na busca não é de graça: o corpus de buscar() é titulo + desc + detalhe. Somar a nota é uma linha, mas um tópico que casa só pela anotação aparece no mapa sem pista de por quê. Precisa de um sinal na linha."
      ] }
    ],
    porque: "Texto escrito não se refaz. É o primeiro dado do projeto que não é reconstruível clicando, e isso muda o contrato de durabilidade da aplicação inteira — um mural perdido não se reconstrói nem com esforço.",
    vejaTambem: ["supabase", "login", "aba-calendario"] },
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
