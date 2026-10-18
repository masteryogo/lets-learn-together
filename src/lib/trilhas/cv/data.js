/* ============================================================
   Roadmap de Computer Vision — metadados e montagem
   Fonte: Computer Vision/Docs/Roadmap de Computer Vision.md

   Mesmo esquema da trilha de ML. A diferença estrutural é que
   aqui cada etapa traz seus próprios `criterios` (o "Critério
   de domínio" de cada iteração), em vez dos critérios globais.
   ============================================================ */


export const ROADMAP = {
  id: "cv",
  titulo: "Computer Vision",
  subtitulo: "Treze iterações, da visão clássica ao capstone",
  fonte: {
    rotulo: "Advanced Computer Vision Engineer Roadmap",
    url: "https://medium.com/cvrealtime/advanced-computer-vision-engineer-roadmap-2024-aee32bfa14c1",
    consultadoEm: "2026-09-16",
  },
};

/* ------------------------------------------------------------
   Projetos sugeridos — o "Praticar" de cada iteração
   ------------------------------------------------------------ */
export const PROJETOS = {
  pre: [
    "Construir uma CLI que recebe uma imagem ou vídeo, aplica uma transformação e grava o resultado.",
    "Fazer a CLI funcionar com webcam ao vivo, exibindo o FPS na tela.",
    "Tratar os erros reais: arquivo inexistente, codec ausente, câmera ocupada.",
  ],
  classica: [
    "Detector de objeto por cor em HSV, com trackbars para calibrar os limiares ao vivo.",
    "Contador de objetos em uma imagem usando limiarização, morfologia e contornos.",
    "Alinhamento de dois ângulos da mesma cena usando ORB e homografia.",
    "Detector de movimento em vídeo com subtração de fundo, ignorando ruído por área mínima.",
  ],
  matematica: [
    "Implementar convolução 2D do zero em NumPy e comparar com `cv2.filter2D`.",
    "Escrever os kernels de Sobel, blur e sharpen à mão e explicar por que funcionam.",
    "Implementar gradiente descendente para uma regressão linear, imprimindo a perda por época.",
    "Aplicar PCA a um conjunto de imagens e reconstruí-las com poucos componentes.",
  ],
  "ml-classico": [
    "Classificador de imagens com HOG + SVM, encapsulado em um `Pipeline` do scikit-learn.",
    "Comparar KNN, Random Forest e SVM no mesmo dataset com validação cruzada.",
    "Produzir a matriz de confusão e analisar quais classes se confundem e por quê.",
    "Repetir o experimento com um dataset propositalmente desbalanceado e observar a acurácia enganar.",
  ],
  redes: [
    "Implementar uma rede densa do zero em NumPy (forward e backward) para um problema simples.",
    "Treinar uma CNN pequena em PyTorch no CIFAR-10 ou dataset equivalente.",
    "Plotar curvas de perda e acurácia de treino e validação, e identificar o ponto de overfitting.",
    "Escrever um `Dataset` customizado que lê imagens do seu próprio diretório.",
  ],
  cnns: [
    "Montar um dataset próprio de classificação (mínimo 3 classes, 200 imagens por classe).",
    "Fazer fine-tuning de uma ResNet e comparar com a mesma arquitetura treinada do zero.",
    "Aplicar Grad-CAM e verificar se o modelo olha para a região correta da imagem.",
    "Registrar todos os experimentos com hiperparâmetros e resultados rastreáveis.",
  ],
  deteccao: [
    "Rodar um YOLO pré-treinado em vídeo e medir o FPS.",
    "Anotar um dataset próprio (mínimo 300 imagens) e treinar um detector nele.",
    "Avaliar por classe e identificar qual classe puxa o mAP para baixo, e por quê.",
    "Ajustar limiares de confiança e NMS para o custo real do falso positivo no seu domínio.",
  ],
  segmentacao: [
    "Treinar uma U-Net em um dataset de segmentação binária.",
    "Comparar cross-entropy contra Dice loss em um dataset com classes desbalanceadas.",
    "Sobrepor a máscara prevista à imagem e inspecionar visualmente os piores casos.",
    "Usar SAM para acelerar a anotação de um dataset próprio.",
  ],
  tracking: [
    "Acoplar um tracker ao seu detector da iteração 6 e manter IDs estáveis.",
    "Contar objetos que cruzam uma linha virtual, sem contar duas vezes.",
    "Medir velocidade aproximada de objetos e discutir a fonte de erro da estimativa.",
    "Provocar oclusões propositais e medir quantas trocas de ID ocorrem.",
  ],
  avancadas: [
    "Fazer fine-tuning de um ViT no dataset da iteração 5 e comparar com a CNN.",
    "Usar CLIP para classificação zero-shot e medir o quanto o prompt altera o resultado.",
    "Construir busca por similaridade em um acervo de imagens usando embeddings.",
    "Usar GroundingDINO combinado com SAM para segmentar por descrição textual.",
  ],
  visao3d: [
    "Calibrar uma câmera real com um padrão de xadrez e corrigir a distorção.",
    "Gerar um mapa de profundidade monocular e convertê-lo em nuvem de pontos.",
    "Reconstruir um objeto pequeno a partir de múltiplas fotos.",
    "Rodar um SLAM visual em um vídeo e avaliar a deriva ao longo do percurso.",
  ],
  edge: [
    "Estabelecer a linha de base medindo o modelo da iteração 6 com rigor.",
    "Exportar para ONNX e reexecutar a medição.",
    "Quantizar para INT8 e registrar acurácia e latência antes e depois.",
    "Perfilar o pipeline completo e descobrir quanto do tempo NÃO é o modelo.",
    "Rodar em hardware limitado (ou simulado) e alcançar a meta de FPS.",
  ],
  deploy: [
    "Expor o detector como API que recebe uma imagem e devolve detecções em JSON.",
    "Construir um frontend que consome a API e desenha as caixas sobre a imagem.",
    "Implementar streaming ao vivo por WebSocket, com o processamento no servidor.",
    "Persistir cada inferência em banco, com metadados, e criar uma tela de histórico.",
    "Empacotar tudo em Docker e subir em uma instância na nuvem.",
    "Instrumentar latência por requisição e taxa de erro.",
  ],
  capstone: [
    "Multi-Object Tracking com detecção de anomalias em tempo real.",
    "Reconstrução 3D de objetos usando Neural Radiance Fields (NeRF).",
    "Super-resolução de imagens médicas com deep learning.",
    "Reconhecimento de gestos em tempo real para interfaces de realidade aumentada.",
    "Navegação autônoma de drone com desvio de obstáculos.",
    "Análise de fluxo de tráfego em tempo real a partir de imagens de drone.",
  ],
};

/* ------------------------------------------------------------
   Recursos, marcados por etapa
   ------------------------------------------------------------ */
export const RECURSOS = [
  { etapa: "pre", titulo: "Documentação do OpenCV", url: "https://docs.opencv.org/", nota: "Referência oficial" },
  { etapa: "pre", titulo: "Documentação do NumPy", url: "https://numpy.org/doc/", nota: "Base de todo o resto" },

  { etapa: "classica", titulo: "OpenCV — tutoriais de processamento de imagem", url: "https://docs.opencv.org/4.x/d2/d96/tutorial_py_table_of_contents_imgproc.html", nota: "Passo a passo do módulo imgproc" },

  { etapa: "matematica", titulo: "Linear Algebra — Gilbert Strang (MIT OCW)", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/", nota: "Álgebra linear" },
  { etapa: "matematica", titulo: "Calculus — Khan Academy", url: "https://www.khanacademy.org/math/calculus-1", nota: "Cálculo" },

  { etapa: "ml-classico", titulo: "Guia do usuário do scikit-learn", url: "https://scikit-learn.org/stable/user_guide.html", nota: "Algoritmos e avaliação" },

  { etapa: "redes", titulo: "Tutoriais do PyTorch", url: "https://pytorch.org/tutorials/", nota: "Tensores, autograd e loop de treino" },

  { etapa: "cnns", titulo: "CS231n — Stanford", url: "http://cs231n.stanford.edu/", nota: "CNNs, do zero ao estado da arte" },
  { etapa: "cnns", titulo: "albumentations", url: "https://albumentations.ai/docs/", nota: "Augmentation moderno" },

  { etapa: "deteccao", titulo: "Documentação do Ultralytics YOLO", url: "https://docs.ultralytics.com/", nota: "Treino e inferência de detectores" },
  { etapa: "deteccao", titulo: "Roboflow", url: "https://roboflow.com/", nota: "Anotação e versionamento de dataset" },

  { etapa: "segmentacao", titulo: "Segment Anything (Meta AI)", url: "https://segment-anything.com/", nota: "Segmentação por prompt" },

  { etapa: "tracking", titulo: "ByteTrack (repositório)", url: "https://github.com/ifzhang/ByteTrack", nota: "Tracking-by-detection moderno" },

  { etapa: "avancadas", titulo: "An Image is Worth 16x16 Words (ViT)", url: "https://arxiv.org/abs/2010.11929", nota: "Vision Transformer" },
  { etapa: "avancadas", titulo: "CLIP (OpenAI)", url: "https://openai.com/research/clip", nota: "Visão e linguagem" },
  { etapa: "avancadas", titulo: "Papers with Code — Computer Vision", url: "https://paperswithcode.com/area/computer-vision", nota: "Acompanhar o estado da arte" },

  { etapa: "visao3d", titulo: "Open3D", url: "https://www.open3d.org/docs/release/", nota: "Nuvens de pontos e registro" },

  { etapa: "edge", titulo: "ONNX Runtime", url: "https://onnxruntime.ai/docs/", nota: "Exportação e inferência otimizada" },
  { etapa: "edge", titulo: "NVIDIA TensorRT", url: "https://docs.nvidia.com/deeplearning/tensorrt/", nota: "Quantização e aceleração" },

  { etapa: "deploy", titulo: "FastAPI", url: "https://fastapi.tiangolo.com/", nota: "Backend recomendado" },
  { etapa: "deploy", titulo: "Docker — documentação", url: "https://docs.docker.com/", nota: "Empacotamento e GPU no container" },

  { etapa: "capstone", titulo: "100 ideias de projetos de visão computacional", url: "https://github.com/farukalamai/top-100-computer-vision-projects-idea-for-2024", nota: "Banco de temas" },
  { etapa: "capstone", titulo: "Repositório do roadmap original", url: "https://github.com/farukalamai/advanced-computer-vision-engineer-roadmap-2024", nota: "Fonte da estrutura" },
];

/* ------------------------------------------------------------
   Legenda — prioridade mapeada para o visual
   ------------------------------------------------------------ */
export const LEGENDA = [
  { chave: "fundamental", rotulo: "Fundamental", desc: "Ordem estrita. Não pule." },
  { chave: "importante", rotulo: "Importante", desc: "Recomendado, mas a ordem é flexível." },
  { chave: "opcional", rotulo: "Opcional", desc: "Pule sem culpa e volte depois." },
];

export const ESTADOS = [
  { chave: "pendente", rotulo: "Pendente" },
  { chave: "estudando", rotulo: "Estudando" },
  { chave: "feito", rotulo: "Feito" },
  { chave: "pulado", rotulo: "Pulado" },
];

/* ------------------------------------------------------------
   Critérios globais — usados só por etapas que não definem os
   seus. São as perguntas de fechamento de iteração do roadmap.
   ------------------------------------------------------------ */
export const CRITERIOS = [
  "Que problema esta técnica resolve que a anterior não resolvia?",
  "Qual é o custo dela (dados, computação, latência, complexidade)?",
  "Como eu meço se ela funcionou?",
  "Em que condições ela falha?",
  "Eu conseguiria explicar isso a alguém sem usar o jargão?",
];
