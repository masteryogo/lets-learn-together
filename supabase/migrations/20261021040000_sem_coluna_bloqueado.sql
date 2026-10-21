-- 0010 — a coluna "Bloqueado por BaaS" deixa de existir.
--
-- Ela nomeava um impedimento, não um status: tudo que parava ali
-- esperava a mesma coisa, e quando o Supabase chegou a coluna
-- esvaziou. Status serve para qualquer card; "bloqueado por BaaS"
-- só servia para aquele mês.
--
-- Nada a migrar: a coluna já está vazia. Isto é o CHECK deixando de
-- aceitar um valor que ninguém mais escreve — e é por isso que vale
-- a migration, em vez de só sumir com a coluna na tela: enquanto o
-- banco aceitar, alguém pode gravar um card invisível.

update public.kanban_card set coluna = 'fazer' where coluna = 'bloqueado';

alter table public.kanban_card drop constraint kanban_card_coluna_check;

alter table public.kanban_card add constraint kanban_card_coluna_check
  check (coluna in ('fazer', 'analise', 'descartado', 'concluido'));
