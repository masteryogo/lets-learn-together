-- 0004 — o calendário no modo próprio.
--
-- Só o modo "lets learn together" mora aqui. No modo Google o dono dos
-- eventos é o Google e a escrita é chamada de API — e os dois modos nunca
-- coexistem, o que é justamente o que dispensa sincronização.

create table sessao_estudo (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users on delete cascade,
  dia date not null,
  -- "projetos" também é um valor válido: a mistura não é só de trilhas
  trilha text not null,
  inicio time not null,
  duracao_min integer not null default 90 check (duracao_min > 0),
  anotacao text,
  -- quem escreveu: a distribuição do modelo ou a pessoa, na mão.
  -- Reaplicar o modelo pode substituir as de origem 'modelo'; nunca as
  -- escritas à mão.
  origem text not null default 'modelo' check (origem in ('modelo', 'mao')),
  criado_em timestamptz not null default now(),
  -- dois blocos no mesmo horário do mesmo dia seriam erro de distribuição,
  -- não escolha de ninguém
  unique (usuario_id, dia, inicio)
);

-- a tela abre sempre num mês
create index sessao_estudo_do_mes on sessao_estudo (usuario_id, dia);

create table modelo_mes (
  -- uma linha por pessoa: o modelo é "o que vale de agora em diante".
  -- O passado se explica pelas sessões que ficaram gravadas — guardar a
  -- história do modelo seria uma segunda verdade sobre o mesmo mês.
  usuario_id uuid primary key references auth.users on delete cascade,
  -- 0 = domingo, como em JS. Seg–sáb é {1,2,3,4,5,6}
  dias_semana smallint[] not null default '{1,2,3,4,5,6}',
  hora_inicio time not null default '19:00',
  duracao_min integer not null default 90 check (duracao_min > 0),
  -- {"ml": 50, "cv": 40, "projetos": 10} — porcentagem de DIAS, não de
  -- horas: é o que se confere olhando a grade
  mistura jsonb not null default '{}'::jsonb,
  -- até onde o modelo já foi aplicado. Aplicar nunca reescreve o passado,
  -- então a distribuição seguinte começa no maior entre hoje e esta data.
  aplicado_ate date,
  atualizado_em timestamptz not null default now()
);

alter table sessao_estudo enable row level security;
alter table modelo_mes enable row level security;

create policy "sessão é só sua" on sessao_estudo
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

create policy "modelo é só seu" on modelo_mes
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);
