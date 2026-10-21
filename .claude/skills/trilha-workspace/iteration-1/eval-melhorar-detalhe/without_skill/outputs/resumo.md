# Etapa 1 da trilha de Computer Vision — detalhes aprofundados

## O que estava raso

A etapa 1 é `classica` — "Visão clássica com OpenCV", 2 grupos e 12 tópicos.
Os `detalhe` tinham entre 304 e 523 caracteres: davam para nomear a técnica e
citar uma curiosidade, não para evitar o erro que ela costuma causar. Faltava,
em quase todos, a mesma tríade: **o parâmetro que manda**, **a armadilha
concreta da API** e **o critério de escolha entre as alternativas**.

(Se o que você chamou de "etapa 1" era a `pre`, a de número 0 — Pré-requisitos
—, é só dizer: a mesma passada serve, e ela está mais rasa ainda, entre 238 e
378 caracteres.)

## O que foi escrito

Os doze `detalhe` foram reescritos, agora entre 1.100 e 1.350 caracteres cada:

| Tópico | antes | depois | o que entrou |
|---|---|---|---|
| `cv-cl-01` Espaços de cor | 523 | 1267 | H de 0–179 no OpenCV; vermelho em duas faixas; `inRange`; LAB como entrada do CLAHE |
| `cv-cl-02` Operações geométricas | 391 | 1290 | `INTER_NEAREST` só para máscara/rótulo; letterbox e volta das coordenadas; `borderMode` |
| `cv-cl-03` Aritmética e máscaras | 321 | 1140 | máscara de 1 canal `uint8` (nem 3 canais, nem `bool`); `addWeighted`, `absdiff`; `float32` no meio |
| `cv-cl-04` Desenho sobre a imagem | 304 | 1097 | `(x,y)` contra `(linha,coluna)`; `LINE_AA`; `getTextSize`; desenhar sempre em `copy()` |
| `cv-cl-05` Suavização | 371 | 1152 | gaussiano separável O(k); `sigmaX=0`; kernel ímpar; blur define a menor estrutura que sobrevive |
| `cv-cl-06` Limiarização | 403 | 1177 | Otsu exige bimodalidade e blur antes; `blockSize`/`C`; `THRESH_BINARY_INV`; dividir pelo fundo estimado |
| `cv-cl-07` Morfologia | 355 | 1250 | ordem não comuta; forma do kernel (`(3,9)` separa linhas de tabela); `TOPHAT` e `GRADIENT` |
| `cv-cl-08` Histogramas | 345 | 1214 | pico em 255 é informação perdida; `calcHist` com máscara; CLAHE no canal L; `compareHist` e `calcBackProject` |
| `cv-cl-09` Detecção de bordas | 444 | 1206 | `CV_8U` no Sobel corta as derivadas negativas; `Scharr`; proporção 1:2 ou 1:3 no Canny |
| `cv-cl-10` Contornos | 379 | 1299 | `RETR_EXTERNAL` × `RETR_TREE`; `epsilon` como fração do perímetro; `minAreaRect` × `boundingRect`; `m00` zero |
| `cv-cl-11` Features e casamento | 467 | 1344 | SIFT livre desde 2020; ORB pede `NORM_HAMMING`; teste de razão de Lowe; RANSAC e os limites da homografia |
| `cv-cl-12` Vídeo e subtração de fundo | 372 | 1303 | `history`/`varThreshold`/`detectShadows` (sombra = 127); `learningRate=0`; limpeza morfológica obrigatória |

Cada um fecha com gancho para onde o assunto reaparece — retroprojeção → tracking,
homografia → visão 3D —, que é o papel do detalhe num roadmap: dizer por que
aquilo está ali.

## O que NÃO mudou

- Os `id` dos doze tópicos. São a chave de `progresso_topico`, e renomear um
  apagaria o progresso de quem já marcou aquele item.
- `titulo`, `prioridade` e `desc` — e, por consequência, os subassuntos
  marcáveis que o painel deriva do `desc`.
- As contagens de etapas, grupos e tópicos: o gatilho `trilha_contagem`
  recalcula e dá o mesmo número.

## Arquivos gerados

Tudo em
`C:\Users\joaop\Workspaces\minhas-coisas\roadmap-web\.claude\skills\trilha-workspace\iteration-1\eval-melhorar-detalhe\without_skill\outputs\`:

- `20261021070000_cv_etapa1_detalhes.sql` — a migration proposta (19 KB). Um
  `update` em `trilha` que troca a etapa inteira via `jsonb_set`, localizando-a
  **pelo `id` `classica`** dentro do array e não por índice escrito, porque a
  posição depende da ordem gravada e não é endereço estável.
- `etapa-1-classica.json` — a etapa resultante, para conferir o texto sem ler SQL.

**Nada foi aplicado ao banco nem copiado para `supabase/migrations/`.** Para
aplicar, mover o `.sql` para `supabase/migrations/` e rodar `npx supabase db push`.
