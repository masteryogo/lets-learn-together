/* Computer Vision — iterações 5 a 8 (deep learning aplicado) */

ROADMAP_ETAPAS.push(
  {
    id: "cnns",
    numero: 5,
    titulo: "CNNs modernas e transfer learning",
    objetivo: "Parar de treinar do zero. Este é o modo padrão de trabalho na prática.",
    descricao:
      "Treinar do zero é quase sempre a escolha errada: um backbone pré-treinado na ImageNet já aprendeu " +
      "bordas, texturas e partes de objeto, e isso transfere para praticamente qualquer domínio visual. " +
      "Com transfer learning, 200 imagens por classe costumam bastar para um resultado decente — contra " +
      "dezenas de milhares exigidas por um treino do zero. " +
      "A outra metade desta iteração é interpretabilidade: Grad-CAM é o que revela que o seu modelo de " +
      "95% de acurácia aprendeu o fundo, a marca d'água ou o tipo de iluminação em vez do objeto.",
    preRequisitos: "Etapa 4",
    duracao: null,
    criterios: [
      "Você justifica a escolha da arquitetura pelo trade-off entre acurácia, tamanho e latência.",
      "Você consegue descobrir, via Grad-CAM, que um modelo com boa acurácia estava aprendendo o fundo e não o objeto.",
      "Você sabe quando congelar e quando descongelar o backbone, em função do tamanho do dataset.",
    ],
    grupos: [
      {
        id: "cv-g-cnn-1",
        titulo: "Arquiteturas",
        descricao: "Cada uma resolveu um problema concreto da anterior; conhecer o problema vale mais que decorar as camadas.",
        topicos: [
          { id: "cv-cnn-01", titulo: "VGG", prioridade: "importante",
            desc: "Profundidade uniforme e seu custo.",
            detalhe: "VGG mostrou que empilhar convoluções 3×3 pequenas supera poucas convoluções grandes, com menos parâmetros e mais não linearidade. O custo é brutal: a maior parte dos seus ~138 milhões de parâmetros está nas camadas densas finais. Hoje serve mais como referência histórica e como extrator de features para perceptual loss do que como escolha de produção." },
          { id: "cv-cnn-02", titulo: "ResNet", prioridade: "fundamental",
            desc: "Conexões residuais e o problema do gradiente que desaparece.",
            detalhe: "Antes da ResNet, redes mais profundas ficavam PIORES, inclusive no treino — não era overfitting, era otimização. A conexão residual (`saída = F(x) + x`) cria um caminho direto para o gradiente retroceder sem ser multiplicado, o que permitiu treinar centenas de camadas. É a ideia mais reaproveitada do deep learning moderno: transformers também a usam. ResNet-50 continua sendo o baseline honesto de classificação." },
          { id: "cv-cnn-03", titulo: "Inception", prioridade: "opcional",
            desc: "Convoluções paralelas em múltiplas escalas.",
            detalhe: "Em vez de escolher o tamanho do kernel, o bloco Inception aplica 1×1, 3×3 e 5×5 em paralelo e concatena, deixando a rede decidir a escala. A convolução 1×1 que aparece antes das maiores é um redutor de canais e é o que torna o custo viável. O conceito de 1×1 como \"camada densa aplicada por pixel\" aparece em muitas arquiteturas depois desta." },
          { id: "cv-cnn-04", titulo: "EfficientNet e MobileNet", prioridade: "importante",
            desc: "Escalonamento composto e convolução separável em profundidade.",
            detalhe: "A convolução separável em profundidade quebra a convolução normal em duas etapas (espacial por canal, depois 1×1 entre canais) e reduz o custo em quase uma ordem de magnitude com perda pequena de acurácia — é o que viabiliza visão em celular. EfficientNet mostrou que escalar profundidade, largura e resolução JUNTOS, numa proporção fixa, rende mais que escalar qualquer um isoladamente. São as arquiteturas a considerar quando a iteração 11 cobrar latência." },
        ],
      },
      {
        id: "cv-g-cnn-2",
        titulo: "Transferir, aumentar e inspecionar",
        topicos: [
          { id: "cv-cnn-05", titulo: "Transfer learning", prioridade: "fundamental",
            desc: "Congelar backbone, substituir a cabeça e descongelar por etapas.",
            detalhe: "A regra prática é pelo tamanho do seu dataset: poucos dados e domínio parecido com ImageNet, congele tudo e treine só a cabeça; muitos dados ou domínio distante (imagem médica, satélite, infravermelho), descongele progressivamente. Descongelar tudo de uma vez com taxa alta destrói as features pré-treinadas nas primeiras iterações — fenômeno conhecido como esquecimento catastrófico." },
          { id: "cv-cnn-06", titulo: "Fine-tuning", prioridade: "fundamental",
            desc: "Taxas de aprendizado diferenciadas por camada.",
            detalhe: "Camadas rasas aprenderam bordas e texturas, que são universais e não devem mudar muito; camadas profundas aprenderam conceitos específicos da ImageNet e precisam se adaptar. Daí a taxa discriminativa: menor nas primeiras camadas, maior nas últimas, tipicamente com fator de 10 entre blocos. Combine com warmup para não arruinar os pesos no primeiro passo." },
          { id: "cv-cnn-07", titulo: "Pré-processamento esperado", prioridade: "fundamental",
            desc: "Tamanho e normalização de cada modelo pré-treinado.",
            detalhe: "Cada modelo pré-treinado espera exatamente a normalização usada no treino original — para a ImageNet, média `[0.485, 0.456, 0.406]` e desvio `[0.229, 0.224, 0.225]` em RGB. Alimentar com valores de 0 a 255, ou em BGR vindo do OpenCV, produz um modelo que funciona mal sem dar nenhum erro. É a falha silenciosa mais frequente de quem está começando com transfer learning." },
          { id: "cv-cnn-08", titulo: "Augmentation moderno", prioridade: "importante",
            desc: "`albumentations`, RandAugment, mixup e cutmix.",
            detalhe: "`albumentations` é rápido e, crucialmente, transforma a anotação junto com a imagem — ao girar, as caixas e máscaras giram também. Mixup e cutmix combinam duas imagens e seus rótulos, o que regulariza bem e calibra melhor a confiança do modelo. Como na iteração 3: só no treino, e só com transformações plausíveis no seu domínio." },
          { id: "cv-cnn-09", titulo: "Interpretabilidade", prioridade: "fundamental",
            desc: "Grad-CAM e visualização de feature maps.",
            detalhe: "Grad-CAM usa o gradiente da classe prevista em relação à última camada convolucional para produzir um mapa de calor do que pesou na decisão. É a ferramenta que expõe o atalho: o modelo que separa cachorro de lobo pela neve ao fundo, ou que detecta pneumonia pelo marcador do aparelho de raio-X. Rode Grad-CAM nos ACERTOS também, não só nos erros — um acerto pelo motivo errado não sobrevive a produção." },
          { id: "cv-cnn-10", titulo: "Acompanhamento de experimentos", prioridade: "importante",
            desc: "TensorBoard ou Weights & Biases.",
            detalhe: "Depois do quinto experimento, você não lembra mais qual taxa de aprendizado gerou qual curva. Registre hiperparâmetros, métricas, hash do commit e versão do dataset junto com cada run. O ganho não é organização: é conseguir responder \"por que esta versão ficou melhor\" com evidência em vez de memória." },
        ],
      },
    ],
  },

  {
    id: "deteccao",
    numero: 6,
    titulo: "Detecção de objetos",
    objetivo: "Sair de \"que imagem é esta\" para \"o que existe na imagem e onde\".",
    descricao:
      "Detecção é onde o trabalho deixa de ser sobre o modelo e passa a ser sobre os dados. " +
      "Anotar 300 imagens à mão ensina mais sobre o problema do que treinar dez arquiteturas: você " +
      "descobre quais casos são ambíguos, onde a sua própria definição de classe vacila e quanto do " +
      "erro do modelo é na verdade erro de anotação. " +
      "A outra lição desta iteração é que os limiares de confiança e de NMS são decisões de PRODUTO, " +
      "não de treino — eles traduzem o custo relativo de um falso positivo e de um falso negativo no " +
      "seu domínio.",
    preRequisitos: "Etapa 5",
    duracao: null,
    criterios: [
      "Você explica mAP@0.5 versus mAP@0.5:0.95 e o que a diferença revela sobre a precisão das caixas.",
      "Você distingue erro de detecção causado por dataset, por anotação e por arquitetura.",
      "Você escolhe entre um detector de um ou dois estágios a partir do requisito de latência.",
    ],
    grupos: [
      {
        id: "cv-g-det-1",
        titulo: "Conceitos e formatos",
        topicos: [
          { id: "cv-det-01", titulo: "Classificação, localização, detecção e segmentação", prioridade: "fundamental",
            desc: "A diferença entre as quatro tarefas.",
            detalhe: "Classificação dá um rótulo para a imagem inteira; localização acrescenta uma caixa para um único objeto; detecção lida com número variável de objetos e classes; segmentação desce ao pixel. A escolha é guiada pelo que a aplicação precisa MEDIR: se basta contar, detecção serve; se é preciso saber a área exata, só segmentação resolve." },
          { id: "cv-det-02", titulo: "Formatos de bounding box", prioridade: "fundamental",
            desc: "`xyxy`, `xywh`, normalizado; COCO, Pascal VOC e YOLO.",
            detalhe: "Três convenções incompatíveis em uso simultâneo: Pascal VOC usa `xyxy` absoluto, COCO usa `x,y,largura,altura` com origem no canto, YOLO usa centro e dimensões NORMALIZADOS de 0 a 1. Converter errado produz caixas deslocadas ou minúsculas, e o treino simplesmente não converge. Sempre desenhe algumas anotações sobre a imagem antes de treinar — cinco minutos que economizam um dia." },
          { id: "cv-det-03", titulo: "IoU, NMS e limiar de confiança", prioridade: "fundamental",
            desc: "Intersecção sobre união, supressão de não máximos e corte de confiança.",
            detalhe: "IoU mede sobreposição entre duas caixas e é a régua de tudo em detecção. NMS resolve o fato de que o detector emite várias caixas para o mesmo objeto: mantém a de maior confiança e descarta as que se sobrepõem acima de um limiar. O efeito colateral a conhecer: com objetos legitimamente sobrepostos (uma multidão), um NMS agressivo apaga detecções corretas — é quando se usa Soft-NMS." },
          { id: "cv-det-04", titulo: "Detectores de dois estágios", prioridade: "importante",
            desc: "R-CNN, Fast R-CNN, Faster R-CNN e Region Proposal Network.",
            detalhe: "A linhagem é uma aula de otimização incremental: R-CNN rodava a CNN em cada proposta (lentíssimo); Fast R-CNN passou a rodar uma vez na imagem e recortar as features; Faster R-CNN substituiu a busca seletiva externa por uma rede de propostas treinável, tornando o sistema inteiro ponta a ponta. São mais precisos em objetos pequenos e mais lentos — a escolha quando a latência não é o gargalo." },
          { id: "cv-det-05", titulo: "Detectores de estágio único", prioridade: "fundamental",
            desc: "SSD e a família YOLO (âncoras, grid, versões anchor-free).",
            detalhe: "Estágio único prevê classe e caixa diretamente sobre um grid, em uma passada — daí a velocidade. Âncoras são caixas de referência de formatos predefinidos; se o seu domínio tem objetos de proporção incomum (algo muito alongado, por exemplo), as âncoras padrão atrapalham e vale recalculá-las. As versões anchor-free mais recentes eliminam esse ajuste prevendo a caixa diretamente." },
          { id: "cv-det-06", titulo: "Detectores com transformer", prioridade: "opcional",
            desc: "DETR.",
            detalhe: "DETR trata detecção como predição de conjunto: a rede emite N caixas de uma vez e um algoritmo de correspondência bipartida as casa com a verdade. Isso elimina âncoras e NMS do pipeline. O preço é convergência muito lenta no treino e desempenho fraco em objetos pequenos — variantes como Deformable DETR atacam ambos." },
        ],
      },
      {
        id: "cv-g-det-2",
        titulo: "Avaliar e treinar",
        topicos: [
          { id: "cv-det-07", titulo: "Métricas de detecção", prioridade: "fundamental",
            desc: "AP, mAP@0.5, mAP@0.5:0.95 e curva precisão-recall.",
            detalhe: "AP é a área sob a curva precisão-recall de uma classe; mAP é a média entre classes. A diferença que o critério de domínio cobra: mAP@0.5 só exige 50% de sobreposição, enquanto mAP@0.5:0.95 faz a média em dez limiares cada vez mais exigentes — uma queda grande entre os dois significa que você ACHA os objetos mas as caixas estão imprecisas, o que é um problema diferente de não achá-los." },
          { id: "cv-det-08", titulo: "Anotação de dados", prioridade: "fundamental",
            desc: "CVAT, Roboflow ou Label Studio; qualidade e consistência.",
            detalhe: "Consistência vale mais que volume: se metade do dataset inclui a sombra do objeto na caixa e a outra metade não, você impôs ao modelo um alvo contraditório e nenhuma arquitetura resolve isso. Escreva um guia de anotação com casos de borda decididos ANTES de começar, e revise uma amostra cruzada. Boa parte do que parece erro de modelo é desacordo de anotação." },
          { id: "cv-det-09", titulo: "Treino com Ultralytics YOLO", prioridade: "fundamental",
            desc: "Dataset YAML, hiperparâmetros e augmentation.",
            detalhe: "O YAML aponta diretórios e lista as classes NA ORDEM dos índices — trocar a ordem entre datasets é um erro silencioso que gera rótulos invertidos. Comece do peso pré-treinado, não do zero. E leia o que o augmentation padrão já faz (mosaico, HSV, flip): ele costuma ser suficiente, e desligá-lo nas últimas épocas melhora as caixas finais." },
        ],
      },
    ],
  },

  {
    id: "segmentacao",
    numero: 7,
    titulo: "Segmentação",
    objetivo: "Precisão em nível de pixel.",
    descricao:
      "Segmentação responde \"quais pixels exatamente\", e isso muda o que você consegue medir: área, " +
      "forma, contorno, proporção. É a diferença entre contar folhas doentes e medir a porcentagem de " +
      "área afetada. " +
      "O custo é de anotação — rotular máscara é entre cinco e dez vezes mais caro que rotular caixa, " +
      "razão pela qual o SAM mudou o jogo ao permitir anotar por clique. " +
      "A armadilha estatística desta iteração é a acurácia por pixel: quando o objeto ocupa 2% da imagem, " +
      "prever \"fundo\" em tudo dá 98%.",
    preRequisitos: "Etapa 6",
    duracao: null,
    criterios: [
      "Você explica por que acurácia por pixel engana quando o objeto ocupa 2% da imagem.",
      "Você escolhe entre detecção e segmentação a partir do que a aplicação precisa medir.",
      "Você lê o tipo de erro: bordas imprecisas, buracos internos e falsos positivos isolados têm causas diferentes.",
    ],
    grupos: [
      {
        id: "cv-g-seg-1",
        titulo: "Tarefas e arquiteturas",
        topicos: [
          { id: "cv-seg-01", titulo: "Os três tipos de segmentação", prioridade: "fundamental",
            desc: "Semântica, de instâncias e panóptica.",
            detalhe: "Semântica rotula cada pixel por classe e não distingue indivíduos: duas pessoas encostadas viram uma mancha só. De instâncias separa indivíduos mas costuma ignorar o fundo. Panóptica faz as duas coisas. Se a sua aplicação precisa CONTAR, segmentação semântica não basta — e descobrir isso depois de anotar o dataset inteiro é caro." },
          { id: "cv-seg-02", titulo: "Encoder-decoder e skip connections", prioridade: "fundamental",
            desc: "A estrutura comum a quase toda rede de segmentação.",
            detalhe: "O encoder reduz a resolução acumulando contexto semântico; o decoder volta ao tamanho original. O problema é que a redução destrói a informação de localização precisa. As skip connections resolvem isso ligando cada nível do encoder ao nível correspondente do decoder, devolvendo o detalhe espacial. É por isso que a U-Net tem esse formato de U." },
          { id: "cv-seg-03", titulo: "U-Net, FCN e DeepLab", prioridade: "fundamental",
            desc: "U-Net e variantes; FCN; convolução dilatada.",
            detalhe: "A U-Net nasceu em imagem biomédica, com poucos dados e muita augmentation, e continua sendo o primeiro modelo a tentar em qualquer segmentação binária. DeepLab usa convolução dilatada (atrous), que amplia o campo receptivo sem reduzir a resolução nem acrescentar parâmetros, e o módulo ASPP combina várias dilatações para capturar objetos em escalas diferentes." },
          { id: "cv-seg-04", titulo: "Mask R-CNN e RoIAlign", prioridade: "importante",
            desc: "Segmentação de instâncias sobre um detector.",
            detalhe: "Mask R-CNN é o Faster R-CNN com um ramo adicional que prevê a máscara dentro de cada caixa. A contribuição técnica importante é o RoIAlign: o RoIPool anterior arredondava coordenadas para inteiros, e esse desalinhamento de poucos pixels era irrelevante para a caixa mas arruinava a máscara. Interpolação bilinear em vez de arredondamento — uma mudança pequena com ganho grande." },
          { id: "cv-seg-05", titulo: "Segment Anything (SAM)", prioridade: "importante",
            desc: "Segmentação por prompt.",
            detalhe: "SAM segmenta qualquer objeto a partir de um ponto, uma caixa ou uma máscara grosseira, sem ter sido treinado nas suas classes. O uso que mais rende: acelerar anotação. Você clica, ele produz a máscara, você corrige — reduzindo o custo por imagem drasticamente. Ele não sabe o NOME do que segmentou, então ainda é preciso atribuir a classe (ou combiná-lo com GroundingDINO, na iteração 9)." },
        ],
      },
      {
        id: "cv-g-seg-2",
        titulo: "Perdas, métricas e pós-processamento",
        topicos: [
          { id: "cv-seg-06", titulo: "Perdas específicas", prioridade: "fundamental",
            desc: "Dice, IoU loss, focal loss e o desbalanceamento de pixels.",
            detalhe: "Cross-entropy por pixel trata todos os pixels igualmente, e com 98% de fundo ela converge para prever fundo. Dice loss otimiza a sobreposição diretamente e é naturalmente robusta ao desbalanceamento. Focal loss reduz o peso dos exemplos fáceis para que os difíceis dominem o gradiente. A combinação cross-entropy + Dice é a receita padrão, e comparar as duas isoladamente é o projeto desta iteração." },
          { id: "cv-seg-07", titulo: "Métricas de segmentação", prioridade: "fundamental",
            desc: "IoU, mIoU, Dice e acurácia por pixel.",
            detalhe: "IoU e Dice medem sobreposição e estão matematicamente relacionados (Dice é sempre maior ou igual); Dice é mais tolerante com objetos pequenos. mIoU é a média entre classes e é a métrica padrão em benchmarks. Acurácia por pixel só deve aparecer no relatório acompanhada de outra — sozinha, ela é a métrica que o critério de domínio pede para você saber desmascarar." },
          { id: "cv-seg-08", titulo: "Anotação por máscara e polígono", prioridade: "importante",
            desc: "Custo de anotação.",
            detalhe: "Polígono é mais rápido de anotar e editar que pintura livre, e é o formato que COCO usa. Decida antecipadamente o nível de detalhe: contornar cada fio de cabelo multiplica o custo por cinco e raramente muda a métrica. Como em detecção, ambiguidade de borda não resolvida vira ruído de rótulo, e o modelo aprende a incerteza da sua equipe." },
          { id: "cv-seg-09", titulo: "Pós-processamento de máscaras", prioridade: "importante",
            desc: "Morfologia e remoção de componentes pequenos.",
            detalhe: "Aqui a iteração 1 volta a ser útil: abertura remove falsos positivos isolados, fechamento tampa buracos internos, e filtrar componentes conectados por área mínima limpa ruído. O critério de domínio pede justamente isso — ler o TIPO de erro: buraco interno sugere perda muito penalizada no centro, borda imprecisa sugere resolução insuficiente no decoder, e pontos isolados sugerem limiar baixo demais." },
        ],
      },
    ],
  },

  {
    id: "tracking",
    numero: 8,
    titulo: "Tracking e análise de movimento",
    objetivo: "Manter identidade ao longo do tempo.",
    descricao:
      "É aqui que o vídeo deixa de ser uma sequência de imagens independentes. " +
      "A mudança de perspectiva é importante: um detector excelente frame a frame pode produzir um " +
      "tracking péssimo, porque identidade é um problema de ASSOCIAÇÃO, não de detecção. " +
      "E tracking é o que habilita quase toda métrica de negócio em vídeo — contagem sem duplicar, " +
      "tempo de permanência, trajetória, velocidade. Sem identidade estável, você consegue dizer " +
      "quantos objetos há em cada frame, mas nunca quantos passaram.",
    preRequisitos: "Etapa 6",
    duracao: null,
    criterios: [
      "Você explica por que um detector bom pode gerar um tracking ruim, e vice-versa.",
      "Você sabe qual parâmetro ajustar quando os IDs trocam demais e quando as trilhas somem cedo demais.",
      "Você distingue quando o problema exige tracking e quando detecção por frame já basta.",
    ],
    grupos: [
      {
        id: "cv-g-trk",
        titulo: null,
        topicos: [
          { id: "cv-trk-01", titulo: "Tracking de objeto único", prioridade: "importante",
            desc: "Trackers clássicos do OpenCV (KCF, CSRT, MOSSE).",
            detalhe: "Você marca o objeto uma vez e o tracker o segue por correlação de aparência, sem detector. MOSSE é o mais rápido e o menos preciso; CSRT é o inverso; KCF fica no meio. Todos derivam com o tempo e nenhum se recupera de oclusão total. Servem quando há um alvo só, definido pelo usuário, e detectar a cada frame seria caro demais." },
          { id: "cv-trk-02", titulo: "Tracking-by-detection", prioridade: "fundamental",
            desc: "Tracking de múltiplos objetos e o paradigma dominante.",
            detalhe: "O paradigma é simples de enunciar: detecte em todo frame e associe as detecções novas às trilhas existentes. Isso separa claramente as duas fontes de erro — falha de detecção (objeto some) e falha de associação (objeto troca de ID) — e é exatamente a distinção que o critério de domínio cobra. Quase todo tracker moderno de múltiplos objetos segue este desenho." },
          { id: "cv-trk-03", titulo: "Kalman e algoritmo húngaro", prioridade: "fundamental",
            desc: "Predição de estado e associação ótima.",
            detalhe: "O filtro de Kalman prevê onde cada trilha deve estar no próximo frame assumindo movimento aproximadamente constante, e funde essa previsão com a medição, ponderando pela incerteza de cada uma. O algoritmo húngaro então resolve a atribuição ótima entre trilhas previstas e detecções novas, minimizando o custo total — tipicamente baseado em IoU ou distância. Juntos, eles são o SORT." },
          { id: "cv-trk-04", titulo: "SORT, DeepSORT e ByteTrack", prioridade: "fundamental",
            desc: "Associação por movimento, por aparência e por detecções fracas.",
            detalhe: "SORT associa só por posição e é rápido, mas troca IDs em cruzamentos. DeepSORT acrescenta um descritor de aparência, o que permite reidentificar após oclusão, ao custo de uma rede extra por objeto. ByteTrack teve a percepção de que detecções de BAIXA confiança, normalmente descartadas, costumam ser objetos ocluídos — associá-las numa segunda rodada melhora bastante sem custo adicional." },
          { id: "cv-trk-05", titulo: "Métricas de tracking", prioridade: "importante",
            desc: "MOTA, IDF1 e troca de identidade.",
            detalhe: "MOTA agrega falsos positivos, falsos negativos e trocas de ID num número só, e por isso é dominada pela qualidade da detecção. IDF1 mede quão bem a identidade foi preservada ao longo do tempo e é a métrica honesta para avaliar a ASSOCIAÇÃO. Reportar as duas é o que separa \"meu detector é bom\" de \"meu tracking é bom\"." },
          { id: "cv-trk-06", titulo: "Optical flow", prioridade: "importante",
            desc: "Lucas-Kanade (esparso) e Farnebäck (denso).",
            detalhe: "Optical flow estima o deslocamento aparente dos pixels entre frames. Lucas-Kanade acompanha poucos pontos bons de rastrear e é barato; Farnebäck calcula o campo para todos os pixels e é caro. Ambos assumem brilho constante e movimento pequeno entre frames — uma mudança brusca de iluminação ou um objeto rápido quebram a premissa." },
          { id: "cv-trk-07", titulo: "Contagem e regiões de interesse", prioridade: "fundamental",
            desc: "Estimativa de movimento, linhas de contagem e ROI.",
            detalhe: "Contar por linha virtual exige identidade estável e uma regra de cruzamento robusta: compare a posição do centro em relação à linha entre frames consecutivos e conte a TRANSIÇÃO, uma vez por ID. Contar presença dentro da ROI frame a frame é o erro clássico que infla o número em dezenas de vezes. Para velocidade, você precisa de escala — e sem calibração (iteração 10) a estimativa é relativa." },
          { id: "cv-trk-08", titulo: "Oclusão e reidentificação", prioridade: "importante",
            desc: "Oclusão, reentrada em cena e re-ID.",
            detalhe: "Os dois parâmetros que o critério de domínio cobra são justamente destes: `max_age` (quantos frames manter uma trilha sem detecção) e o limiar de associação. `max_age` curto demais faz as trilhas sumirem cedo em oclusões; longo demais faz trilhas fantasmas capturarem objetos errados. Limiar de associação frouxo troca IDs; apertado fragmenta trilhas." },
        ],
      },
    ],
  }
);
