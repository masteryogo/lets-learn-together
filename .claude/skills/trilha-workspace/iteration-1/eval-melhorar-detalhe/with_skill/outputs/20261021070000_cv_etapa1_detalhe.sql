-- 0013 — os detalhes da etapa 1 da trilha de CV (Visão clássica com OpenCV).
--
-- O detalhe é o valor da trilha: lista de tópicos qualquer um monta; o que
-- não se acha pronto é por que o tópico existe nessa ordem e onde quem
-- estuda sozinho tropeça. Os doze detalhes desta etapa estavam curtos
-- demais para isso — diziam o que a função faz, não onde ela falha nem
-- como se percebe que está indo bem.
--
-- Só o campo `detalhe` muda. `id`, `titulo`, `desc` e `prioridade` ficam
-- intactos de propósito: o id é a chave de progresso_topico e o texto de
-- `desc` é a chave de progresso_subassunto. Mexer neles apagaria em
-- silêncio o progresso de quem já marcou esses itens.
--
-- Um `update` por tópico, em vez de reescrever o documento inteiro, para o
-- diff dizer qual tópico mudou. Cada um carrega no `where` o id do tópico
-- que espera encontrar naquele caminho: se alguém reordenar as etapas ou os
-- grupos, a declaração não aplica em vez de escrever no tópico errado —
-- jsonb_set por índice é silencioso quando o índice mudou de dono.
--
-- As contagens não mudam — nenhum tópico entra ou sai — e o gatilho
-- trilha_contagem as recalcula de qualquer forma.

-- cv-cl-01 · Espaços de cor
update public.trilha
   set conteudo = jsonb_set(conteudo,
       '{ROADMAP,etapas,1,grupos,0,topicos,0,detalhe}',
       to_jsonb('HSV é a resposta quando o problema é “achar o objeto daquela cor”: ele separa matiz (qual cor) de saturação e valor (quão intensa, quão clara), então uma sombra sobre o objeto muda o V mas preserva o H. Em BGR, a mesma sombra muda os três canais ao mesmo tempo e o limiar quebra. Duas pegadinhas de implementação: no OpenCV o matiz vai de 0 a 179, não de 0 a 360 (ele cabe num byte pela metade), e o vermelho fica partido nas duas pontas da escala — para segmentar vermelho você precisa de DUAS faixas e um `bitwise_or`, e quem não sabe disso passa a tarde achando que calibrou errado.

LAB entra quando você precisa comparar cores como o olho compara: distância euclidiana em LAB aproxima diferença perceptual, o que BGR não faz. Grayscale não é a média dos três canais — é uma soma ponderada que dá mais peso ao verde, e é por isso que dois objetos de cores diferentes podem virar exatamente o mesmo cinza; se o seu detector some ao converter para cinza, o problema é esse. O OpenCV usa BGR por herança das câmeras dos anos 90, e essa é a causa número um de imagens com azul e vermelho trocados ao misturar com matplotlib ou PIL. Sinal de que você entendeu: antes de escrever o primeiro limiar, você abre a imagem, inspeciona os valores de HSV no pixel do objeto, e só então escreve a faixa.'::text))
 where id = 'cv'
   and conteudo #>> '{ROADMAP,etapas,1,grupos,0,topicos,0,id}' = 'cv-cl-01';

-- cv-cl-02 · Operações geométricas
update public.trilha
   set conteudo = jsonb_set(conteudo,
       '{ROADMAP,etapas,1,grupos,0,topicos,1,detalhe}',
       to_jsonb('Todo redimensionamento interpola, e a escolha importa: `INTER_AREA` para reduzir (faz média da região, evita aliasing), `INTER_LINEAR` ou `INTER_CUBIC` para ampliar. Reduzir com `INTER_NEAREST` cria serrilhado que depois vira ruído de alta frequência nos filtros — e ruído que você mesmo criou é o pior de diagnosticar, porque não estava na imagem original. Lembre também que `cv2.resize` recebe o tamanho como `(largura, altura)`, o inverso da ordem do `shape`: trocar os dois é o erro de digitação mais comum do OpenCV, e ele não levanta exceção, só entrega a imagem deformada.

Rotação e warp dependem de uma matriz e de uma política de borda. Ao rotacionar com `getRotationMatrix2D` e `warpAffine`, a saída continua retangular: ou você corta os cantos, ou recalcula o novo bounding box e ajusta a translação da matriz antes de aplicar. O `borderMode` decide o que aparece onde não havia pixel — `BORDER_CONSTANT` preto é o padrão e cria uma borda escura artificial que o detector de bordas vai encontrar com prazer; `BORDER_REFLECT` costuma ser mais honesto. E a regra que economiza horas: toda transformação geométrica aplicada à imagem precisa ser aplicada também às coordenadas das anotações. Se o seu bounding box deslocou depois de um crop, é porque você esqueceu de subtrair a origem do recorte.'::text))
 where id = 'cv'
   and conteudo #>> '{ROADMAP,etapas,1,grupos,0,topicos,1,id}' = 'cv-cl-02';

-- cv-cl-03 · Operações aritméticas e máscaras
update public.trilha
   set conteudo = jsonb_set(conteudo,
       '{ROADMAP,etapas,1,grupos,0,topicos,2,detalhe}',
       to_jsonb('Máscara é o mecanismo central da visão clássica: uma imagem binária de um canal, mesma altura e largura da imagem, onde 255 significa “aqui sim”. `cv2.bitwise_and(img, img, mask=m)` é o idioma para aplicar uma, e o motivo de a imagem aparecer duas vezes é que a operação é entre `img` e ela mesma, filtrada pela máscara. Erro clássico: passar uma máscara de três canais ou de dtype errado — o OpenCV reclama com uma mensagem que não ajuda, e a correção é quase sempre um `cvtColor` ou um `astype(np.uint8)`.

Na aritmética, a diferença entre `cv2.add` e o `+` do NumPy é a diferença entre saturar e dar a volta: `250 + 10` em `uint8` vale 4, então clarear uma imagem com soma direta escurece exatamente as regiões já claras — um céu branco vira um céu com manchas pretas. `cv2.add` satura em 255 e é o que você quer na maior parte das vezes. Para brilho e contraste juntos, `cv2.convertScaleAbs(img, alpha, beta)` faz `alpha*img + beta` com saturação numa chamada só. E `cv2.absdiff` entre dois frames é o detector de movimento mais primitivo que existe — vale conhecê-lo porque ele é a linha de base contra a qual a subtração de fundo tem que provar que melhora. Sinal de domínio: você combina máscaras com `bitwise_or` e `bitwise_not` para expressar a regra do problema (“este tom, menos esta região”) em vez de encadear três limiares.'::text))
 where id = 'cv'
   and conteudo #>> '{ROADMAP,etapas,1,grupos,0,topicos,2,id}' = 'cv-cl-03';

-- cv-cl-04 · Desenho sobre a imagem
update public.trilha
   set conteudo = jsonb_set(conteudo,
       '{ROADMAP,etapas,1,grupos,0,topicos,3,detalhe}',
       to_jsonb('Parece trivial e é a sua ferramenta de depuração mais usada: desenhar o bounding box, o contorno detectado, o centróide e o valor do limiar sobre o frame é como você vê o que o algoritmo está vendo. Um pipeline clássico falha em silêncio — o resultado sai errado, não sai exceção — e a forma mais barata de achar em que passo a informação se perdeu é exibir cada estágio. Monte isso desde o primeiro dia, com uma função que empilha as imagens intermediárias lado a lado (`np.hstack`) numa janela só.

Três detalhes que mordem: essas funções alteram a imagem NO LUGAR, então `img = cv2.rectangle(...)` é um hábito perigoso — desenhe sempre sobre uma `img.copy()` se ainda for processar o original. As coordenadas são `(x, y)`, ou seja, coluna e linha, o inverso da indexação NumPy `img[y, x]`, e misturar as duas convenções na mesma função é a origem de metade dos retângulos que aparecem no lugar errado. A cor é uma tupla BGR, não RGB: `(0, 0, 255)` é vermelho. Para sobreposição semitransparente, desenhe numa cópia e misture com `cv2.addWeighted` — é o que deixa a máscara visível sem esconder a imagem embaixo.'::text))
 where id = 'cv'
   and conteudo #>> '{ROADMAP,etapas,1,grupos,0,topicos,3,id}' = 'cv-cl-04';

-- cv-cl-05 · Suavização
update public.trilha
   set conteudo = jsonb_set(conteudo,
       '{ROADMAP,etapas,1,grupos,0,topicos,4,detalhe}',
       to_jsonb('Cada filtro serve a um ruído, e escolher pelo nome em vez de pelo ruído é o erro padrão. O mediano é o único que remove sal e pimenta sem borrar, porque usa a mediana em vez da média e portanto descarta o outlier em vez de diluí-lo. O gaussiano é o padrão antes de detectar bordas, já que Canny amplifica ruído, e tem a propriedade prática de ser separável: um borrão 2D sai de dois borrões 1D, o que o torna barato mesmo com kernel grande. O bilateral preserva bordas enquanto suaviza áreas planas, ao custo de ser ordens de magnitude mais lento — ele raramente cabe em tempo real, e quando cabe é porque você reduziu a imagem antes.

O parâmetro que manda no gaussiano é o `sigma`, não o tamanho do kernel: se você passa `ksize` e deixa `sigma=0`, o OpenCV deriva um do outro, e é por isso que aumentar o kernel borra mais. O tamanho precisa ser ímpar, sempre. A armadilha de fundo é que suavizar é jogar informação fora de forma irreversível: borrar demais antes de limiarizar funde objetos vizinhos num blob só, e aí nenhuma morfologia depois os separa. Sinal de que você está acertando: você consegue dizer qual ruído está atacando (grão do sensor, sal e pimenta, textura do fundo) antes de escolher o filtro, e testa o pipeline com e sem a suavização para ver se ela está ajudando ou só escondendo o problema.'::text))
 where id = 'cv'
   and conteudo #>> '{ROADMAP,etapas,1,grupos,0,topicos,4,id}' = 'cv-cl-05';

-- cv-cl-06 · Limiarização
update public.trilha
   set conteudo = jsonb_set(conteudo,
       '{ROADMAP,etapas,1,grupos,0,topicos,5,detalhe}',
       to_jsonb('Limiar global só funciona com iluminação uniforme — que quase nunca é o caso fora do laboratório. Otsu escolhe o limiar automaticamente maximizando a separação entre duas classes do histograma, mas pressupõe que existem dois picos: aplicado a uma imagem que é quase toda fundo, ou que tem três materiais distintos, ele devolve um número sem sentido e com cara de resultado. A adaptativa calcula um limiar por vizinhança (`blockSize` ímpar e uma constante `C` subtraída da média ou da gaussiana local) e é o que salva documento fotografado com sombra de um lado; o preço é que, numa região inteiramente lisa, ela inventa textura a partir de ruído.

Três hábitos que fazem diferença: converta para cinza ou para o canal certo antes — limiarizar o V de HSV não é o mesmo que limiarizar o cinza; use `THRESH_BINARY_INV` quando o objeto é escuro sobre fundo claro, em vez de limiarizar e inverter depois; e combine Otsu com uma suavização gaussiana prévia, que é a receita da própria documentação e estabiliza muito o limiar escolhido. A regra de diagnóstico que vale a etapa inteira: se a sua limiarização falha, olhe o histograma antes de mexer no parâmetro. Um histograma sem vale entre os picos está dizendo que nenhum limiar escalar separa aquilo, e a correção é na iluminação, no espaço de cor ou no realce — não no número.'::text))
 where id = 'cv'
   and conteudo #>> '{ROADMAP,etapas,1,grupos,0,topicos,5,id}' = 'cv-cl-06';

-- cv-cl-07 · Morfologia
update public.trilha
   set conteudo = jsonb_set(conteudo,
       '{ROADMAP,etapas,1,grupos,0,topicos,6,detalhe}',
       to_jsonb('É a faxina pós-limiarização, e a ordem das duas operações básicas é tudo. Abertura (erosão seguida de dilatação) remove pontinhos brancos soltos preservando o tamanho do que sobrou; fechamento (o inverso) tampa buracos dentro do objeto e une partes que o limiar separou por um fio. O gradiente morfológico (dilatação menos erosão) dá o contorno de um objeto binário quase de graça, e `TOPHAT` isola o que é mais claro que a vizinhança — é o truque para tirar texto de um fundo com iluminação irregular quando nem a adaptativa resolveu.

O parâmetro de verdade é o elemento estruturante, não o número de iterações: use `cv2.getStructuringElement` e pense na FORMA. Um kernel elíptico de 5×5 limpa ruído isotrópico; um retangular de 3×9 preserva traços verticais e apaga horizontais, que é exatamente como se separa linha de tabela de texto num documento. Erosão demais faz objetos finos desaparecerem por completo e não há como recuperá-los: a dilatação não devolve o que a erosão apagou, ela só engorda o que sobrou. Sinal de domínio: você dimensiona o kernel a partir do tamanho em pixels do ruído e do objeto na SUA imagem, e refaz essa conta quando muda a resolução de entrada, em vez de carregar um `(5,5)` de projeto em projeto.'::text))
 where id = 'cv'
   and conteudo #>> '{ROADMAP,etapas,1,grupos,0,topicos,6,id}' = 'cv-cl-07';

-- cv-cl-08 · Histogramas
update public.trilha
   set conteudo = jsonb_set(conteudo,
       '{ROADMAP,etapas,1,grupos,0,topicos,7,detalhe}',
       to_jsonb('O histograma é o primeiro lugar a olhar quando o pipeline falha, porque ele diz se a imagem está subexposta, estourada ou com baixo contraste antes de você culpar o algoritmo. Um pico colado no 0 ou no 255 significa informação perdida no sensor, e nenhum realce traz de volta o que foi cortado. Ele também é a ponte para a limiarização: Otsu procura o vale entre dois picos, então olhar o histograma é literalmente ver se existe o vale que ele pressupõe.

Equalização global espalha os níveis por toda a faixa, mas amplifica ruído em regiões já uniformes e costuma deixar a imagem com aparência artificial. CLAHE faz o mesmo por blocos, com um `clipLimit` que corta picos antes de redistribuir, e é o que se usa na prática em imagem médica e em cena com iluminação desigual; o cuidado é que `tileGridSize` grande demais volta ao comportamento global e pequeno demais cria emendas visíveis entre blocos. Para imagem colorida, nunca equalize os três canais BGR separadamente — isso desloca o matiz e muda as cores. Converta para LAB ou YCrCb, equalize só o canal de luminância e volte. O outro uso que vale a pena é comparação: `cv2.compareHist` sobre histogramas normalizados em HSV é um medidor de similaridade barato, usado para achar corte de cena em vídeo e para reidentificar um objeto entre frames na etapa de tracking.'::text))
 where id = 'cv'
   and conteudo #>> '{ROADMAP,etapas,1,grupos,0,topicos,7,id}' = 'cv-cl-08';

-- cv-cl-09 · Detecção de bordas
update public.trilha
   set conteudo = jsonb_set(conteudo,
       '{ROADMAP,etapas,1,grupos,1,topicos,0,detalhe}',
       to_jsonb('Borda é derivada: onde a intensidade muda rápido. Sobel aproxima a primeira derivada em X ou Y e já embute uma suavização na direção perpendicular, por isso é mais estável que uma diferença simples; o Laplaciano usa a segunda derivada e marca a borda pela troca de sinal, o que o torna mais sensível a ruído. Um detalhe que gera bug silencioso: a derivada é negativa de um lado da borda, então calcular Sobel direto em `uint8` corta metade da informação. Use `ddepth=cv2.CV_64F`, tome o valor absoluto e só então converta de volta — `convertScaleAbs` faz isso.

Canny é um pipeline completo: suaviza, calcula gradiente, afina a borda com supressão de não-máximos e aplica histerese com DOIS limiares. Acima do alto é borda certa; entre os dois, só conta se estiver conectada a uma borda certa. Essa conectividade é o que evita bordas tracejadas, e é por isso que mexer só no limiar baixo muda tanto o resultado. Uma razão de 1:2 a 1:3 entre eles é o ponto de partida sensato, e derivar os limiares da mediana da imagem (`0.66*mediana` e `1.33*mediana`) é o truque que faz o mesmo código sobreviver a uma mudança de iluminação. Sintoma e causa: borda picotada quase sempre é limiar baixo alto demais ou suavização insuficiente; borda dupla significa que você esqueceu de suavizar e está pegando o ruído dos dois lados do gradiente. E lembre que Canny devolve pixels de borda, não objetos — transformar isso em entidade é o trabalho do tópico seguinte.'::text))
 where id = 'cv'
   and conteudo #>> '{ROADMAP,etapas,1,grupos,1,topicos,0,id}' = 'cv-cl-09';

-- cv-cl-10 · Contornos
update public.trilha
   set conteudo = jsonb_set(conteudo,
       '{ROADMAP,etapas,1,grupos,1,topicos,1,detalhe}',
       to_jsonb('Contorno é a fronteira de uma região conectada, e é onde o pipeline sai de pixels e entra em entidades que você pode contar, medir e decidir. Dele saem as medidas que viram regra: área (filtra ruído por tamanho mínimo), perímetro, razão de aspecto, extensão (área sobre a área do bounding box) e solidez (área sobre a área do fecho convexo) — a solidez baixa é o que denuncia uma forma recortada ou dois objetos grudados. `approxPolyDP` reduz o contorno a poucos vértices com uma tolerância proporcional ao perímetro; se sobram quatro, provavelmente é um retângulo, e é assim que se acha a folha de papel numa foto antes de corrigir a perspectiva.

Os modos importam mais do que parecem. `RETR_EXTERNAL` devolve só os contornos de fora e é o que você quer para contar objetos; `RETR_TREE` devolve a hierarquia, que informa quem está dentro de quem — é como se detecta um furo dentro de uma peça ou o miolo de uma letra. `CHAIN_APPROX_SIMPLE` guarda só os vértices em vez de todos os pixels da borda e economiza memória sem perder nada que você use. Cuidados práticos: `findContours` espera imagem binária e, em versões mais antigas, a modificava no lugar — passe uma cópia; a assinatura de retorno mudou entre OpenCV 3 e 4, o que quebra código copiado da internet; e `boundingRect` devolve o retângulo alinhado aos eixos, enquanto `minAreaRect` devolve o rotacionado, que é o certo para objeto inclinado. Sinal de domínio: você ordena os contornos por área, descarta por um mínimo derivado do tamanho esperado do objeto na sua resolução, e consegue justificar cada filtro que escreveu.'::text))
 where id = 'cv'
   and conteudo #>> '{ROADMAP,etapas,1,grupos,1,topicos,1,id}' = 'cv-cl-10';

-- cv-cl-11 · Features e casamento
update public.trilha
   set conteudo = jsonb_set(conteudo,
       '{ROADMAP,etapas,1,grupos,1,topicos,2,detalhe}',
       to_jsonb('Feature é um ponto que você reconhece de novo mesmo que a imagem gire, mude de escala ou de iluminação — tipicamente um canto, nunca um ponto no meio de uma área lisa, porque ali não há como saber de onde o ponto veio. Harris detecta cantos mas não descreve nem lida com escala; SIFT detecta e descreve, é robusto a escala e rotação, e já saiu de patente (está no módulo principal desde o OpenCV 4.4); ORB é livre, binário e rápido, e é a escolha padrão quando o orçamento é tempo real. A diferença entre detector e descritor é o que organiza o assunto: o primeiro acha onde olhar, o segundo transforma a vizinhança num vetor comparável.

O casamento é onde se perde ou se ganha. Descritor binário (ORB, BRIEF) casa com distância de Hamming e `NORM_HAMMING`; descritor float (SIFT) casa com L2 — trocar a métrica produz correspondências aleatórias sem erro nenhum. Nunca confie no vizinho mais próximo puro: use `knnMatch` com k=2 e o teste de razão de Lowe (descarte se a melhor distância não for menor que cerca de 0,75 da segunda), que é o que elimina a maior parte dos falsos pares. Mesmo assim sobram erros, e por isso `findHomography` tem que ser chamado com `RANSAC` — ele ajusta a matriz 3×3 usando só os pares que concordam entre si e devolve a máscara de inliers. Dois sinais de que algo está errado: poucos inliers (menos de uns 10 a 15) significa que a homografia é lixo mesmo que a função tenha retornado uma matriz; e homografia só vale se a cena for plana ou a câmera só girar — aplicá-la a uma cena 3D com translação produz um alinhamento que fica bom no centro e abre nas bordas.'::text))
 where id = 'cv'
   and conteudo #>> '{ROADMAP,etapas,1,grupos,1,topicos,2,id}' = 'cv-cl-11';

-- cv-cl-12 · Vídeo e subtração de fundo
update public.trilha
   set conteudo = jsonb_set(conteudo,
       '{ROADMAP,etapas,1,grupos,1,topicos,3,detalhe}',
       to_jsonb('Com câmera fixa, modelar o fundo e subtrair é o detector de movimento mais barato que existe, e continua em produção em muita aplicação de vigilância e contagem. A diferença entre frames consecutivos (`absdiff`) é a versão ingênua: ela só enxerga a BORDA do objeto em movimento, porque o interior uniforme não muda de um frame para o outro, e some assim que o objeto para. MOG2 e KNN mantêm um modelo estatístico por pixel, aprendem o fundo ao longo do tempo e se adaptam a mudanças lentas de luz — é por isso que eles pegam o objeto inteiro e sobrevivem ao entardecer.

Os parâmetros que decidem o resultado: `history` e a taxa de aprendizado passada em `apply` controlam quão rápido o modelo incorpora o que vê, e é um compromisso direto — rápido demais e o objeto que para some em segundos; lento demais e a cadeira que alguém moveu vira um fantasma permanente. `detectShadows=True` marca sombra com o valor 127 em vez de 255, o que é útil e é também a razão de muita máscara estranha: limiarize em 254 se você quer só o primeiro plano real. A saída crua sempre vem salpicada, então o pós-processamento faz parte do método: abertura morfológica, depois contornos, depois descarte por área mínima. E conheça os limites antes de apostar nisso: qualquer tremor ou reenquadramento da câmera invalida o modelo inteiro, folhagem balançando e reflexo em água geram movimento permanente, e mudança brusca de iluminação (uma luz acesa) faz o quadro inteiro virar primeiro plano por alguns segundos. Sinal de que você entendeu: você consegue dizer, olhando a máscara, se o problema é o modelo de fundo ou o pós-processamento.'::text))
 where id = 'cv'
   and conteudo #>> '{ROADMAP,etapas,1,grupos,1,topicos,3,id}' = 'cv-cl-12';
