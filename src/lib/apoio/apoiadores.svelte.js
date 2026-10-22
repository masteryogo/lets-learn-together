/* ============================================================
   Quem apoia, lido do banco.

   A leitura é pública e sem conta: esta lista é desenhada na mesa,
   que é a primeira tela de quem nunca entrou.

   O cuidado todo está no que acontece quando a resposta não chega.
   A seção mostra lotes vagos por padrão, e lote vago é uma afirmação
   — diz "ninguém ocupa este lugar". Se a falha virasse lista vazia,
   a tela afirmaria isso sem saber, que é o defeito que este projeto
   já corrigiu em três camadas. Por isso `estado.falha`: a seção
   precisa poder dizer que não conseguiu olhar, em vez de dizer que
   olhou e não havia nada.
   ============================================================ */
import { supabase } from "$lib/supabase.js";
import { IDS_NIVEIS } from "$lib/apoio/niveis.js";

export const estado = $state({ falha: null, carregado: false });

export async function listarApoiadores() {
  const sb = supabase();
  /* sem Supabase configurado não há falha a relatar: o site nasceu
     assim, e a mesa com os lotes vagos é a tela correta */
  if (!sb) {
    estado.carregado = true;
    return [];
  }

  const { data, error } = await sb
    .from("apoiador")
    .select("id, nome, site, nivel, desde")
    .order("ordem");

  estado.carregado = true;
  estado.falha = error ? error.message : null;
  if (error) return null;

  /* nível fora da lista é apoiador que some da tela sem erro nenhum.
     O `check` da tabela impede isso no banco; aqui é o que sobra
     para o dia em que a lista do código andar na frente dele. */
  return data.filter((a) => IDS_NIVEIS.includes(a.nivel));
}
