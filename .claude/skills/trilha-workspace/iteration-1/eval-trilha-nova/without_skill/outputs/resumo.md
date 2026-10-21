# Trilha de Rust — pronta para revisão

Trilha nova para quem já programa em outra linguagem, em **4 etapas**,
**8 grupos** e **40 tópicos**. Nada foi escrito no banco nem nos
diretórios do projeto: os arquivos estão só na pasta de saída.

## As quatro etapas

| # | Etapa | Tópicos | O que ela resolve |
|---|---|---|---|
| 1 | Do que você já sabe até o borrow checker | 11 | ferramenta, o básico que muda de nome, e ownership/empréstimo/fatias/lifetimes |
| 2 | Tipos, erros e as coleções | 12 | structs, enums com dado, `match`, traits, `Option`/`Result`/`?`, coleções, iteradores, closures |
| 3 | Módulos, testes e concorrência | 9 | módulos e visibilidade, Cargo, testes, `Box`/`Rc`/`RefCell`, threads, `Send`/`Sync`, canais e mutex |
| 4 | Async, ecossistema e produção | 8 | `async`/`await`, Tokio, dependências, desempenho medido, `unsafe`/FFI, publicar, escolher um alvo |

Cada etapa traz `objetivo`, `descricao`, `preRequisitos`, `duracao`,
`criterios` próprios e os grupos de tópicos — o mesmo formato das
trilhas que estavam no código. Há ainda `PROJETOS` (2 por etapa),
`RECURSOS` (13 links oficiais, distribuídos por etapa), `LEGENDA`,
`ESTADOS` e os `CRITERIOS` globais.

## As decisões que valem discussão

- **Não há etapa de sintaxe básica.** O público já programa. Laço,
  condicional e função entram de passagem na etapa 1, e o espaço vai
  para o que não tem equivalente em Python, Java ou Go. Quem vem de
  fora não trava em sintaxe: trava no borrow checker.
- **Ownership ocupa a etapa 1 inteira, não um capítulo.** Ele é a
  gramática das outras três — `Send`/`Sync` é a regra de aliasing
  aplicada a threads, e `Fn`/`FnMut`/`FnOnce` são as mesmas três formas
  de acesso. A trilha faz esse elo explícito em cada retorno.
- **Async fica na etapa 4, e não antes.** Rust não traz runtime na
  biblioteca padrão; sem entender futuro preguiçoso e `Send`, Tokio
  vira receita de bolo.
- **`unsafe` é `opcional`.** Ele está lá porque existe, com o aviso de
  que `unsafe` usado para vencer uma briga com o compilador é sinal de
  que a resposta está em outro lugar.
- **Prioridades:** 24 `fundamental`, 13 `importante`, 3 `opcional`
  (documentação testada, rayon, `unsafe`/FFI).

## Os arquivos

Todos em
`.claude/skills/trilha-workspace/iteration-1/eval-trilha-nova/without_skill/outputs/`:

- `trilha-rust.mjs` — o conteúdo, legível e comentado (a fonte de verdade)
- `gerar-sql.mjs` — serializa o conteúdo na migration e recusa tópico sem id ou com id repetido
- `20261021070000_trilha_rust.sql` — a migration (32 KB), um `insert` em
  `public.trilha` com `on conflict (id) do update`, para reaplicar depois
  de uma correção sem apagar nada

As colunas `etapas`, `grupos` e `topicos` não vão escritas: o gatilho
`trilha_contagem` as recalcula na inserção. `cor` é `#b7512a` (o
ferrugem do Rust) e `ordem` é 3, depois das três existentes.

## Para aplicar (quando você quiser)

```bash
cp .claude/skills/trilha-workspace/iteration-1/eval-trilha-nova/without_skill/outputs/20261021070000_trilha_rust.sql \
   supabase/migrations/
npx supabase db push
```

Depois, abrir `/` e conferir a carta nova na mesa e a contagem no
rodapé de `/roadmap?trilha=rust`.
