-- A versão atual de produção ainda não entende o tipo desafio; mantenha o
-- conteúdo fora da consulta pública até a interface correspondente chegar.
update public.atividade
set publicada = false, atualizado_em = now()
where id = 'py-desafio-maior-valor';
