/* Computer Vision — iterações 0 a 4 (base) */

ROADMAP_ETAPAS.push(
  {
    id: "pre",
    numero: 0,
    titulo: "Pré-requisitos",
    objetivo: "Ter Python e NumPy sob controle e conseguir ler, escrever e exibir imagem e vídeo.",
    descricao:
      "Esta etapa não é sobre visão: é sobre não tropeçar na ferramenta. " +
      "O ponto de virada é parar de pensar em imagem como \"arquivo\" e passar a pensar nela como " +
      "uma matriz `H × W × C` de inteiros de 0 a 255 — porque é isso que todo o resto do roadmap manipula. " +
      "Se você já programa em Python, o trabalho real aqui é o NumPy vetorizado: " +
      "um laço `for` sobre pixels em Python é entre 50 e 500 vezes mais lento que a operação equivalente " +
      "em NumPy, e essa diferença decide se o seu protótipo roda em tempo real ou não.",
    preRequisitos: "Nenhum",
    duracao: null,
    criterios: [
      "Você explica por que o OpenCV usa BGR e o que quebra quando você mistura com bibliotecas em RGB.",
      "Você percorre e altera pixels sem laços Python explícitos, usando apenas NumPy.",
      "Você recria seu ambiente do zero em uma máquina limpa em menos de 10 minutos.",
    ],
    grupos: [
      {
        id: "cv-g-py",
        titulo: "Python",
        descricao: "O suficiente para escrever código que você mesmo consiga manter daqui a três meses.",
        topicos: [
          { id: "cv-pre-01", titulo: "Sintaxe e controle de fluxo", prioridade: "fundamental", inicial: "feito",
            desc: "Variáveis, operadores, condicionais, laços (`for`, `while`, `break`, `continue`, `else`).",
            detalhe: "O `else` de um laço é o detalhe que quase todo mundo desconhece: ele roda quando o laço termina SEM `break`, o que é exatamente o padrão \"procurei e não achei\". Fora isso, o que importa aqui é fluência: você não deveria estar pensando em sintaxe enquanto depura um pipeline de visão." },
          { id: "cv-pre-02", titulo: "Estruturas de dados", prioridade: "fundamental", inicial: "feito",
            desc: "Listas, strings, dicionários, tuplas e sets.",
            detalhe: "A escolha da estrutura é escolha de complexidade: buscar em lista é O(n), em set ou dict é O(1). Em visão isso aparece ao cruzar IDs de detecção entre frames — com lista, o tracking fica quadrático no número de objetos. Tuplas são imutáveis e por isso podem ser chave de dicionário, o que é útil para indexar por coordenada." },
          { id: "cv-pre-03", titulo: "Funções, retorno e escopo", prioridade: "fundamental", inicial: "feito",
            desc: "`return`, recursão e regras de escopo.",
            detalhe: "A armadilha clássica de Python é o argumento padrão mutável: `def f(x, acc=[])` reusa a MESMA lista entre chamadas. Use `None` como padrão e crie a lista dentro. Em visão isso morde quando você acumula detecções entre frames sem perceber." },
          { id: "cv-pre-04", titulo: "Arquivos e exceções", prioridade: "fundamental", inicial: "feito",
            desc: "Manipulação de arquivos e tratamento de exceções.",
            detalhe: "Use sempre `with open(...)` para que o arquivo feche mesmo se der erro no meio. Em exceções, capture o tipo específico (`FileNotFoundError`), não `except Exception`: um `except` genérico engole o erro de programação junto com o erro esperado e você perde horas achando que o arquivo é que estava errado." },
          { id: "cv-pre-05", titulo: "Orientação a objetos", prioridade: "importante", inicial: "feito",
            desc: "Classes, herança e composição.",
            detalhe: "Em visão você vai escrever classes o tempo todo — `Dataset` do PyTorch, trackers, pipelines. A regra prática: prefira composição a herança. Um `Pipeline` que CONTÉM um detector e um tracker é mais fácil de trocar e testar do que um que HERDA de ambos." },
          { id: "cv-pre-06", titulo: "Recursos avançados", prioridade: "importante", inicial: "feito",
            desc: "Decorators, generators e context managers.",
            detalhe: "Generators (`yield`) são o que permite processar um vídeo de 2 horas sem carregar tudo na memória: você entrega um frame por vez. Decorators aparecem como `@torch.no_grad()` e em cronômetros de perfilagem. Context managers (`with`) garantem que a câmera é liberada mesmo quando o código estoura no meio." },
          { id: "cv-pre-07", titulo: "Ambientes virtuais", prioridade: "fundamental", inicial: "feito",
            desc: "`venv` ou `uv` e gerenciamento de dependências.",
            detalhe: "Visão computacional é a área onde o inferno de dependências é mais real: versão de CUDA, de PyTorch, de OpenCV e de driver precisam combinar. Um ambiente por projeto, com as versões fixadas em arquivo, é o que torna o seu trabalho reproduzível — e é literalmente um dos critérios de domínio desta etapa." },
          { id: "cv-pre-08", titulo: "NumPy", prioridade: "fundamental", inicial: "feito",
            desc: "Arrays, shapes, slicing, broadcasting e operações vetorizadas.",
            detalhe: "É a etapa mais importante desta lista. Uma imagem É um array NumPy, então recortar uma região é `img[y1:y2, x1:x2]` e clarear é `img + 30`. Broadcasting é o que permite aplicar um valor por canal sem laço. Atenção: slicing devolve uma VISTA que compartilha memória — alterar o recorte altera a imagem original, o que é ótimo para performance e péssimo quando não era a intenção." },
          { id: "cv-pre-09", titulo: "O que é uma imagem", prioridade: "fundamental", inicial: "feito",
            desc: "Matriz `H × W × C`, dtype `uint8`, intervalo 0–255.",
            detalhe: "A ordem é altura, largura, canais — o inverso da intuição de \"largura por altura\" de quem vem do design. O dtype `uint8` tem um comportamento traiçoeiro: ele dá a volta (`250 + 10 = 4`), então clarear uma imagem com soma direta escurece as regiões já claras. Para aritmética segura, converta para `float32`, opere e use `np.clip` antes de voltar para `uint8`." },
          { id: "cv-pre-10", titulo: "Entrada e saída no OpenCV", prioridade: "fundamental", inicial: "feito",
            desc: "`imread`, `imwrite`, `VideoCapture`, `VideoWriter`.",
            detalhe: "`imread` NÃO levanta exceção em arquivo inexistente: ele devolve `None` silenciosamente, e o erro só aparece três linhas depois com uma mensagem incompreensível. Cheque o retorno sempre. No `VideoWriter`, o FourCC e o FPS precisam ser compatíveis com o container, senão você obtém um arquivo de 0 byte sem nenhum aviso." },
        ],
      },
    ],
  },

  {
    id: "classica",
    numero: 1,
    titulo: "Visão clássica com OpenCV",
    objetivo: "Resolver problemas de visão sem deep learning.",
    descricao:
      "Esta é a iteração que mais gente pula e que mais se arrepende de ter pulado. " +
      "Ela constrói a intuição que depois explica o que a CNN está aprendendo — um filtro de Sobel " +
      "escrito à mão é literalmente o que a primeira camada de uma rede converge a aprender sozinha. " +
      "Além disso, boa parte do trabalho real de um engenheiro de visão é pré-processamento, " +
      "definição de ROI, calibração e pós-processamento: tudo isso vive aqui, antes e depois do modelo. " +
      "E, com frequência, a solução clássica é a solução certa em produção — ela é determinística, " +
      "roda em milissegundos na CPU e não precisa de dataset anotado.",
    preRequisitos: "Etapa 0",
    duracao: null,
    criterios: [
      "Você escolhe o espaço de cor a partir do problema, não por tentativa e erro.",
      "Você diagnostica um pipeline clássico que falhou identificando em qual etapa a informação foi perdida.",
      "Você sabe apontar em que condições de iluminação e fundo a abordagem clássica deixa de servir.",
    ],
    grupos: [
      {
        id: "cv-g-cl-1",
        titulo: "Manipulação e realce",
        descricao: "As operações que preparam a imagem antes de qualquer decisão sobre ela.",
        topicos: [
          { id: "cv-cl-01", titulo: "Espaços de cor", prioridade: "fundamental", inicial: "feito",
            desc: "BGR, RGB, HSV, LAB e quando cada um é preferível.",
            detalhe: "HSV é a resposta quando o problema é \"achar o objeto daquela cor\": ele separa matiz (qual cor) de saturação e valor (quão intensa, quão clara), então uma sombra sobre o objeto muda o V mas preserva o H. Em BGR, a mesma sombra muda os três canais ao mesmo tempo e o limiar quebra. LAB é útil quando você precisa de diferença de cor perceptualmente uniforme. O OpenCV usa BGR por herança histórica das câmeras dos anos 90 — e isso é a causa número um de imagens com azul e vermelho trocados ao misturar com matplotlib ou PIL." },
          { id: "cv-cl-02", titulo: "Operações geométricas", prioridade: "fundamental",
            desc: "Crop, resize, rotação, flip, translação e warp.",
            detalhe: "Todo redimensionamento interpola, e a escolha importa: `INTER_AREA` para reduzir (faz média, evita aliasing), `INTER_LINEAR` ou `INTER_CUBIC` para ampliar. Reduzir com `INTER_NEAREST` cria serrilhado que depois vira ruído de alta frequência nos filtros. Ao rotacionar, lembre que a imagem resultante é retangular: ou você corta os cantos, ou calcula o novo bounding box e preenche as bordas." },
          { id: "cv-cl-03", titulo: "Operações aritméticas e máscaras", prioridade: "fundamental",
            desc: "Operações aritméticas e bitwise entre imagens; máscaras.",
            detalhe: "Máscara é o mecanismo central da visão clássica: uma imagem binária onde 255 significa \"aqui sim\". `cv2.bitwise_and(img, img, mask=m)` é o idioma para aplicar uma. Use `cv2.add` em vez de `+` quando quiser saturação em 255 em vez de estouro — a diferença entre um céu branco e um céu com manchas pretas é exatamente essa." },
          { id: "cv-cl-04", titulo: "Desenho sobre a imagem", prioridade: "opcional",
            desc: "Linhas, retângulos, círculos e texto.",
            detalhe: "Parece trivial e é a sua ferramenta de depuração mais usada: desenhar o bounding box, o contorno detectado e o valor do limiar sobre o frame é como você vê o que o algoritmo está vendo. Lembre que essas funções alteram a imagem NO LUGAR — desenhe sempre sobre uma cópia se ainda for processar o original." },
          { id: "cv-cl-05", titulo: "Suavização", prioridade: "fundamental",
            desc: "Blur médio, gaussiano, mediano e bilateral.",
            detalhe: "Cada um serve a um ruído: o mediano é o único que remove ruído sal e pimenta sem borrar, porque usa a mediana em vez da média e portanto ignora o outlier. O gaussiano é o padrão antes de detectar bordas, já que Canny amplifica ruído. O bilateral preserva bordas enquanto suaviza áreas planas, ao custo de ser ordens de magnitude mais lento — raramente cabe em tempo real." },
          { id: "cv-cl-06", titulo: "Limiarização", prioridade: "fundamental",
            desc: "Global, adaptativa e Otsu.",
            detalhe: "Limiar global só funciona com iluminação uniforme — que quase nunca é o caso. Otsu escolhe o limiar automaticamente maximizando a separação entre dois picos do histograma, mas pressupõe que existem dois picos. A adaptativa calcula um limiar por vizinhança e é o que salva documento fotografado com sombra de um lado. Se a sua limiarização falha, o problema costuma estar na iluminação, não no parâmetro." },
          { id: "cv-cl-07", titulo: "Morfologia", prioridade: "fundamental",
            desc: "Erosão, dilatação, abertura, fechamento e gradiente.",
            detalhe: "É a faxina pós-limiarização. Abertura (erosão seguida de dilatação) remove pontinhos brancos soltos; fechamento (o inverso) tampa buracos dentro do objeto. O tamanho e a forma do kernel são o parâmetro de verdade: um kernel elíptico de 5×5 remove ruído diferente de um retangular de 3×9. Aplicar erosão demais faz objetos finos desaparecerem por completo." },
          { id: "cv-cl-08", titulo: "Histogramas", prioridade: "importante",
            desc: "Cálculo, equalização e CLAHE.",
            detalhe: "O histograma diz se a imagem está subexposta, estourada ou com baixo contraste — antes de você culpar o algoritmo. Equalização global espalha os níveis por toda a faixa, mas amplifica ruído em regiões já uniformes. CLAHE faz isso por blocos com limite de contraste, e é o que se usa na prática em imagem médica e em cena com iluminação desigual." },
        ],
      },
      {
        id: "cv-g-cl-2",
        titulo: "Extração de estrutura",
        descricao: "De pixels para entidades: bordas, formas e correspondências entre imagens.",
        topicos: [
          { id: "cv-cl-09", titulo: "Detecção de bordas", prioridade: "fundamental",
            desc: "Sobel, Laplaciano e Canny (e o papel dos dois limiares).",
            detalhe: "Borda é derivada: onde a intensidade muda rápido. Sobel aproxima a primeira derivada em X ou Y; o Laplaciano usa a segunda. Canny é um pipeline completo — suaviza, calcula gradiente, afina a borda e aplica histerese com DOIS limiares: acima do alto é borda certa, entre os dois só conta se estiver conectada a uma borda certa. Essa conectividade é o que evita bordas tracejadas, e é por isso que mexer só no limiar baixo muda tanto o resultado." },
          { id: "cv-cl-10", titulo: "Contornos", prioridade: "fundamental",
            desc: "Extração, hierarquia, área, perímetro, bounding box e aproximação poligonal.",
            detalhe: "Contorno é a fronteira de uma região conectada, e dele saem as medidas que viram decisão: área (filtra ruído por tamanho mínimo), razão de aspecto, extensão e solidez (identificam forma). `approxPolyDP` reduz o contorno a poucos vértices — se sobram 4, provavelmente é um retângulo. A hierarquia informa quem está dentro de quem, que é como se detecta um furo dentro de uma peça." },
          { id: "cv-cl-11", titulo: "Features e casamento", prioridade: "importante",
            desc: "Harris, SIFT, ORB, matchers e homografia.",
            detalhe: "Feature é um ponto que você reconhece mesmo que a imagem gire, mude de escala ou de iluminação — tipicamente um canto, nunca um ponto no meio de uma área lisa. SIFT é mais robusto mas era patenteado; ORB é livre, rápido e suficiente na maior parte dos casos. Com pares casados entre duas imagens, a homografia é a matriz 3×3 que leva uma no plano da outra: é assim que se faz panorama, correção de perspectiva de documento e alinhamento de duas tomadas da mesma cena." },
          { id: "cv-cl-12", titulo: "Vídeo e subtração de fundo", prioridade: "importante",
            desc: "MOG2, KNN e diferença entre frames.",
            detalhe: "Com câmera fixa, modelar o fundo e subtrair é o detector de movimento mais barato que existe. MOG2 e KNN mantêm um modelo estatístico por pixel e se adaptam a mudanças lentas de luz. As falhas previsíveis: objeto que para passa a fazer parte do fundo; sombra é detectada como movimento (MOG2 tem opção para marcá-la); e qualquer tremor da câmera invalida o modelo inteiro." },
        ],
      },
    ],
  },

  {
    id: "matematica",
    numero: 2,
    titulo: "Fundamentos matemáticos aplicados",
    objetivo: "Ver a matemática como explicação do que você já implementou, não como pré-requisito abstrato.",
    descricao:
      "A ordem aqui é deliberada e contraria a maioria dos cursos: você já escreveu o filtro antes de " +
      "estudar a convolução, já viu a borda aparecer antes de saber que estava calculando uma derivada. " +
      "Isso transforma a matemática de obstáculo em explicação. " +
      "O objetivo não é demonstrar teoremas, e sim conseguir prever o comportamento: saber o que acontece " +
      "com o tamanho da saída quando você muda o stride, por que uma taxa de aprendizado alta diverge, " +
      "e o que o PCA está jogando fora quando reduz dimensão.",
    preRequisitos: "Etapa 1",
    duracao: null,
    criterios: [
      "Você explica o que muda no tamanho da saída ao alterar stride e padding, sem consultar a fórmula.",
      "Você relaciona o kernel de Sobel ao conceito de derivada da imagem.",
      "Você sabe dizer por que uma taxa de aprendizado alta faz a perda divergir.",
    ],
    grupos: [
      {
        id: "cv-g-mat-1",
        titulo: "Álgebra linear e geometria",
        topicos: [
          { id: "cv-mat-01", titulo: "Vetores e matrizes", prioridade: "fundamental",
            desc: "Produto matricial, transposta e inversa.",
            detalhe: "A intuição que vale mais que a mecânica: uma matriz é uma FUNÇÃO que transforma vetores. O produto `A @ B` é a composição \"aplique B, depois A\" — por isso a ordem importa. A inversa desfaz a transformação, e só existe se nada foi perdido no caminho; uma matriz que achata o espaço em uma dimensão menor não tem inversa, e é isso que o determinante zero está dizendo." },
          { id: "cv-mat-02", titulo: "Autovalores, autovetores e PCA", prioridade: "importante",
            desc: "O que isso significa em uma imagem.",
            detalhe: "Autovetor é a direção que a transformação não gira, só estica; o autovalor é o quanto estica. PCA usa isso para achar as direções de maior variância dos dados. Aplicado a rostos, os primeiros componentes viram as \"eigenfaces\": padrões de iluminação e forma que, somados, reconstroem qualquer rosto do conjunto. O exercício de reconstruir imagens com poucos componentes mostra na prática o que cada componente carrega." },
          { id: "cv-mat-03", titulo: "Transformações geométricas como matrizes", prioridade: "fundamental",
            desc: "Translação, rotação, escala, afim e projetiva.",
            detalhe: "O truque das coordenadas homogêneas (acrescentar um 1 ao vetor) é o que permite expressar translação como multiplicação de matriz, e portanto compor rotação, escala e translação num único produto. Afim preserva paralelismo e precisa de 3 pares de pontos; projetiva não preserva e precisa de 4 — é a diferença entre endireitar uma imagem levemente torta e corrigir a perspectiva de um documento fotografado de lado." },
          { id: "cv-mat-04", titulo: "Convolução e correlação cruzada", prioridade: "fundamental",
            desc: "Kernel, stride, padding e o efeito de cada um.",
            detalhe: "Convolução formalmente inverte o kernel; correlação cruzada não. Na prática as bibliotecas de deep learning implementam correlação cruzada e chamam de convolução — e como o kernel é aprendido, dá no mesmo. A fórmula do tamanho de saída, que vale a pena internalizar: `(entrada + 2·padding − kernel) / stride + 1`. Padding `same` existe para manter o tamanho; stride 2 reduz pela metade e é a alternativa ao pooling." },
        ],
      },
      {
        id: "cv-g-mat-2",
        titulo: "Cálculo, otimização e estatística",
        topicos: [
          { id: "cv-mat-05", titulo: "Cálculo", prioridade: "fundamental",
            desc: "Derivadas, gradiente, regra da cadeia e derivadas parciais.",
            detalhe: "O gradiente é o vetor que aponta para a subida mais íngreme; treinar é andar no sentido contrário. A regra da cadeia é literalmente o backpropagation: a derivada de uma composição é o produto das derivadas de cada etapa. Entender isso explica por que redes muito profundas sofrem com gradiente que desaparece — é um produto de muitos números menores que 1." },
          { id: "cv-mat-06", titulo: "Gradiente descendente", prioridade: "fundamental",
            desc: "Variantes e taxa de aprendizado.",
            detalhe: "A taxa de aprendizado é o tamanho do passo. Pequena demais: converge devagar ou empaca em mínimo local raso. Grande demais: o passo ultrapassa o vale, a perda sobe, e a divergência vira NaN em poucas iterações. É o hiperparâmetro que mais importa, e o teste de sanidade mais rápido quando um treino não desce." },
          { id: "cv-mat-07", titulo: "Probabilidade", prioridade: "importante",
            desc: "Variáveis aleatórias, distribuições, Bayes, média e variância.",
            detalhe: "Bayes é o que converte \"o modelo acertou 99% no teste\" em \"qual a chance de estar certo NESTE caso\" — e a resposta depende da prevalência. Com um evento raro (1 em 10 mil), mesmo um detector de 99% de precisão produz muito mais falsos positivos do que verdadeiros. É a matemática por trás da sua desconfiança saudável de métricas altas." },
          { id: "cv-mat-08", titulo: "Estatística", prioridade: "importante",
            desc: "Amostragem, viés, correlação e significância.",
            detalhe: "Viés de amostragem é o erro mais caro em visão: se todas as fotos da classe A foram tiradas de dia e as da classe B de noite, o modelo aprende iluminação e reporta acurácia excelente. Sobre significância: a diferença entre 91,2% e 91,8% em um conjunto de teste de 500 imagens está dentro do ruído — não é melhoria, é variação." },
          { id: "cv-mat-09", titulo: "Otimização", prioridade: "importante",
            desc: "Funções de custo, mínimos locais, regularização L1 e L2.",
            detalhe: "A função de custo é a tradução do seu objetivo em número derivável — escolhê-la é uma decisão de projeto, não um detalhe. L2 (weight decay) encolhe todos os pesos suavemente; L1 zera muitos deles e produz um modelo esparso, útil quando você quer seleção de features. Em redes profundas, mínimos locais são um problema menor do que a teoria sugere; o obstáculo real costuma ser platôs e pontos de sela." },
        ],
      },
    ],
  },

  {
    id: "ml-classico",
    numero: 3,
    titulo: "Machine learning clássico",
    objetivo: "Aprender a avaliar modelos corretamente antes de treinar redes profundas.",
    descricao:
      "A razão de esta iteração vir antes das redes é econômica: erro de avaliação em modelo clássico " +
      "custa minutos para descobrir; o mesmo erro em rede profunda custa dias de GPU e passa despercebido " +
      "por semanas, porque o número na tela continua subindo. " +
      "Aqui você aprende a desconfiar da própria métrica — vazamento de dados, acurácia enganosa em " +
      "dataset desbalanceado, validação que não representa produção. " +
      "São os mesmos erros que depois aparecem em deep learning, só que aqui eles são visíveis.",
    preRequisitos: "Etapa 2",
    duracao: null,
    criterios: [
      "Você explica por que acurácia é uma métrica ruim em dataset desbalanceado, com um exemplo numérico.",
      "Você identifica vazamento de dados em um pipeline (por exemplo, normalizar antes de dividir o conjunto).",
      "Você escolhe entre priorizar precisão ou recall a partir do custo do erro no domínio.",
    ],
    grupos: [
      {
        id: "cv-g-mlc-1",
        titulo: "Enquadramento e algoritmos",
        topicos: [
          { id: "cv-mlc-01", titulo: "Tipos de aprendizado", prioridade: "fundamental",
            desc: "Supervisionado e não supervisionado; classificação e regressão.",
            detalhe: "Supervisionado precisa de rótulo, e rotular é o gargalo real de qualquer projeto de visão — não o modelo. Não supervisionado dispensa rótulo mas entrega agrupamento, não resposta: o algoritmo separa os dados em grupos e cabe a você decidir o que cada grupo significa. Classificação prevê categoria; regressão prevê número contínuo, como a coordenada de um ponto." },
          { id: "cv-mlc-02", titulo: "Divisão de dados e vazamento", prioridade: "fundamental",
            desc: "Treino, validação e teste; vazamento de dados.",
            detalhe: "Treino ajusta parâmetros, validação ajusta hiperparâmetros, teste se toca UMA vez. Vazamento é qualquer informação do teste que escapa para o treino, e em visão ele tem formas próprias: frames consecutivos do mesmo vídeo em splits diferentes (são quase a mesma imagem), augmentação aplicada antes da divisão, ou normalização calculada sobre o conjunto inteiro. O sintoma é sempre o mesmo: validação ótima, produção péssima." },
          { id: "cv-mlc-03", titulo: "Classificadores clássicos", prioridade: "importante",
            desc: "KNN, árvores de decisão, Random Forest e SVM (incluindo o kernel trick).",
            detalhe: "KNN não treina: guarda tudo e compara na hora, o que o torna lento na inferência e péssimo em alta dimensão. Random Forest é o baseline honesto para dados tabulares e descritores de imagem — robusto e quase sem ajuste. SVM com kernel RBF projeta os dados num espaço de dimensão maior onde eles ficam separáveis, sem nunca calcular essa projeção explicitamente; foi o estado da arte em classificação de imagem antes das CNNs." },
          { id: "cv-mlc-04", titulo: "K-Means e clustering em imagens", prioridade: "importante",
            desc: "Segmentação por cor e quantização.",
            detalhe: "Tratando cada pixel como um ponto em 3 dimensões (B, G, R), o K-Means agrupa cores parecidas: isso é quantização de cor e também uma segmentação ingênua. Limitações a conhecer: você precisa escolher o K, o resultado depende da inicialização, e o algoritmo assume grupos esféricos de tamanho parecido — o que raramente descreve regiões de uma imagem real." },
          { id: "cv-mlc-05", titulo: "Validação cruzada e hiperparâmetros", prioridade: "fundamental",
            desc: "Cross-validation e busca de hiperparâmetros.",
            detalhe: "Validação cruzada em K dobras dá uma estimativa com barra de erro em vez de um número solto, e é o que diferencia \"melhorou\" de \"deu sorte na divisão\". Use a variante estratificada para preservar a proporção das classes. Busca aleatória costuma achar bons hiperparâmetros mais rápido que busca em grade, porque a maioria dos hiperparâmetros não importa e a grade desperdiça tempo variando os irrelevantes." },
        ],
      },
      {
        id: "cv-g-mlc-2",
        titulo: "Avaliação e preparação de dados",
        topicos: [
          { id: "cv-mlc-06", titulo: "Métricas de classificação", prioridade: "fundamental",
            desc: "Acurácia, precisão, recall, F1, matriz de confusão, ROC e AUC.",
            detalhe: "O exemplo numérico que resolve o critério de domínio: num dataset com 99% de classe negativa, o modelo que responde sempre \"negativo\" tem 99% de acurácia e serve para nada. Precisão responde \"dos que apontei, quantos eram\"; recall, \"dos que existiam, quantos achei\". A matriz de confusão é mais informativa que qualquer número único, porque mostra QUAIS classes se confundem — e isso costuma apontar um problema de anotação." },
          { id: "cv-mlc-07", titulo: "Overfitting, viés e variância", prioridade: "fundamental",
            desc: "Overfitting, underfitting, viés e variância.",
            detalhe: "O diagnóstico se faz comparando duas curvas: erro de treino alto e validação alta é underfitting (modelo simples demais, viés); treino baixo e validação alta é overfitting (decorou, variância). Cada caso pede o oposto do outro — mais capacidade contra mais dados e regularização. Tratar overfitting com um modelo maior é o erro mais comum de quem não olha as duas curvas." },
          { id: "cv-mlc-08", titulo: "Engenharia de features", prioridade: "importante",
            desc: "Seleção, redução de dimensionalidade e normalização.",
            detalhe: "Normalizar é obrigatório para KNN e SVM, que dependem de distância: sem isso, a feature de maior escala domina o cálculo. O detalhe que vira vazamento: calcule média e desvio APENAS no treino e aplique no teste, nunca o contrário. Em alta dimensão, as distâncias se achatam (\"maldição da dimensionalidade\") e reduzir dimensão passa a melhorar o resultado, não só a velocidade." },
          { id: "cv-mlc-09", titulo: "Descritores clássicos de imagem", prioridade: "importante",
            desc: "HOG, LBP e histogramas de cor.",
            detalhe: "São o elo entre a iteração 1 e o machine learning: convertem a imagem num vetor de tamanho fixo que o classificador consegue consumir. HOG descreve a distribuição de orientações de gradiente em células e foi a base da detecção de pedestres por anos. LBP captura textura comparando cada pixel com seus vizinhos. HOG + SVM é um baseline que ainda vale como referência, e é o projeto desta iteração." },
          { id: "cv-mlc-10", titulo: "Augmentation e desbalanceamento", prioridade: "fundamental",
            desc: "Data augmentation e classes desbalanceadas.",
            detalhe: "Augmentation só vale se a transformação for plausível no seu domínio: espelhar um gato horizontalmente faz sentido, espelhar um dígito manuscrito cria um rótulo errado. Para desbalanceamento, as opções são pesar a classe na função de custo, reamostrar, ou mudar a métrica — e a primeira costuma ser a menos destrutiva. Aplique augmentation apenas no treino, jamais na validação." },
          { id: "cv-mlc-11", titulo: "Scikit-learn na prática", prioridade: "importante",
            desc: "`Pipeline`, transformadores e reprodutibilidade com `random_state`.",
            detalhe: "O `Pipeline` existe para tornar o vazamento difícil: ele garante que cada transformador só vê o treino dentro de cada dobra da validação cruzada. Fixe `random_state` em toda divisão e todo modelo estocástico — sem isso, você não consegue dizer se a melhoria veio da sua mudança ou de outra divisão dos dados." },
        ],
      },
    ],
  },

  {
    id: "redes",
    numero: 4,
    titulo: "Redes neurais e PyTorch",
    objetivo: "Entender o que uma rede faz internamente antes de usar modelos prontos.",
    descricao:
      "Esta é a última iteração em que você escreve as coisas do zero. Daqui em diante você usa modelos " +
      "pré-treinados, e a diferença entre quem consegue depurá-los e quem não consegue é exatamente o " +
      "que se aprende aqui. " +
      "Implementar forward e backward à mão em NumPy, mesmo para um problema trivial, é o que transforma " +
      "backpropagation de palavra em mecanismo. " +
      "Depois disso, o loop de treino do PyTorch deixa de ser um template copiado e passa a ser cinco " +
      "linhas cujo propósito você consegue justificar uma a uma.",
    preRequisitos: "Etapa 3",
    duracao: null,
    criterios: [
      "Você escreve um loop de treino em PyTorch do zero, sem consultar um template.",
      "Você diagnostica três sintomas distintos: perda que não desce, perda que diverge, e treino bom com validação ruim.",
      "Você explica o que `model.eval()` e `torch.no_grad()` mudam, e o que quebra ao esquecê-los.",
    ],
    grupos: [
      {
        id: "cv-g-nn-1",
        titulo: "Anatomia de uma rede",
        topicos: [
          { id: "cv-nn-01", titulo: "Neurônio e camadas densas", prioridade: "fundamental",
            desc: "Neurônio, camadas densas, pesos e vieses.",
            detalhe: "Um neurônio é uma soma ponderada mais um viés, passada por uma ativação. Uma camada densa é só isso em forma matricial: `y = Wx + b`. O viés é o que permite deslocar a fronteira de decisão da origem — sem ele, toda fronteira passaria pelo ponto zero, o que limita severamente o que a rede consegue representar." },
          { id: "cv-nn-02", titulo: "Funções de ativação", prioridade: "fundamental",
            desc: "ReLU, LeakyReLU, sigmoid, tanh, softmax.",
            detalhe: "Sem ativação não linear, empilhar camadas é inútil: a composição de transformações lineares continua linear. ReLU é o padrão por ser barata e não saturar do lado positivo; seu defeito é o neurônio morto, que LeakyReLU corrige deixando um filete passar no lado negativo. Sigmoid satura nas duas pontas e mata o gradiente — use só na saída de classificação binária. Softmax normaliza logits em distribuição de probabilidade e pertence à saída multiclasse, não ao meio da rede." },
          { id: "cv-nn-03", titulo: "Forward e backpropagation", prioridade: "fundamental",
            desc: "Forward pass e backpropagation.",
            detalhe: "Forward calcula a predição e guarda os valores intermediários; backward percorre o grafo no sentido inverso aplicando a regra da cadeia para obter a derivada da perda em relação a cada peso. O ponto que o exercício em NumPy deixa claro: o backward REUSA o que o forward guardou — é por isso que treinar consome muito mais memória que inferir, e por isso que `torch.no_grad()` economiza tanto." },
          { id: "cv-nn-04", titulo: "Funções de perda", prioridade: "fundamental",
            desc: "Cross-entropy, MSE e quando cada uma se aplica.",
            detalhe: "Cross-entropy para classificação, MSE para regressão — e a troca entre elas é erro comum. Detalhe prático do PyTorch: `nn.CrossEntropyLoss` já aplica log-softmax internamente, então a sua rede deve devolver logits crus. Colocar um softmax antes dela aplica a operação duas vezes, os gradientes encolhem e o treino fica lento sem dar erro algum." },
          { id: "cv-nn-05", titulo: "Otimizadores", prioridade: "fundamental",
            desc: "SGD, momentum, RMSProp e Adam.",
            detalhe: "SGD puro é lento em vales estreitos; momentum acumula velocidade e atravessa platôs. Adam adapta a taxa por parâmetro e é o padrão razoável para começar. Contraponto que vale saber: SGD com momentum e um bom schedule costuma generalizar melhor que Adam em visão, e é o que as receitas de treino de ResNet usam." },
        ],
      },
      {
        id: "cv-g-nn-2",
        titulo: "Treinar de verdade",
        topicos: [
          { id: "cv-nn-06", titulo: "Hiperparâmetros de treino", prioridade: "fundamental",
            desc: "Batch size, épocas, learning rate e schedulers.",
            detalhe: "Batch grande dá gradiente menos ruidoso e melhor uso da GPU, mas o ruído do batch pequeno é em parte o que ajuda a generalizar. Regra prática ao dobrar o batch: dobre também a taxa de aprendizado. Schedulers reduzem a taxa ao longo do treino — cosine annealing e step decay são os dois padrões, e quase sempre valem alguns pontos de acurácia de graça." },
          { id: "cv-nn-07", titulo: "Regularização", prioridade: "fundamental",
            desc: "Dropout, weight decay e early stopping.",
            detalhe: "Dropout desliga neurônios aleatoriamente no treino, forçando redundância; ele é DESLIGADO automaticamente por `model.eval()`, e esquecer isso é a causa número um de inferência com resultado instável. Weight decay penaliza pesos grandes. Early stopping para quando a validação para de melhorar e é a regularização mais barata que existe." },
          { id: "cv-nn-08", titulo: "Normalização e inicialização", prioridade: "importante",
            desc: "Batch normalization e inicialização de pesos.",
            detalhe: "BatchNorm normaliza as ativações por batch e permite taxas de aprendizado maiores e convergência mais rápida. Ele também muda de comportamento entre treino e avaliação — usa estatísticas do batch no treino e médias acumuladas na inferência — outra razão para `model.eval()`. Inicialização ruim faz o sinal desaparecer ou explodir ao longo das camadas; He para ReLU, Xavier para tanh." },
          { id: "cv-nn-09", titulo: "Convolução em redes", prioridade: "fundamental",
            desc: "Filtros, feature maps, pooling e campo receptivo.",
            detalhe: "A CNN é eficiente por dois motivos: pesos compartilhados (o mesmo filtro varre a imagem inteira, o que dá invariância a translação) e conectividade local. Campo receptivo é a região da imagem original que influencia um neurônio — ele cresce com a profundidade, e é por isso que camadas rasas detectam bordas e as profundas detectam partes de objeto. Se o objeto é maior que o campo receptivo, a rede não consegue vê-lo inteiro." },
          { id: "cv-nn-10", titulo: "PyTorch essencial", prioridade: "fundamental",
            desc: "Tensores, `autograd`, `nn.Module`, `Dataset`, `DataLoader`, `.to(device)`.",
            detalhe: "`nn.Module` organiza parâmetros e submódulos e dá `.parameters()` de graça para o otimizador. `Dataset` define como obter UM item; `DataLoader` cuida de batch, embaralhamento e paralelismo de leitura — e `num_workers` costuma ser o parâmetro que tira a GPU da ociosidade. Modelo e dados precisam estar no MESMO device, e o erro de device é provavelmente o mais frequente de todos." },
          { id: "cv-nn-11", titulo: "Loop de treino à mão", prioridade: "fundamental",
            desc: "`zero_grad`, `backward`, `step`, modo `train`/`eval`.",
            detalhe: "A ordem é: zerar gradientes, forward, calcular perda, backward, passo do otimizador. `zero_grad` é necessário porque o PyTorch ACUMULA gradientes por padrão — esquecê-lo faz os gradientes somarem entre batches e o treino degenera de um jeito difícil de diagnosticar. Na validação, `model.eval()` mais `torch.no_grad()`: o primeiro muda dropout e BatchNorm, o segundo dispensa o grafo e economiza memória. São coisas diferentes e você precisa das duas." },
          { id: "cv-nn-12", titulo: "Checkpoints e reprodutibilidade", prioridade: "importante",
            desc: "Salvar e carregar checkpoints; seeds.",
            detalhe: "Salve o `state_dict`, não o objeto do modelo inteiro — o pickle do objeto amarra o arquivo à estrutura exata do seu código e quebra na primeira refatoração. Um checkpoint útil guarda também o estado do otimizador, a época e a melhor métrica, para poder retomar. Fixar seeds reduz a variação mas não elimina: algumas operações de CUDA são não determinísticas por padrão." },
        ],
      },
    ],
  }
);
