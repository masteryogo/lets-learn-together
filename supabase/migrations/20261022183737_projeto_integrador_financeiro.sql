-- Tipo próprio para o projeto com avaliação humana; a carga curricular fica
-- em migration seguinte, após este novo rótulo do enum estar confirmado.
alter type public.tipo_atividade add value if not exists 'projeto';
