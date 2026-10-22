/* Serializa a trilha de Rust na migration. Rodar:
     node gerar-sql.mjs > 20261021070000_trilha_rust.sql
   O conteúdo vive em trilha-rust.mjs porque JSON escrito à mão num
   .sql é onde aspa e vírgula erram em silêncio. */
import { TRILHA } from "./trilha-rust.mjs";

/* aspa simples dobrada: é todo o escape que um literal SQL pede */
const lit = (s) => "'" + String(s).replaceAll("'", "''") + "'";

const { id, rotulo, cor, rota, ordem, conteudo } = TRILHA;

/* confere o que o gatilho trilha_contagem vai calcular */
let etapas = 0, grupos = 0, topicos = 0, semId = [], idsVistos = new Set(), repetidos = [];
for (const e of conteudo.ROADMAP.etapas) {
  etapas++;
  for (const g of e.grupos ?? []) {
    grupos++;
    for (const t of g.topicos ?? []) {
      topicos++;
      if (!t.id) semId.push(t.titulo);
      if (idsVistos.has(t.id)) repetidos.push(t.id);
      idsVistos.add(t.id);
    }
  }
}
if (semId.length || repetidos.length) {
  throw new Error("tópico sem id ou com id repetido: " + JSON.stringify({ semId, repetidos }));
}

const cabecalho = `-- 0013 — trilha de Rust, para quem já programa em outra linguagem.
--
-- Quatro etapas: ownership e o borrow checker; tipos, erro e coleções;
-- módulos, testes e concorrência; async, ecossistema e produção.
-- Não há etapa de sintaxe básica de propósito — o público já programa,
-- e o espaço vai para o que não tem equivalente na linguagem anterior.
--
-- As contagens (${etapas} etapas, ${grupos} grupos, ${topicos} tópicos) não vão
-- escritas: o gatilho trilha_contagem as calcula na inserção. Estão
-- aqui só como registro do que se espera ver.
--
-- Os ids dos tópicos (rs-01 … rs-${String(topicos).padStart(2, "0")}) são a chave do progresso
-- de quem marcar algo. Editar o texto é livre; renomear id, não.

insert into public.trilha (id, rotulo, cor, rota, ordem, publicada, conteudo)
values
  (${lit(id)}, ${lit(rotulo)}, ${lit(cor)},
   ${lit(JSON.stringify(rota))}::jsonb, ${ordem}, true,
   ${lit(JSON.stringify(conteudo))}::jsonb)
on conflict (id) do update set
  rotulo = excluded.rotulo,
  cor = excluded.cor,
  rota = excluded.rota,
  ordem = excluded.ordem,
  publicada = excluded.publicada,
  conteudo = excluded.conteudo;
`;

process.stdout.write(cabecalho);
process.stderr.write(`etapas=${etapas} grupos=${grupos} topicos=${topicos}\n`);
