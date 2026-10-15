/* LangChain e LangGraph — fases 0 a 3 (construir com LangChain) */

ROADMAP_ETAPAS.push(
  {
    id: "f0-prereq",
    numero: 0,
    titulo: "Pré-requisitos",
    objetivo: "Cliente de LLM tipado e testável.",
    descricao:
      "Esta fase não usa LangChain. A ideia é chegar ao framework sabendo o que ele resolve, " +
      "e para isso você precisa ter sentido o problema primeiro: pedir \"responda em JSON\" e torcer " +
      "não é o mesmo que validar uma estrutura. " +
      "O cliente que você escreve aqui vira a sua régua — quando o LangChain fizer a mesma coisa em " +
      "três linhas, você vai saber exatamente o que foi abstraído e o que continua sendo problema seu. " +
      "Timeout, resposta inválida e estouro de contexto são os três erros que aparecem no primeiro dia " +
      "de produção e que nenhum tutorial trata.",
    preRequisitos: "Python e noções de LLM",
    duracao: "3–5 dias",
    criterios: [
      "Você explica por que validar a saída do modelo é diferente de apenas pedir que ele responda em JSON.",
      "Você trata timeout, resposta inválida e limite de contexto de forma explícita.",
    ],
    grupos: [
      {
        id: "lc-g-f0",
        titulo: null,
        topicos: [
          { id: "lc-f0-01", titulo: "Python moderno", prioridade: "fundamental",
            desc: "Funções, classes, `typing`, `TypedDict`, iteradores e `async`/`await`.",
            detalhe: "`TypedDict` é o que o LangGraph usa para declarar o schema de estado, então vale conhecê-lo antes. `async`/`await` deixa de ser opcional a partir da fase 3: chamadas a LLM são I/O, e executar cinco buscas em paralelo contra sequencialmente é a diferença entre 2 e 10 segundos de resposta. Anotações de tipo aqui não são estilo — as bibliotecas as leem em tempo de execução para gerar schemas." },
          { id: "lc-f0-02", titulo: "Ambiente e dependências", prioridade: "fundamental",
            desc: "Ambientes virtuais, variáveis de ambiente e gerenciamento de dependências.",
            detalhe: "Chave de API vai em variável de ambiente, nunca no código — e `.env` entra no `.gitignore` antes do primeiro commit, não depois. O ecossistema LangChain se move rápido e quebra entre versões menores: fixe as versões em arquivo e anote qual versão da documentação você está seguindo, porque metade dos tutoriais na internet usa APIs que já não existem." },
          { id: "lc-f0-03", titulo: "JSON, HTTP e exceções", prioridade: "fundamental",
            desc: "APIs HTTP e tratamento de exceções.",
            detalhe: "Toda chamada a um provedor de LLM é HTTP e falha como HTTP: 429 de limite de taxa (que pede backoff exponencial, não retry imediato), 500 transitório, e timeout. Timeout merece atenção especial porque a geração pode legitimamente demorar — um timeout curto demais derruba requisições válidas, e um longo demais trava o seu serviço." },
          { id: "lc-f0-04", titulo: "Papéis de mensagem", prioridade: "fundamental",
            desc: "Mensagens de sistema, usuário, assistente e ferramentas.",
            detalhe: "A API de chat é uma lista de mensagens com papéis, e cada papel tem peso diferente: a de sistema estabelece comportamento, as de usuário e assistente formam o histórico, e a de ferramenta carrega o retorno de uma chamada. O ciclo completo de tool calling (fase 2) é literalmente a conversa crescendo com uma mensagem de ferramenta no meio — entender isso agora torna aquela fase trivial." },
          { id: "lc-f0-05", titulo: "Tokens, contexto e saída estruturada", prioridade: "fundamental",
            desc: "Janela de contexto, temperatura e saída estruturada.",
            detalhe: "A janela de contexto é o limite de entrada MAIS saída somadas, e estourá-la é a falha que mais aparece quando você começa a acumular histórico ou a injetar documentos. Temperatura baixa para extração e classificação, mais alta para redação. Sobre saída estruturada: use o modo nativo do provedor (function calling ou JSON schema) em vez de pedir no prompt — a diferença é entre garantia e probabilidade." },
          { id: "lc-f0-06", titulo: "Embeddings e RAG", prioridade: "importante",
            desc: "Noções de embeddings, similaridade vetorial e RAG.",
            detalhe: "Só o suficiente para a fase 3 não ser do zero: embedding é um vetor que posiciona o texto num espaço onde proximidade significa semelhança de significado, e a busca é por similaridade de cosseno. O conceito que evita a confusão mais comum da trilha inteira: RAG é recuperação, não memória — ele busca em documentos, não lembra da conversa." },
        ],
      },
    ],
  },

  {
    id: "f1-fundamentos",
    numero: 1,
    titulo: "Fundamentos do LangChain",
    objetivo: "Pipeline de extração e classificação.",
    descricao:
      "O valor desta fase não está nas funcionalidades e sim na interface: quando toda etapa é um " +
      "`Runnable` com a mesma assinatura, elas se compõem, se trocam e se testam isoladamente. " +
      "O teste de que você entendeu é o critério de domínio — trocar o provedor de modelo sem " +
      "encostar na lógica de negócio. " +
      "Se isso exigir reescrita, a abstração vazou em algum ponto e vale achar onde antes de seguir.",
    preRequisitos: "Fase 0",
    duracao: "4–6 dias",
    criterios: [
      "Você compõe etapas pequenas em vez de escrever um bloco monolítico.",
      "Você troca o modelo sem reescrever a lógica de negócio.",
      "Você testa cada etapa isoladamente.",
    ],
    grupos: [
      {
        id: "lc-g-f1",
        titulo: null,
        topicos: [
          { id: "lc-f1-01", titulo: "Instalação e integração do provedor", prioridade: "fundamental",
            desc: "Instalar e conectar o provedor de modelo escolhido.",
            detalhe: "O pacote se divide entre o núcleo e as integrações por provedor, o que é exatamente o que permite trocar de modelo depois. Instale só a integração que você usa. Faça uma chamada crua funcionar antes de montar qualquer cadeia: separar \"a credencial está errada\" de \"a composição está errada\" economiza bastante tempo." },
          { id: "lc-f1-02", titulo: "Modelos de chat e mensagens", prioridade: "fundamental",
            desc: "Objetos de mensagem e a interface de chat.",
            detalhe: "O LangChain normaliza os papéis da fase 0 em classes de mensagem, e é isso que faz o mesmo código rodar em provedores diferentes. A resposta traz metadados valiosos além do texto: contagem de tokens (para custo), motivo de parada (para detectar truncamento) e as chamadas de ferramenta pendentes, que a fase 2 vai usar." },
          { id: "lc-f1-03", titulo: "Prompts e templates", prioridade: "fundamental",
            desc: "Modelos de prompt parametrizados.",
            detalhe: "Template separa a instrução estável do dado variável, o que torna o prompt versionável e diffável em vez de uma string montada por concatenação espalhada pelo código. O detalhe operacional: trate o prompt como código — ele vai no repositório, muda com commit, e uma alteração nele pode degradar o sistema tanto quanto uma mudança de lógica." },
          { id: "lc-f1-04", titulo: "Saída estruturada e schemas", prioridade: "fundamental",
            desc: "Schemas e validação da resposta.",
            detalhe: "Declare um modelo Pydantic e peça a saída nesse formato: a biblioteca converte o schema para o formato do provedor e valida o retorno. As descrições dos campos vão no prompt e influenciam o resultado — são documentação E instrução ao mesmo tempo. Decida desde já o que fazer quando a validação falhar: tentar de novo, pedir correção, ou falhar explicitamente." },
          { id: "lc-f1-05", titulo: "Runnable e composição", prioridade: "fundamental",
            desc: "Composição e execução síncrona e assíncrona.",
            detalhe: "`Runnable` é a abstração central: tudo (prompt, modelo, parser, função sua) tem `invoke`, `batch`, `stream` e as versões assíncronas. Por isso o operador de composição funciona e por isso streaming e paralelismo vêm de graça quando você compõe em vez de escrever um bloco imperativo. `batch` é o atalho mais subestimado para processar muitos itens com concorrência." },
          { id: "lc-f1-06", titulo: "Configuração, callbacks e erros", prioridade: "importante",
            desc: "Configuração em tempo de execução, callbacks e tratamento de falhas.",
            detalhe: "Callbacks dão os ganchos de observabilidade que a fase 7 vai usar: início, fim, erro e token a token. Configuração em tempo de execução permite trocar temperatura ou modelo por chamada sem reconstruir a cadeia. Para falhas, os padrões prontos são retry com backoff e fallback para outro modelo — o fallback é o que mantém o sistema de pé durante uma instabilidade do provedor." },
        ],
      },
    ],
  },

  {
    id: "f2-agentes",
    numero: 2,
    titulo: "Ferramentas e agentes com LangChain",
    objetivo: "Agente com ferramentas seguras.",
    descricao:
      "A pergunta central desta fase é de arquitetura, não de API: o que fica em código e o que é " +
      "delegado ao modelo. A resposta prática é que regra de negócio, política de segurança e ordem " +
      "obrigatória de passos ficam em código; a escolha entre caminhos legítimos pode ser do modelo. " +
      "Delegar demais produz um sistema que não se consegue testar nem auditar. " +
      "Os dois modos de falha a provocar deliberadamente aqui: o ciclo infinito e a ferramenta " +
      "sensível executada sem confirmação.",
    preRequisitos: "Fase 1",
    duracao: "1 semana",
    criterios: [
      "Você justifica quais decisões ficam em código e quais podem ser delegadas ao modelo.",
      "O agente não entra em ciclo infinito.",
      "O agente não executa uma ferramenta sensível sem a política esperada.",
    ],
    grupos: [
      {
        id: "lc-g-f2",
        titulo: null,
        topicos: [
          { id: "lc-f2-01", titulo: "Criação de ferramentas", prioridade: "fundamental",
            desc: "Nome, descrição e schema claros.",
            detalhe: "A descrição da ferramenta é um prompt: é por ela que o modelo decide se e quando chamar. Vago demais e a ferramenta nunca é usada; genérico demais e é usada sempre. Diga o que ela faz, quando usar e, principalmente, quando NÃO usar. Tipos restritivos no schema (enum em vez de string livre) eliminam uma classe inteira de argumentos inválidos antes de a chamada acontecer." },
          { id: "lc-f2-02", titulo: "Tool calling", prioridade: "fundamental",
            desc: "O ciclo modelo–ferramenta–modelo.",
            detalhe: "O modelo não executa nada: ele devolve a intenção de chamar, com os argumentos. Quem executa é o seu código, e o resultado volta como mensagem de ferramenta para o modelo continuar. Essa separação é a sua oportunidade de controle — validar argumentos, aplicar autorização, pedir confirmação. O modelo pode pedir várias chamadas de uma vez, e tratá-las em paralelo é ganho fácil." },
          { id: "lc-f2-03", titulo: "create_agent e estado do agente", prioridade: "fundamental",
            desc: "O laço de agente pronto e o que ele guarda.",
            detalhe: "`create_agent` empacota o laço \"chamar modelo, executar ferramentas, repetir até não haver mais chamadas\". Vale escrever esse laço à mão uma vez antes de usar o atalho: são cerca de vinte linhas e, depois disso, o comportamento do agente deixa de ser caixa-preta. Por baixo, ele já é um grafo do LangGraph — o que torna a fase 4 menos um salto." },
          { id: "lc-f2-04", titulo: "Contexto e injeção de dependências", prioridade: "importante",
            desc: "Contexto de execução e dependências nas ferramentas.",
            detalhe: "Ferramentas quase sempre precisam de algo que o modelo não deve ver nem escolher: conexão de banco, ID do usuário autenticado, credencial. Isso entra por injeção, fora do schema exposto ao modelo. É também a forma correta de impor escopo — a ferramenta consulta pedidos DO usuário da sessão, e não de um ID que o modelo poderia inventar." },
          { id: "lc-f2-05", titulo: "Middleware e limites", prioridade: "fundamental",
            desc: "Middleware, limites de iteração e tratamento de falhas.",
            detalhe: "Limite de iterações é obrigatório: sem ele, um modelo que insiste em chamar a mesma ferramenta queima orçamento até o timeout. Middleware é onde entram log, autorização e a confirmação antes de ação com efeito externo. Sobre erro de ferramenta: devolver a mensagem de erro ao modelo costuma funcionar, porque ele corrige o argumento e tenta de novo — desde que a mensagem diga o que estava errado." },
          { id: "lc-f2-06", titulo: "Workflow determinístico ou decisão delegada", prioridade: "fundamental",
            desc: "Quando o fluxo é código e quando é escolha do modelo.",
            detalhe: "Se os passos são conhecidos de antemão, escreva um workflow: ele é testável, barato e previsível. Agente é para quando o caminho depende do que for descoberto no meio. Um bom projeto costuma ser majoritariamente determinístico com um trecho agêntico delimitado — e esta é a decisão que a fase 4 vai tornar explícita em forma de grafo." },
        ],
      },
    ],
  },

  {
    id: "f3-rag",
    numero: 3,
    titulo: "RAG com LangChain",
    objetivo: "Assistente que responde a partir de documentos.",
    descricao:
      "RAG parece simples e falha de quatro maneiras diferentes, que o critério de domínio pede para " +
      "você saber distinguir: o documento não foi indexado, o chunk ficou mal cortado, a recuperação " +
      "trouxe o trecho errado, ou a geração ignorou o contexto que recebeu. " +
      "Cada uma pede uma correção distinta, e tratá-las como um problema só é a razão pela qual tanta " +
      "gente fica ajustando o prompt quando o erro está na indexação. " +
      "Por isso a regra desta fase: avalie recuperação separadamente da resposta.",
    preRequisitos: "Fase 1",
    duracao: "1–2 semanas",
    criterios: [
      "Você diagnostica separadamente: documento não indexado, chunk inadequado, recuperação irrelevante e geração infiel ao contexto.",
      "A resposta apresenta as fontes recuperadas.",
      "O sistema admite quando não há evidência suficiente.",
    ],
    grupos: [
      {
        id: "lc-g-f3-1",
        titulo: "Indexar",
        topicos: [
          { id: "lc-f3-01", titulo: "Carregamento e normalização", prioridade: "fundamental",
            desc: "Carregar e normalizar documentos.",
            detalhe: "É a etapa mais ingrata e a que mais determina a qualidade final. PDF com colunas vira texto embaralhado; tabela perde a estrutura; cabeçalho e rodapé repetidos poluem todo chunk. Inspecione o texto extraído antes de indexar — grande parte dos \"o modelo não sabe responder\" se explica aqui, e nenhum ajuste de prompt compensa." },
          { id: "lc-f3-02", titulo: "Chunks e metadados", prioridade: "fundamental",
            desc: "Divisão em chunks e metadados associados.",
            detalhe: "Chunk grande traz contexto e dilui a similaridade; pequeno é preciso e perde o entorno. Divida respeitando a estrutura (seção, parágrafo) em vez de contar caracteres cegamente, e use sobreposição para não cortar uma frase ao meio. Metadados (fonte, página, seção, data) são o que permite citar a evidência e filtrar a busca — e são baratos de guardar e caros de acrescentar depois." },
          { id: "lc-f3-03", titulo: "Embeddings e vector stores", prioridade: "fundamental",
            desc: "Gerar embeddings e armazená-los.",
            detalhe: "Use o MESMO modelo de embedding para indexar e para consultar; trocá-lo invalida o índice inteiro e exige reindexar tudo. Para começar, um store local resolve; a migração para um gerenciado vem quando o volume ou a concorrência pedirem. Anote junto do índice qual modelo e qual versão o geraram." },
        ],
      },
      {
        id: "lc-g-f3-2",
        titulo: "Recuperar e responder",
        topicos: [
          { id: "lc-f3-04", titulo: "Retrievers, filtros e busca híbrida", prioridade: "fundamental",
            desc: "Recuperação, filtros por metadado e combinação com busca léxica.",
            detalhe: "Busca puramente vetorial erra em termos exatos — códigos de produto, nomes próprios, números de artigo — porque semelhança semântica não é igualdade. Busca híbrida combina o vetorial com busca léxica e cobre os dois casos. Filtros por metadado restringem o espaço antes da similaridade e são o jeito de implementar permissão por documento." },
          { id: "lc-f3-05", titulo: "Contexto e citação", prioridade: "fundamental",
            desc: "Construção do contexto e citação das evidências.",
            detalhe: "A ordem dos trechos importa: modelos prestam menos atenção ao meio de um contexto longo, então coloque o mais relevante nas pontas. Peça a citação por identificador do chunk, não por título livre, para a referência ser verificável. E instrua explicitamente a admitir ausência de evidência — sem isso, o comportamento padrão é preencher a lacuna." },
          { id: "lc-f3-06", titulo: "Avaliar recuperação e resposta", prioridade: "fundamental",
            desc: "Avaliação de recuperação separada da avaliação da resposta.",
            detalhe: "Monte um conjunto de perguntas com os chunks corretos anotados e meça recall da recuperação primeiro: se o trecho certo não chegou, nenhum ajuste de geração resolve. Só depois avalie a resposta quanto à fidelidade ao contexto fornecido. Duas métricas, dois diagnósticos — é literalmente o critério de domínio desta fase." },
          { id: "lc-f3-07", titulo: "Riscos de RAG", prioridade: "fundamental",
            desc: "Prompt injection em documentos, conteúdo desatualizado e ausência de evidência.",
            detalhe: "Documento recuperado é entrada NÃO CONFIÁVEL: um texto que contenha \"ignore as instruções anteriores\" pode sequestrar o comportamento do agente, e isso é especialmente grave quando ele tem ferramentas com efeito externo (fase 2). Trate o conteúdo recuperado como dado, delimite-o claramente no prompt, e nunca deixe que ele autorize uma ação. Conteúdo desatualizado é o outro risco: registre a data no metadado e deixe-a visível na resposta." },
        ],
      },
    ],
  }
);
