/* ============================================================
   Roadmap de Machine Learning 2026 — metadados e montagem
   Fonte: machine-learning-checklist-ptbr.md

   Este arquivo guarda só o invólucro. O conteúdo de cada etapa
   vive em conteudo-N-*.js, que dão push em ROADMAP_ETAPAS na
   ordem em que são carregados no index.html.

   Esquema de um tópico:
     id          identificador estável, usado no localStorage
     titulo      rótulo curto exibido no nó
     prioridade  "fundamental" | "importante" | "opcional"
     desc        a linha do checklist — o "o quê", para revisão
     detalhe     explicação real — o "por quê" e "quando morde"
   ============================================================ */

const ROADMAP_ETAPAS = [];

const ROADMAP = {
  titulo: "Machine Learning",
  subtitulo: "A ordem completa — 2026",
  fonte: {
    rotulo: "r/learnmachinelearning — how to learn machine learning in 2026",
    url: "https://www.reddit.com/r/learnmachinelearning/comments/1wn850o/how_to_learn_machine_learning_in_2026_the/",
    consultadoEm: "2026-10-09",
  },
  etapas: ROADMAP_ETAPAS,
};

/* ------------------------------------------------------------
   Projetos sugeridos, por etapa (seção 6 do checklist)
   ------------------------------------------------------------ */
const PROJETOS = {
  python: [
    "Criar uma CLI que lê um CSV, calcula estatísticas básicas e grava um relatório JSON.",
  ],
  matematica: [
    "Implementar multiplicação de matrizes e autovalores usando apenas NumPy, validando com matrizes conhecidas.",
  ],
  pytorch: [
    "Reimplementar um MLP de duas camadas do zero e treinar no dataset Iris.",
  ],
  fundamentos: [
    "Replicar um tutorial de classificação binária (Titanic, por exemplo) com regressão logística e reportar precisão, recall e F1.",
    "Treinar o mesmo modelo com e sem dropout e weight decay, comparando as curvas de validação.",
    "Realizar CV estratificado de 5 folds em um dataset multiclasse e plotar ROC-AUC por classe.",
  ],
  especializacao: [
    "Escolher um dataset público (CIFAR-10 para visão ou SST-2 para NLP) e fazer fine-tuning de um transformer pré-treinado, avaliando com métricas adequadas.",
  ],
};

/* ------------------------------------------------------------
   Recursos (seção 5 do checklist), marcados por etapa
   ------------------------------------------------------------ */
const RECURSOS = [
  { etapa: "python", titulo: "Tutorial oficial de Python", url: "https://docs.python.org/3/tutorial/", nota: "Referência oficial" },
  { etapa: "python", titulo: "Ambientes virtuais em Python", url: "https://realpython.com/python-virtual-environments/", nota: "venv e conda" },
  { etapa: "python", titulo: "Documentação do NumPy", url: "https://numpy.org/doc/", nota: "Biblioteca fundamental de arrays" },
  { etapa: "python", titulo: "Documentação do pandas", url: "https://pandas.pydata.org/docs/", nota: "Manipulação de dados" },
  { etapa: "python", titulo: "scikit-learn", url: "https://scikit-learn.org/stable/", nota: "Algoritmos clássicos de ML" },

  { etapa: "matematica", titulo: "Linear Algebra — Gilbert Strang (MIT OCW)", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/", nota: "Álgebra linear" },
  { etapa: "matematica", titulo: "Calculus — Khan Academy", url: "https://www.khanacademy.org/math/calculus-1", nota: "Cálculo" },
  { etapa: "matematica", titulo: "Probability and Statistics — DeGroot & Schervish", url: null, nota: "Probabilidade" },
  { etapa: "matematica", titulo: "Elements of Information Theory — Cover & Thomas", url: null, nota: "Teoria da informação" },
  { etapa: "matematica", titulo: "Truque log-sum-exp", url: "https://stackoverflow.com/questions/42126924/", nota: "Estabilidade numérica" },

  { etapa: "pytorch", titulo: "Tutoriais oficiais do PyTorch", url: "https://pytorch.org/tutorials/", nota: "Tensores e deep learning" },

  { etapa: "fundamentos", titulo: "Deep Learning — Goodfellow, Bengio, Courville", url: null, nota: "Referência completa" },
  { etapa: "fundamentos", titulo: "Pattern Recognition and Machine Learning — Bishop", url: null, nota: "Leitura adicional" },
  { etapa: "fundamentos", titulo: "Hands-On Machine Learning — Géron", url: null, nota: "Leitura adicional" },

  { etapa: "especializacao", titulo: "Attention Is All You Need (Vaswani et al., 2017)", url: "https://arxiv.org/abs/1706.03762", nota: "Transformers" },
  { etapa: "especializacao", titulo: "CS231n — Stanford", url: "http://cs231n.stanford.edu/", nota: "Visão computacional, CNNs" },
  { etapa: "especializacao", titulo: "Reinforcement Learning — Sutton & Barto (2ª ed.)", url: null, nota: "RL" },
];

/* ------------------------------------------------------------
   Legenda — prioridade do checklist mapeada para o visual
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
   Critérios de domínio pessoal (seção 7 do checklist).
   Exibidos no painel de cada etapa como lembrete do que
   significa marcar algo como "feito".
   ------------------------------------------------------------ */
const CRITERIOS = [
  "Explicar o conceito com suas próprias palavras, sem consultar notas.",
  "Implementar um exemplo mínimo funcional em código.",
  "Interpretar o resultado de um experimento e justificar as escolhas de design.",
  "Depurar um treinamento que falhou usando a lista de diagnóstico.",
];
