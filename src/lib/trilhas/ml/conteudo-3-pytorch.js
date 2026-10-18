/* Etapa 3 — PyTorch */

export default [{
  id: "pytorch",
  numero: 3,
  titulo: "PyTorch",
  objetivo: "Tornar-se fluente com tensores, autograd e utilitários básicos.",
  descricao:
    "Esta etapa é deliberadamente curta: o objetivo é fluência com tensores, não com redes. " +
    "Você ainda não vai treinar nada. A ideia é que, quando chegar na Etapa 4, nenhum erro " +
    "seja sobre a ferramenta — se o treino falhar, que seja por um motivo conceitual, não " +
    "porque um tensor estava no device errado ou com o shape transposto. " +
    "Se você já sabe NumPy, 80% disto é tradução direta; o que é genuinamente novo é autograd " +
    "e o conceito de device.",
  preRequisitos: "Etapa 2",
  duracao: null,
  grupos: [
    {
      id: "g-pytorch",
      titulo: null,
      topicos: [
        {
          id: "pt-01",
          titulo: "Tensores básicos",
          prioridade: "fundamental",
          desc: "Criação, dtype, forma, armazenamento vs visualização, reshape, indexação, concatenação, primeira introdução ao autograd.",
          detalhe:
            "Tensor é um array de N dimensões que, diferente do NumPy, sabe rodar na GPU e " +
            "rastrear suas próprias derivadas. " +
            "A distinção que mais causa bug é view versus cópia: `.view()` e `.reshape()` " +
            "costumam devolver uma vista que COMPARTILHA memória com o original, então " +
            "alterar uma altera a outra. Use `.clone()` quando quiser independência de fato. " +
            "Sobre dtype: a maior parte do treino roda em float32, rótulos de classificação " +
            "precisam ser `long`, e misturar tipos gera erro ou conversão silenciosa. " +
            "Quando um tensor tem `requires_grad=True`, o PyTorch passa a gravar todas as " +
            "operações sobre ele num grafo para poder derivar depois.",
        },
        {
          id: "pt-02",
          titulo: "Operações em tensores",
          prioridade: "fundamental",
          desc: "Aritmética elemento a elemento, broadcasting, multiplicação matricial, reduções, comparações, seleções.",
          detalhe:
            "Vale decorar a diferença entre `*` (elemento a elemento) e `@` / `torch.matmul` " +
            "(produto matricial) — e que broadcasting se aplica ao primeiro. " +
            "Nas reduções (`.sum()`, `.mean()`, `.max()`), o argumento `dim` é o eixo que " +
            "DESAPARECE; `keepdim=True` mantém a dimensão com tamanho 1 para o broadcasting " +
            "seguinte funcionar. Em classificação você usa `.argmax(dim=1)` para converter " +
            "logits em classe prevista. " +
            "Hábito que economiza horas: imprima `.shape` depois de cada operação enquanto " +
            "monta o modelo, em vez de descobrir o desalinhamento três camadas depois.",
        },
        {
          id: "pt-03",
          titulo: "Interoperabilidade e utilitários",
          prioridade: "importante",
          desc: "Conversão com NumPy, reprodutibilidade (torch.manual_seed), dispositivos CPU/GPU, serialização (torch.save e torch.load), helpers diversos.",
          detalhe:
            "`torch.from_numpy()` e `.numpy()` compartilham memória quando o tensor está na " +
            "CPU — alterar um altera o outro. Para ir de GPU para NumPy é preciso " +
            "`.detach().cpu().numpy()`: detach solta o grafo de gradientes e cpu move a memória. " +
            "Todo tensor de uma mesma operação precisa estar no mesmo device, e esse é o erro " +
            "número um de quem começa a usar GPU. " +
            "Salve `state_dict()` em vez do objeto inteiro do modelo: o pickle do objeto " +
            "quebra quando a classe muda de nome ou de arquivo. " +
            "Semente fixa reduz a variação, mas não elimina: cuDNN tem kernels " +
            "não-determinísticos, e é normal duas execuções com a mesma seed diferirem um " +
            "pouco.",
        },
      ],
    },
  ],
}
];
