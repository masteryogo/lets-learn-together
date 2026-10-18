/* Computer Vision — iterações 9 a 13 (avançado, produção e capstone) */

export default [
  {
    id: "avancadas",
    numero: 9,
    titulo: "Arquiteturas avançadas",
    objetivo: "Alcançar o estado da arte atual, onde visão e linguagem convergem.",
    descricao:
      "A mudança conceitual desta iteração é que o modelo deixa de ser treinado para o SEU conjunto de " +
      "classes. CLIP classifica categorias que nunca viu rotuladas, GroundingDINO detecta pelo nome em " +
      "texto livre, SAM segmenta sem saber o que está segmentando. " +
      "Na prática isso muda o início de qualquer projeto: antes de anotar, vale testar o que um modelo " +
      "zero-shot já resolve — e, quando não resolve sozinho, usá-lo para gerar os rótulos iniciais que " +
      "você depois corrige. " +
      "O risco correspondente é se enganar com exemplos escolhidos a dedo: zero-shot impressiona na demo " +
      "e decepciona no conjunto de teste.",
    preRequisitos: "Etapa 5",
    duracao: null,
    criterios: [
      "Você explica quando ViT supera CNN e quando não vale o custo.",
      "Você usa modelos zero-shot para gerar rótulos iniciais e reduzir custo de anotação.",
      "Você sabe avaliar um resultado zero-shot sem se enganar com exemplos escolhidos a dedo.",
    ],
    grupos: [
      {
        id: "cv-g-adv-1",
        titulo: "Transformers em visão",
        topicos: [
          { id: "cv-adv-01", titulo: "Atenção e self-attention", prioridade: "fundamental",
            desc: "A arquitetura transformer.",
            detalhe: "Self-attention deixa cada posição consultar todas as outras e decidir de quais depende, o que dá campo receptivo global já na primeira camada — contra o crescimento gradual da CNN. O preço é custo quadrático no número de tokens, razão pela qual imagens são cortadas em patches em vez de tratadas pixel a pixel." },
          { id: "cv-adv-02", titulo: "Vision Transformer (ViT)", prioridade: "fundamental",
            desc: "Patches, embeddings posicionais e token de classificação.",
            detalhe: "O ViT corta a imagem em patches de 16×16, projeta cada um num vetor e trata a sequência como texto. Como a atenção não tem noção de ordem, o embedding posicional é o que reintroduz a geometria. O token de classificação é um vetor extra que agrega a informação de todos os patches e alimenta a cabeça final — ideia herdada do BERT." },
          { id: "cv-adv-03", titulo: "Swin Transformer", prioridade: "importante",
            desc: "Atenção hierárquica em janelas.",
            detalhe: "O Swin calcula atenção dentro de janelas locais e desloca essas janelas a cada camada, o que restaura a comunicação entre elas. Isso derruba o custo de quadrático para linear na resolução e recupera a hierarquia multiescala que as CNNs têm naturalmente — por isso ele funciona bem como backbone de detecção e segmentação, onde o ViT puro é desajeitado." },
          { id: "cv-adv-04", titulo: "Por que ViT precisa de mais dados", prioridade: "fundamental",
            desc: "O papel do pré-treino em larga escala.",
            detalhe: "A CNN traz embutidas duas suposições corretas sobre imagens: pixels vizinhos se relacionam e um padrão é o mesmo em qualquer posição. O ViT não traz nenhuma das duas e precisa APRENDER isso dos dados — daí precisar de escala. Treinado só no seu dataset de 5 mil imagens, ele perde para uma ResNet; partindo de pré-treino massivo, ganha. É exatamente a resposta ao critério de domínio desta iteração." },
        ],
      },
      {
        id: "cv-g-adv-2",
        titulo: "Sem rótulos e com linguagem",
        topicos: [
          { id: "cv-adv-05", titulo: "Aprendizado autossupervisionado", prioridade: "importante",
            desc: "SimCLR, MoCo, MAE e DINO.",
            detalhe: "A ideia é inventar uma tarefa cujo rótulo vem dos próprios dados: reconhecer que duas augmentações da mesma imagem são a mesma coisa (SimCLR, MoCo), ou reconstruir pedaços mascarados (MAE). Isso aproveita imagem não anotada, que você provavelmente tem aos milhares. DINO produz, de brinde, mapas de atenção que segmentam objetos sem nunca ter visto uma máscara." },
          { id: "cv-adv-06", titulo: "Modelos visão-linguagem", prioridade: "fundamental",
            desc: "CLIP, embeddings compartilhados e classificação zero-shot.",
            detalhe: "O CLIP treina um codificador de imagem e um de texto para projetarem no MESMO espaço, aproximando os pares corretos. Classificar sem treino vira comparar o embedding da imagem com o de frases como \"uma foto de um gato\". O resultado depende muito da formulação do prompt — medir essa variação é o projeto desta iteração. O mesmo espaço compartilhado também dá busca por similaridade de graça." },
          { id: "cv-adv-07", titulo: "Vocabulário aberto", prioridade: "importante",
            desc: "GroundingDINO e SAM.",
            detalhe: "GroundingDINO detecta a partir de uma descrição textual, devolvendo caixas; alimentando essas caixas ao SAM, você obtém máscaras. O pipeline \"texto, caixa, máscara\" produz dataset de segmentação sem anotação manual inicial. Trate o resultado como rascunho a revisar, não como verdade — mas um rascunho que corta a maior parte do trabalho." },
          { id: "cv-adv-08", titulo: "Modelos generativos", prioridade: "opcional",
            desc: "GANs, autoencoders e modelos de difusão.",
            detalhe: "Em visão aplicada, o uso mais concreto é gerar dados sintéticos para classes raras e traduzir entre domínios (sintético para real, dia para noite). Difusão substituiu as GANs na maior parte dos casos por treinar de forma estável, sem o colapso de modo. Autoencoders continuam úteis para detecção de anomalia: o erro de reconstrução sinaliza o que foge do normal." },
          { id: "cv-adv-09", titulo: "Super-resolução e restauração", prioridade: "opcional",
            desc: "Aumentar resolução e remover degradação.",
            detalhe: "Útil quando a captura é limitada — placa distante, imagem médica de baixa dose. A ressalva crítica é que esses modelos ALUCINAM detalhe plausível: o resultado parece nítido mas o conteúdo é inventado. Em domínio forense ou clínico isso é inaceitável, e a métrica que conta não é a perceptual, é se a tarefa seguinte melhorou." },
        ],
      },
    ],
  },

  {
    id: "visao3d",
    numero: 10,
    titulo: "Visão 3D",
    objetivo: "Recuperar geometria a partir de imagens.",
    descricao:
      "Uma imagem é uma projeção: a terceira dimensão foi descartada na captura. Esta iteração é sobre " +
      "recuperá-la, e a primeira lição é que isso exige ou duas vistas, ou movimento, ou uma suposição " +
      "aprendida sobre o mundo. " +
      "A calibração é o alicerce de tudo o que vem depois — intrínsecos errados contaminam disparidade, " +
      "nuvem de pontos, reconstrução e SLAM, e o erro aparece lá na frente, disfarçado de outra coisa. " +
      "Boa parte dos problemas que parecem precisar de 3D se resolve com uma heurística 2D mais barata; " +
      "saber distinguir os casos é o critério de domínio aqui.",
    preRequisitos: "Etapa 2",
    duracao: null,
    criterios: [
      "Você explica por que profundidade monocular é relativa e o que é preciso para torná-la métrica.",
      "Você identifica quando o problema exige geometria de verdade e quando uma heurística 2D basta.",
      "Você reconhece os efeitos de uma calibração ruim nos resultados seguintes do pipeline.",
    ],
    grupos: [
      {
        id: "cv-g-3d",
        titulo: null,
        topicos: [
          { id: "cv-3d-01", titulo: "Modelo de câmera pinhole", prioridade: "fundamental",
            desc: "Parâmetros intrínsecos e extrínsecos.",
            detalhe: "Intrínsecos descrevem a câmera em si — distância focal em pixels e ponto principal — e formam a matriz K. Extrínsecos descrevem onde ela está no mundo: rotação e translação. A projeção é a composição das duas, e é por isso que, sem conhecer K, você consegue dizer que um objeto está mais longe, mas não quantos metros." },
          { id: "cv-3d-02", titulo: "Calibração e distorção", prioridade: "fundamental",
            desc: "Calibração de câmera e correção de distorção.",
            detalhe: "Lentes reais curvam linhas retas, especialmente grande-angulares. A calibração com padrão de xadrez estima K e os coeficientes de distorção a partir de pontos de geometria conhecida. Dicas que decidem a qualidade: use 15 a 20 imagens com o padrão em orientações e profundidades variadas, cobrindo os CANTOS do quadro, que é onde a distorção é maior. Um erro de reprojeção acima de ~1 pixel indica calibração a refazer." },
          { id: "cv-3d-03", titulo: "Geometria epipolar e estéreo", prioridade: "importante",
            desc: "Visão estéreo e mapa de disparidade.",
            detalhe: "Com duas câmeras, a restrição epipolar reduz a busca pelo ponto correspondente de duas dimensões para uma linha — é o que torna o estéreo computável. A disparidade (deslocamento horizontal) é inversamente proporcional à profundidade, com a constante dada pela linha de base e pela focal. Superfícies sem textura não têm correspondência confiável, e é ali que o mapa de profundidade vem esburacado." },
          { id: "cv-3d-04", titulo: "Profundidade monocular", prioridade: "importante",
            desc: "MiDaS, Depth Anything.",
            detalhe: "Esses modelos aprenderam pistas que humanos também usam: tamanho relativo, oclusão, perspectiva, textura. O resultado é profundidade RELATIVA, ou seja, ordenação — sem escala absoluta, porque uma maquete e uma casa projetam a mesma imagem. Para torná-la métrica você precisa de uma referência: um objeto de tamanho conhecido, um sensor de profundidade ou estéreo." },
          { id: "cv-3d-05", titulo: "Nuvens de pontos", prioridade: "importante",
            desc: "Representação, registro (ICP) e Open3D.",
            detalhe: "Nuvem de pontos é um conjunto de coordenadas 3D, possivelmente com cor e normal. ICP alinha duas nuvens iterando entre \"achar correspondências mais próximas\" e \"calcular a transformação que as alinha\". Ele converge para o mínimo local mais próximo, então precisa de uma inicialização razoável — alinhamento grosseiro por features globais primeiro, ICP para refinar." },
          { id: "cv-3d-06", titulo: "Structure from Motion", prioridade: "opcional",
            desc: "Reconstrução multi-vista.",
            detalhe: "SfM recupera simultaneamente as poses das câmeras e a estrutura 3D a partir de várias fotos não calibradas, casando features entre elas. É o que está por trás de reconstruir um objeto a partir de fotos de celular. Exige sobreposição generosa entre vistas e textura suficiente; parede lisa e superfície reflexiva derrubam o processo." },
          { id: "cv-3d-07", titulo: "SLAM", prioridade: "opcional",
            desc: "Odometria visual, mapeamento e fechamento de laço.",
            detalhe: "SLAM resolve mapeamento e localização ao mesmo tempo, em tempo real. A odometria acumula erro a cada frame — é a deriva que o exercício manda medir. O fechamento de laço é o mecanismo de correção: ao reconhecer um lugar já visitado, o sistema redistribui o erro acumulado por todo o percurso. Sem ele, um trajeto fechado não fecha." },
          { id: "cv-3d-08", titulo: "NeRF e Gaussian Splatting", prioridade: "opcional",
            desc: "Representação neural de cena.",
            detalhe: "NeRF representa a cena como uma função contínua que, dada uma posição e uma direção de visada, devolve cor e densidade — e renderiza vistas novas com realismo alto, ao custo de horas de otimização por cena. Gaussian Splatting alcança qualidade comparável com treino e renderização muito mais rápidos, o que o tornou a escolha prática atual." },
        ],
      },
    ],
  },

  {
    id: "edge",
    numero: 11,
    titulo: "Tempo real e edge",
    objetivo: "O mesmo modelo, rodando dentro das restrições reais de hardware.",
    descricao:
      "Esta iteração é o que separa protótipo de produto, e a ordem importa: meça primeiro, otimize " +
      "depois. A descoberta recorrente de quem perfila um pipeline de visão pela primeira vez é que a " +
      "inferência não é o gargalo — decodificação de vídeo, redimensionamento, cópia entre CPU e GPU e " +
      "NMS costumam consumir mais tempo que o modelo. " +
      "Otimizar a rede antes de saber disso é esforço aplicado no lugar errado. " +
      "A entrega desta iteração não é um número de FPS: é uma tabela de acurácia contra latência que " +
      "sustenta uma decisão.",
    preRequisitos: "Etapa 6",
    duracao: null,
    criterios: [
      "Você apresenta uma tabela de acurácia versus latência e defende uma escolha com base nela.",
      "Você descobre e corrige um gargalo que estava fora da inferência.",
      "Você mede corretamente, descartando as primeiras iterações e sincronizando a GPU.",
    ],
    grupos: [
      {
        id: "cv-g-edge-1",
        titulo: "Medir antes de otimizar",
        topicos: [
          { id: "cv-edge-01", titulo: "Medição correta", prioridade: "fundamental",
            desc: "Latência, throughput, FPS, uso de memória e warm-up.",
            detalhe: "Três erros arruínam qualquer medição de GPU: não descartar as primeiras iterações (o warm-up inclui alocação e compilação de kernels), não sincronizar antes de parar o cronômetro (as chamadas CUDA são assíncronas e você acaba medindo o tempo de enfileirar) e reportar a média sem a cauda. Relate a mediana e o percentil 95 — é a cauda que estoura o orçamento de tempo real." },
          { id: "cv-edge-02", titulo: "Mapeamento de gargalos", prioridade: "fundamental",
            desc: "Pré-processamento, cópia CPU↔GPU, decodificação, pós-processamento.",
            detalhe: "Cronometre cada estágio separadamente antes de tocar no modelo. Decodificar H.264 em CPU pode custar mais que a inferência inteira; o redimensionamento em CPU, idem; e cada cópia entre CPU e GPU é tempo puro. NMS com muitas caixas também aparece com frequência no topo do perfil. É aqui que mora o critério de domínio sobre o gargalo fora da inferência." },
          { id: "cv-edge-03", titulo: "Batching e assincronia", prioridade: "importante",
            desc: "Inferência assíncrona e paralelismo em pipeline.",
            detalhe: "Batch aumenta o throughput mas também a latência do primeiro resultado — se a aplicação é interativa, isso pode ser inaceitável. Paralelismo em pipeline (decodificar o frame N+1 enquanto o N é inferido) é o ganho mais barato em vídeo, porque sobrepõe trabalho de CPU e GPU que hoje acontece em sequência." },
        ],
      },
      {
        id: "cv-g-edge-2",
        titulo: "Comprimir e acelerar",
        topicos: [
          { id: "cv-edge-04", titulo: "Exportação de modelos", prioridade: "fundamental",
            desc: "ONNX e o grafo de inferência.",
            detalhe: "ONNX é o formato intermediário que desacopla o treino do runtime. A exportação congela o grafo e remove tudo que só servia ao treino. Armadilhas comuns: controle de fluxo dependente de dados não exporta bem, e dimensões dinâmicas precisam ser declaradas explicitamente ou o modelo só aceita o tamanho exato usado na exportação. Sempre confira que a saída do ONNX bate com a do PyTorch dentro de uma tolerância." },
          { id: "cv-edge-05", titulo: "Runtimes", prioridade: "fundamental",
            desc: "ONNX Runtime, TensorRT, OpenVINO e TFLite.",
            detalhe: "Cada um é especializado no seu hardware: TensorRT em GPUs NVIDIA, OpenVINO em CPUs e aceleradores Intel, TFLite em móvel, ONNX Runtime como opção portátil. Eles aceleram fundindo operações (convolução, BatchNorm e ReLU viram um kernel só) e escolhendo implementações otimizadas. Ganhos de 2 a 5 vezes sem perda de acurácia são comuns só com a troca de runtime." },
          { id: "cv-edge-06", titulo: "Quantização", prioridade: "fundamental",
            desc: "Dinâmica, estática e QAT; INT8 e FP16.",
            detalhe: "FP16 costuma ser ganho quase gratuito em GPU moderna, com perda desprezível. INT8 dá mais velocidade e menos memória, mas exige calibração com dados representativos para escolher as escalas, e pode custar acurácia. QAT simula a quantização durante o treino e recupera boa parte dessa perda. A regra inegociável: reavalie a acurácia DEPOIS de quantizar, no mesmo conjunto de teste." },
          { id: "cv-edge-07", titulo: "Pruning e distilação", prioridade: "importante",
            desc: "Poda, distilação de conhecimento e backbone leve.",
            detalhe: "Pruning remove pesos ou canais pouco importantes; o não estruturado comprime bem mas só acelera com suporte de hardware a esparsidade, enquanto o estruturado (canais inteiros) acelera em qualquer lugar. Distilação treina um modelo pequeno para imitar as saídas de um grande e costuma superar o mesmo modelo pequeno treinado direto nos rótulos. E às vezes o caminho mais curto é simplesmente trocar o backbone por um MobileNet." },
          { id: "cv-edge-08", titulo: "Hardware", prioridade: "importante",
            desc: "Jetson, Raspberry Pi, Coral TPU e aceleradores móveis.",
            detalhe: "Cada plataforma impõe o seu formato: Jetson quer TensorRT, Coral exige INT8 totalmente quantizado e um conjunto restrito de operações, Raspberry Pi sem acelerador é CPU pura. Decida o hardware ANTES de escolher a arquitetura — descobrir que o seu modelo usa uma operação não suportada depois de treinado é um retrabalho caro." },
          { id: "cv-edge-09", titulo: "Decodificação acelerada e GStreamer", prioridade: "opcional",
            desc: "Decodificação de vídeo em hardware.",
            detalhe: "GPUs e SoCs trazem decodificadores de vídeo dedicados que liberam a CPU por completo. Com GStreamer é possível montar um pipeline que decodifica em hardware e entrega o frame já na memória da GPU, eliminando a cópia. Em sistemas com muitas câmeras simultâneas, isso é frequentemente a diferença entre viável e inviável." },
          { id: "cv-edge-10", titulo: "Trade-off explícito", prioridade: "fundamental",
            desc: "Acurácia perdida contra velocidade ganha.",
            detalhe: "A entrega concreta é uma tabela: para cada configuração, acurácia, latência mediana, p95, memória e tamanho. Com ela, a decisão deixa de ser preferência e vira argumento — \"perdemos 1,2 ponto de mAP e ganhamos 3,4 vezes em velocidade, e o requisito é 25 FPS\". Sem ela, qualquer escolha é defensável e nenhuma é justificada." },
        ],
      },
    ],
  },

  {
    id: "deploy",
    numero: 12,
    titulo: "Full stack e deploy",
    objetivo: "Transformar o modelo em um sistema que outra pessoa consegue usar.",
    descricao:
      "O critério de domínio desta iteração é desconfortável de propósito: outra pessoa clona o seu " +
      "repositório, roda um comando e o sistema funciona. Notebook que só roda na sua máquina não conta. " +
      "Esta é a iteração mais larga do roadmap porque cruza para outra disciplina — API, banco, fila, " +
      "container, nuvem, observabilidade. " +
      "Não é preciso profundidade em tudo: o objetivo é conseguir entregar uma fatia vertical completa, " +
      "da imagem enviada ao resultado exibido, com log e medição no caminho.",
    preRequisitos: "Etapa 6",
    duracao: null,
    criterios: [
      "Outra pessoa clona seu repositório, roda um comando e o sistema funciona.",
      "Você justifica o que roda no servidor e o que roda no navegador, considerando latência e privacidade.",
      "Você sabe o que acontece sob 10 requisições simultâneas, porque mediu.",
    ],
    grupos: [
      {
        id: "cv-g-dep-1",
        titulo: "Interface e API",
        topicos: [
          { id: "cv-dep-01", titulo: "Fundamentos web", prioridade: "importante",
            desc: "HTML, CSS e JavaScript.",
            detalhe: "O suficiente para montar uma página que envia uma imagem e desenha o resultado. Para visão, o elemento que importa é o `<canvas>`: é nele que você sobrepõe caixas e máscaras ao frame. Vale conhecer também `getUserMedia`, que dá acesso à webcam direto do navegador." },
          { id: "cv-dep-02", titulo: "Framework de frontend", prioridade: "opcional",
            desc: "React.js ou Vue.js.",
            detalhe: "Só compensa quando a interface tem estado de verdade — lista de resultados, filtros, histórico, upload com progresso. Para uma demo de uma tela, HTML e JavaScript puros entregam mais rápido e com menos a manter. Escolha pelo tamanho do problema, não pelo currículo." },
          { id: "cv-dep-03", titulo: "Backend em Python", prioridade: "fundamental",
            desc: "FastAPI (recomendado), Flask ou Django.",
            detalhe: "FastAPI é a escolha natural aqui: valida entrada e saída com tipos, gera documentação interativa sozinho e suporta assíncrono nativamente. O detalhe que mais importa em visão: carregue o modelo UMA vez na inicialização e reaproveite entre requisições — carregá-lo por requisição transforma 30 ms em 3 segundos." },
          { id: "cv-dep-04", titulo: "APIs REST", prioridade: "fundamental",
            desc: "Rotas, upload de arquivos, validação e códigos de erro.",
            detalhe: "Defina um contrato explícito: tipos e tamanho máximo aceitos, formato da resposta, e o que acontece quando a imagem é inválida. Responda 400 para entrada ruim e 500 só para falha sua — misturar os dois torna impossível distinguir cliente errado de servidor quebrado no monitoramento. Imponha limite de tamanho: sem ele, um upload de 200 MB derruba o processo." },
          { id: "cv-dep-05", titulo: "WebSockets", prioridade: "importante",
            desc: "Vídeo ao vivo e atualizações em tempo real.",
            detalhe: "HTTP não serve para fluxo contínuo: o custo por requisição domina. WebSocket mantém a conexão aberta nos dois sentidos. A decisão de projeto é o que trafega — enviar o frame inteiro codificado e devolver JSON com as detecções costuma ser mais barato que devolver o frame anotado. E descarte frames quando o servidor atrasar, em vez de acumular fila." },
          { id: "cv-dep-06", titulo: "Streaming de vídeo", prioridade: "importante",
            desc: "MJPEG, WebRTC e suas limitações.",
            detalhe: "MJPEG é trivial de implementar e esbanja banda, porque cada frame é um JPEG independente. WebRTC é o caminho de baixa latência de verdade, com compressão e adaptação à rede, ao custo de infraestrutura adicional (STUN/TURN). Para demo interna, MJPEG; para produto, WebRTC." },
        ],
      },
      {
        id: "cv-g-dep-2",
        titulo: "Dados, empacotamento e operação",
        topicos: [
          { id: "cv-dep-07", titulo: "Banco de dados", prioridade: "importante",
            desc: "PostgreSQL e MongoDB; metadados e resultados.",
            detalhe: "Guarde metadados e resultados no banco e a mídia fora dele — blob de imagem em tabela incha o banco e estraga backup e replicação. PostgreSQL com coluna JSONB cobre bem resultados de formato variável sem abrir mão de consultas e integridade. O que você vai querer consultar depois: data, modelo e versão usados, tempo de inferência e confiança." },
          { id: "cv-dep-08", titulo: "Armazenamento de mídia", prioridade: "importante",
            desc: "Sistema de arquivos versus object storage (S3).",
            detalhe: "Sistema de arquivos local é simples e não escala além de uma máquina; object storage dá durabilidade, URLs assinadas e acesso de múltiplos processos. O padrão que evita trafegar a imagem pelo seu servidor duas vezes: o cliente envia direto para o storage com URL pré-assinada e manda ao backend apenas a chave." },
          { id: "cv-dep-09", titulo: "Filas e processamento assíncrono", prioridade: "importante",
            desc: "Tarefas pesadas fora do ciclo da requisição.",
            detalhe: "Processar um vídeo de 10 minutos dentro de uma requisição HTTP garante timeout. O padrão é: aceitar, devolver um ID de tarefa, processar em worker e expor o status por consulta ou notificação. A fila também é o que protege a GPU de ser disputada por dez requisições simultâneas — que é o que o critério de domínio manda você medir." },
          { id: "cv-dep-10", titulo: "Docker", prioridade: "fundamental",
            desc: "Imagens, volumes, GPU no container e `docker compose`.",
            detalhe: "É o que torna \"clona e roda um comando\" verdadeiro. Para GPU é preciso a imagem base CUDA correta e o runtime da NVIDIA; a versão do CUDA dentro do container tem que ser compatível com o driver do host. Use build em múltiplos estágios para não carregar compilador na imagem final, e monte modelos e dados como volume em vez de embuti-los, para não gerar imagens de vários gigabytes." },
          { id: "cv-dep-11", titulo: "Nuvem", prioridade: "importante",
            desc: "AWS, GCP ou Azure — computação, storage e GPU.",
            detalhe: "Instância com GPU é cara por hora e é o custo que surpreende. Para carga intermitente, considere inferência em CPU com modelo otimizado (iteração 11) ou função serverless; a GPU dedicada só se justifica com uso contínuo. Configure alerta de gasto antes de subir qualquer coisa — a conta esquecida é um clássico." },
          { id: "cv-dep-12", titulo: "Servidores de inferência", prioridade: "opcional",
            desc: "TorchServe, Triton e BentoML.",
            detalhe: "Resolvem de forma pronta o que você escreveria à mão: batching dinâmico, múltiplas versões do modelo em paralelo, métricas e health check. Triton ainda roda modelos de frameworks diferentes no mesmo servidor. Valem quando há vários modelos ou tráfego sério; para um modelo só, FastAPI é mais simples de operar." },
          { id: "cv-dep-13", titulo: "Observabilidade", prioridade: "fundamental",
            desc: "Logs estruturados, métricas, tracing e alertas.",
            detalhe: "Log estruturado em JSON é consultável; log em texto livre é arqueologia. Registre latência por estágio, taxa de erro e distribuição das confianças — essa última é o seu detector precoce de drift, porque a confiança média cai antes de a acurácia desabar. Alerta só no que exige ação humana, senão ele vira ruído e deixa de ser lido." },
          { id: "cv-dep-14", titulo: "Visão no navegador", prioridade: "opcional",
            desc: "TensorFlow.js e OpenCV.js.",
            detalhe: "Rodar no cliente elimina latência de rede e mantém a imagem no dispositivo, o que resolve privacidade de um jeito que nenhuma política de servidor resolve. As limitações são reais: modelo pequeno, desempenho variável entre dispositivos e download inicial pesado. É a resposta ao critério de domínio sobre o que roda onde." },
          { id: "cv-dep-15", titulo: "Versionamento de modelos e dados", prioridade: "fundamental",
            desc: "Rastreabilidade e rollback.",
            detalhe: "Toda predição deveria ser rastreável até a versão exata de modelo e dataset que a gerou — sem isso você não consegue explicar uma regressão nem voltar atrás. Ferramentas como DVC versionam dados junto com o código. Mantenha a versão anterior pronta para servir: rollback precisa ser uma troca de configuração, não um retreino." },
        ],
      },
    ],
  },

  {
    id: "capstone",
    numero: 13,
    titulo: "Capstone",
    objetivo: "Integrar tudo em um sistema único, com escopo real e limitações declaradas.",
    descricao:
      "Prefira um problema do seu próprio contexto, com dados aos quais você tem acesso. " +
      "A dificuldade real de um capstone quase nunca está no modelo; está em obter e anotar dados " +
      "representativos, e em admitir por escrito onde o sistema falha. " +
      "Os tópicos desta etapa são os critérios de conclusão do roadmap transformados em itens de " +
      "trabalho: cada um é uma entrega verificável, e a ordem entre eles importa — definir a métrica " +
      "depois de ver os resultados é a forma mais fácil de se enganar.",
    preRequisitos: "Etapas 11 e 12",
    duracao: null,
    grupos: [
      {
        id: "cv-g-cap",
        titulo: null,
        topicos: [
          { id: "cv-cap-01", titulo: "Problema e métrica definidos antes", prioridade: "fundamental",
            desc: "Métrica de sucesso declarada antes de começar.",
            detalhe: "Escreva, antes de tocar no código, qual número precisa atingir qual valor para o projeto ser considerado bem-sucedido, e por que esse número reflete o custo real do erro. Métrica escolhida depois dos resultados é sempre a que favorece o que você já obteve — e essa é a forma mais comum e mais invisível de autoengano técnico." },
          { id: "cv-cap-02", titulo: "Dataset versionado e dividido", prioridade: "fundamental",
            desc: "Treino, validação e teste sem vazamento.",
            detalhe: "Em visão, divida por FONTE, não por arquivo: todos os frames de um mesmo vídeo, todas as fotos de uma mesma sessão ou de um mesmo paciente ficam no mesmo lado. Divisão aleatória por imagem coloca quadros quase idênticos nos dois lados e produz uma validação otimista que não sobrevive à produção." },
          { id: "cv-cap-03", titulo: "Baseline antes do modelo complexo", prioridade: "fundamental",
            desc: "Linha de base simples implementada primeiro.",
            detalhe: "Comece pelo trivial: a classe majoritária, uma heurística clássica da iteração 1, um modelo pré-treinado sem ajuste. O baseline serve a dois propósitos — mede quanto a complexidade realmente agrega e, com frequência, revela que o problema é mais fácil ou mais difícil do que parecia. Modelo complexo sem baseline é um número sem régua." },
          { id: "cv-cap-04", titulo: "Avaliação com as métricas corretas", prioridade: "fundamental",
            desc: "As métricas da tarefa, e não apenas acurácia.",
            detalhe: "Classificação desbalanceada pede F1 por classe e matriz de confusão; detecção pede mAP nos dois limiares e análise por classe; segmentação pede IoU e Dice. Reporte também a variação entre execuções com seeds diferentes: um número único sem noção de dispersão não permite dizer se a sua melhoria é real." },
          { id: "cv-cap-05", titulo: "Análise dos piores casos", prioridade: "fundamental",
            desc: "Exemplos visuais dos erros.",
            detalhe: "Separe os N piores erros e olhe para eles um a um. Os padrões que aparecem quase sempre são de três tipos: rótulo errado, classe genuinamente ambígua, ou condição não representada no treino (iluminação, ângulo, escala). Cada um pede uma ação diferente, e nenhum deles é visível no agregado da métrica." },
          { id: "cv-cap-06", titulo: "Latência e FPS no hardware alvo", prioridade: "fundamental",
            desc: "Medição no dispositivo real.",
            detalhe: "Aplique o rigor da iteração 11: warm-up descartado, GPU sincronizada, mediana e p95 reportados, e a medição feita no hardware onde o sistema vai rodar. Número obtido na sua RTX não diz nada sobre o comportamento em uma Jetson — e é no dispositivo alvo que o requisito precisa ser cumprido." },
          { id: "cv-cap-07", titulo: "Sistema empacotado e executável", prioridade: "fundamental",
            desc: "Executável por terceiros e documentado.",
            detalhe: "O teste honesto é pedir a alguém que siga o seu README numa máquina limpa, sem fazer perguntas, e anotar onde essa pessoa trava. Tudo que ela precisou perguntar é documentação faltando. Docker com um comando de subida resolve a maior parte dos casos." },
          { id: "cv-cap-08", titulo: "README com decisões e resultados", prioridade: "fundamental",
            desc: "Arquitetura, decisões, resultados e limitações.",
            detalhe: "Documente as alternativas que você considerou e descartou, com o motivo — isso vale mais para quem lê (e para você em seis meses) do que a descrição do que ficou. Inclua a tabela de acurácia contra latência e seja explícito sobre as limitações: um projeto que declara onde falha demonstra mais maturidade técnica do que um que promete funcionar sempre." },
          { id: "cv-cap-09", titulo: "Condições de falha declaradas", prioridade: "fundamental",
            desc: "Lista explícita de onde o sistema falha.",
            detalhe: "Teste deliberadamente fora da distribuição: pouca luz, ângulo extremo, oclusão, objeto fora do conjunto de classes, imagem corrompida. Escreva o que acontece em cada caso. Um sistema que sabe dizer \"não sei\" com confiança calibrada é muito mais útil em produção do que um que responde com alta confiança sobre algo que nunca viu." },
        ],
      },
    ],
  }
];
