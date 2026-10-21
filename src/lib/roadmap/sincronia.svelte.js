/* ============================================================
   O progresso no banco.

   Uma camada fina entre a classe Progresso e o Supabase. Ela não
   guarda estado do mapa: quem o guarda é o Progresso, que continua
   escrevendo no localStorage em toda mudança. Aqui só se repete a
   mesma mudança no banco, quando há sessão.

   Por que o localStorage continua: é o cache e é o modo sem conta.
   Com ele, abrir a trilha desenha o mapa na hora e a consulta ao
   banco só corrige o que divergir — em vez de a tela esperar a rede
   para mostrar o que já se sabe.

   Toda escrita engole o erro, como o progresso.js sempre fez. A
   diferença é que agora o fracasso tem nome: `ultimaFalha` existe
   para a tela poder dizer "não consegui salvar na conta", em vez de
   mentir que salvou.
   ============================================================ */
import { supabase } from "$lib/supabase.js";
import { sessao } from "$lib/conta/Sessao.svelte.js";

/* a última escrita que não chegou ao banco. Nulo quando está tudo
   em dia — e é isso que a tela observa. */
export const sincronia = $state({ ultimaFalha: null, gravando: 0 });

function cliente() {
  if (!sessao.conectado) return null;
  return supabase();
}

function usuario() {
  return sessao.usuario.id;
}

/* embrulha uma escrita: conta quantas estão no ar e guarda a falha */
async function escrever(tarefa) {
  const sb = cliente();
  if (!sb) return;

  sincronia.gravando += 1;
  try {
    const { error } = await tarefa(sb);
    sincronia.ultimaFalha = error ? error.message : null;
  } catch (e) {
    sincronia.ultimaFalha = e?.message ?? "falha de rede";
  } finally {
    sincronia.gravando -= 1;
  }
}

/* ----------------------------- leitura ----------------------------- */

/* devolve o que está no banco para esta trilha, no mesmo formato que
   o Progresso usa em memória. Null quando não há conta — e null é
   diferente de vazio: vazio significa "a conta não marcou nada". */
export async function baixar(trilha) {
  const sb = cliente();
  if (!sb) return null;

  const uid = usuario();
  const [topicos, subs] = await Promise.all([
    sb.from("progresso_topico").select("topico_id, estado")
      .eq("usuario_id", uid).eq("trilha", trilha),
    sb.from("progresso_subassunto").select("topico_id, sub_texto")
      .eq("usuario_id", uid).eq("trilha", trilha),
  ]);

  if (topicos.error || subs.error) {
    sincronia.ultimaFalha = (topicos.error ?? subs.error).message;
    return null;
  }

  const estados = {};
  for (const linha of topicos.data) estados[linha.topico_id] = linha.estado;

  /* a chave composta é a mesma do localStorage: topicoId + "|" + texto */
  const sub = {};
  for (const linha of subs.data) sub[`${linha.topico_id}|${linha.sub_texto}`] = 1;

  return { estados, sub };
}

/* a mesa pergunta por todas as trilhas de uma vez: é contagem
   agrupada, que o cliente JavaScript não sabe fazer. Null quando não
   há conta — e aí a mesa segue com o cache do localStorage. */
export async function contagens() {
  const sb = cliente();
  if (!sb) return null;

  const { data, error } = await sb.rpc("contagem_por_trilha");
  if (error) {
    sincronia.ultimaFalha = error.message;
    return null;
  }

  const mapa = {};
  for (const linha of data) mapa[linha.trilha] = Number(linha.feitos);
  return mapa;
}

/* ----------------------------- escrita ----------------------------- */

/* "pendente" não vira linha: ausência é pendente, no banco como na
   memória. Por isso voltar ao pendente é apagar, não gravar. */
export function salvarEstado(trilha, topicoId, estado) {
  return escrever((sb) =>
    estado === "pendente"
      ? sb.from("progresso_topico").delete()
          .eq("usuario_id", usuario()).eq("trilha", trilha).eq("topico_id", topicoId)
      : sb.from("progresso_topico").upsert(
          {
            usuario_id: usuario(),
            trilha,
            topico_id: topicoId,
            estado,
            atualizado_em: new Date().toISOString(),
          },
          { onConflict: "usuario_id,trilha,topico_id" }
        )
  );
}

export function salvarSub(trilha, topicoId, texto, marcado) {
  return escrever((sb) =>
    marcado
      ? sb.from("progresso_subassunto").upsert(
          { usuario_id: usuario(), trilha, topico_id: topicoId, sub_texto: texto },
          { onConflict: "usuario_id,trilha,topico_id,sub_texto" }
        )
      : sb.from("progresso_subassunto").delete()
          .eq("usuario_id", usuario()).eq("trilha", trilha)
          .eq("topico_id", topicoId).eq("sub_texto", texto)
  );
}

export function limparTrilha(trilha) {
  return escrever(async (sb) => {
    const uid = usuario();
    const a = await sb.from("progresso_topico").delete()
      .eq("usuario_id", uid).eq("trilha", trilha);
    if (a.error) return a;
    return sb.from("progresso_subassunto").delete()
      .eq("usuario_id", uid).eq("trilha", trilha);
  });
}

/* o que o navegador tem, de uma vez só: é o que a pergunta do
   primeiro login manda para a conta quando a resposta é sim */
export function enviarTudo(trilha, estados, sub) {
  const uid = usuario();

  const topicos = Object.entries(estados).map(([topico_id, estado]) => ({
    usuario_id: uid, trilha, topico_id, estado,
  }));

  /* a chave do sub guarda tópico e texto grudados por "|", e o texto
     pode conter "|"? Não hoje: ele vem de partirDesc, que separa por
     vírgula. Ainda assim parte-se só na primeira barra. */
  const subs = Object.keys(sub).map((chave) => {
    const corte = chave.indexOf("|");
    return {
      usuario_id: uid,
      trilha,
      topico_id: chave.slice(0, corte),
      sub_texto: chave.slice(corte + 1),
    };
  });

  return escrever(async (sb) => {
    if (topicos.length) {
      const a = await sb.from("progresso_topico")
        .upsert(topicos, { onConflict: "usuario_id,trilha,topico_id" });
      if (a.error) return a;
    }
    if (subs.length) {
      return sb.from("progresso_subassunto")
        .upsert(subs, { onConflict: "usuario_id,trilha,topico_id,sub_texto" });
    }
    return { error: null };
  });
}
