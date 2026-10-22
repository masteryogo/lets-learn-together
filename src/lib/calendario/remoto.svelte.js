/* ============================================================
   As sessões de estudo no banco.

   O calendário era maquete: outubro de 2026 escrito dia a dia, com
   sessões cumpridas e perdidas que nunca existiram. Saiu — dado de
   mentira é indistinguível do verdadeiro até alguém tentar mexer.

   O que ficou é o que o banco sabe responder: as sessões do mês
   (tabela `sessao_estudo`) e o modelo que as gera (`modelo_mes`,
   uma linha por pessoa). Nenhum dos dois existe antes de alguém
   escrever o primeiro — e a tela diz isso em vez de preencher.
   ============================================================ */
import { supabase } from "$lib/supabase.js";
import { sessao } from "$lib/conta/Sessao.svelte.js";

function cliente() {
  if (!sessao.conectado) return null;
  return supabase();
}

/* AAAA-MM-DD em hora local. toISOString() daria o dia errado para
   quem está a oeste de Greenwich depois das 21h — o Brasil inteiro. */
export function diaISO(data) {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

/* a última leitura que falhou, para a tela poder dizer em vez de
   mostrar um mês vazio que parece verdade */
export const leitura = $state({ falha: null });

export async function sessoesDoMes(primeiroDia, ultimoDia) {
  const sb = cliente();
  if (!sb) return [];

  const { data, error } = await sb
    .from("sessao_estudo")
    .select("id, dia, trilha, inicio, duracao_min, anotacao, origem")
    .eq("usuario_id", sessao.usuario.id)
    .gte("dia", diaISO(primeiroDia))
    .lte("dia", diaISO(ultimoDia))
    .order("inicio");

  leitura.falha = error ? error.message : null;
  return error ? null : data;
}

export async function escrever({ dia, trilha, inicio, duracao_min, anotacao }) {
  const sb = cliente();
  if (!sb) return "Entre na conta para escrever no calendário.";

  const { error } = await sb.from("sessao_estudo").insert({
    usuario_id: sessao.usuario.id,
    dia,
    trilha,
    inicio,
    duracao_min,
    anotacao: anotacao || null,
    /* escrita à mão nunca é substituída quando o modelo for aplicado */
    origem: "mao",
  });

  if (!error) return null;
  /* a única colisão prevista: duas sessões no mesmo horário do mesmo
     dia, barrada pela unique (usuario, dia, inicio) */
  return error.code === "23505"
    ? "Já existe uma sessão nesse horário."
    : "Não consegui escrever. Tente de novo.";
}

export async function apagarSessao(id) {
  const sb = cliente();
  if (!sb) return "Entre na conta para apagar uma sessão.";
  const { error } = await sb.from("sessao_estudo").delete().eq("id", id);
  return error ? "Não consegui apagar a sessão. Tente de novo." : null;
}

/* uma linha por pessoa: o modelo é "o que vale de agora em diante".
   Por isso upsert pela chave do usuário, e não insert. */
export async function salvarModelo(modelo) {
  const sb = cliente();
  if (!sb) return "Entre na conta para salvar o modelo.";

  const { error } = await sb.from("modelo_mes").upsert(
    {
      usuario_id: sessao.usuario.id,
      dias_semana: modelo.dias_semana,
      hora_inicio: modelo.hora_inicio,
      duracao_min: modelo.duracao_min,
      mistura: modelo.mistura,
      aplicado_ate: modelo.aplicado_ate ?? null,
      atualizado_em: new Date().toISOString(),
    },
    { onConflict: "usuario_id" }
  );

  return error ? "Não consegui salvar o modelo." : null;
}

/* o plano inteiro numa escrita só: 27 inserts seriam 27 viagens, e
   uma falha no meio deixaria o mês pela metade.

   ignoreDuplicates porque a unique (usuario, dia, inicio) é o que
   protege o que foi escrito à mão: aplicar o modelo passa por cima
   do dia já ocupado sem tocá-lo nem falhar. */
export async function aplicarPlano(linhas) {
  const sb = cliente();
  if (!sb) return "Entre na conta para aplicar o modelo.";
  if (!linhas.length) return null;

  const { error } = await sb.from("sessao_estudo").upsert(
    linhas.map((l) => ({ usuario_id: sessao.usuario.id, ...l, origem: "modelo" })),
    { onConflict: "usuario_id,dia,inicio", ignoreDuplicates: true }
  );

  return error ? "Não consegui escrever o mês." : null;
}

/* limpa só o que o modelo escreveu, e só daqui para frente: sessão
   escrita à mão não é do modelo, e o passado não se reescreve */
export async function limparFuturoDoModelo(deISO) {
  const sb = cliente();
  if (!sb) return "Entre na conta para limpar o plano.";
  const { error } = await sb
    .from("sessao_estudo")
    .delete()
    .eq("usuario_id", sessao.usuario.id)
    .eq("origem", "modelo")
    .gte("dia", deISO);
  return error ? "Não consegui limpar o plano. Tente de novo." : null;
}

export async function modeloDoMes() {
  const sb = cliente();
  if (!sb) return null;

  const { data, error } = await sb
    .from("modelo_mes")
    .select("dias_semana, hora_inicio, duracao_min, mistura, aplicado_ate")
    .eq("usuario_id", sessao.usuario.id)
    .maybeSingle();

  return error ? null : data;
}
