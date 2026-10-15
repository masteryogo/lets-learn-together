/* Etapa 5 — Especialização */

ROADMAP_ETAPAS.push({
  id: "especializacao",
  numero: 5,
  titulo: "Especialização",
  objetivo:
    "Escolher um domínio e aprofundar, mantendo o hábito das três dimensões: estudar teoria, implementar um projeto pequeno e validar em tarefa real.",
  descricao:
    "Escolha UM domínio. A tentação de estudar vários ao mesmo tempo produz conhecimento " +
    "raso em todos — e, como os fundamentos da Etapa 4 são comuns a todos eles, migrar " +
    "depois é barato. Profundidade em um domínio é o que gera projeto defensável e " +
    "contratação; amplitude vem com o tempo, sozinha. " +
    "O critério de escolha mais útil não é qual parece mais interessante, e sim a qual " +
    "tipo de dado você tem acesso real para construir algo seu.",
  preRequisitos: "Etapa 4",
  duracao: "contínuo",
  grupos: [
    {
      id: "g-dominios",
      titulo: "Escolha um domínio",
      descricao:
        "Os quatro caminhos mais comuns. Os dois primeiros concentram a maior parte das " +
        "vagas; os dois últimos são mais nichados e mais acadêmicos.",
      topicos: [
        {
          id: "es-01",
          titulo: "NLP",
          prioridade: "importante",
          desc: "Tokenização, embeddings, atenção e transformers; fine-tuning de modelos pré-treinados.",
          detalhe:
            "A progressão típica: tokenização (como texto vira números, e por que BPE existe) " +
            "→ embeddings (palavras como vetores com geometria significativa) → atenção e " +
            "transformers → fine-tuning de modelos pré-treinados. " +
            "Hoje quase nenhum trabalho prático treina do zero: você parte de um modelo " +
            "pronto e adapta, o que torna a habilidade central avaliar e não arquitetar. " +
            "É também a porta de entrada para engenharia de LLMs, RAG e agentes — área que " +
            "você já começou a mapear nas suas notas de AI Engineer.",
        },
        {
          id: "es-02",
          titulo: "Visão computacional",
          prioridade: "importante",
          desc: "Convoluções, CNNs modernas, detecção e segmentação.",
          detalhe:
            "Progressão: convolução e campo receptivo → CNNs modernas (ResNet, EfficientNet) → " +
            "transfer learning → detecção (YOLO, DETR) → segmentação (U-Net, SAM) → " +
            "otimização para tempo real. " +
            "Você já tem um roadmap dedicado e bem mais detalhado para isto no vault, em " +
            "Computer Vision/Docs — este nó serve só para marcar a escolha. " +
            "Uma observação que vale para os dois roadmaps: anotar um dataset próprio ensina " +
            "mais sobre o problema do que treinar mais um modelo.",
        },
        {
          id: "es-03",
          titulo: "Reinforcement learning",
          prioridade: "opcional",
          desc: "MDPs, value e policy methods, exploração versus explotação.",
          detalhe:
            "Aprender por tentativa e recompensa, sem rótulo certo. Conceitos centrais: " +
            "processo de decisão de Markov, funções de valor, gradiente de política, e o " +
            "dilema entre explorar o desconhecido e explotar o que já funciona. " +
            "Avise-se de que RL é notoriamente instável e caro em amostras — resultados " +
            "variam muito entre seeds. Fora de jogos e robótica, a aplicação mais relevante " +
            "hoje é RLHF, o alinhamento de modelos de linguagem por preferência humana.",
        },
        {
          id: "es-04",
          titulo: "Continual learning",
          prioridade: "opcional",
          desc: "Aprendizado incremental e esquecimento catastrófico.",
          detalhe:
            "Como fazer um modelo aprender tarefas novas sem apagar as antigas. O fenômeno " +
            "central é o esquecimento catastrófico: treinar na tarefa B degrada drasticamente " +
            "o desempenho na tarefa A. " +
            "É uma área mais de pesquisa que de produção, onde a solução padrão da indústria " +
            "continua sendo retreinar do zero com todos os dados. Relevante quando retreinar " +
            "é proibitivo ou quando os dados antigos não podem ser retidos, por regulação.",
        },
      ],
    },
    {
      id: "g-habito",
      titulo: "Hábito das três dimensões",
      descricao:
        "O critério para marcar qualquer tópico deste roadmap como feito. Vale para os " +
        "156, não só para esta etapa.",
      topicos: [
        {
          id: "es-05",
          titulo: "Teoria",
          prioridade: "fundamental",
          desc: "Explicar o conceito com suas próprias palavras, sem consultar notas.",
          detalhe:
            "O teste honesto é explicar em voz alta, sem olhar nada, para alguém que não " +
            "conhece o assunto. A sensação de entendimento ao ler é notoriamente não " +
            "confiável — reconhecer não é lembrar. " +
            "Escrever a explicação com suas palavras, aqui ou no vault, expõe os buracos " +
            "imediatamente.",
        },
        {
          id: "es-06",
          titulo: "Prática",
          prioridade: "fundamental",
          desc: "Implementar um exemplo mínimo funcional em código.",
          detalhe:
            "Implemente a versão menor possível que funcione de ponta a ponta, sem copiar. " +
            "Código executável não admite entendimento parcial: ou o shape bate ou não bate. " +
            "Para conceitos matemáticos, o padrão de ouro é implementar em NumPy e conferir " +
            "contra a função pronta da biblioteca — quando os dois batem, você entendeu.",
        },
        {
          id: "es-07",
          titulo: "Validação",
          prioridade: "fundamental",
          desc: "Interpretar o resultado de um experimento e justificar as escolhas de design.",
          detalhe:
            "A dimensão que quase todo mundo pula. Rodar e obter um número não é validar: " +
            "validar é saber dizer se o número é confiável, o que ele esconde, e por que " +
            "você escolheu esta métrica e não outra. " +
            "Pergunte sempre: qual é o baseline trivial? Qual é a variação entre seeds? " +
            "Em que condições isto falharia?",
        },
      ],
    },
  ],
});
