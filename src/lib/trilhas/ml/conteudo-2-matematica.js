/* Etapa 2 — Matemática */

export default [{
  id: "matematica",
  numero: 2,
  titulo: "Matemática",
  objetivo:
    "Adquirir fundamentos de álgebra linear, cálculo, probabilidade, teoria da informação e computação numérica usados por ML.",
  descricao:
    "O objetivo aqui não é virar matemático, é parar de tratar o modelo como caixa-preta. " +
    "Cada bloco desta etapa responde a uma pergunta que vai aparecer depois: álgebra linear " +
    "explica o que uma camada faz com os dados; cálculo explica como o treino sabe para onde " +
    "andar; probabilidade explica de onde vem cada função de perda; teoria da informação " +
    "explica por que cross-entropy é a perda natural de classificação; computação numérica " +
    "explica por que o loss virou NaN. " +
    "Estude com código ao lado: implemente o conceito em NumPy e compare com a função pronta.",
  preRequisitos: "Etapa 1",
  duracao: "~9 semanas",
  grupos: [
    {
      id: "g-ferramentas",
      titulo: "Ferramentas matemáticas",
      duracao: "1 sem",
      descricao:
        "A notação que todo paper e toda documentação assume que você lê sem traduzir.",
      topicos: [
        {
          id: "mt-01",
          titulo: "Notação",
          prioridade: "fundamental",
          desc: "Funções, composição, inversas, chapéus e tils (ŷ, x̃), pertinência a conjuntos, notação big-O.",
          detalhe:
            "Convenções que se repetem em todo texto de ML: `ŷ` (y com chapéu) é a predição e " +
            "`y` é o valor verdadeiro; `θ` é o conjunto de parâmetros; `x ∈ ℝⁿ` diz que x é um " +
            "vetor de n números reais; `f ∘ g` é composição, que é literalmente o que empilhar " +
            "camadas significa. " +
            "A notação big-O descreve como o custo cresce com o tamanho da entrada — você vai " +
            "usar para comparar atenção (O(n²)) com convolução (O(n)).",
        },
        {
          id: "mt-02",
          titulo: "Expoentes, logaritmos e trigonometria",
          prioridade: "fundamental",
          desc: "Expoentes, logaritmos, trigonometria básica, círculo unitário.",
          detalhe:
            "Logaritmo é a ferramenta central e por um motivo prático: transforma produto em " +
            "soma. Como verossimilhança é um produto de muitas probabilidades menores que 1, " +
            "ela vira zero por underflow — trabalhar com log resolve, e é por isso que quase " +
            "toda perda tem um `log` dentro. " +
            "Exponencial aparece em softmax e em decaimento de learning rate; trigonometria " +
            "aparece em similaridade cosseno e em positional encoding de transformers.",
        },
        {
          id: "mt-03",
          titulo: "Somatórios e combinatória",
          prioridade: "importante",
          desc: "Notação de somatórios e produtos, argmin/argmax, combinatória.",
          detalhe:
            "Distinga `max` de `argmax`: o primeiro devolve o maior valor, o segundo devolve " +
            "ONDE ele está. A predição de um classificador é um argmax sobre as probabilidades " +
            "de classe, não o max. " +
            "Σ e Π traduzem direto para laços — e, em NumPy, para `.sum()` e `.prod()` com um " +
            "eixo. Saber ler o índice do somatório é saber qual eixo reduzir, que é a origem " +
            "de metade dos erros de shape.",
        },
      ],
    },
    {
      id: "g-algebra",
      titulo: "Álgebra linear",
      duracao: "3 sem",
      descricao:
        "A linguagem em que os dados e o modelo são escritos. Dado é matriz, camada é " +
        "multiplicação de matriz, e a GPU existe porque essa operação paraleliza bem.",
      topicos: [
        {
          id: "al-01",
          titulo: "Vetores, matrizes e bases",
          prioridade: "fundamental",
          desc: "Escalares, vetores, matrizes, span (espaço gerado), bases, independência linear, colinearidade, multiplicação matricial como transformação linear, transposta, produto externo (outer product), produto Hadamard, identidade, diagonal, simétrica.",
          detalhe:
            "A ideia que destrava tudo: uma matriz não é uma tabela de números, é uma função " +
            "que transforma vetores. `Wx` leva x de um espaço para outro, e é exatamente isso " +
            "que uma camada densa faz. " +
            "Independência linear e colinearidade têm consequência direta em dados: duas " +
            "features perfeitamente correlacionadas são colineares e tornam a solução " +
            "instável ou não-única. " +
            "Atenção à distinção entre produto matricial (`@`) e produto Hadamard, elemento a " +
            "elemento (`*`) — confundir os dois em NumPy não dá erro, dá resultado errado.",
        },
        {
          id: "al-02",
          titulo: "Sistemas lineares e posto",
          prioridade: "fundamental",
          desc: "Sistemas lineares, eliminação de Gauss, determinante, inversa, singularidade, posto (rank), espaço coluna e nulo, traço.",
          detalhe:
            "Posto é quanta informação independente a matriz realmente carrega. Uma matriz de " +
            "dados com posto menor que o número de colunas tem features redundantes. " +
            "Matriz singular é a que não tem inversa — e é por isso que a solução fechada da " +
            "regressão linear quebra quando há colinearidade perfeita, o que por sua vez " +
            "motiva a regularização (somar λI à diagonal torna o sistema resolvível). " +
            "Na prática você quase nunca inverte uma matriz: resolve o sistema, que é mais " +
            "estável e mais barato.",
        },
        {
          id: "al-03",
          titulo: "Produto escalar, normas e projeções",
          prioridade: "fundamental",
          desc: "Produto escalar, normas, distâncias, ângulos, similaridade cosseno, produto vetorial, ortogonalidade, matrizes ortogonais, projeções ortogonais, bases ortonormais, mínimos quadrados.",
          detalhe:
            "Produto escalar mede alinhamento entre dois vetores, e é a operação atômica de " +
            "toda rede neural e de todo mecanismo de atenção. " +
            "Similaridade cosseno é o produto escalar normalizado: compara direção ignorando " +
            "magnitude, que é o que você quer ao comparar embeddings de tamanhos diferentes. " +
            "Normas medem tamanho — L2 penaliza outliers mais que L1, e essa única diferença " +
            "explica por que regularização L1 gera pesos esparsos e L2 não. " +
            "Mínimos quadrados é projeção ortogonal: a predição é a sombra de y no espaço que " +
            "o modelo consegue alcançar.",
        },
        {
          id: "al-04",
          titulo: "Autovalores, SVD e fatorações",
          prioridade: "importante",
          desc: "Autovalores e autovetores, mudança de base, decomposição espectral, matrizes PSD, quociente de Rayleigh, número de condição, SVD, aproximação de posto baixo (low-rank), fatorações QR e Cholesky.",
          detalhe:
            "Autovetor é a direção que a matriz só estica, sem girar; o autovalor é o quanto " +
            "estica. PCA é exatamente isso aplicado à matriz de covariância: as direções de " +
            "maior variância dos seus dados. " +
            "SVD generaliza para qualquer matriz e dá a melhor aproximação de posto baixo — a " +
            "base de compressão, de sistemas de recomendação e, hoje, do LoRA, que faz " +
            "fine-tuning treinando apenas duas matrizes finas. " +
            "Número de condição alto significa problema mal-condicionado: pequenas mudanças na " +
            "entrada provocam grandes mudanças na saída, e o treino fica instável.",
        },
        {
          id: "al-05",
          titulo: "Tensores e broadcasting",
          prioridade: "importante",
          desc: "Tensores, broadcasting, notação einsum.",
          detalhe:
            "Tensor aqui é só array de N dimensões. O shape típico de um batch é " +
            "`(batch, canais, altura, largura)` e saber ler isso é metade do trabalho. " +
            "Broadcasting é a regra que permite somar shapes diferentes esticando dimensões de " +
            "tamanho 1 — poderoso e perigoso: somar `(32, 1)` com `(32,)` produz silenciosamente " +
            "`(32, 32)` em vez de erro. Quando um loss ficar estranho sem motivo, suspeite disso. " +
            "`einsum` escreve qualquer contração de índices de forma explícita e é a melhor " +
            "defesa contra esse tipo de bug.",
        },
      ],
    },
    {
      id: "g-calculo",
      titulo: "Cálculo e otimização",
      duracao: "2 sem",
      descricao:
        "Como o modelo aprende. Treinar é descer uma superfície de erro, e derivada é a " +
        "bússola que diz para onde.",
      topicos: [
        {
          id: "ca-01",
          titulo: "Derivadas e regra da cadeia",
          prioridade: "fundamental",
          desc: "Limites, continuidade, derivadas, derivadas parciais, gradientes, Jacobiano, regra da cadeia, cálculo matricial, backpropagation em camada linear, diferenciação automática.",
          detalhe:
            "Gradiente é o vetor das derivadas parciais: aponta na direção de maior aumento, " +
            "então você anda no sentido oposto para reduzir o erro. " +
            "A regra da cadeia é o coração de tudo: uma rede é composição de funções, e a " +
            "derivada da composição é o produto das derivadas. Backpropagation é só a " +
            "aplicação organizada disso, da saída para a entrada, reaproveitando cálculos. " +
            "Diferenciação automática é como PyTorch faz isso sozinho: cada operação registra " +
            "no grafo como derivar a si mesma, e `.backward()` percorre o grafo ao contrário. " +
            "Entender isso é o que te permite diagnosticar gradiente que some ou que explode.",
        },
        {
          id: "ca-02",
          titulo: "Hessiana e convexidade",
          prioridade: "importante",
          desc: "Hessiana, expansão de Taylor, funções convexas, pontos críticos, mínimos locais vs sela, definitude via autovalores.",
          detalhe:
            "A Hessiana é a matriz das segundas derivadas: descreve a curvatura. Gradiente " +
            "zero não garante mínimo — pode ser máximo ou ponto de sela, e são os autovalores " +
            "da Hessiana que distinguem. " +
            "Em alta dimensão, selas são muito mais comuns que mínimos locais ruins, o que é " +
            "uma das razões de redes profundas treinarem melhor do que a intuição 2D sugere. " +
            "Função convexa tem um único mínimo (regressão linear e logística são convexas); " +
            "rede neural não é, e por isso o resultado depende da inicialização e da seed.",
        },
      ],
    },
    {
      id: "g-probabilidade",
      titulo: "Probabilidade e estatística",
      duracao: "3 sem",
      descricao:
        "De onde vêm as funções de perda e como não se enganar com um número de validação. " +
        "ML é, em boa medida, estatística aplicada com mais parâmetros.",
      topicos: [
        {
          id: "pb-01",
          titulo: "Variáveis aleatórias e Bayes",
          prioridade: "fundamental",
          desc: "Variáveis aleatórias, PMF/PDF, conjunta, marginal e condicional, independência, regras de soma e produto, união, regra da cadeia da probabilidade, Teorema de Bayes.",
          detalhe:
            "Classificação é estimar `P(classe | entrada)` — uma probabilidade condicional. " +
            "Bayes é a regra que inverte condicionais e explica por que um teste com 99% de " +
            "acerto para uma doença rara ainda produz mais falsos positivos que verdadeiros: " +
            "a prevalência (o prior) domina. Essa mesma aritmética explica por que acurácia " +
            "engana em dataset desbalanceado. " +
            "Guarde a distinção entre PMF (discreta) e PDF (contínua): numa PDF o valor pode " +
            "passar de 1, porque o que vale 1 é a área, não a altura.",
        },
        {
          id: "pb-02",
          titulo: "Distribuições",
          prioridade: "fundamental",
          desc: "Discretas (Bernoulli, Binomial, Poisson) e contínuas (Gaussiana, Beta, Exponencial e outras).",
          detalhe:
            "Cada distribuição é uma hipótese sobre como seus dados foram gerados, e essa " +
            "hipótese escolhe a função de perda. Bernoulli (sim/não) leva a binary " +
            "cross-entropy; categórica leva a cross-entropy; Gaussiana leva a MSE. " +
            "A Gaussiana domina por causa do Teorema Central do Limite, não porque a natureza " +
            "goste dela. Poisson modela contagens por intervalo; Beta modela uma probabilidade " +
            "desconhecida e aparece em calibração.",
        },
        {
          id: "pb-03",
          titulo: "Momentos e covariância",
          prioridade: "importante",
          desc: "Esperança (valor esperado), variância, covariância, correlação, Gaussiana multivariada, distância de Mahalanobis.",
          detalhe:
            "Média e variância são o que você calcula para normalizar features — e precisam " +
            "ser calculadas SÓ no conjunto de treino, senão é vazamento. " +
            "Correlação mede associação linear e tem dois limites que importam: não implica " +
            "causalidade, e não captura relação não linear (duas variáveis podem ter " +
            "correlação zero e dependência total). " +
            "Mahalanobis é distância que leva em conta a covariância: mede o quanto um ponto é " +
            "atípico considerando o formato da nuvem de dados, e serve de detector de " +
            "outliers.",
        },
        {
          id: "pb-04",
          titulo: "LGN, TCL e testes",
          prioridade: "importante",
          desc: "Lei dos Grandes Números, Teorema Central do Limite, intervalos de confiança, testes de hipótese, p-values.",
          detalhe:
            "O TCL é a razão de a média de qualquer coisa tender à Gaussiana, e portanto a " +
            "razão de intervalos de confiança funcionarem. " +
            "O uso prático em ML é sóbrio e muito necessário: seu conjunto de validação é uma " +
            "amostra, então a métrica tem incerteza. Com 200 exemplos de validação, uma " +
            "diferença de 1% entre dois modelos provavelmente é ruído. Rode com várias seeds e " +
            "reporte média e desvio — comparar dois números únicos é o erro mais comum de quem " +
            "está começando.",
        },
        {
          id: "pb-05",
          titulo: "MLE, MAP e inferência bayesiana",
          prioridade: "importante",
          desc: "Máxima verossimilhança (MLE), estimativa MAP, inferência bayesiana, priors e posteriors, preditiva posterior, priors conjugados, viés-variância.",
          detalhe:
            "MLE é o princípio que unifica as perdas: escolher os parâmetros que tornam os " +
            "dados observados mais prováveis. Minimizar MSE é MLE sob ruído gaussiano; " +
            "minimizar cross-entropy é MLE sob distribuição categórica. Não são escolhas " +
            "arbitrárias. " +
            "MAP acrescenta um prior, e aqui está a conexão bonita: usar um prior gaussiano " +
            "sobre os pesos é matematicamente idêntico a regularização L2. Regularizar é " +
            "declarar uma crença prévia de que os pesos devem ser pequenos.",
        },
        {
          id: "pb-06",
          titulo: "Monte Carlo e amostragem",
          prioridade: "opcional",
          desc: "Monte Carlo, amostragem de importância, amostragem por rejeição, MCMC, truque de reparametrização, bootstrap.",
          detalhe:
            "Monte Carlo é estimar o que não se consegue calcular, amostrando. " +
            "O item com maior retorno imediato aqui é o bootstrap: reamostrar seu conjunto de " +
            "teste com reposição várias vezes dá um intervalo de confiança para a métrica sem " +
            "nenhuma suposição — é a forma mais honesta e mais barata de dizer se a diferença " +
            "entre dois modelos é real. " +
            "O truque de reparametrização é o que permite treinar VAEs por gradiente, e MCMC " +
            "aparece quando você faz inferência bayesiana de verdade.",
        },
      ],
    },
    {
      id: "g-informacao",
      titulo: "Teoria da informação",
      duracao: "3 dias",
      descricao:
        "Curto, mas é o bloco que explica a função de perda mais usada em classificação.",
      topicos: [
        {
          id: "ti-01",
          titulo: "Entropia e divergência KL",
          prioridade: "importante",
          desc: "Autoinformação, entropia, entropia diferencial, princípio da máxima entropia, cross-entropy, divergência KL, informação mútua.",
          detalhe:
            "Informação é surpresa: evento improvável carrega mais bits. Entropia é a surpresa " +
            "média de uma distribuição — quanta incerteza ela tem. " +
            "Cross-entropy é a surpresa média quando você usa a distribuição prevista para " +
            "codificar dados que na verdade seguem outra. Minimizá-la é aproximar a previsão " +
            "da verdade, e é literalmente a loss de classificação. " +
            "KL é cross-entropy menos entropia: o custo extra de ter errado a distribuição. " +
            "Como a entropia dos rótulos verdadeiros é constante, minimizar cross-entropy e " +
            "minimizar KL são a mesma coisa. Informação mútua mede dependência de qualquer " +
            "tipo, não só linear, e serve para seleção de features.",
        },
      ],
    },
    {
      id: "g-numerica",
      titulo: "Computação numérica",
      duracao: "2 dias",
      descricao:
        "Pequeno e muito rentável: é o bloco que explica NaN, inf e loss que trava.",
      topicos: [
        {
          id: "cn-01",
          titulo: "Ponto flutuante e estabilidade",
          prioridade: "importante",
          desc: "Representação em ponto flutuante, overflow e underflow, truque log-sum-exp, média móvel exponencial.",
          detalhe:
            "Float tem precisão finita: float32 guarda cerca de 7 dígitos significativos. " +
            "`exp(1000)` estoura para infinito e `log(0)` vai para menos infinito — as duas " +
            "fontes mais comuns de NaN no treino. " +
            "O truque log-sum-exp (subtrair o máximo antes de exponenciar) resolve, e é por " +
            "isso que você deve passar logits para `CrossEntropyLoss` em vez de aplicar softmax " +
            "antes: a versão combinada é numericamente estável. " +
            "Média móvel exponencial aparece em Adam, em batch norm e em qualquer métrica " +
            "suavizada que você plotar.",
        },
      ],
    },
  ],
}
];
