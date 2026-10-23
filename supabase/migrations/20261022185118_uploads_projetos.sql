insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('entregas-projetos', 'entregas-projetos', false, 20971520, array['application/zip'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Alunos enviam seus arquivos de projeto"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'entregas-projetos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and (storage.foldername(name))[2] = 'py-projeto-financeiro'
  and storage.extension(name) = 'zip'
);

create policy "Alunos leem seus arquivos de projeto"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'entregas-projetos'
  and owner_id = (select auth.uid()::text)
);

create policy "Alunos removem seus arquivos de projeto"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'entregas-projetos'
  and owner_id = (select auth.uid()::text)
);

update public.atividade
set configuracao = jsonb_set(
  configuracao,
  '{instrucoes}',
  to_jsonb('Envie um repositório público ou um arquivo .zip de até 20 MB, escreva um resumo e marque apenas o que verificou. A equipe revisará sua entrega antes de demonstrar a competência.'::text)
)
where id = 'py-projeto-financeiro';
