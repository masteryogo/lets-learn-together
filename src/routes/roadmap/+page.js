/* ============================================================
   Carrega a trilha pedida na querystring.

   Era o trilhas.js: ler ?trilha=, injetar oito <script> em ordem e
   torcer. Aqui é um import dinâmico — se um arquivo faltar, a
   promessa rejeita e o +error.svelte assume, em vez de o app montar
   meio mapa por cima de uma bandeira global.

   A página é pré-renderizada, mas a trilha é escolhida na
   querystring, que o prerender não vê. Daí ssr desligado: o HTML
   sai vazio e a trilha é carregada no cliente, que é exatamente o
   que acontecia antes.
   ============================================================ */
import { resolverId, carregarTrilha, TRILHAS } from "$lib/trilhas.js";

export const ssr = false;

export async function load({ url }) {
  const trilha = resolverId(url.searchParams.get("trilha"));
  const dados = await carregarTrilha(trilha);

  return {
    trilha,
    rotulo: TRILHAS[trilha].rotulo,
    ROADMAP: dados.ROADMAP,
    PROJETOS: dados.PROJETOS,
    RECURSOS: dados.RECURSOS,
    LEGENDA: dados.LEGENDA,
    ESTADOS: dados.ESTADOS,
    CRITERIOS: dados.CRITERIOS,
  };
}
