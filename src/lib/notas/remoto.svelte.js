/* ============================================================
   As notas no banco.

   Camada fina entre o Mural e o Supabase, no mesmo espírito do
   roadmap/sincronia.svelte.js: aqui não mora estado do mural, só a
   ida e a volta.

   O que distingue as notas do progresso é o ritmo da escrita. Marcar
   um tópico é um evento; escrever uma nota são dezenas por segundo,
   e arrastar, centenas. Por isso quem chama agrupa as mudanças — o
   `atualizar` daqui recebe o resultado, não cada tecla.
   ============================================================ */
import { supabase } from "$lib/supabase.js";
import { sessao } from "$lib/conta/Sessao.svelte.js";

/* o que não chegou ao banco. O mural muda na tela antes da resposta
   — é o que faz digitar parecer digitar —, então sem isto uma falha
   de escrita vira texto que só existe na janela aberta. */
export const estado = $state({ falha: null });

function marcar(error) {
  estado.falha = error ? error.message : null;
  return error;
}

function cliente() {
  if (!sessao.conectado) return null;
  return supabase();
}

/* todas as notas da pessoa, de todas as trilhas: são poucas, e o
   mural mostra a contagem de cada aba sem abrir nenhuma */
export async function listar() {
  const sb = cliente();
  if (!sb) return null;

  const { data, error } = await sb
    .from("nota")
    .select("id, trilha, topico_id, texto, cor, x, y, z")
    .eq("usuario_id", sessao.usuario.id)
    .order("criado_em", { ascending: false });

  if (marcar(error)) return null;

  /* o banco fala topico_id; o mural sempre falou topico */
  return data.map((n) => ({
    id: n.id,
    trilha: n.trilha,
    topico: n.topico_id,
    texto: n.texto,
    cor: n.cor,
    x: n.x,
    y: n.y,
    z: n.z,
  }));
}

/* devolve a nota criada, com o id que o banco deu — é ele que a
   tela usa como chave do {#each} e como alvo do foco */
export async function criar(trilha) {
  const sb = cliente();
  if (!sb) return null;

  const { data, error } = await sb
    .from("nota")
    .insert({ usuario_id: sessao.usuario.id, trilha, texto: "", cor: "amarelo" })
    .select("id, trilha, topico_id, texto, cor, x, y, z")
    .single();

  if (marcar(error)) return null;
  return { id: data.id, trilha: data.trilha, topico: data.topico_id,
           texto: data.texto, cor: data.cor, x: data.x, y: data.y, z: data.z };
}

export async function atualizar(id, campos) {
  const sb = cliente();
  if (!sb) return;

  const linha = { atualizado_em: new Date().toISOString() };
  if ("texto" in campos) linha.texto = campos.texto;
  if ("cor" in campos) linha.cor = campos.cor;
  if ("x" in campos) linha.x = campos.x;
  if ("z" in campos) linha.z = campos.z;
  if ("y" in campos) linha.y = campos.y;
  if ("topico" in campos) linha.topico_id = campos.topico;

  const { error } = await sb.from("nota").update(linha).eq("id", id);
  marcar(error);
}

export async function apagar(id) {
  const sb = cliente();
  if (!sb) return;
  const { error } = await sb.from("nota").delete().eq("id", id);
  marcar(error);
}
