/* ============================================================
   Trilha de Rust — fonte legível do conteúdo que vira a migration.

   O banco guarda `conteudo` como um documento jsonb só. Escrever
   JSON na mão num arquivo .sql é onde erro de vírgula e aspa
   aparecem, então o conteúdo mora aqui, em JavaScript, e o
   `gerar-sql.mjs` o serializa.

   Público: quem já programa em outra linguagem. Por isso não há
   etapa de sintaxe básica: `if`, laço e função entram de passagem,
   e o espaço é gasto no que não tem equivalente em Python, Java ou
   Go — ownership, borrow checker, enums com dado, traits e o
   modelo de concorrência que o compilador verifica.
   ============================================================ */

const ROADMAP = {
  id: "rust",
  titulo: "Rust",
  subtitulo: "Quatro etapas, para quem já programa em outra linguagem",
  fonte: {
    rotulo: "The Rust Programming Language (o livro oficial) e o Rust Book experimental",
    url: "https://doc.rust-lang.org/book/",
    consultadoEm: "2026-10-21",
  },
  etapas: [
    /* ---------------------------------------------------------- */
    {
      id: "rs-1-base",
      numero: 1,
      titulo: "Do que você já sabe até o borrow checker",
      objetivo:
        "Escrever e rodar programas Rust e entender por que o compilador recusa código que em outra linguagem passaria.",
      descricao:
        "Você já sabe programar, então sintaxe não é o problema: laço, condicional e função você lê de primeira. " +
        "O que trava quem vem de fora é que Rust tem um conceito que as outras linguagens não têm — a cada valor " +
        "pertence a um dono, e o compilador acompanha esse dono por todo o programa. É daí que vem a liberação de " +
        "memória sem coletor de lixo e a ausência de ponteiro pendurado. " +
        "A etapa inteira existe para você parar de ler erro do borrow checker como obstáculo e começar a lê-lo como " +
        "o que é: a descrição de um bug que a sua linguagem anterior deixaria acontecer em produção. " +
        "Quem pula daqui sofre em todas as outras etapas, porque ownership não é um assunto — é a gramática do resto.",
      preRequisitos: "Programar em qualquer linguagem; terminal e Git",
      duracao: "2–3 semanas",
      criterios: [
        "Você explica, sem metáfora, o que acontece com o valor quando ele é movido.",
        "Você escolhe entre `&T`, `&mut T` e valor por posse justificando a escolha.",
        "Você lê um erro do compilador e sabe se a correção é emprestar, clonar ou mudar o desenho.",
      ],
      grupos: [
        {
          id: "rs-g-1a",
          titulo: "Ferramenta e o básico que muda de nome",
          topicos: [
            {
              id: "rs-01",
              titulo: "rustup, cargo e o primeiro binário",
              prioridade: "fundamental",
              desc: "Instalar pelo rustup, criar projeto com cargo, build, run, check.",
              detalhe:
                "Instale pelo `rustup`, nunca pelo gerenciador de pacotes do sistema: Rust tem três canais (stable, beta, nightly) e você vai precisar trocar entre eles sem reinstalar nada. `cargo new` já cria repositório Git, `Cargo.toml` e `src/main.rs`. O comando que você mais vai usar não é `cargo build` e sim `cargo check` — ele roda todo o type checking e o borrow checker sem gerar código de máquina, e é ordens de grandeza mais rápido. No começo você compila muito e executa pouco.",
            },
            {
              id: "rs-02",
              titulo: "Variáveis, imutabilidade e shadowing",
              prioridade: "fundamental",
              desc: "`let`, `let mut`, `const`, redeclaração com o mesmo nome.",
              detalhe:
                "O padrão é imutável, e isso não é estilo: imutabilidade é a metade do contrato que permite ao compilador provar que ninguém altera um valor enquanto outro o lê. `mut` é um pedido explícito. O shadowing (`let x = x.trim()`) parece reatribuição mas é variável nova — serve para transformar sem precisar inventar `x2`, e permite trocar o tipo no caminho, o que `mut` não permite.",
            },
            {
              id: "rs-03",
              titulo: "Tipos escalares, tuplas e arrays",
              prioridade: "fundamental",
              desc: "Inteiros com tamanho no nome, `f64`, `bool`, `char`, `usize`.",
              detalhe:
                "`i32`, `u8`, `usize` — o tamanho está no nome porque Rust não promove nem converte inteiro sozinho; toda conversão é um `as` ou um `try_into()` escrito por você. Isso incomoda no primeiro dia e evita a classe de bug mais silenciosa que existe em C. `usize` é o tipo de índice e de tamanho, e é por isso que ele aparece em todo lugar. Overflow em debug entra em pânico, em release dá wrapping: saber disso evita um bug que só existe em produção.",
            },
            {
              id: "rs-04",
              titulo: "Funções, expressões e o `;` que muda tudo",
              prioridade: "fundamental",
              desc: "Retorno implícito, blocos como expressão, `if` que devolve valor.",
              detalhe:
                "Quase tudo em Rust é expressão: um bloco vale a última expressão dele, e `if` e `match` devolvem valor. Daí a pegadinha que todo iniciante leva: pôr `;` na última linha transforma a expressão em statement e a função passa a devolver `()`, com uma mensagem de erro que fala de tipos quando o problema é pontuação.",
            },
            {
              id: "rs-05",
              titulo: "Controle de fluxo e `loop` com valor",
              prioridade: "importante",
              desc: "`if`, `while`, `for ... in`, `loop`, `break` com valor, rótulos.",
              detalhe:
                "Nada aqui é novidade para você, com duas exceções que valem os cinco minutos: `loop` é um laço infinito explícito cujo `break x` devolve valor — é o idioma para retentativa —, e `for` sempre itera sobre um iterador, nunca sobre índice. Escrever `for i in 0..v.len()` e indexar é a marca de quem ainda está traduzindo da outra linguagem.",
            },
          ],
        },
        {
          id: "rs-g-1b",
          titulo: "Ownership — o assunto da etapa",
          topicos: [
            {
              id: "rs-06",
              titulo: "Posse e movimento",
              prioridade: "fundamental",
              desc: "Dono único, move na atribuição e na chamada, `Drop` no fim do escopo.",
              detalhe:
                "Três regras: todo valor tem um dono, há um dono por vez, e quando o dono sai de escopo o valor é liberado. Atribuir ou passar para uma função move a posse — a variável antiga deixa de ser usável, e o compilador reclama de \"value borrowed after move\". Isso é o `free` acontecendo em um lugar determinado e único, sem coletor de lixo e sem double free. Tipos `Copy` (os escalares) são a exceção que copia em vez de mover.",
            },
            {
              id: "rs-07",
              titulo: "Pilha, heap e por que `String` não é `&str`",
              prioridade: "fundamental",
              desc: "`String` dona e crescível, `&str` emprestado; o mesmo par em `Vec<T>`/`&[T]`.",
              detalhe:
                "Esse par se repete em toda a biblioteca padrão: um tipo dono, com dado no heap, e uma fatia emprestada que aponta para ele. Regra prática que resolve 90% dos casos: receba `&str` no parâmetro, devolva `String`. Receber `String` obriga quem chama a abrir mão do valor dele sem necessidade.",
            },
            {
              id: "rs-08",
              titulo: "Empréstimo e referências",
              prioridade: "fundamental",
              desc: "`&T` à vontade ou um `&mut T` — nunca os dois ao mesmo tempo.",
              detalhe:
                "A regra do aliasing: ou muitos leitores, ou um escritor. Ela existe para impedir que alguém altere o que outro está lendo — a mesma garantia que, na etapa 3, torna a concorrência verificável em tempo de compilação. Vale registrar que isso também evita invalidação de iterador: o `for` que remove item da própria lista, erro de runtime em Python e Java, aqui nem compila.",
            },
            {
              id: "rs-09",
              titulo: "Fatias",
              prioridade: "fundamental",
              desc: "`&v[1..4]`, fatias de string e o cuidado com UTF-8.",
              detalhe:
                "Fatia é uma vista emprestada de uma parte contígua: ponteiro mais comprimento, sem cópia. E o detalhe que surpreende: `String` é UTF-8, então indexar por byte no meio de um caractere entra em pânico. Para percorrer texto use `.chars()` ou `.bytes()`, decidindo qual — a dúvida em si já é o aprendizado, porque nas outras linguagens ela estava escondida.",
            },
            {
              id: "rs-10",
              titulo: "Tempos de vida, a primeira passada",
              prioridade: "importante",
              desc: "`'a` nas assinaturas, elisão, por que uma struct com referência precisa deles.",
              detalhe:
                "Lifetime não prolonga a vida de nada: é anotação que relaciona a validade da saída com a das entradas. Na maior parte do código a elisão escreve isso por você; os `'a` aparecem quando você devolve uma referência derivada de mais de uma entrada, ou guarda referência dentro de uma struct. Primeira passada mesmo — se a struct com lifetime estiver doendo, guarde `String` em vez de `&str` e siga; a etapa 3 volta ao assunto.",
            },
            {
              id: "rs-11",
              titulo: "Ler o erro do compilador",
              prioridade: "fundamental",
              desc: "`cargo check`, códigos `E0502`, `cargo clippy`, `rustfmt`.",
              detalhe:
                "O compilador de Rust foi escrito para ensinar: ele aponta a linha do empréstimo, a do conflito e geralmente sugere a correção. `rustc --explain E0502` abre a explicação longa do erro. Instale `clippy` agora, não depois — ele pega os idiomas traduzidos da sua linguagem anterior (indexar em vez de iterar, `clone()` defensivo) enquanto o hábito ainda não pegou.",
            },
          ],
        },
      ],
    },

    /* ---------------------------------------------------------- */
    {
      id: "rs-2-tipos",
      numero: 2,
      titulo: "Tipos, erros e as coleções",
      objetivo:
        "Modelar um domínio com structs, enums e traits, e tratar erro sem exceção e sem `null`.",
      descricao:
        "Aqui a linguagem deixa de ser um obstáculo e passa a ser ferramenta. Duas ausências definem esta etapa: " +
        "não existe `null` e não existe exceção. No lugar há dois enums comuns — `Option` e `Result` — e a obrigação " +
        "de tratá-los, porque o compilador não deixa seguir com o caso não coberto. " +
        "O ganho é que o erro vira parte da assinatura: ler uma função já conta o que pode dar errado, " +
        "o que em linguagem com exceção só se descobre lendo a implementação inteira, ou em produção. " +
        "A outra metade é o sistema de traits, que é polimorfismo sem herança — e é o jeito de Rust que mais confunde " +
        "quem vem de linguagem orientada a objetos.",
      preRequisitos: "Etapa 1",
      duracao: "2–3 semanas",
      criterios: [
        "Você desenha um enum em que estado impossível não é representável.",
        "Você escolhe entre `?`, `unwrap_or`, `expect` e propagar, sabendo o custo de cada um.",
        "Você escreve um trait e o implementa para um tipo que não é seu.",
      ],
      grupos: [
        {
          id: "rs-g-2a",
          titulo: "Modelar com o sistema de tipos",
          topicos: [
            {
              id: "rs-12",
              titulo: "Structs e blocos `impl`",
              prioridade: "fundamental",
              desc: "Struct nomeada, tupla, unitária; métodos, associadas, `self`/`&self`/`&mut self`.",
              detalhe:
                "Dado e comportamento ficam separados: a struct declara os campos e o `impl` traz os métodos. O receptor é uma escolha de design que a etapa 1 preparou — `&self` lê, `&mut self` altera, `self` consome (é o que permite API em cadeia, estilo builder). `Self::nova()` é a convenção de construtor; Rust não tem construtor especial de linguagem.",
            },
            {
              id: "rs-13",
              titulo: "Enums com dado",
              prioridade: "fundamental",
              desc: "Variantes que carregam campos; estado impossível que não compila.",
              detalhe:
                "Esta é a ferramenta de modelagem mais forte da linguagem e a que não tem equivalente direto em Java ou Python: cada variante carrega seus próprios dados. Em vez de uma struct com campos que só valem em certas combinações, você escreve as combinações válidas e as inválidas deixam de existir. Vale fazer o exercício com um domínio seu antes de seguir.",
            },
            {
              id: "rs-14",
              titulo: "`match` e padrões",
              prioridade: "fundamental",
              desc: "Exaustividade, desestruturação, guardas, `if let`/`let else`.",
              detalhe:
                "`match` é exaustivo: variante nova no enum quebra a compilação em todo lugar que precisa tratá-la, o que transforma refatoração em lista de tarefas gerada pelo compilador. Por isso o `_ =>` genérico é escolha séria, não atalho — ele desliga justamente esse aviso. `let ... else` é o idioma moderno de saída antecipada.",
            },
            {
              id: "rs-15",
              titulo: "Genéricos e traits",
              prioridade: "fundamental",
              desc: "`<T>`, limites `T: Display`, `impl Trait`, objetos de trait `dyn`.",
              detalhe:
                "Trait é comportamento compartilhado sem herança; herança de implementação não existe em Rust, e a composição ocupa o lugar dela. O limite (`T: Ord`) é um contrato verificado na definição da função genérica, não no uso — o erro aparece para quem escreveu a função, não para quem a chamou. Genérico despacha estático (monomorfização, rápido, binário maior); `dyn Trait` despacha dinâmico, e você o usa quando precisa de tipos diferentes na mesma coleção.",
            },
            {
              id: "rs-16",
              titulo: "Traits derivados e os da std",
              prioridade: "importante",
              desc: "`#[derive(Debug, Clone, PartialEq)]`, `Default`, `From`/`Into`, `Display`.",
              detalhe:
                "`#[derive(Debug)]` em tudo, desde o primeiro dia: sem ele o `{:?}` não funciona e depurar vira adivinhação. Implementar `From` é o que faz o `?` converter o erro de baixo no seu tipo de erro automaticamente — é a peça que liga esta seção à próxima. `Display` é a mensagem para pessoas; `Debug`, a para quem programa.",
            },
          ],
        },
        {
          id: "rs-g-2b",
          titulo: "Erro, coleção e iterador",
          topicos: [
            {
              id: "rs-17",
              titulo: "`Option` em vez de null",
              prioridade: "fundamental",
              desc: "`Some`/`None`, `map`, `and_then`, `unwrap_or_default`, `ok_or`.",
              detalhe:
                "Ausência vira tipo, e o compilador cobra o caso vazio. Isso elimina, de classe, o erro de referência nula. O conjunto de combinadores evita a escada de `match`: `map` transforma o que existe, `and_then` encadeia outra operação que também pode falhar, `ok_or` converte ausência em erro — que é a ponte para o `Result`.",
            },
            {
              id: "rs-18",
              titulo: "`Result` e o operador `?`",
              prioridade: "fundamental",
              desc: "`Ok`/`Err`, propagação com `?`, `main` que devolve `Result`.",
              detalhe:
                "Erro é valor de retorno, não desvio de fluxo invisível. O `?` propaga a falha para quem chamou, convertendo o tipo via `From` — é o que mantém o caminho feliz legível sem esconder a existência do erro, como um `try/catch` abrangente faz. `#[must_use]` no `Result` garante que ignorar um erro silenciosamente é aviso do compilador, não descuido impune.",
            },
            {
              id: "rs-19",
              titulo: "Pânico, e quando ele é a resposta certa",
              prioridade: "importante",
              desc: "`panic!`, `unwrap`, `expect`, `unreachable!`, pânico que atravessa a thread.",
              detalhe:
                "Pânico é para bug — invariante quebrada, caso impossível —, não para entrada inválida do usuário, que é `Result`. `unwrap()` em produção é dívida; quando for inevitável, use `expect(\"a razão pela qual isto não pode falhar\")`, porque a mensagem vira a explicação do incidente às três da manhã. Em teste e protótipo, `unwrap` à vontade.",
            },
            {
              id: "rs-20",
              titulo: "Erro próprio: `thiserror` e `anyhow`",
              prioridade: "importante",
              desc: "Enum de erro em biblioteca, erro opaco em binário, contexto.",
              detalhe:
                "A divisão combinada pelo ecossistema: biblioteca expõe um enum de erro (com `thiserror`, que escreve `Display` e `From` por você), porque quem a usa precisa decidir caso a caso; aplicação usa `anyhow::Result`, porque o destino do erro é o log ou a tela. Inverter isso dá dor — erro opaco em biblioteca obriga quem chama a comparar strings.",
            },
            {
              id: "rs-21",
              titulo: "Coleções",
              prioridade: "fundamental",
              desc: "`Vec`, `HashMap`, `BTreeMap`, `HashSet`, `VecDeque`; a API `entry`.",
              detalhe:
                "`Vec` é o padrão, e quase sempre o certo — para poucos itens ele bate o `HashMap` até em busca, por causa do cache. `HashMap::entry()` é o idioma para \"insere ou atualiza\" e evita duas buscas. Use `BTreeMap` quando a ordem das chaves importar. Lembre que `.iter()`, `.iter_mut()` e `.into_iter()` são as três formas da etapa 1 aplicadas à iteração: emprestar, emprestar mutável, consumir.",
            },
            {
              id: "rs-22",
              titulo: "Iteradores",
              prioridade: "fundamental",
              desc: "`map`, `filter`, `fold`, `collect`, preguiça e custo zero.",
              detalhe:
                "Iterador é preguiçoso: nada acontece até um consumidor (`collect`, `sum`, `for`) puxar. A cadeia compila para o mesmo código do laço escrito à mão — é a abstração de custo zero mais visível da linguagem, então não há motivo para voltar ao índice por desempenho. `collect()` é o método que mais pede anotação de tipo, porque ele decide o que construir pelo tipo de destino; `collect::<Result<Vec<_>, _>>()` transformando uma lista de resultados em um resultado de lista é o truque que vale memorizar.",
            },
            {
              id: "rs-23",
              titulo: "Closures",
              prioridade: "importante",
              desc: "`Fn`, `FnMut`, `FnOnce`, captura por empréstimo e `move`.",
              detalhe:
                "Os três traits são, de novo, as três formas de acesso da etapa 1: ler, alterar, consumir. Não é teoria distante — é exatamente o que a mensagem de erro vai dizer quando você passar uma closure para uma thread na etapa 3, e `move` for necessário para que ela leve o que capturou.",
            },
          ],
        },
      ],
    },

    /* ---------------------------------------------------------- */
    {
      id: "rs-3-concorrencia",
      numero: 3,
      titulo: "Módulos, testes e concorrência",
      objetivo:
        "Organizar um projeto de verdade, testá-lo, e escrever código concorrente que o compilador aprova.",
      descricao:
        "A promessa que fez Rust sair do nicho é a desta etapa: concorrência sem corrida de dados, verificada em " +
        "tempo de compilação. E a parte bonita é que nenhum conceito novo aparece — `Send` e `Sync` são a regra de " +
        "aliasing da etapa 1 aplicada a threads. O compilador recusa o compartilhamento inseguro com a mesma " +
        "mensagem com que recusava o segundo `&mut`. " +
        "Antes disso vem o que todo projeto que passa de um arquivo precisa: módulos, visibilidade e testes — " +
        "que em Rust moram no mesmo arquivo do código e rodam com um comando, sem framework a escolher.",
      preRequisitos: "Etapa 2",
      duracao: "2–3 semanas",
      criterios: [
        "Você divide o código em módulos e decide o que é `pub` com argumento, não por hábito.",
        "Você explica por que `Rc` não atravessa thread e `Arc` atravessa.",
        "Você escolhe entre canal e mutex pelo formato do problema.",
      ],
      grupos: [
        {
          id: "rs-g-3a",
          titulo: "Projeto, teste e documentação",
          topicos: [
            {
              id: "rs-24",
              titulo: "Módulos, caminhos e visibilidade",
              prioridade: "fundamental",
              desc: "`mod`, `use`, `pub`, `pub(crate)`, crate binária e crate biblioteca.",
              detalhe:
                "A árvore de módulos é declarada, não deduzida da pasta: um arquivo só entra na compilação se algum `mod` o nomear — é o que confunde quem vem de Python. Privado é o padrão, e `pub(crate)` costuma ser o certo: `pub` é promessa pública, e em biblioteca, promessa que você vai ter de manter.",
            },
            {
              id: "rs-25",
              titulo: "Cargo, dependências e features",
              prioridade: "fundamental",
              desc: "`Cargo.toml`, `Cargo.lock`, semver, features, workspaces, perfis.",
              detalhe:
                "Commite o `Cargo.lock` em binário e deixe-o fora em biblioteca — é a convenção, e ela tem motivo: quem decide as versões é a aplicação no topo. Feature flags são o mecanismo de compilação condicional do ecossistema (`default-features = false` enxuga dependência pesada). E meça sempre em `--release`: a diferença entre debug e release em Rust chega a dez vezes, e número de benchmark em debug não quer dizer nada.",
            },
            {
              id: "rs-26",
              titulo: "Testes",
              prioridade: "fundamental",
              desc: "`#[test]`, `#[cfg(test)]`, `tests/` de integração, `assert_eq!`, `#[should_panic]`.",
              detalhe:
                "O teste unitário vive no mesmo arquivo, num módulo `#[cfg(test)]` que só é compilado em teste — e por isso ele enxerga o privado. O de integração fica em `tests/`, importa a crate de fora e só vê o `pub`, o que o torna o teste da sua API pública. `cargo test` roda em paralelo por padrão: teste que depende de arquivo ou variável global fixa falha de forma intermitente, e descobrir isso agora poupa uma tarde.",
            },
            {
              id: "rs-27",
              titulo: "Documentação que é testada",
              prioridade: "opcional",
              desc: "`///`, `//!`, `cargo doc`, exemplos executados por `cargo test`.",
              detalhe:
                "Exemplo em comentário de doc é compilado e executado junto com os testes. É a única forma de documentação que não apodrece em silêncio: quando a API muda, o exemplo desatualizado quebra a suíte.",
            },
          ],
        },
        {
          id: "rs-g-3b",
          titulo: "Ponteiros inteligentes e concorrência",
          topicos: [
            {
              id: "rs-28",
              titulo: "`Box`, `Rc` e `RefCell`",
              prioridade: "fundamental",
              desc: "Indireção, posse compartilhada, mutabilidade interior, ciclo com `Weak`.",
              detalhe:
                "`Box` põe o valor no heap e é o que permite tipo recursivo e `Box<dyn Trait>`. `Rc` dá vários donos por contagem de referência, para o caso em que a árvore de posse da etapa 1 não descreve o problema. `RefCell` move a regra de empréstimo para o tempo de execução — mesma regra, mesma proibição, só que a violação vira pânico em vez de erro de compilação. Um `Rc<RefCell<T>>` espalhado pelo código costuma ser sinal de que a estrutura de dados quer ser outra (um índice em `Vec`, por exemplo), e vale desconfiar antes de insistir.",
            },
            {
              id: "rs-29",
              titulo: "Threads",
              prioridade: "fundamental",
              desc: "`thread::spawn`, `join`, closure `move`, threads com escopo.",
              detalhe:
                "A closure vai para outra thread, então ela precisa levar o que usa — é o `move` da etapa 2 ficando obrigatório. `scope` é a adição moderna que permite emprestar da pilha de quem criou, porque o escopo garante que as threads terminam antes. Ignorar o `JoinHandle` descarta silenciosamente o resultado e o pânico de dentro da thread.",
            },
            {
              id: "rs-30",
              titulo: "`Send`, `Sync` e por que isto compila ou não",
              prioridade: "fundamental",
              desc: "Os dois traits automáticos, e o erro de compilação que substitui a corrida de dados.",
              detalhe:
                "`Send` é poder mudar de thread; `Sync`, poder ser referenciado de várias. Eles são deduzidos pelo compilador e é por isso que `Rc` não passa (sua contagem não é atômica) e `Arc` passa. Toda a \"concorrência sem medo\" é isto: a corrida de dados, que nas outras linguagens é um bug de produção não determinístico, aqui é uma mensagem de erro antes de rodar.",
            },
            {
              id: "rs-31",
              titulo: "Canais e estado compartilhado",
              prioridade: "fundamental",
              desc: "`mpsc`, `Arc<Mutex<T>>`, `RwLock`, deadlock e envenenamento.",
              detalhe:
                "Duas formas, e a escolha é pelo formato do problema: canal quando o dado flui por etapas (o produtor passa a posse, e o compilador garante que ele não mexe mais); `Arc<Mutex<T>>` quando o estado é um só e muitos o tocam. O guard do mutex libera ao sair de escopo, o que elimina o cadeado esquecido — mas não o deadlock de dois cadeados em ordens diferentes, que continua sendo seu. Se uma thread entra em pânico segurando o mutex, ele fica envenenado e o próximo `lock()` devolve `Err`, de propósito: o invariante pode ter ficado pela metade.",
            },
            {
              id: "rs-32",
              titulo: "Paralelismo de dados com rayon",
              prioridade: "opcional",
              desc: "`par_iter()` e a mudança de uma palavra.",
              detalhe:
                "Vale uma tarde porque mostra a tese inteira em um exemplo: trocar `iter()` por `par_iter()` paraleliza o laço, e se o corpo não for seguro para isso, não compila. Aqui os traits da seção anterior deixam de ser teoria.",
            },
          ],
        },
      ],
    },

    /* ---------------------------------------------------------- */
    {
      id: "rs-4-producao",
      numero: 4,
      titulo: "Async, ecossistema e produção",
      objetivo:
        "Levar um programa Rust a sério até o fim: assíncrono, dependências maduras, desempenho medido e publicação.",
      descricao:
        "Rust não traz runtime assíncrono na biblioteca padrão — a linguagem dá `async`/`await` e os traits, e a " +
        "execução vem de uma crate (na prática, Tokio). Isso é decisão de projeto, não omissão, e explica por que " +
        "misturar bibliotecas de runtimes diferentes dá erro estranho. " +
        "O resto da etapa é o que separa quem aprendeu a linguagem de quem entrega com ela: escolher dependência, " +
        "medir em vez de supor, saber onde `unsafe` é legítimo, e publicar. " +
        "Escolha um alvo — serviço web, ferramenta de linha de comando, WebAssembly ou embarcado — e faça um projeto " +
        "inteiro nele; a largura do ecossistema só vira conhecimento com um projeto atravessado de ponta a ponta.",
      preRequisitos: "Etapa 3",
      duracao: "3–4 semanas",
      criterios: [
        "Você explica por que uma função async não faz nada até ser aguardada.",
        "Você identifica o bloqueio de CPU que trava um executor assíncrono.",
        "Você justifica uma otimização com medida, não com intuição.",
        "Você publica um projeto com README, testes e CI.",
      ],
      grupos: [
        {
          id: "rs-g-4a",
          titulo: "Assíncrono",
          topicos: [
            {
              id: "rs-33",
              titulo: "`async`/`await` e futuros",
              prioridade: "fundamental",
              desc: "`Future` preguiçoso, máquina de estados, `.await` como ponto de suspensão.",
              detalhe:
                "Uma função `async` devolve um futuro e não executa nada até alguém aguardá-lo — ao contrário da Promise de JavaScript, que já partiu. Essa diferença é a origem da maior parte da confusão de quem vem de JS ou C#. O `.await` é o ponto em que a função pode ser suspensa, e é por isso que segurar um `MutexGuard` da std atravessando um `.await` é erro: use o mutex do runtime.",
            },
            {
              id: "rs-34",
              titulo: "Tokio",
              prioridade: "fundamental",
              desc: "`#[tokio::main]`, tasks, `spawn_blocking`, `select!`, `join!`, cancelamento.",
              detalhe:
                "O runtime é quem executa os futuros. A regra operacional que mais importa: trabalho de CPU ou I/O bloqueante dentro de uma task trava a thread do executor e derruba a latência do serviço inteiro — mande para `spawn_blocking` ou para um pool. E em Rust o cancelamento é por descarte do futuro, o que significa que `select!` pode abandonar uma operação no meio; saber disso evita a classe de bug mais sutil do async.",
            },
            {
              id: "rs-35",
              titulo: "Async na prática",
              prioridade: "importante",
              desc: "`reqwest`, `sqlx`, `serde`, `tracing`.",
              detalhe:
                "`serde` é a crate que você vai usar em todo projeto, assíncrono ou não: `#[derive(Serialize, Deserialize)]` resolve JSON inteiro. `sqlx` valida SQL contra o banco em tempo de compilação. E prefira `tracing` a `log` em código assíncrono: sem spans, as linhas de várias tasks se intercalam e o log vira ruído.",
            },
          ],
        },
        {
          id: "rs-g-4b",
          titulo: "Entregar",
          topicos: [
            {
              id: "rs-36",
              titulo: "Escolher dependência",
              prioridade: "importante",
              desc: "crates.io, docs.rs, `cargo add`, `cargo audit`, `cargo deny`.",
              detalhe:
                "Rust tem biblioteca padrão pequena de propósito, então o ecossistema não é opcional. Avalie por manutenção recente, número de dependentes e documentação em docs.rs — que é gerada para toda crate publicada, o que torna a comparação honesta. `cargo audit` cruza o seu `Cargo.lock` com o banco de vulnerabilidades e cabe no CI.",
            },
            {
              id: "rs-37",
              titulo: "Desempenho medido",
              prioridade: "importante",
              desc: "`--release`, `criterion`, perfilamento, alocação e `clone`.",
              detalhe:
                "Primeiro meça — em release, com `criterion`, que faz a estatística do ruído por você. A causa mais comum de lentidão em código de quem está começando não é algoritmo: é alocação em laço e `clone()` defensivo posto para calar o borrow checker na etapa 1. Vale também lembrar que `clone()` explícito é uma virtude: ele deixa o custo visível no código, onde outras linguagens o escondem.",
            },
            {
              id: "rs-38",
              titulo: "`unsafe` e FFI",
              prioridade: "opcional",
              desc: "O que `unsafe` libera, invariantes, `extern \"C\"`, `bindgen`.",
              detalhe:
                "`unsafe` não desliga o borrow checker: libera cinco operações (desreferenciar ponteiro cru, chamar função unsafe, e mais três) e passa para você a obrigação de manter os invariantes. O uso legítimo é FFI e estrutura de dados que o verificador não consegue provar. Mantenha os blocos minúsculos, documente o invariante em um comentário `// SAFETY:` e embrulhe tudo numa API segura. Se você está usando `unsafe` para resolver uma briga com o compilador, a resposta está em outro lugar.",
            },
            {
              id: "rs-39",
              titulo: "Publicar e automatizar",
              prioridade: "importante",
              desc: "CI com `fmt`, `clippy` e `test`; `cargo publish`; compilação cruzada.",
              detalhe:
                "Um CI mínimo — `cargo fmt --check`, `cargo clippy -- -D warnings` e `cargo test` — já cobre quase tudo, porque em Rust o compilador faz o papel que em outras linguagens cabe a uma bateria de testes. Publicar em crates.io é irreversível: versão publicada não sai (só pode ser retirada de novas resoluções), então confira o `Cargo.toml` antes.",
            },
            {
              id: "rs-40",
              titulo: "Escolher um alvo",
              prioridade: "importante",
              desc: "Serviço web (axum), CLI (clap), WebAssembly, embarcado.",
              detalhe:
                "Aqui a trilha se abre, e a escolha é sua. CLI com `clap` é o caminho mais curto até algo que você usa de verdade no dia a dia. Serviço com `axum` exercita o async da etapa inteira. WebAssembly e embarcado (`no_std`) são onde Rust não tem concorrente óbvio — e são também onde o que você aprendeu sobre alocação passa a ser requisito, não preferência.",
            },
          ],
        },
      ],
    },
  ],
};

const PROJETOS = {
  "rs-1-base": [
    "Reescrever em Rust um programa de 100–200 linhas que você já escreveu em outra linguagem, sem usar `clone()` para calar o compilador: quando der vontade, anote por que e tente emprestar.",
    "Fazer um contador de palavras que lê um arquivo e imprime as dez mais frequentes — é o exercício mínimo que encosta em `String`, `&str`, fatia e empréstimo de uma vez.",
  ],
  "rs-2-tipos": [
    "Escrever um parser de um formato de configuração simples (chave = valor, com seções), devolvendo `Result` com um enum de erro próprio que diga a linha do problema.",
    "Modelar uma máquina de estados do seu domínio como enum, de modo que a transição inválida não compile.",
  ],
  "rs-3-concorrencia": [
    "Construir uma ferramenta de linha de comando que percorre um diretório e calcula o hash de cada arquivo em paralelo, com um pool de threads e um canal reunindo os resultados.",
    "Dividir o projeto em módulos, cobrir o parser com testes unitários e a API pública com testes de integração.",
  ],
  "rs-4-producao": [
    "Projeto final — um serviço HTTP ou uma CLI de verdade: async com Tokio, persistência, erro tratado com tipo próprio, `tracing` estruturado, testes, CI com fmt/clippy/test e um README que explique as decisões.",
    "Medir uma operação quente com `criterion`, otimizar, e registrar no README o antes e o depois.",
  ],
};

const RECURSOS = [
  { etapa: "rs-1-base", titulo: "The Rust Programming Language", url: "https://doc.rust-lang.org/book/", nota: "O livro oficial; capítulos 1 a 4 são esta etapa" },
  { etapa: "rs-1-base", titulo: "Rustlings", url: "https://rustlings.rust-lang.org/", nota: "Exercícios curtos corrigidos pelo compilador" },
  { etapa: "rs-1-base", titulo: "Rust by Example", url: "https://doc.rust-lang.org/rust-by-example/", nota: "Para quem aprende lendo código" },
  { etapa: "rs-2-tipos", titulo: "The Book — capítulos 6, 8, 9, 10 e 13", url: "https://doc.rust-lang.org/book/ch06-00-enums.html", nota: "Enums, coleções, erro, genéricos e iteradores" },
  { etapa: "rs-2-tipos", titulo: "Rust API Guidelines", url: "https://rust-lang.github.io/api-guidelines/", nota: "Como uma API em Rust deve parecer" },
  { etapa: "rs-2-tipos", titulo: "std — documentação", url: "https://doc.rust-lang.org/std/", nota: "Consulta diária; os exemplos são executáveis" },
  { etapa: "rs-3-concorrencia", titulo: "The Book — capítulos 7, 11, 15 e 16", url: "https://doc.rust-lang.org/book/ch16-00-concurrency.html", nota: "Módulos, testes, ponteiros inteligentes e concorrência" },
  { etapa: "rs-3-concorrencia", titulo: "The Cargo Book", url: "https://doc.rust-lang.org/cargo/", nota: "Features, workspaces e perfis" },
  { etapa: "rs-3-concorrencia", titulo: "Rust Atomics and Locks", url: "https://marabos.nl/atomics/", nota: "Gratuito; o porquê por trás de `Send` e `Sync`" },
  { etapa: "rs-4-producao", titulo: "Asynchronous Programming in Rust", url: "https://rust-lang.github.io/async-book/", nota: "Futuros e o modelo de execução" },
  { etapa: "rs-4-producao", titulo: "Tokio — tutorial", url: "https://tokio.rs/tokio/tutorial", nota: "O runtime na prática" },
  { etapa: "rs-4-producao", titulo: "The Rustonomicon", url: "https://doc.rust-lang.org/nomicon/", nota: "Só quando `unsafe` for inevitável" },
  { etapa: "rs-4-producao", titulo: "Zero To Production In Rust", url: "https://www.zero2prod.com/", nota: "Pago; um serviço web do primeiro commit ao deploy" },
];

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

const CRITERIOS = [
  "Eu entendi o erro do compilador ou só mexi até passar?",
  "Quem é o dono deste valor, e por quanto tempo?",
  "Este `clone()` existe por desenho ou para calar o borrow checker?",
  "O que acontece aqui quando dá errado — e quem trata?",
  "Eu conseguiria explicar esta escolha de tipo para quem vem de outra linguagem?",
];

export const TRILHA = {
  id: "rust",
  rotulo: "Rust",
  cor: "#b7512a",
  /* a rota desenhada na carta: cinco pontos num quadro de 300x240,
     subindo da esquerda para a direita como nas outras trilhas */
  rota: [
    [28, 206],
    [88, 160],
    [150, 132],
    [214, 80],
    [270, 42],
  ],
  ordem: 3,
  conteudo: { ROADMAP, PROJETOS, RECURSOS, LEGENDA, ESTADOS, CRITERIOS },
};
