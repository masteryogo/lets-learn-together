-- 0011 — autoria do card não muda depois da criação.
--
-- O quadro continua colaborativo: qualquer conta autenticada pode editar
-- o conteúdo. Mas autor_id é a fronteira da policy de exclusão. Se pudesse
-- mudar junto com o resto, qualquer pessoa assumiria um card alheio e então
-- o apagaria como se fosse seu.
--
-- RLS escolhe quais linhas podem ser editadas; privilégio por coluna impede
-- que uma atualização permitida altere justamente esse campo de segurança.

revoke update on public.kanban_card from authenticated;

grant update (
  titulo,
  raia,
  coluna,
  resumo,
  porque,
  blocos,
  veja_tambem,
  ordem,
  atualizado_em
) on public.kanban_card to authenticated;
