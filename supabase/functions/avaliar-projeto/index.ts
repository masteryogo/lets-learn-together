import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cabecalhosCors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function responder(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { ...cabecalhosCors, "Content-Type": "application/json" },
  });
}

function texto(valor: unknown) {
  return typeof valor === "string" ? valor.trim().replace(/\s+/g, " ") : "";
}

Deno.serve(async (requisicao) => {
  if (requisicao.method === "OPTIONS") return new Response("ok", { headers: cabecalhosCors });
  if (requisicao.method !== "POST") return responder({ erro: "Método não permitido." }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const servico = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon || !servico) return responder({ erro: "Função sem configuração do Supabase." }, 500);

  const autorizacao = requisicao.headers.get("Authorization") ?? "";
  const cliente = createClient(url, anon, { global: { headers: { Authorization: autorizacao } } });
  const { data: { user }, error: falhaSessao } = await cliente.auth.getUser();
  if (falhaSessao || !user) return responder({ erro: "Entre na conta para revisar projetos." }, 401);

  const corpo = await requisicao.json().catch(() => null);
  const tentativaId = texto(corpo?.tentativaId);
  const feedback = texto(corpo?.feedback);
  const pontuacao = Number(corpo?.pontuacao);
  const aprovada = corpo?.aprovada === true;
  if (!tentativaId || !/^[0-9a-f-]{36}$/i.test(tentativaId) || typeof corpo?.aprovada !== "boolean" || !Number.isFinite(pontuacao) || pontuacao < 0 || pontuacao > 100 || !Number.isInteger(pontuacao) || feedback.length < 20 || feedback.length > 2000) {
    return responder({ erro: "Informe uma avaliação válida, com nota inteira e feedback de 20 a 2.000 caracteres." }, 400);
  }
  if (aprovada && pontuacao < 70) return responder({ erro: "Para aprovar, a nota precisa ser de pelo menos 70." }, 400);

  const administrador = createClient(url, servico);
  const { data: perfil, error: falhaPerfil } = await administrador
    .from("perfil")
    .select("admin")
    .eq("id", user.id)
    .maybeSingle();
  if (falhaPerfil) return responder({ erro: "Não consegui verificar sua permissão." }, 500);
  if (perfil?.admin !== true) return responder({ erro: "Somente pessoas administradoras podem revisar projetos." }, 403);

  const { data: tentativa, error: falhaBusca } = await administrador
    .from("tentativa_atividade")
    .select("id, atividade_id, detalhes")
    .eq("id", tentativaId)
    .maybeSingle();
  if (falhaBusca || !tentativa) return responder({ erro: "Envio de projeto não encontrado." }, 404);

  const { data: atividade, error: falhaAtividade } = await administrador
    .from("atividade")
    .select("tipo")
    .eq("id", tentativa.atividade_id)
    .maybeSingle();
  if (falhaAtividade || atividade?.tipo !== "projeto" || tentativa.detalhes?.status !== "aguardando_avaliacao") {
    return responder({ erro: "Este envio já foi avaliado ou não é um projeto." }, 409);
  }

  const detalhes = {
    ...tentativa.detalhes,
    status: aprovada ? "aprovado" : "revisar_e_reenviar",
    avaliador_id: user.id,
    avaliado_em: new Date().toISOString(),
  };
  const { data: atualizada, error: falhaAtualizacao } = await administrador
    .from("tentativa_atividade")
    .update({ correta: aprovada, pontuacao, feedback, detalhes })
    .eq("id", tentativaId)
    .eq("detalhes->>status", "aguardando_avaliacao")
    .select("id, atividade_id, correta, pontuacao, feedback, detalhes, criada_em, acao")
    .single();
  if (falhaAtualizacao) return responder({ erro: "Não consegui salvar a avaliação." }, 500);
  return responder({ tentativa: atualizada });
});
