-- As consultas do roadmap começam pela trilha e pelo tópico; os históricos
-- e os vínculos de competência também são consultados pelo lado inverso.
create index atividade_por_trilha_topico_publicacao_ordem
  on public.atividade (trilha, topico_id, publicada, ordem);

create index atividade_competencia_por_competencia
  on public.atividade_competencia (competencia_id, atividade_id);

create index tentativa_atividade_por_atividade
  on public.tentativa_atividade (atividade_id, criada_em desc);
