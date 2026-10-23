update public.atividade
set enunciado = case id
  when 'py-saida-precedencia' then 'Qual valor este código mostra?'
  when 'py-erro-igualdade' then 'O que está errado nesta condição?'
end
where id in ('py-saida-precedencia', 'py-erro-igualdade');

update public.atividade
set configuracao = jsonb_set(
  configuracao,
  '{codigo}',
  to_jsonb(replace(configuracao->>'codigo', chr(92) || 'n', chr(10)))
)
where id in (
  'py-saida-precedencia',
  'py-completar-maioridade',
  'py-erro-igualdade'
);
