/* Etapa 1 — Python */

export default [{
  id: "python",
  numero: 1,
  titulo: "Python",
  objetivo: "Dominar o subconjunto de Python usado em pipelines de ML.",
  descricao:
    "Você não precisa de Python inteiro. Precisa do pedaço que aparece em pipeline de ML: " +
    "manipular estruturas de dados, escrever funções e classes legíveis, ler um traceback sem " +
    "pânico e montar um ambiente que outra pessoa consiga reproduzir. Quase todo bug difícil de " +
    "ML que parece matemático é, na verdade, um erro de Python — um shape errado, uma lista " +
    "copiada por referência, um caminho relativo que mudou. Esta etapa é o que te permite " +
    "distinguir os dois casos.",
  preRequisitos: "Nenhum",
  duracao: null,
  grupos: [
    {
      id: "g-python",
      titulo: null,
      topicos: [
        {
          id: "py-01",
          titulo: "Começar",
          prioridade: "fundamental",
          desc: "Instalar Python, escolher editor, executar um script.",
          detalhe:
            "Instale uma versão recente pelo site oficial ou por um gerenciador (pyenv, uv). " +
            "Evite o Python que já veio com o sistema operacional: ele pertence ao SO e " +
            "atualizá-lo pode quebrar outras coisas. Confirme com `python --version` e rode um " +
            "arquivo `.py` pelo terminal, não só pelo botão do editor — saber invocar o " +
            "interpretador na mão é o que te salva quando o editor não ajuda.",
        },
        {
          id: "py-02",
          titulo: "Ambientes",
          prioridade: "fundamental",
          desc: "venv/conda, gerenciadores de pacotes, layout de projeto, regras de importação.",
          detalhe:
            "Um ambiente virtual é um diretório com seu próprio Python e suas próprias " +
            "bibliotecas. Sem ele, dois projetos que pedem versões diferentes de torch entram " +
            "em conflito e você perde horas. Crie um por projeto, ative antes de instalar " +
            "qualquer coisa e congele as versões (`pip freeze > requirements.txt`). " +
            "Sobre imports: Python resolve módulos a partir do diretório de onde você " +
            "executou o script, não de onde o arquivo está — é a origem da maioria dos " +
            "`ModuleNotFoundError` em projeto com subpastas.",
        },
        {
          id: "py-03",
          titulo: "Variáveis e objetos",
          prioridade: "fundamental",
          desc: "Números, booleanos, None, comparações.",
          detalhe:
            "Em Python toda variável é um nome apontando para um objeto, nunca uma caixa com " +
            "um valor dentro. Isso explica comportamentos que surpreendem: atribuir `b = a` " +
            "não copia nada, só cria um segundo nome para o mesmo objeto. " +
            "`None` é o objeto que representa ausência — compare com `is None`, não com `==`. " +
            "Cuidado com float: `0.1 + 0.2 != 0.3`, e isso vai reaparecer quando você comparar " +
            "losses.",
        },
        {
          id: "py-04",
          titulo: "Strings",
          prioridade: "fundamental",
          desc: "Literais, fatiamento, imutabilidade, métodos, f-strings.",
          detalhe:
            "Strings são imutáveis: todo método que parece alterar (`.upper()`, `.replace()`) " +
            "devolve uma nova. Concatenar dentro de um laço cria uma string nova a cada volta " +
            "e fica lento; use `''.join(lista)`. " +
            "As f-strings (`f\"loss={loss:.4f}\"`) são a forma moderna de formatar e o `:.4f` " +
            "controla casas decimais — você vai usar isso em todo log de treinamento.",
        },
        {
          id: "py-05",
          titulo: "Listas",
          prioridade: "fundamental",
          desc: "Criação, mutação, aninhamento, armadilhas de cópia.",
          detalhe:
            "Lista é mutável e ordenada, e é por isso que as armadilhas de cópia existem. " +
            "`b = a` compartilha a mesma lista; `b = a[:]` ou `list(a)` copia o nível de cima, " +
            "mas as listas internas continuam compartilhadas (cópia rasa) — para listas " +
            "aninhadas use `copy.deepcopy`. " +
            "Outra armadilha clássica: `[[0]*3]*3` cria três referências para a MESMA linha, " +
            "então alterar uma altera as três.",
        },
        {
          id: "py-06",
          titulo: "Tuplas e conjuntos",
          prioridade: "importante",
          desc: "Uso básico, imutabilidade, operações de conjunto.",
          detalhe:
            "Tupla é a lista imutável: use quando a coleção não deve mudar, como o shape de um " +
            "tensor ou o retorno de uma função com vários valores. Por ser imutável, pode ser " +
            "chave de dicionário. " +
            "Set não tem ordem nem repetição e testa pertencimento em tempo constante — " +
            "verificar se um id já foi visto num set é instantâneo, numa lista é linear. " +
            "Use sets para achar diferença entre conjuntos de ids de treino e teste; é a forma " +
            "mais rápida de detectar vazamento.",
        },
        {
          id: "py-07",
          titulo: "Dicionários",
          prioridade: "fundamental",
          desc: "Criação, acesso seguro, iteração, dicionários aninhados, comprehensions.",
          detalhe:
            "Dicionário é a estrutura mais usada em ML: configuração de experimento, " +
            "`state_dict` de modelo, mapeamento de rótulo para índice, histórico de métricas. " +
            "Prefira `.get(chave, padrão)` a indexar direto quando a chave pode faltar, e " +
            "`.items()` para iterar chave e valor juntos. " +
            "Desde o Python 3.7 a ordem de inserção é preservada, o que importa quando você " +
            "serializa um dicionário de hiperparâmetros e espera o mesmo arquivo nas duas vezes.",
        },
        {
          id: "py-08",
          titulo: "Fluxo de controle",
          prioridade: "fundamental",
          desc: "if/elif/else, for, while, enumerate, zip.",
          detalhe:
            "O `for` de Python percorre elementos, não índices. Quando precisar do índice, use " +
            "`enumerate(lista)`; quando precisar percorrer duas sequências em paralelo, `zip(a, b)` " +
            "— e lembre que `zip` para na mais curta, silenciosamente, o que já escondeu muito " +
            "bug de dataset desalinhado. " +
            "Em ML, a regra prática é a oposta da intuição: laço explícito sobre números é " +
            "sinal de que você deveria estar usando NumPy ou PyTorch vetorizado.",
        },
        {
          id: "py-09",
          titulo: "Comprehensions e iteradores",
          prioridade: "importante",
          desc: "list/set/dict comprehensions, expressões geradoras, iter, next.",
          detalhe:
            "Comprehension é a forma idiomática de transformar uma coleção: " +
            "`[f(x) for x in dados if cond(x)]`. Mais legível e mais rápida que o laço " +
            "equivalente com `.append()`. " +
            "Troque os colchetes por parênteses e você tem um gerador: ele produz um item por " +
            "vez em vez de materializar tudo na memória — é exatamente isso que um `DataLoader` " +
            "faz com um dataset que não cabe na RAM. Entender `iter`/`next` é entender por que " +
            "um gerador se esgota e não pode ser percorrido duas vezes.",
        },
        {
          id: "py-10",
          titulo: "Funções",
          prioridade: "fundamental",
          desc: "Definição, *args, **kwargs, escopo, expressões lambda.",
          detalhe:
            "`*args` coleta posicionais extras numa tupla e `**kwargs` coleta nomeados num " +
            "dicionário; é assim que bibliotecas repassam configuração sem enumerar cada " +
            "parâmetro. " +
            "A armadilha a decorar: nunca use valor mutável como padrão (`def f(x=[])`) — o " +
            "objeto é criado uma única vez, na definição, e é compartilhado entre todas as " +
            "chamadas. Use `None` como padrão e crie dentro da função.",
        },
        {
          id: "py-11",
          titulo: "Anotações de tipo",
          prioridade: "importante",
          desc: "Leitura e escrita de anotações typing.",
          detalhe:
            "Anotações não são verificadas em tempo de execução — Python as ignora. Servem " +
            "para quem lê o código e para ferramentas (mypy, autocomplete do editor). " +
            "Em ML o valor prático é documentar o que entra e o que sai de cada função: " +
            "`def treinar(modelo: nn.Module, dl: DataLoader) -> dict[str, float]` já conta " +
            "metade da história. Saber ler `Optional[X]`, `list[X]` e `Callable` é suficiente " +
            "para navegar na documentação de qualquer biblioteca.",
        },
        {
          id: "py-12",
          titulo: "Classes",
          prioridade: "fundamental",
          desc: "Definição, herança, métodos dunder, @dataclass, decoradores.",
          detalhe:
            "Você vai escrever classes em ML principalmente por herança de framework: todo " +
            "modelo em PyTorch é uma subclasse de `nn.Module` e todo dataset customizado " +
            "implementa `__len__` e `__getitem__`. Esses métodos com underscore duplo " +
            "(\"dunder\") são o contrato que faz seu objeto funcionar com `len()` e com `obj[i]`. " +
            "`@dataclass` elimina o `__init__` repetitivo e é ideal para objetos de " +
            "configuração.",
        },
        {
          id: "py-13",
          titulo: "Erros e exceções",
          prioridade: "importante",
          desc: "try/except, leitura de tracebacks, exceções customizadas, gerenciadores de contexto.",
          detalhe:
            "Leia o traceback de baixo para cima: a última linha diz o tipo do erro e a " +
            "penúltima seção diz onde no SEU código ele nasceu — o topo costuma ser " +
            "código de biblioteca. " +
            "Nunca escreva `except:` vazio ou `except Exception: pass`; isso engole inclusive " +
            "o seu Ctrl+C e transforma uma falha ruidosa numa falha silenciosa, que é a pior " +
            "espécie num treinamento de 6 horas. " +
            "Gerenciadores de contexto (`with`) garantem limpeza mesmo com erro — é o mesmo " +
            "mecanismo por trás de `with torch.no_grad():`.",
        },
        {
          id: "py-14",
          titulo: "I/O de arquivos",
          prioridade: "fundamental",
          desc: "Leitura/escrita de texto, binário, pathlib, JSON, CSV.",
          detalhe:
            "Use `pathlib.Path` em vez de concatenar strings com barras: funciona igual em " +
            "Windows e Linux e tem `.exists()`, `.mkdir(parents=True)` e `.glob()` embutidos. " +
            "Sempre abra texto com `encoding='utf-8'` explícito — o padrão varia por sistema e " +
            "é o motivo de um CSV com acentos abrir certo na sua máquina e corrompido na do " +
            "colega. " +
            "JSON serve para configuração e métricas; para dataset tabular grande, prefira " +
            "parquet a CSV.",
        },
        {
          id: "py-15",
          titulo: "Biblioteca padrão e ecossistema",
          prioridade: "importante",
          desc: "Imports, scripts como módulos, visão geral de numpy, pandas, scikit-learn e torch.",
          detalhe:
            "Saiba a divisão de trabalho antes de escolher a ferramenta: NumPy é array " +
            "numérico na CPU; pandas é tabela com rótulos, para explorar e limpar dados; " +
            "scikit-learn é o conjunto de modelos clássicos e, mais importante, o padrão de API " +
            "`fit`/`predict`/`transform`; PyTorch é tensor com autograd e GPU. " +
            "Da biblioteca padrão, conheça `pathlib`, `json`, `csv`, `random`, `logging`, " +
            "`argparse` e `dataclasses` — cobrem quase tudo de infraestrutura de um script de " +
            "treino.",
        },
        {
          id: "py-16",
          titulo: "Padrões Python para ML",
          prioridade: "opcional",
          desc: "Decoradores para logging, acesso dinâmico a atributos, idiomatismo comum, hábitos de depuração.",
          detalhe:
            "Um decorador é uma função que embrulha outra; em ML aparece como `@torch.no_grad()`, " +
            "`@staticmethod` e em cronômetros de execução que você mesmo escreve. " +
            "Para depurar, troque `print` por `breakpoint()`: abre um debugger no ponto exato e " +
            "deixa você inspecionar shapes ao vivo. " +
            "Use o módulo `logging` em vez de `print` em scripts de treino longos — ele carimba " +
            "horário, tem níveis e grava em arquivo sem você reescrever nada.",
        },
      ],
    },
  ],
}
];
