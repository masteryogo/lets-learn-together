# Trilha nova: Rust

Escrevi a migration `20261021070000_trilha_rust.sql` — uma linha nova em
`public.trilha`, com a árvore inteira no `conteudo jsonb`. Nada foi aplicado
no banco.

## O que tem dentro

| | |
|---|---|
| id / rótulo | `rust` / **Rust** |
| cor | `#8a4a2d` (ferrugem — distinta do azul do ml, do verde do cv e do roxo do langchain) |
| ordem | 30 (depois das três existentes) |
| publicada | `true` |
| etapas | 4 |
| grupos | 9 |
| tópicos | 48 |
| prioridades | 29 fundamental · 14 importante · 5 opcional |
| fonte | `null` — a trilha não deriva de uma referência pública, e fonte inventada é pior que nenhuma |

As contagens acima não estão escritas na migration: o gatilho
`trilha_contagem` as recalcula na escrita. Conferi no gerador para o resumo
bater com o que o rodapé do roadmap vai mostrar.

## As quatro etapas

1. **O modelo de memória** (12 tópicos, 2 grupos) — `fundamentos`, prefixo
   `rs-`. Instalar, ler o erro do compilador, tipos escalares, e então posse,
   movimento, empréstimo, fatias, tempos de vida, structs e módulos.
2. **Tipos, erros e abstração** (13, 2) — `tipos`, prefixo `tp-`. Enums com
   dados, `match`, `Option`, `Result` e `?`, erro próprio, coleções; depois
   traits, genéricos, `dyn`, iteradores, closures, smart pointers, conversões.
3. **Programa de verdade** (11, 2) — `pratica`, prefixo `pr-`. Cargo a sério,
   fmt e clippy, testes, escolher dependência, documentar; I/O, CLI com clap,
   serde, logging, um projeto terminado, FFI e alvos alternativos.
4. **Concorrência, async e desempenho** (12, 3) — `avancado`, prefixo `av-`.
   Threads e canais, `Send`/`Sync`, `Arc<Mutex<_>>`, rayon; como async
   funciona, tokio, os erros que dão trabalho, um serviço de rede; medir antes
   de otimizar, `unsafe`, macros, ler código alheio.

Acompanham: `PROJETOS` (3 exercícios por etapa), `RECURSOS` (15 links com
nota), `CRITERIOS` (5) e `LEGENDA`/`ESTADOS` copiados das trilhas existentes —
eles são contrato da interface, não texto livre.

## As decisões que moldaram o conteúdo

- **O público é "já programa em outra linguagem"**, então sintaxe aparece só
  como o mínimo para rodar código e ler o erro do compilador. A etapa 1 inteira
  é sobre o que a linguagem anterior não tinha: posse e empréstimo.
- **Async fica na etapa 4**, separado de threads. É a segunda curva de
  aprendizado, e começá-la cedo é o caminho mais curto para desistir.
- **Os `detalhe` nomeiam o erro típico**, não reformulam o título: o `;` que
  transforma expressão em instrução, o `.clone()` como reflexo de quem briga
  com o borrow checker, o `BufWriter` ausente que faz "Rust ficar mais lento
  que Python", o `MutexGuard` que atravessa um `.await`.
- **O JSON foi gerado por script**, não digitado no SQL — aspas simples viram
  `''` numa passada só, que é a causa mais comum de migration que não aplica.
  Validei o arquivo relendo o literal e fazendo `json.loads` nele.

## Aplicar

```bash
npx supabase db push
```

Depois de aplicada, a conferência é abrir `/` e `/roadmap?trilha=rust`: as
contagens no rodapé vêm do gatilho, então elas são a prova de que a árvore
subiu inteira.
