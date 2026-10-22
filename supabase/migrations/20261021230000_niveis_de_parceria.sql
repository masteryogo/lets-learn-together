-- 0016 — a parceria passa a ter níveis.
--
-- A página de apoio era uma planta de expansão com três lotes à
-- venda, e as duas tabelas falavam essa língua: `apoiador.lote` e
-- `contato_apoio.formatos`, um array, porque uma empresa podia
-- escolher mais de um lote ao mesmo tempo.
--
-- A página virou uma proposta de parceria com três níveis — apoiador,
-- parceiro, fundador —, e níveis não se somam: cada um inclui o
-- anterior. Um array deixou de fazer sentido no dia em que escolher
-- "parceiro" passou a significar que "apoiador" já está dentro.
--
-- As duas tabelas estão vazias (conferido antes de escrever isto), e
-- é por isso que esta migration pode renomear e remover coluna sem
-- tratar dado existente. Depois da primeira linha, não poderia mais.

-- ---------------------------------------------------------------
-- quem já apoia
-- ---------------------------------------------------------------

alter table apoiador drop constraint apoiador_lote_check;
alter table apoiador rename column lote to nivel;
alter table apoiador add constraint apoiador_nivel_check
  check (nivel in ('apoiador', 'parceiro', 'fundador'));

-- ---------------------------------------------------------------
-- quem quer conversar
-- ---------------------------------------------------------------

/* o nível é opcional de propósito: a ficha oferece "ainda não sei", e
   é a resposta honesta de quem chegou na página hoje. Obrigar a
   escolher faria a pessoa chutar, e o chute entra no banco com a
   mesma cara de uma decisão. */
alter table contato_apoio add column nivel text
  check (nivel in ('apoiador', 'parceiro', 'fundador'));

/* `formatos` era a lista de lotes escolhidos. Sai junto com os lotes:
   coluna que nenhuma tela escreve é dado morto, e dado morto numa
   caixa de contato é pior — parece que a informação existe. */
alter table contato_apoio drop column formatos;
