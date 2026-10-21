-- 0006 — os perfis que nasceram antes do gatilho.
--
-- A 0005 criou o perfil no cadastro, mas quem se cadastrou antes dela
-- ficou sem. Não é defeito do gatilho: é o intervalo entre a conta e a
-- regra. Sem isto, "perfil existe para todo usuário" seria quase
-- verdade — e quase verdade é pior que falso, porque o código deixa de
-- tratar o nulo justamente onde ele ainda aparece.

insert into public.perfil (id, nome)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'nome',
           u.raw_user_meta_data ->> 'full_name')
from auth.users u
on conflict (id) do nothing;
