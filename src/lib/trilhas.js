/* ============================================================
   As trilhas, lidas do banco.

   Era um manifesto escrito à mão mais um mapa de import dinâmico,
   um por trilha. Virou tabela em 21/10/2026: trilha nova e correção
   de tópico deixaram de exigir deploy, e a contagem de etapas e
   tópicos deixou de ser número copiado — o gatilho do banco a
   recalcula a cada escrita.

   A divisão que existia continua existindo, e é o que mantém a mesa
   leve: `listarTrilhas` traz só a ficha (rótulo, cor, contagens,
   rota da carta), e `carregarTrilha` traz o conteúdo de uma. Antes
   isso era um módulo separado do chunk; agora são duas consultas,
   uma delas sem a coluna pesada.

   Sem Supabase configurado não há trilha nenhuma — e a tela diz
   isso, em vez de desenhar uma mesa vazia que parece verdade.
   ============================================================ */
import { supabase } from "$lib/supabase.js";

export const PADRAO = "ml";

/* As gavetas da mesa, na ordem em que aparecem.

   O eixo é papel ou ferramenta, e ele foi escolhido por sobreviver a
   qualquer trilha nova: tudo que alguém escreva é um cargo que se quer
   ter ou uma ferramenta que se quer usar. Agrupar por domínio
   (dados / modelos / aplicações) reparte melhor as quatro de hoje e
   quebra na primeira trilha de fora dele.

   O rótulo vive aqui, e não no banco, porque é texto de interface e
   porque a mesa precisa da ordem das seções antes de qualquer trilha
   chegar. O preço: trilha nova numa categoria existente não pede
   deploy, categoria nova pede. */
export const CATEGORIAS = [
  { chave: "papel", rotulo: "Por papel" },
  { chave: "ferramenta", rotulo: "Por ferramenta" },
];

/* o que já foi baixado nesta visita. Trocar de trilha e voltar não
   deve pedir de novo os 50 KB da anterior. */
const cache = new Map();
let fichas = null;

/* a ficha de cada trilha, sem o conteúdo: é o que a mesa desenha */
export async function listarTrilhas() {
  if (fichas) return fichas;

  const sb = supabase();
  if (!sb) return {};

  const { data, error } = await sb
    .from("trilha")
    .select("id, rotulo, cor, rota, categoria, etapas, grupos, topicos")
    .order("ordem");

  if (error) return {};

  fichas = Object.fromEntries(
    data.map((t) => [
      t.id,
      {
        rotulo: t.rotulo,
        cor: t.cor,
        rota: t.rota ?? [],
        categoria: t.categoria,
        etapas: t.etapas,
        grupos: t.grupos,
        topicos: t.topicos,
      },
    ])
  );
  return fichas;
}

/* o conteúdo de uma trilha: ROADMAP (com as etapas na ordem),
   PROJETOS, RECURSOS, LEGENDA, ESTADOS e CRITERIOS — o mesmo formato
   que o index.js de cada pasta exportava */
export async function carregarTrilha(id) {
  const pedido = id || PADRAO;
  if (cache.has(pedido)) return cache.get(pedido);

  const sb = supabase();
  if (!sb) throw new Error("Sem conexão com o banco das trilhas.");

  /* Era `resolverId` antes desta consulta: uma ida ao banco só para
     saber se o id existe, seguida da ida que traz o conteúdo. Duas
     esperas em série, e a primeira respondia o que a segunda já
     responde — com ssr desligado, cada uma delas é tela branca.

     maybeSingle em vez de single porque id desconhecido é caso
     comum (link antigo circulando), não falha: `single` devolveria
     erro e o +error.svelte assumiria onde a tolerância antiga caía
     no padrão. */
  const { data, error } = await sb
    .from("trilha")
    .select("id, rotulo, conteudo")
    .eq("id", pedido)
    .maybeSingle();

  if (error) throw new Error("Não consegui carregar a trilha " + pedido + ".");

  /* id que não existe cai no padrão, como caía antes. A guarda
     impede o laço no dia em que o próprio padrão sumir do banco. */
  if (!data) {
    if (pedido === PADRAO) {
      throw new Error("A trilha " + PADRAO + " não está no banco.");
    }
    return carregarTrilha(PADRAO);
  }

  const trilha = { id: data.id, rotulo: data.rotulo, ...data.conteudo };
  cache.set(pedido, trilha);
  /* guardado também sob o id real: pedir "xpto" e cair no ml não
     deve fazer o ml ser baixado de novo quando alguém o pedir pelo
     nome */
  if (data.id !== pedido) cache.set(data.id, trilha);
  return trilha;
}
