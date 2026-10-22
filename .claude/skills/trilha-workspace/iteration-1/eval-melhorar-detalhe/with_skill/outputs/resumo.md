# Trilha de CV — etapa 1 com detalhe de verdade

**Trilha:** `cv` (Computer Vision) · **Etapa 1:** Visão clássica com OpenCV
(`classica`) · 2 grupos · 12 tópicos.

A etapa não mudou de forma: continuam os mesmos 2 grupos e os mesmos 12
tópicos, na mesma ordem. O que mudou foi só o campo `detalhe` de cada um
dos doze.

## O que estava raso

Os detalhes antigos tinham entre 300 e 520 caracteres e paravam no que a
função faz: "o mediano remove sal e pimenta", "abertura remove pontinhos".
Isso é a documentação do OpenCV reescrita — vale pouco, porque está a uma
busca de distância. Os novos têm cerca de 1.370 caracteres, em dois
parágrafos, e carregam o que não se acha pronto:

- **o erro típico, nomeado**: o matiz do OpenCV vai a 179 e o vermelho fica
  partido nas duas pontas (precisa de duas faixas); `cv2.resize` recebe
  `(largura, altura)` ao contrário do `shape`; Sobel em `uint8` corta a
  metade negativa da derivada; equalizar os três canais BGR desloca o matiz;
  trocar `NORM_HAMMING` por L2 no matcher produz pares aleatórios sem erro
  nenhum; a assinatura de `findContours` mudou entre OpenCV 3 e 4.
- **o sinal de que está indo bem**: olhar o histograma antes de mexer no
  limiar; dimensionar o kernel morfológico a partir do tamanho do ruído na
  sua resolução; contar inliers depois do RANSAC antes de confiar na
  homografia; saber dizer, olhando a máscara, se o defeito é o modelo de
  fundo ou o pós-processamento.
- **a ligação entre tópicos**: o histograma explica o vale que Otsu
  pressupõe; Canny devolve pixels e quem vira entidade é o contorno;
  `absdiff` é a linha de base contra a qual MOG2 tem que provar que melhora.

Dois parágrafos por tópico, separados por linha em branco — é o que o
`Texto.svelte` quebra em `<p>` — e os nomes de função entre crases, que ele
vira `<code>`.

## O que não foi tocado, de propósito

`id`, `titulo`, `desc` e `prioridade` ficaram idênticos. O `id` é a chave de
`progresso_topico` e o texto de `desc` é a chave de `progresso_subassunto`:
mexer em qualquer um dos dois apagaria em silêncio o progresso de quem já
marcou esses itens. Também não entra `etapas`, `grupos` nem `topicos` como
coluna — o gatilho `trilha_contagem` os recalcula, e nada entrou nem saiu.

## A migration

`20261021070000_cv_etapa1_detalhe.sql` — doze `update`, um por tópico, cada
um com `jsonb_set` no caminho do seu `detalhe`. Um `update` por tópico, e não
um documento novo, para o diff dizer qual tópico mudou.

Cada declaração leva no `where` o id do tópico que espera encontrar naquele
caminho:

```sql
 where id = 'cv'
   and conteudo #>> '{ROADMAP,etapas,1,grupos,0,topicos,0,id}' = 'cv-cl-01';
```

`jsonb_set` por índice é silencioso quando o índice mudou de dono — se um dia
alguém reordenar as etapas ou os grupos, a declaração não aplica em vez de
sobrescrever o detalhe do tópico errado.

## Aplicar

```bash
npx supabase db push
```

Depois de aplicada, a conferência é abrir `/roadmap?trilha=cv`, ir à etapa 1
e abrir o detalhe de alguns tópicos: as contagens no rodapé vêm do gatilho e
devem continuar as mesmas de antes.
