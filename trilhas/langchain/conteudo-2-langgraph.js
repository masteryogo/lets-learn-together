/* LangChain e LangGraph — fases 4 a 7 (orquestrar e produzir) */

ROADMAP_ETAPAS.push(
  {
    id: "f4-grafos",
    numero: 4,
    titulo: "Fundamentos do LangGraph",
    objetivo: "Workflow com estado, decisão e ciclo.",
    descricao:
      "Aqui o controle de fluxo deixa de ser implícito e vira estrutura declarada: estado, nós e arestas. " +
      "A recomendação da fonte é começar pelo Graph API em vez da Functional API justamente porque ele " +
      "torna o fluxo VISÍVEL — e o critério de domínio desta fase é desenhar o grafo antes de programá-lo. " +
      "A outra recomendação vale ouro e quase ninguém segue: implemente o workflow inteiro com funções " +
      "determinísticas ou simuladas primeiro, e só depois conecte o LLM. " +
      "Depurar topologia e depurar prompt ao mesmo tempo é o que torna esta fase difícil sem necessidade.",
    preRequisitos: "Fase 2",
    duracao: "1 semana",
    criterios: [
      "Você desenha o grafo antes de programá-lo.",
      "Você explica cada campo do estado e quem o modifica.",
      "Você prevê quais nós serão executados em cada rota.",
    ],
    grupos: [
      {
        id: "lc-g-f4-1",
        titulo: "Modelo mental",
        descricao: "Um workflow no Graph API é definido por três coisas, e só por elas.",
        topicos: [
          { id: "lc-f4-01", titulo: "Estado", prioridade: "fundamental",
            desc: "Snapshot compartilhado da aplicação.",
            detalhe: "O estado é o contrato do grafo: tudo que um nó precisa ler ou escrever passa por ele. Projete-o primeiro, campo a campo, respondendo para cada um quem escreve e quem lê. Estado inchado com dados que só um nó usa é sinal de que aquilo deveria ser variável local; estado faltando campo força comunicação por efeito colateral, que é o começo de um grafo impossível de depurar." },
          { id: "lc-f4-02", titulo: "Nós", prioridade: "fundamental",
            desc: "Funções que executam lógica e retornam atualizações.",
            detalhe: "Um nó recebe o estado e devolve apenas o DELTA — os campos que mudaram — e não o estado inteiro. Isso é o que permite execução paralela sem sobrescrita acidental. Mantenha cada nó com uma responsabilidade: colocar toda a lógica em um nó só é uma das armadilhas listadas no roadmap, e anula o motivo de usar grafo." },
          { id: "lc-f4-03", titulo: "Arestas", prioridade: "fundamental",
            desc: "Transições fixas ou condicionais entre nós.",
            detalhe: "Aresta fixa sempre leva ao mesmo nó; condicional é uma função que lê o estado e devolve o próximo destino. A regra prática que vale para o resto da trilha: a condição é código seu, determinístico e testável, mesmo quando o DADO que ela inspeciona veio do modelo. Roteamento é lugar de `if`, não de prompt." },
        ],
      },
      {
        id: "lc-g-f4-2",
        titulo: "Construir o grafo",
        topicos: [
          { id: "lc-f4-04", titulo: "StateGraph e reducers", prioridade: "fundamental",
            desc: "Schemas de estado e reducers.",
            detalhe: "Por padrão, uma atualização SUBSTITUI o valor do campo. Reducer muda essa regra — o caso clássico é a lista de mensagens, que deve acumular em vez de sobrescrever. Quando dois nós paralelos escrevem no mesmo campo sem reducer, você tem uma condição de corrida; com reducer de concatenação, tem o resultado combinado. É o primeiro lugar onde um grafo paralelo dá errado." },
          { id: "lc-f4-05", titulo: "Nós, arestas, START e END", prioridade: "fundamental",
            desc: "Montagem básica do grafo.",
            detalhe: "`START` e `END` são nós virtuais que marcam entrada e saída. Compile o grafo e renderize o diagrama antes de executar: comparar o desenho que você fez à mão com o que a biblioteca gerou revela aresta esquecida e nó órfão em segundos. Esse diagrama também é um dos entregáveis do projeto final." },
          { id: "lc-f4-06", titulo: "Sequências, ramificações e ciclos", prioridade: "fundamental",
            desc: "As três topologias básicas.",
            detalhe: "Ciclo é o que diferencia grafo de pipeline: é ele que permite \"buscar de novo se a evidência for insuficiente\", que é o passo 5 do projeto desta fase. E todo ciclo precisa de condição de parada explícita, normalmente um contador de tentativas no estado — o mesmo cuidado com limite de iterações da fase 2, agora na topologia." },
          { id: "lc-f4-07", titulo: "Roteamento condicional", prioridade: "fundamental",
            desc: "Escolher o próximo nó a partir do estado.",
            detalhe: "A função de roteamento deve ser pura e testável sem LLM: dado um estado, qual é o próximo nó. Escreva testes para ela cobrindo cada rota — é o teste mais barato e mais valioso do grafo inteiro, e responde diretamente ao critério de \"prever quais nós serão executados em cada rota\"." },
          { id: "lc-f4-08", titulo: "Command", prioridade: "importante",
            desc: "Combinar atualização de estado e controle de fluxo.",
            detalhe: "`Command` deixa um nó devolver, de uma vez, o que mudou no estado E para onde ir. Isso evita separar artificialmente a decisão (que o nó já tomou, porque tem a informação) da aresta condicional (que teria de reinspecionar o estado para redescobri-la). Use quando o próprio nó é quem sabe o destino." },
          { id: "lc-f4-09", titulo: "Send e map-reduce", prioridade: "importante",
            desc: "Fan-out dinâmico.",
            detalhe: "`Send` despacha N execuções paralelas de um nó, uma por item, quando N só é conhecido em tempo de execução — exatamente o caso de \"executar pesquisas em paralelo\" do projeto. Os resultados se juntam no estado via reducer, fechando o map-reduce. É também onde a vantagem do `async` da fase 0 aparece de forma concreta." },
          { id: "lc-f4-10", titulo: "Functional API versus Graph API", prioridade: "opcional",
            desc: "Por que começar pelo Graph API.",
            detalhe: "A Functional API usa decoradores e fluxo de controle Python comum, o que é mais natural de escrever e menos explícito de ler. O Graph API obriga a declarar a topologia, e é essa obrigação que tem valor didático agora: o grafo desenhado é o sistema documentado. Volte à Functional API depois, quando a estrutura já estiver clara na sua cabeça." },
        ],
      },
    ],
  },

  {
    id: "f5-persistencia",
    numero: 5,
    titulo: "Persistência e human-in-the-loop",
    objetivo: "Agente retomável com aprovação.",
    descricao:
      "Esta fase resolve dois problemas que sempre aparecem juntos em sistema real: o processo precisa " +
      "sobreviver a uma reinicialização, e uma pessoa precisa aprovar antes de algo irreversível acontecer. " +
      "O checkpoint é o que torna as duas coisas possíveis — pausar é só não avançar, e retomar é carregar " +
      "o estado salvo. " +
      "A sutileza que morde aqui é a reexecução: ao retomar, o nó interrompido roda desde o começo, " +
      "então qualquer efeito externo que ele já tenha causado acontece de novo. " +
      "Daí a insistência em idempotência.",
    preRequisitos: "Fase 4",
    duracao: "1 semana",
    criterios: [
      "Você sabe onde posicionar uma interrupção.",
      "Você evita duplicar efeitos externos durante retomadas.",
      "Você consegue inspecionar o estado persistido.",
    ],
    grupos: [
      {
        id: "lc-g-f5",
        titulo: null,
        topicos: [
          { id: "lc-f5-01", titulo: "Checkpoints e threads", prioridade: "fundamental",
            desc: "Retomada de execução por `thread_id`.",
            detalhe: "O checkpointer salva o estado a cada passo, indexado por `thread_id`. A thread é a unidade de conversa: mesmo ID, mesmo histórico e mesmo estado. Para desenvolvimento, um checkpointer em memória basta; para o projeto desta fase, que exige reiniciar o processo e retomar, é preciso um persistente de verdade. Teste matando o processo no meio, não simulando." },
          { id: "lc-f5-02", titulo: "Persistência e tolerância a falhas", prioridade: "fundamental",
            desc: "Estado durável e recuperação.",
            detalhe: "Com checkpoint a cada nó, uma falha custa no máximo um nó de retrabalho, e não a execução inteira — o que importa quando cada nó custa uma chamada paga de LLM. Guardar o histórico de checkpoints também dá depuração temporal: você consegue olhar o estado exato antes da decisão errada, em vez de reconstruí-lo a partir de logs." },
          { id: "lc-f5-03", titulo: "interrupt() e retomada com Command", prioridade: "fundamental",
            desc: "Pausar e retomar com a decisão humana.",
            detalhe: "`interrupt()` suspende a execução e devolve o controle a quem chamou, com os dados que a pessoa precisa ver. A retomada acontece com um `Command` carregando a decisão. O detalhe decisivo: a retomada reexecuta o nó DESDE O INÍCIO, e o `interrupt()` devolve o valor fornecido em vez de pausar de novo. Por isso o código antes da interrupção não pode ter efeito colateral." },
          { id: "lc-f5-04", titulo: "Revisão, aprovação, edição e rejeição", prioridade: "fundamental",
            desc: "Os quatro desfechos de uma intervenção humana.",
            detalhe: "Aprovar e rejeitar são os casos fáceis. Editar é o mais útil e o mais esquecido: a pessoa corrige o argumento da ferramenta e o fluxo segue com o valor corrigido. Trate os quatro desfechos explicitamente no estado — e lembre que a rejeição precisa de um caminho de saída digno, não de uma exceção não tratada." },
          { id: "lc-f5-05", titulo: "Idempotência de efeitos externos", prioridade: "fundamental",
            desc: "Não duplicar o que já aconteceu.",
            detalhe: "A técnica é a chave de idempotência: gere um identificador determinístico para a operação e deixe que o sistema externo ignore a repetição. Enquanto isso não existir, siga a regra estrutural — coloque o efeito externo DEPOIS da interrupção, num nó próprio e minúsculo, de modo que a reexecução do nó anterior não dispare nada." },
          { id: "lc-f5-06", titulo: "Implicações da reexecução", prioridade: "fundamental",
            desc: "O que roda de novo após uma interrupção.",
            detalhe: "Internalize: o nó inteiro roda de novo. Isso significa que chamadas de LLM antes do `interrupt()` são repetidas (custo), que contadores incrementados ali são incrementados duas vezes (bug) e que logs aparecem duplicados (confusão). O padrão seguro é um nó que só prepara e interrompe, e outro que só executa." },
        ],
      },
    ],
  },

  {
    id: "f6-streaming",
    numero: 6,
    titulo: "Streaming, memória e subgrafos",
    objetivo: "Agente modular e responsivo.",
    descricao:
      "O critério de domínio desta fase é conceitual e vale mais que qualquer API: distinguir histórico " +
      "de conversa, estado transitório, checkpoint e memória de longo prazo — e escolher " +
      "conscientemente onde cada dado vive. " +
      "Confundi-los é uma das armadilhas listadas no roadmap, e produz sistemas que lembram do que " +
      "deveriam esquecer e esquecem do que deveriam lembrar. " +
      "O streaming, por sua vez, é menos sobre velocidade e mais sobre percepção: um agente que leva " +
      "oito segundos mostrando progresso é aceitável; o mesmo agente em silêncio, não.",
    preRequisitos: "Fase 5",
    duracao: "1 semana",
    criterios: [
      "Você distingue histórico de conversa, estado transitório, checkpoint e memória de longo prazo.",
      "Você escolhe conscientemente onde cada dado deve viver.",
    ],
    grupos: [
      {
        id: "lc-g-f6",
        titulo: null,
        topicos: [
          { id: "lc-f6-01", titulo: "Modos de streaming", prioridade: "fundamental",
            desc: "Mensagens, tokens, atualizações e valores de estado.",
            detalhe: "São granularidades diferentes para públicos diferentes: token a token para a resposta final na tela; atualizações por nó para indicar progresso (\"pesquisando\", \"verificando\"); valores de estado para depuração. Dá para consumir mais de um modo ao mesmo tempo, e a escolha é de interface, não de implementação." },
          { id: "lc-f6-02", titulo: "Eventos personalizados", prioridade: "importante",
            desc: "Informar progresso a partir de dentro dos nós.",
            detalhe: "Quando um nó faz algo demorado que não é uma chamada de LLM — uma busca, um cálculo, uma espera por API — nada é transmitido por padrão e a interface congela. Eventos personalizados permitem emitir sinais de progresso de dentro do nó, e são o que evita a sensação de travamento na parte mais lenta do fluxo." },
          { id: "lc-f6-03", titulo: "Memória de curto prazo", prioridade: "fundamental",
            desc: "Histórico no estado da thread.",
            detalhe: "É o histórico da conversa, que vive no estado e morre com a thread. O problema inevitável é o crescimento: a janela de contexto estoura. As saídas são resumir as mensagens antigas, manter uma janela deslizante das últimas N, ou ambas. Decida a política ANTES de o estouro acontecer em produção." },
          { id: "lc-f6-04", titulo: "Memória de longo prazo", prioridade: "fundamental",
            desc: "Stores organizados por namespace e chave.",
            detalhe: "É o que atravessa threads: a preferência do usuário lembrada na conversa de amanhã. Vive num store separado, organizado por namespace (tipicamente o usuário) e chave. Duas regras que o projeto final cobra: grave apenas o que foi explicitamente autorizado, e deixe a memória inspecionável e apagável — memória implícita que o usuário não sabe que existe é problema de produto e de privacidade." },
          { id: "lc-f6-05", titulo: "Subgrafos", prioridade: "importante",
            desc: "Modularidade e isolamento de estado.",
            detalhe: "Um subgrafo é um grafo usado como nó de outro, com estado próprio e uma tradução explícita na fronteira. É o que mantém o grafo principal legível quando o sistema cresce, e o que permite testar \"pesquisa\" e \"revisão\" isoladamente — que é exatamente o que o projeto desta fase pede. Também é o caminho natural para multiagente, mais tarde." },
          { id: "lc-f6-06", titulo: "Execução assíncrona e cancelamento", prioridade: "importante",
            desc: "Rodar e interromper sob demanda.",
            detalhe: "Cancelamento é requisito real: o usuário fecha a aba, e o seu agente continua gastando tokens numa pesquisa que ninguém vai ler. Trate o cancelamento como caminho previsto — propagado para as chamadas em andamento, com o estado salvo até o último passo concluído, de modo que a thread continue retomável." },
        ],
      },
    ],
  },

  {
    id: "f7-producao",
    numero: 7,
    titulo: "Avaliação, observabilidade e produção",
    objetivo: "Projeto final observável e testado.",
    descricao:
      "A regra que organiza esta fase está na própria fonte: implante somente depois de tornar o " +
      "comportamento observável. Sem trace, um agente em produção é uma caixa-preta cara — você sabe " +
      "que a resposta ficou ruim e não sabe em qual dos oito passos ela se perdeu. " +
      "A segunda regra é avaliar a TRAJETÓRIA, não só a resposta: um agente que chega à conclusão certa " +
      "depois de chamar a ferramenta errada quatro vezes passa em qualquer avaliação de saída final e " +
      "vai quebrar no primeiro caso que não estava no seu teste.",
    preRequisitos: "Fases 3 e 6",
    duracao: "1–2 semanas",
    criterios: [
      "Diagrama do grafo e contrato de estado documentados.",
      "Ferramentas tipadas e com erros tratados.",
      "Persistência e retomada verificadas.",
      "Pelo menos um interrupt de aprovação.",
      "Testes de nós e rotas críticas.",
      "Dataset de avaliação com casos normais e adversariais.",
      "Medições de qualidade, custo e latência.",
      "Lista explícita de riscos e limitações.",
    ],
    grupos: [
      {
        id: "lc-g-f7-1",
        titulo: "Observar e avaliar",
        topicos: [
          { id: "lc-f7-01", titulo: "Tracing e depuração", prioridade: "fundamental",
            desc: "LangSmith.",
            detalhe: "Um trace mostra a árvore completa de execução: cada nó, cada prompt enviado, cada resposta, tokens e latência por passo. Ligue isso no começo do desenvolvimento, não no fim — ele é mais útil enquanto você constrói, e a prática de olhar o trace antes de chutar uma causa é o hábito que esta fase precisa instalar." },
          { id: "lc-f7-02", titulo: "Datasets de avaliação", prioridade: "fundamental",
            desc: "Casos de regressão.",
            detalhe: "Toda vez que você encontrar um caso em que o sistema erra, transforme-o em caso de teste antes de corrigir. O conjunto cresce a partir das falhas reais, que é a única fonte confiável de casos difíceis. Sem isso, cada ajuste de prompt corrige um caso e quebra outro silenciosamente — e você só descobre pelo usuário." },
          { id: "lc-f7-03", titulo: "Avaliação de trajetória", prioridade: "fundamental",
            desc: "Decisões, chamadas de ferramentas e resultado.",
            detalhe: "Avalie se as ferramentas certas foram chamadas, na ordem razoável, com os argumentos corretos — e não só se a resposta final ficou boa. Trajetória ruim com resultado bom é sorte, custa caro em tokens e não generaliza. É também o que permite detectar o agente que entrou em laço e saiu por limite de iteração." },
          { id: "lc-f7-04", titulo: "Métricas de qualidade e custo", prioridade: "fundamental",
            desc: "Groundedness, custo e latência.",
            detalhe: "Groundedness mede se a resposta se sustenta no contexto recuperado e é a métrica central de qualquer sistema com RAG. Acompanhe custo por requisição desde o primeiro dia: agentes têm custo variável, e um laço mal contido transforma centavos em dezenas de reais sem aviso. Latência vale no percentil, não na média." },
        ],
      },
      {
        id: "lc-g-f7-2",
        titulo: "Endurecer e entregar",
        topicos: [
          { id: "lc-f7-05", titulo: "Resiliência", prioridade: "fundamental",
            desc: "Retries, timeouts, limites, cache e fallback.",
            detalhe: "Retry com backoff exponencial para 429 e 5xx; timeout em toda chamada externa; limite de iterações e de custo por requisição; fallback para um modelo alternativo quando o provedor cai. Cache de embeddings e de respostas idênticas corta custo de desenvolvimento de forma significativa, porque você reexecuta o mesmo caso dezenas de vezes." },
          { id: "lc-f7-06", titulo: "Segurança", prioridade: "fundamental",
            desc: "Ferramentas, autorização, dados pessoais e prompt injection.",
            detalhe: "A regra que não se negocia: autorização é verificada no SEU código, nunca no prompt. Um modelo pode ser convencido a ignorar uma instrução; um `if` não. Some isso ao risco de injeção via documento recuperado (fase 3) e à exigência de aprovação humana para ação sensível (fase 5), e você tem as três camadas que sustentam um agente com acesso a ferramentas reais. Dados pessoais: minimize o que entra no prompt e no trace." },
          { id: "lc-f7-07", titulo: "Testes", prioridade: "fundamental",
            desc: "Unitários de nós e integração do grafo.",
            detalhe: "Nó é função: teste com estado de entrada fixo e LLM simulado. Rota é função pura: teste cada caminho. Integração roda o grafo com simulações e verifica a sequência de nós executada. O objetivo é que a maior parte da suíte rode sem chamar um LLM real — rápida, barata e determinística. Essa é a última das cinco perguntas de fechamento de semana, e não por acaso." },
          { id: "lc-f7-08", titulo: "Implantar depois de observar", prioridade: "fundamental",
            desc: "A ordem correta de colocar em produção.",
            detalhe: "Antes de implantar: trace ligado, métricas de custo e latência coletadas, dataset de avaliação passando, limites configurados e um caminho de rollback pronto. O projeto final pede diagrama do grafo, contrato de estado documentado e lista explícita de riscos e limitações — e essa lista é o que demonstra que você entendeu o sistema, mais ainda do que o sistema funcionando." },
        ],
      },
    ],
  }
);
