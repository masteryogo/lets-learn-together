/* ============================================================
   Carrega a trilha pedida na querystring.

   Era o trilhas.js: ler ?trilha=, injetar oito <script> em ordem e
   torcer. Depois virou import dinâmico, e desde 21/10/2026 é uma
   consulta ao banco — se a trilha não existir ou a rede falhar, a
   promessa rejeita e o +error.svelte assume, em vez de o app montar
   meio mapa por cima de uma bandeira global.

   A página é pré-renderizada, mas a trilha é escolhida na
   querystring, que o prerender não vê. Daí ssr desligado: o HTML
   sai vazio e a trilha é carregada no cliente, que é exatamente o
   que acontecia antes.
   ============================================================ */
import { carregarTrilha } from "$lib/trilhas.js";

export const ssr = false;

export async function load({ url }) {
  /* uma consulta só: quem diz qual trilha é de fato esta é a linha
     que voltou, não uma checagem antes dela */
  const dados = await carregarTrilha(url.searchParams.get("trilha"));

  return {
    trilha: dados.id,
    /* o rótulo vem com o conteúdo: eram duas fontes, e duas fontes
       para o mesmo nome é como ele fica diferente num lugar só */
    rotulo: dados.rotulo,
    ROADMAP: dados.ROADMAP,
    PROJETOS: dados.PROJETOS,
    RECURSOS: dados.RECURSOS,
    LEGENDA: dados.LEGENDA,
    ESTADOS: dados.ESTADOS,
    CRITERIOS: dados.CRITERIOS,
  };
}
