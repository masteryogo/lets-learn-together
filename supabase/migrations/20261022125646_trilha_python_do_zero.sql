-- 22/10/2026 — Python do Zero.
--
-- Esta trilha entra como ferramenta: Python é uma linguagem que abre
-- caminhos posteriores (backend, dados, IA e automação), não um cargo
-- profissional. As sete etapas são módulos; os tópicos, as aulas que o
-- mapa já sabe exibir e acompanhar. Atividades e competências ganharão
-- tabelas próprias numa migration posterior, quando houver a interface
-- que as realiza — não antecipamos uma segunda árvore de conteúdo aqui.

insert into public.trilha (id, rotulo, cor, rota, ordem, publicada, categoria, conteudo)
values (
  'python',
  'Python do Zero',
  '#3776ab',
  '[[22, 214], [61, 190], [101, 162], [143, 126], [184, 98], [226, 59], [278, 24]]'::jsonb,
  40,
  true,
  'ferramenta',
  $json$
  {
    "ROADMAP": {
      "titulo": "Python do Zero",
      "subtitulo": "Da lógica de programação aos projetos reais",
      "fonte": null,
      "etapas": [
        {
          "id": "primeiros-passos",
          "numero": 1,
          "titulo": "Primeiros passos na programação",
          "objetivo": "Executar e compreender programas simples, sem depender de copiar um tutorial.",
          "descricao": "Programar é dar instruções precisas e testáveis para uma máquina. Antes de decorar sintaxe, você precisa aprender a transformar uma ideia em uma sequência de passos, observar o resultado e corrigir o que não aconteceu como esperado. Python entra aqui como a ferramenta que torna esse ciclo visível rápido.\n\nAo fim desta etapa você terá um ambiente funcionando e um primeiro programa seu no terminal.",
          "preRequisitos": "Nenhum",
          "duracao": "2 semanas",
          "criterios": ["Você executa um arquivo Python pelo terminal.", "Você explica, em palavras, a sequência de instruções do seu programa.", "Você altera um exemplo e prevê o que mudará antes de rodá-lo."],
          "grupos": [{
            "id": "g-py-inicio",
            "titulo": "Pensar e executar",
            "topicos": [
              {"id":"py-ini-01","titulo":"O que é programação","prioridade":"fundamental","desc":"instruções, problema, programa e resultado","detalhe":"Um programa não é uma lista de comandos mágicos: é uma descrição precisa de um processo. A máquina faz exatamente o que foi escrito, inclusive quando o que foi escrito não era o que você queria. Esse detalhe é libertador: erro não é falta de talento; é uma hipótese sobre o que o computador entendeu."},
              {"id":"py-ini-02","titulo":"Como o computador executa instruções","prioridade":"fundamental","desc":"ordem, memória, entrada e saída","detalhe":"O computador lê instruções em ordem, guarda valores na memória e produz saídas. Quando um programa parece misterioso, pare de imaginar tudo de uma vez: acompanhe uma linha por vez e anote o que mudou. Esse hábito será sua primeira técnica de depuração."},
              {"id":"py-ini-03","titulo":"Algoritmos","prioridade":"fundamental","desc":"passos finitos, entrada, processamento e saída","detalhe":"Algoritmo é uma receita que alguém consegue executar sem adivinhar nada. Se o passo diz apenas “calcule a média”, ainda falta dizer quais valores entram, como somar e por quanto dividir. Escrever esses passos antes do código reduz muito a tela em branco."},
              {"id":"py-ini-04","titulo":"Lógica e pseudocódigo","prioridade":"fundamental","desc":"sequência, decisão e repetição em português","detalhe":"Pseudocódigo não é Python mal escrito; é um rascunho para separar a solução do idioma da linguagem. Primeiro descreva a decisão em português claro. Depois traduza. Quando a tradução falhar, você saberá se o problema era de lógica ou de sintaxe."},
              {"id":"py-ini-05","titulo":"Por que Python","prioridade":"importante","desc":"usos da linguagem, interpretador e comunidade","detalhe":"Python aparece em automação, web, dados, ciência e ensino porque sua sintaxe deixa o problema mais visível que a pontuação. Isso não significa que ele resolve tudo; significa que é uma boa primeira ferramenta para aprender fundamentos que continuam valendo em outras linguagens."},
              {"id":"py-ini-06","titulo":"Instalar Python","prioridade":"fundamental","desc":"versão recente, interpretador e verificação","detalhe":"Instale uma versão recente do site oficial e confirme no terminal com `python --version` ou `python3 --version`, conforme o sistema. Não avance enquanto esse comando não responder: editor funcionando sem interpretador configurado é uma ilusão que cobra tempo mais tarde."},
              {"id":"py-ini-07","titulo":"VS Code e terminal","prioridade":"fundamental","desc":"arquivo .py, pasta de projeto e execução","detalhe":"O editor ajuda a escrever; o terminal mostra como o programa realmente é chamado. Crie uma pasta por projeto, salve um arquivo `.py` e execute-o pelo terminal. Saber esse caminho impede que um botão do editor esconda um ambiente configurado errado."},
              {"id":"py-ini-08","titulo":"Seu primeiro print","prioridade":"fundamental","desc":"print(), strings e execução de script","detalhe":"`print()` torna observável o que o programa está fazendo. Use-o para produzir uma mensagem e para inspecionar valores enquanto aprende. Mais tarde haverá ferramentas melhores de depuração, mas a pergunta continua a mesma: o que este valor é nesta linha?"},
              {"id":"py-ini-09","titulo":"Entrada com input","prioridade":"fundamental","desc":"input(), texto recebido e interação","detalhe":"Tudo que vem de `input()` chega como texto. Essa regra explica muitos erros de iniciante e prepara a próxima etapa, quando você converterá respostas para números. Teste entradas inesperadas cedo: pessoa usuária raramente digita exatamente o exemplo do enunciado."},
              {"id":"py-ini-10","titulo":"Sequência de instruções","prioridade":"fundamental","desc":"ordem de execução e rastreamento manual","detalhe":"Mude a ordem de duas linhas e veja o que acontece. Variáveis ainda não são o assunto principal, mas já é possível perceber que uma instrução só pode usar um resultado que exista antes dela. Essa noção simples organiza programas inteiros."}
            ]
          }]
        },
        {
          "id": "fundamentos",
          "numero": 2,
          "titulo": "Fundamentos do Python",
          "objetivo": "Receber entradas, calcular, decidir e repetir ações com segurança básica.",
          "descricao": "Agora a lógica ganha a sintaxe que você usará todos os dias. Variáveis dão nome aos valores; operadores os transformam; condicionais e laços escolhem e repetem caminhos. O ponto não é decorar cada símbolo, mas reconhecer qual ferramenta expressa a intenção do problema.\n\nOs dois projetos desta etapa transformam entrada de pessoas em resultados verificáveis.",
          "preRequisitos": "Etapa 1",
          "duracao": "3 semanas",
          "criterios": ["Você converte entradas antes de calcular.", "Você escolhe entre if e repetição justificando a escolha.", "Você testa os limites e entradas inválidas de um programa."],
          "grupos": [{"id":"g-py-fund","titulo":"Valores e fluxo","topicos":[
            {"id":"py-fun-01","titulo":"Variáveis","prioridade":"fundamental","desc":"nomes, atribuição e atualização de valores","detalhe":"Variável é um nome que aponta para um valor. Escolha nomes que contem o papel do dado — `nota_final` explica mais que `x` — e leia uma atribuição como uma mudança de estado: depois de `total = total + valor`, o nome passa a guardar outro resultado."},
            {"id":"py-fun-02","titulo":"Tipos de dados","prioridade":"fundamental","desc":"int, float, str, bool e None","detalhe":"Tipo informa quais operações fazem sentido. O texto 12 entre aspas é texto; 12 sem aspas é número. None representa ausência, não zero nem texto vazio. Antes de corrigir um cálculo estranho, descubra o tipo dos valores que entraram nele."},
            {"id":"py-fun-03","titulo":"Operadores aritméticos","prioridade":"fundamental","desc":"+, -, *, /, //, %, ** e precedência","detalhe":"A expressão é avaliada seguindo regras de precedência, como na matemática. Use parênteses quando a intenção não ficar óbvia — código que alguém entende sem simular mentalmente é código mais fácil de corrigir."},
            {"id":"py-fun-04","titulo":"Comparações e lógica","prioridade":"fundamental","desc":"==, !=, <, >, and, or e not","detalhe":"Comparar produz `True` ou `False`; é esse resultado que uma condição usa. A armadilha clássica é confundir `=` (atribuir) com `==` (comparar). Escreva condições pequenas e dê nome a verificações complexas."},
            {"id":"py-fun-05","titulo":"Conversão de tipos","prioridade":"fundamental","desc":"int(), float(), str() e erros de conversão","detalhe":"Converter não é detalhe: é validar a fronteira entre pessoa e programa. Converter a palavra dez em inteiro falha porque não há um número para calcular. Por enquanto, aprenda a reconhecer essa falha; mais adiante você a tratará sem encerrar o programa."},
            {"id":"py-fun-06","titulo":"Strings","prioridade":"fundamental","desc":"concatenação, f-strings, tamanho e métodos","detalhe":"Texto também é dado estruturado. F-strings tornam mensagens legíveis ao interpolar um nome numa saudação; métodos como strip removem espaços indesejados. Não presuma que uma entrada vem limpa: um espaço a mais pode mudar uma comparação."},
            {"id":"py-fun-07","titulo":"Decisões com if","prioridade":"fundamental","desc":"if, elif, else e indentação","detalhe":"Uma condicional escolhe um caminho, não repete tentativas. A indentação faz parte da sintaxe do Python: ela mostra o que pertence a cada bloco. Teste sempre o caso que entra, o que não entra e o limite exato da condição."},
            {"id":"py-fun-08","titulo":"Laço for","prioridade":"fundamental","desc":"iteração, range() e acumuladores","detalhe":"`for` percorre uma sequência de valores. Use `range()` quando o problema é “repita N vezes” e um acumulador quando cada volta contribui para um resultado. Evite contar manualmente se o próprio Python pode entregar os valores."},
            {"id":"py-fun-09","titulo":"Laço while","prioridade":"fundamental","desc":"condição de continuidade e sentinelas","detalhe":"`while` repete enquanto uma condição for verdadeira; ele é útil quando não se sabe quantas tentativas haverá. Toda repetição precisa de uma mudança que aproxime a condição de parada, ou você criou um laço infinito."},
            {"id":"py-fun-10","titulo":"break, continue e validação","prioridade":"importante","desc":"interromper, pular e repetir entrada inválida","detalhe":"`break` e `continue` são ferramentas de exceção, não a estrutura principal de um programa. Use-os para deixar clara uma saída ou para pedir novamente uma entrada inválida. Se vários desvios aparecem, talvez o laço precise ser reorganizado."}
          ]}]
        },
        {
          "id": "estruturas-funcoes",
          "numero": 3,
          "titulo": "Estruturas de dados e funções",
          "objetivo": "Organizar informações e decompor problemas em funções reutilizáveis.",
          "descricao": "Quando valores passam a formar coleções, a escolha de estrutura importa: lista preserva ordem, dicionário liga uma chave a um valor, conjunto remove repetição. Funções evitam que o programa vire uma sequência única impossível de ler.\n\nO projeto desta etapa é um sistema de alunos que cadastra, pesquisa e organiza dados em memória.",
          "preRequisitos": "Etapa 2",
          "duracao": "3 semanas",
          "criterios": ["Você escolhe uma coleção pelo problema, não por hábito.", "Você escreve funções com uma responsabilidade clara.", "Você separa entrada, processamento e apresentação."],
          "grupos": [{"id":"g-py-colecoes","titulo":"Dados organizados","topicos":[
            {"id":"py-est-01","titulo":"Listas","prioridade":"fundamental","desc":"criação, acesso, append, remove e cópia","detalhe":"Lista guarda valores em ordem e muda ao longo do programa. Índices começam em zero; acessar um índice inexistente é um erro útil, pois revela uma suposição errada sobre o tamanho da coleção."},
            {"id":"py-est-02","titulo":"Tuplas","prioridade":"importante","desc":"sequência imutável e desempacotamento","detalhe":"Tupla comunica que um conjunto de valores não deve mudar. Use-a para dados que viajam juntos, como coordenadas ou retornos múltiplos. Imutabilidade aqui é uma forma simples de evitar alterações acidentais."},
            {"id":"py-est-03","titulo":"Dicionários","prioridade":"fundamental","desc":"chaves, valores, get() e items()","detalhe":"Dicionário responde “qual valor pertence a esta chave?”. É ideal para um aluno identificado por matrícula ou um produto identificado por código. Prefira `.get()` quando uma chave poder faltar e trate a ausência conscientemente."},
            {"id":"py-est-04","titulo":"Conjuntos","prioridade":"importante","desc":"set, unicidade e operações entre conjuntos","detalhe":"Conjunto não guarda duplicatas e é eficiente para testar pertencimento. Ele não serve quando a ordem importa. Reconhecer essa troca evita usar lista para descobrir se um valor já apareceu muitas vezes."},
            {"id":"py-est-05","titulo":"Indexação e slicing","prioridade":"fundamental","desc":"índices, fatias e índices negativos","detalhe":"Fatiar cria uma parte de uma sequência sem precisar de laço. O limite final não entra na fatia; confira isso com exemplos pequenos. Índice negativo começa pelo fim e é útil, mas pode esconder um erro de tamanho se usado sem atenção."},
            {"id":"py-est-06","titulo":"Iterar coleções","prioridade":"fundamental","desc":"for, enumerate(), zip() e items()","detalhe":"Percorra os valores diretamente sempre que puder. `enumerate()` entrega índice e valor; `items()` entrega chave e valor. Código que usa o índice apenas para recuperar o mesmo item está fazendo trabalho extra."},
            {"id":"py-est-07","titulo":"Criar funções","prioridade":"fundamental","desc":"def, nome, responsabilidade e chamada","detalhe":"Função deve responder a uma pergunta ou realizar uma ação pequena com nome. Se precisa de um comentário para explicar tudo que faz, provavelmente há mais de uma responsabilidade misturada nela."},
            {"id":"py-est-08","titulo":"Parâmetros e argumentos","prioridade":"fundamental","desc":"entrada da função, posicionais e nomeados","detalhe":"Parâmetros descrevem o que a função precisa; argumentos são os valores concretos de uma chamada. Passe para a função somente o que ela precisa saber: isso facilita testar e reutilizar sem depender de variáveis espalhadas."},
            {"id":"py-est-09","titulo":"Retorno e escopo","prioridade":"fundamental","desc":"return, variáveis locais e efeitos","detalhe":"`return` devolve um resultado para quem chamou; `print()` apenas mostra algo na tela. Misturar os dois torna difícil reutilizar e testar. Variáveis locais vivem dentro da função e protegem o restante do programa de mudanças acidentais."},
            {"id":"py-est-10","titulo":"Decompor problemas","prioridade":"fundamental","desc":"passos, funções auxiliares e casos de teste","detalhe":"Quebre um problema grande em perguntas menores: cadastrar, buscar, validar, calcular, mostrar. Cada parte pode ser testada com entradas simples. A decomposição é a habilidade que permite começar um projeto antes de conhecer todas as respostas."}
          ]}]
        },
        {
          "id": "python-aplicado",
          "numero": 4,
          "titulo": "Python aplicado",
          "objetivo": "Construir programas modulares que leem, salvam e processam dados fora da memória.",
          "descricao": "Programa útil raramente vive de uma única execução. Nesta etapa, dados atravessam arquivos, módulos e serviços externos; por isso erro e formato deixam de ser detalhe. Você aprenderá a salvar informação de modo que o programa consiga retomá-la depois.\n\nO projeto é um gerenciador de despesas que persiste registros em JSON.",
          "preRequisitos": "Etapa 3",
          "duracao": "2–3 semanas",
          "criterios": ["Você divide código entre módulos sem importações confusas.", "Você lê e grava um arquivo sem destruir dados existentes.", "Você transforma falhas previsíveis em mensagens úteis."],
          "grupos": [{"id":"g-py-aplicado","titulo":"Arquivos e serviços","topicos":[
            {"id":"py-apl-01","titulo":"Módulos e importações","prioridade":"fundamental","desc":"import, from, arquivo e responsabilidade","detalhe":"Módulo é um arquivo que agrupa código relacionado. Importe funções e módulos pelo que oferecem, não por onde a execução começou. Evite dois módulos que se importam mutuamente: costuma ser sinal de responsabilidades misturadas."},
            {"id":"py-apl-02","titulo":"Biblioteca padrão","prioridade":"importante","desc":"documentação, random, math e collections","detalhe":"Antes de instalar uma dependência, procure na biblioteca padrão. Ela já resolve muitas tarefas comuns e reduz o que seu projeto precisa manter. Ler a documentação é parte do trabalho: exemplos mostram uso, referência explica limites."},
            {"id":"py-apl-03","titulo":"Datas e horas","prioridade":"importante","desc":"datetime, date, timedelta e formatação","detalhe":"Data é dado cheio de armadilhas: texto que parece data, fuso e mês com tamanhos diferentes. Guarde objetos de data enquanto calcula e formate para exibir só no fim. Somar dias como texto sempre quebra em alguma virada de mês."},
            {"id":"py-apl-04","titulo":"Caminhos com pathlib","prioridade":"fundamental","desc":"Path, diretório, arquivo e compatibilidade","detalhe":"Caminhos variam entre sistemas. `pathlib` evita montar strings com barras e oferece operações que dizem a intenção, como verificar se um arquivo existe. Um projeto que só funciona na pasta exata de quem o escreveu ainda não está pronto para outra pessoa."},
            {"id":"py-apl-05","titulo":"Arquivos de texto","prioridade":"fundamental","desc":"open, with, leitura e escrita","detalhe":"Abra arquivos com `with`: assim o recurso é fechado mesmo se algo falhar. Diferencie ler, acrescentar e sobrescrever — abrir para escrita pode apagar o conteúdo anterior. Faça uma cópia ou teste com arquivo pequeno antes de uma transformação destrutiva."},
            {"id":"py-apl-06","titulo":"JSON","prioridade":"fundamental","desc":"json.load, json.dump e estruturas serializáveis","detalhe":"JSON transforma listas, dicionários, números e textos em arquivo que outros programas entendem. Ele não sabe salvar qualquer objeto Python; converta datas e classes conscientemente. Valide o formato ao ler: arquivo existente não é sinônimo de arquivo válido."},
            {"id":"py-apl-07","titulo":"CSV","prioridade":"importante","desc":"csv.reader, csv.DictReader e cabeçalhos","detalhe":"CSV parece simples até uma vírgula aparecer dentro de um campo. Use o módulo `csv`, não `split(',')`. Cabeçalhos permitem acessar valores por nome, que é menos frágil que depender da quinta coluna ser sempre a mesma."},
            {"id":"py-apl-08","titulo":"Tratamento de exceções","prioridade":"fundamental","desc":"try, except, else, finally e erros específicos","detalhe":"Exceção é um caminho previsto para algo que não deu certo. Capture apenas erros que você sabe tratar e explique ao usuário o próximo passo. Um `except` genérico que esconde tudo troca um defeito visível por um dado errado silencioso."},
            {"id":"py-apl-09","titulo":"pip e bibliotecas externas","prioridade":"fundamental","desc":"instalação, versão e documentação","detalhe":"`pip` instala pacotes no ambiente ativo. Confirme qual ambiente está ativo antes de instalar; a maioria dos “módulo não encontrado” vem de pacote instalado em outro Python. Dependência nova também é código de terceiros: escolha com critério."},
            {"id":"py-apl-10","titulo":"APIs HTTP","prioridade":"importante","desc":"requisição, status, JSON e timeout","detalhe":"API é um contrato entre programas. Verifique código de status, trate falha de rede e não confie que toda resposta terá o campo esperado. Nunca deixe uma chamada externa sem timeout: esperar para sempre não é uma experiência aceitável."}
          ]}]
        },
        {
          "id": "ferramentas-profissionais",
          "numero": 5,
          "titulo": "Ferramentas profissionais",
          "objetivo": "Manter um projeto Python versionado, testável e reproduzível.",
          "descricao": "Projeto não termina quando roda no seu computador. Nesta etapa você aprende a registrar mudanças, separar dependências, entender erros e provar comportamentos importantes com testes. As ferramentas não substituem pensamento; elas tornam esse pensamento repetível.\n\nVocê refatorará um projeto anterior, adicionará testes e o publicará com um README que outra pessoa consiga seguir.",
          "preRequisitos": "Etapa 4",
          "duracao": "2 semanas",
          "criterios": ["Você cria um repositório com histórico compreensível.", "Você reproduz o ambiente a partir das instruções do projeto.", "Você escreve teste que falha antes da correção e passa depois."],
          "grupos": [{"id":"g-py-profissional","titulo":"Fluxo de desenvolvimento","topicos":[
            {"id":"py-pro-01","titulo":"Git","prioridade":"fundamental","desc":"repositório, status, add e commit","detalhe":"Git registra decisões no tempo. Faça commits pequenos que expliquem por que uma mudança existe; um commit não é cópia de segurança sem sentido, é uma unidade que outra pessoa pode revisar e reverter."},
            {"id":"py-pro-02","titulo":"GitHub","prioridade":"fundamental","desc":"repositório remoto, push, issue e colaboração","detalhe":"GitHub torna o projeto acessível e auditável. Revise o que será enviado antes do push, especialmente arquivos de configuração. Chaves e senhas não entram no repositório, mesmo privado: histórico é difícil de apagar de verdade."},
            {"id":"py-pro-03","titulo":"Branches e merge","prioridade":"importante","desc":"ramo de trabalho, comparação e conflito","detalhe":"Branch permite experimentar sem quebrar a linha principal. Conflito não é um erro do Git: é um pedido para decidir qual intenção deve sobreviver quando duas mudanças mexeram no mesmo lugar."},
            {"id":"py-pro-04","titulo":"Ambientes virtuais","prioridade":"fundamental","desc":"venv, ativação e isolamento","detalhe":"Um ambiente virtual separa dependências de cada projeto. Crie um por projeto e não use o Python do sistema como laboratório. Isso evita que instalar uma biblioteca para hoje quebre um projeto que funcionava ontem."},
            {"id":"py-pro-05","titulo":"Dependências","prioridade":"fundamental","desc":"requirements.txt, versões e instalação","detalhe":"Liste as dependências necessárias para executar o projeto e fixe versões quando a repetição importa. “Instale a versão mais recente” não é uma instrução reproduzível: a versão mais recente muda sem pedir licença."},
            {"id":"py-pro-06","titulo":"Depuração","prioridade":"fundamental","desc":"breakpoint, inspeção e hipótese","detalhe":"Depurar não é clicar aleatoriamente até parar de falhar. Forme uma hipótese, observe valores no ponto relevante e altere uma coisa por vez. Breakpoints permitem ver o estado sem encher o programa de prints permanentes."},
            {"id":"py-pro-07","titulo":"Ler mensagens de erro","prioridade":"fundamental","desc":"traceback, linha relevante e causa","detalhe":"Leia traceback de baixo para cima: a última linha nomeia o erro, as anteriores mostram como chegou ali. Copiar só a primeira linha para uma busca perde o contexto que distingue uma causa da outra."},
            {"id":"py-pro-08","titulo":"Testes com pytest","prioridade":"fundamental","desc":"asserção, casos e organização de testes","detalhe":"Teste automatizado responde se uma regra continua verdadeira após mudanças. Comece com funções pequenas e entradas conhecidas. Um bom teste dá nome ao comportamento, não à implementação interna."},
            {"id":"py-pro-09","titulo":"Formatação e Ruff","prioridade":"importante","desc":"formatador, linter e erro recorrente","detalhe":"Formatador reduz discussão estética; linter aponta padrões que costumam virar erro. Ruff não substitui revisão, mas libera atenção humana para a lógica. Rode as ferramentas antes de entregar uma mudança."},
            {"id":"py-pro-10","titulo":"README e documentação","prioridade":"fundamental","desc":"objetivo, instalação, uso e limites","detalhe":"README é a porta de entrada de quem não estava ao seu lado quando o projeto nasceu. Explique como instalar, rodar, testar e o que o programa ainda não faz. Instrução não testada por outra máquina é só uma esperança."}
          ]}]
        },
        {
          "id": "intermediario",
          "numero": 6,
          "titulo": "Python intermediário",
          "objetivo": "Projetar aplicações organizadas, modulares e extensíveis sem adicionar complexidade por hábito.",
          "descricao": "Esta etapa apresenta recursos que ficam valiosos quando um projeto cresce: objetos para modelar responsabilidades, tipos para comunicar contratos e construções que tornam processamento mais expressivo. O objetivo não é usar tudo; é reconhecer quando cada ferramenta reduz complexidade.\n\nO projeto é um sistema orientado a objetos para biblioteca ou controle de estoque.",
          "preRequisitos": "Etapa 5",
          "duracao": "3 semanas",
          "criterios": ["Você modela responsabilidades antes de criar classes.", "Você explica composição e herança com uma troca concreta.", "Você mede ou justifica a complexidade de uma busca simples."],
          "grupos": [{"id":"g-py-intermediario","titulo":"Organização e eficiência","topicos":[
            {"id":"py-int-01","titulo":"Objetos e classes","prioridade":"fundamental","desc":"classe, instância, estado e comportamento","detalhe":"Classe reúne dados e operações que fazem sentido juntos. Não transforme cada dicionário em classe automaticamente: crie uma quando houver comportamento e regras próprias para proteger. Objeto bem nomeado reduz parâmetros soltos."},
            {"id":"py-int-02","titulo":"Atributos e métodos","prioridade":"fundamental","desc":"self, inicialização e ações do objeto","detalhe":"Atributo descreve estado; método descreve o que o objeto pode fazer. Faça métodos preservarem as regras do próprio objeto, em vez de espalhar validações em quem o usa. Isso mantém a regra em um lugar só."},
            {"id":"py-int-03","titulo":"Encapsulamento","prioridade":"importante","desc":"invariantes, propriedades e interface","detalhe":"Encapsular não é esconder tudo; é expor uma interface que impede estados inválidos. Se saldo não pode ficar negativo, a operação que desconta deve validar isso. Convenções de Python ajudam, mas a regra precisa existir no código."},
            {"id":"py-int-04","titulo":"Composição e herança","prioridade":"fundamental","desc":"tem-um, é-um e reutilização consciente","detalhe":"Prefira composição quando um objeto usa outro; herança só cabe quando a relação “é um tipo de” é verdadeira e a substituição continua fazendo sentido. Hierarquias profundas parecem elegantes antes de a primeira mudança atravessá-las todas."},
            {"id":"py-int-05","titulo":"Métodos especiais","prioridade":"importante","desc":"__init__, __str__, __repr__ e operadores","detalhe":"Métodos especiais conectam seu objeto às convenções da linguagem. Um bom `__repr__` torna a depuração mais clara; não implemente operadores apenas porque pode. Cada comportamento novo precisa ser fácil de explicar a quem usa a classe."},
            {"id":"py-int-06","titulo":"List comprehensions","prioridade":"fundamental","desc":"transformação, filtro e legibilidade","detalhe":"Comprehension é uma forma concisa de criar coleção a partir de outra. Use-a quando couber em uma ideia; se houver várias condições ou efeitos, um laço explícito é mais legível. Código curto não é automaticamente código simples."},
            {"id":"py-int-07","titulo":"Iteradores e generators","prioridade":"importante","desc":"iter, next, yield e consumo sob demanda","detalhe":"Iterador entrega itens um por vez; generator permite escrever essa entrega sem guardar tudo na memória. É ideal para arquivo grande ou sequência potencialmente longa. Lembre que um generator consumido não volta ao início sozinho."},
            {"id":"py-int-08","titulo":"Type hints e dataclasses","prioridade":"fundamental","desc":"anotações, contratos e dados estruturados","detalhe":"Anotações de tipo ajudam pessoa e ferramenta a entender o que entra e sai de uma função; não validam automaticamente em execução. `dataclass` reduz código repetitivo para objetos cujo papel principal é carregar dados."},
            {"id":"py-int-09","titulo":"Context managers e regex","prioridade":"importante","desc":"with, recursos e padrões de texto","detalhe":"Context manager garante limpeza de recurso mesmo diante de erro; arquivos são o exemplo clássico. Expressão regular é poderosa para padrão de texto, mas precisa de testes com casos normais e estranhos para não virar uma regra impossível de manter."},
            {"id":"py-int-10","titulo":"Busca, ordenação e complexidade","prioridade":"fundamental","desc":"busca linear, ordenação e ordem de crescimento","detalhe":"Complexidade não pede decorar fórmulas: pede reconhecer trabalho repetido. Procurar numa lista é diferente de consultar um dicionário; ordenar antes de buscar pode compensar ou não conforme o número de buscas. Meça quando a decisão importar."}
          ]}]
        },
        {
          "id": "projeto-integrador",
          "numero": 7,
          "titulo": "Projeto integrador",
          "objetivo": "Entregar uma aplicação Python funcional que outra pessoa consiga executar e entender.",
          "descricao": "O projeto final junta conteúdo técnico e trabalho de produto: entender o problema, decidir um modelo, lidar com erros, salvar dados e documentar o caminho. O objetivo não é uma interface bonita nem uma lista enorme de recursos; é um sistema pequeno, correto e demonstrável.\n\nVocê construirá um controle financeiro pessoal de linha de comando com SQLite, testes e documentação.",
          "preRequisitos": "Etapa 6",
          "duracao": "2–3 semanas",
          "criterios": ["Você transforma requisitos em tarefas e critérios de aceitação.", "Você persiste e consulta dados sem corromper registros.", "Outra pessoa instala, testa e usa seu projeto seguindo o README."],
          "grupos": [{"id":"g-py-projeto-final","titulo":"Construir e entregar","topicos":[
            {"id":"py-fin-01","titulo":"Levantamento de requisitos","prioridade":"fundamental","desc":"problema, pessoa usuária, regras e limites","detalhe":"Comece dizendo o que o sistema faz e o que não faz. Requisito “controlar despesas” ainda é amplo; transforme-o em ações observáveis, como cadastrar, listar, filtrar e calcular saldo. Critério claro evita construir muito e provar pouco."},
            {"id":"py-fin-02","titulo":"Planejar a solução","prioridade":"fundamental","desc":"tarefas pequenas, ordem e risco","detalhe":"Planeje uma versão mínima que já salva uma transação e calcula saldo. Depois acrescente categorias e filtros. Entregar uma fatia funcionando cedo revela problemas de modelo antes de eles contaminarem todas as partes."},
            {"id":"py-fin-03","titulo":"Organizar o projeto","prioridade":"fundamental","desc":"módulos, responsabilidades e ponto de entrada","detalhe":"Separe interface de linha de comando, regras de negócio e persistência. Essa divisão permite testar cálculo sem simular teclado e trocar armazenamento sem reescrever menus. Pasta organizada é consequência de responsabilidades claras."},
            {"id":"py-fin-04","titulo":"Modelar transações","prioridade":"fundamental","desc":"receita, despesa, categoria, data e valor","detalhe":"Defina o que uma transação precisa ter e quais valores são válidos antes de criar a tabela. Valor, tipo e data não são texto livre sem consequência. Modelo explícito diminui as condições espalhadas pelo programa."},
            {"id":"py-fin-05","titulo":"SQLite","prioridade":"fundamental","desc":"banco local, tabela, chave e consulta parametrizada","detalhe":"SQLite guarda dados em um arquivo e é ideal para este projeto. Use parâmetros nas consultas, nunca concatenação de texto: além de segurança, parâmetros lidam corretamente com aspas e tipos."},
            {"id":"py-fin-06","titulo":"Persistir e consultar","prioridade":"fundamental","desc":"insert, select, filtro e saldo","detalhe":"Persistir só vale se for possível recuperar e conferir. Escreva consultas pequenas primeiro e teste o resultado com dados conhecidos. Saldo deve vir de uma regra única, não de um número salvo que pode divergir das transações."},
            {"id":"py-fin-07","titulo":"Interface de linha de comando","prioridade":"fundamental","desc":"menu, comandos, mensagens e fluxo","detalhe":"CLI boa diz o que espera e confirma o que fez. Mensagem de erro deve explicar o próximo passo, não despejar uma exceção técnica. Separe leitura de entrada da regra que processa o comando."},
            {"id":"py-fin-08","titulo":"Tratar erros","prioridade":"fundamental","desc":"validação, falha de banco e recuperação","detalhe":"Preveja valor inválido, categoria ausente e arquivo indisponível. Nunca apresente sucesso antes da operação terminar; se não salvou, a pessoa precisa saber. Erro visível e honesto é melhor que uma tela tranquila com dados perdidos."},
            {"id":"py-fin-09","titulo":"Testar o projeto","prioridade":"fundamental","desc":"regras, banco temporário e regressão","detalhe":"Teste cálculo de saldo, filtros e validações com cenários pequenos. Use banco temporário nos testes para não misturar dados de demonstração com dados reais. Cada defeito corrigido merece um teste que impede seu retorno."},
            {"id":"py-fin-10","titulo":"Publicar e apresentar","prioridade":"fundamental","desc":"GitHub, README, demonstração e limitações","detalhe":"Publique código, instruções, testes e uma demonstração curta do fluxo principal. Apresente também uma limitação real e o próximo passo que faria: reconhecer limites mostra que você entende o sistema, não só que conseguiu rodá-lo."}
          ]}]
        }
      ]
    },
    "PROJETOS": {
      "primeiros-passos": ["Projeto — apresentação pessoal interativa no terminal: pergunte nome, cidade e objetivo de estudo; mostre uma mensagem organizada com as respostas."],
      "fundamentos": ["Calculadora interativa: receba dois números e uma operação, valide a escolha e mostre o resultado.", "Simulador de média escolar: receba notas, calcule a média e informe aprovação, recuperação ou reprovação."],
      "estruturas-funcoes": ["Sistema de alunos: cadastrar, listar, pesquisar por matrícula e calcular média usando listas, dicionários e funções pequenas."],
      "python-aplicado": ["Gerenciador de despesas em JSON: cadastrar receita ou despesa, listar registros, calcular saldo e salvar os dados para a próxima execução."],
      "ferramentas-profissionais": ["Refatore um projeto anterior, crie ambiente virtual, adicione testes com pytest, configure Ruff e publique com README reproduzível."],
      "intermediario": ["Sistema de biblioteca ou estoque orientado a objetos: modele entidades, aplique regras de empréstimo ou quantidade e cubra as regras críticas com testes."],
      "projeto-integrador": ["Projeto final — controle financeiro pessoal: receitas e despesas categorizadas, filtros, saldo, SQLite, tratamento de erros, testes e README de instalação e uso."]
    },
    "RECURSOS": [
      {"etapa":"primeiros-passos","titulo":"Documentação oficial do Python — Tutorial","url":"https://docs.python.org/pt-br/3/tutorial/","nota":"Leia junto do terminal; não como livro de uma vez."},
      {"etapa":"fundamentos","titulo":"Python — estruturas de controle","url":"https://docs.python.org/pt-br/3/tutorial/controlflow.html","nota":"Referência para condições, laços e funções."},
      {"etapa":"estruturas-funcoes","titulo":"Python — estruturas de dados","url":"https://docs.python.org/pt-br/3/tutorial/datastructures.html","nota":"Listas, dicionários, conjuntos e tuplas."},
      {"etapa":"python-aplicado","titulo":"Python — biblioteca padrão","url":"https://docs.python.org/pt-br/3/library/","nota":"Procure aqui antes de instalar uma dependência."},
      {"etapa":"ferramentas-profissionais","titulo":"pytest — primeiros passos","url":"https://docs.pytest.org/en/stable/getting-started.html","nota":"Comece com testes de funções pequenas."},
      {"etapa":"ferramentas-profissionais","titulo":"Ruff","url":"https://docs.astral.sh/ruff/","nota":"Formatador e linter do projeto."},
      {"etapa":"intermediario","titulo":"Python — classes","url":"https://docs.python.org/pt-br/3/tutorial/classes.html","nota":"Use para consolidar orientação a objetos."},
      {"etapa":"projeto-integrador","titulo":"SQLite — documentação","url":"https://www.sqlite.org/docs.html","nota":"Referência do banco local usado no projeto final."}
    ],
    "LEGENDA": [
      {"chave":"fundamental","rotulo":"Fundamental","desc":"Ordem estrita. Não pule."},
      {"chave":"importante","rotulo":"Importante","desc":"Recomendado, mas a ordem é flexível."},
      {"chave":"opcional","rotulo":"Opcional","desc":"Pule sem culpa e volte depois."}
    ],
    "ESTADOS": [
      {"chave":"pendente","rotulo":"Pendente"},
      {"chave":"estudando","rotulo":"Estudando"},
      {"chave":"feito","rotulo":"Feito"},
      {"chave":"pulado","rotulo":"Pulado"}
    ],
    "CRITERIOS": [
      "Consigo explicar esta solução para alguém que não a escreveu?",
      "O que acontece quando a entrada é inválida ou falta um dado?",
      "Como verifico que o resultado continua certo depois de mudar o código?",
      "Outra pessoa consegue executar isto apenas com o README?"
    ]
  }
  $json$::jsonb
)
on conflict (id) do nothing;
