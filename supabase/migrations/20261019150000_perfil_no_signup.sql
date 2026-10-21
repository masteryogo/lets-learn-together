-- 0005 — todo usuário nasce com perfil.
--
-- Sem isto, "modo_calendario" seria sempre "talvez exista", e a
-- condicional se espalharia por toda tela que lê preferência.

create function public.criar_perfil_do_usuario()
returns trigger
language plpgsql
security definer
-- sem search_path vazio, uma função definer pode ser levada a chamar
-- objeto plantado num schema que o invocador controla
set search_path = ''
as $$
begin
  insert into public.perfil (id, nome)
  values (
    new.id,
    -- o que o provedor souber; nulo é aceitável, a tela pergunta depois
    coalesce(new.raw_user_meta_data ->> 'nome',
             new.raw_user_meta_data ->> 'full_name')
  )
  -- gatilho em auth.users roda em caminhos que não controlamos (convite,
  -- OAuth, criação pelo painel), e falhar aqui derruba o cadastro inteiro
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger perfil_no_signup
  after insert on auth.users
  for each row execute function public.criar_perfil_do_usuario();
