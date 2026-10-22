/* ============================================================
   Quadro de trabalho — dados

   Espelha o .kanban (rascunho local). Card sem `porque` não entra:
   o valor do quadro é o motivo, não a lista.
   ============================================================ */

/* Quatro colunas. Havia uma quinta, "Bloqueado por BaaS", que saiu em
   21/10/2026: ela nomeava um impedimento e não um status — tudo que
   parava ali esperava a mesma coisa, e quando o Supabase chegou ela
   esvaziou. Status serve para qualquer card; aquele nome só servia
   para aquele mês. */
export const KANBAN_COLUNAS = [
  { id: "fazer",     rotulo: "A fazer" },
  { id: "analise",   rotulo: "Em análise" },
  { id: "descartado", rotulo: "Descartado" },
  { id: "concluido",  rotulo: "Concluído",
    nota: "O que saiu do papel. Fica no quadro porque a decisão continua valendo depois de pronta: é aqui que se confere o que foi prometido contra o que de fato existe." }
];

export const KANBAN_RAIAS = [
  { id: "arquitetura", rotulo: "Arquitetura" },
  { id: "interface",   rotulo: "Interface" },
  { id: "conteudo",    rotulo: "Conteúdo e configuração" }
];

/* Os cards moravam aqui, escritos à mão, e foram para a tabela
   kanban_card em 21/10/2026 — ver a migration 0009, que os levou
   palavra por palavra. Saíram porque o quadro passou a aceitar
   sugestão de quem usa o site: dado que muda sem deploy não pode
   depender de deploy para mudar.

   O que ficou aqui é estrutura, não conteúdo: as colunas e as raias
   mudam junto com a tela que as desenha. Os números de referência
   também saíram, em 21/10/2026: eram contados à mão e carregavam a
   data da contagem, enquanto o gatilho de `trilha` já os recalcula a
   cada escrita. Número com data de medição é número que vai divergir
   — o próprio quadro contava 15/157 para o ml enquanto o manifesto
   dizia 5/156. */
