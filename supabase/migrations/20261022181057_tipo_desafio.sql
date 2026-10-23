-- Um valor de enum precisa ser confirmado antes de ser usado por outra migration.
alter type public.tipo_atividade add value if not exists 'desafio';
