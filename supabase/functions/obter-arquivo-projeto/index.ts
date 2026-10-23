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

Deno.serve(async (requisicao: Request) => {
  if (requisicao.method === "OPTIONS") return new Response("ok", { headers: cabecalhosCors });
  if (requisicao.method !== "POST") return responder({ erro: "Método não permitido." }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const servico = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon || !servico) return responder({ erro: "Função sem configuração do Supabase." }, 500);

  const autorizacao = requisicao.headers.get("Authorization") ?? "";
  const cliente = createClient(url, anon, { global: { headers: { Authorization: autorizacao } } });
  const { data: { user }, error: falhaSessao } = await cliente.auth.getUser();
  if (falhaSessao || !user) return responder({ erro: "Entre na conta para acessar a entrega." }, 401);

  const corpo = await requisicao.json().catch(() => null);
  const tentativaId = typeof corpo?.tentativaId === "string" ? corpo.tentativaId : "";
  if (!/^[0-9a-f-]{36}$/i.test(tentativaId)) return responder({ erro: "Entrega inválida." }, 400);

  const administrador = createClient(url, servico);
  const [{ data: tentativa, error: falhaTentativa }, { data: perfil, error: falhaPerfil }] = await Promise.all([
    administrador.from("tentativa_atividade")
      .select("id, usuario_id, atividade_id, resposta")
      .eq("id", tentativaId)
      .maybeSingle(),
    administrador.from("perfil").select("admin").eq("id", user.id).maybeSingle(),
  ]);
  if (falhaTentativa || !tentativa) return responder({ erro: "Entrega não encontrada." }, 404);
  if (falhaPerfil) return responder({ erro: "Não consegui verificar sua permissão." }, 500);
  if (tentativa.usuario_id !== user.id && perfil?.admin !== true) {
    return responder({ erro: "Você não tem permissão para acessar este arquivo." }, 403);
  }

  const caminho = tentativa.resposta?.arquivo?.caminho;
  const prefixo = `${tentativa.usuario_id}/${tentativa.atividade_id}/`;
  if (typeof caminho !== "string" || !caminho.startsWith(prefixo) || !/^[0-9a-f-]{36}\.zip$/i.test(caminho.slice(prefixo.length))) {
    return responder({ erro: "Esta entrega não possui um arquivo válido." }, 404);
  }

  const { data, error } = await administrador.storage
    .from("entregas-projetos")
    .createSignedUrl(caminho, 300, { download: tentativa.resposta.arquivo.nome || "projeto.zip" });
  if (error || !data?.signedUrl) return responder({ erro: "Não consegui preparar o download do projeto." }, 500);
  return responder({ url: data.signedUrl });
});
