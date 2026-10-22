/* ============================================================
   Os três níveis de parceria.

   Substituíram os lotes da planta de expansão. A diferença não é de
   nome: lote era escolha múltipla — dava para querer dois ao mesmo
   tempo —, e nível não se soma, porque cada um já inclui o anterior.
   Foi isso que tirou o array de `contato_apoio` e deixou uma coluna.

   A lista mora aqui porque três lugares precisam dela: a página de
   apoio, que a desenha; o `select` da ficha, que a oferece; e o
   `check` das duas tabelas, que tem exatamente estes ids.
   ============================================================ */

export const NIVEIS = [
  {
    id: "apoiador",
    nome: "Apoiador",
    linha:
      "Sua marca no rodapé de todas as telas e na fita do topo da página " +
      "inicial, escrita no mesmo papel do resto do site. Sem banner, sem " +
      "rede de anúncio, sem rastreador.",
    entrar: "Uma conversa e um acordo de doze meses. No ar em uma semana.",
  },
  {
    id: "parceiro",
    nome: "Parceiro",
    linha:
      "Tudo do Apoiador, mais um roadmap de uso interno da empresa: um caminho de " +
      "estudo de verdade, do começo ao avançado, escrito por nós e revisado " +
      "pelo seu time.",
    entrar: "Conversa, desenho do conteúdo e escrita.",
  },
  {
    id: "fundador",
    nome: "Parceiro fundador",
    linha:
      "Tudo do Parceiro, mais o nome na página do Let's Learn Togheter e voz nas " +
      "próximas trilhas que vamos escrever, inclusive nas que não são sobre " +
      "a sua ferramenta.",
    /* o número é verdade, não escassez de vitrine: ninguém apoia o
       site ainda, e some da tela sozinho quando alguém entrar */
    vagas: 3,
    entrar:
      "O nível existe para empresas que queiram adentrar o mercado de EduTech. "
  },
];

/* só os ids, que é o que o banco conhece */
export const IDS_NIVEIS = NIVEIS.map((n) => n.id);

/* as linhas da tabela de comparação. `true` entra, `false` não entra,
   "depois" é o que ainda não existe — e precisa de uma terceira
   forma, porque dizer "não" a algo que ainda vai existir é errado
   tanto quanto dizer "sim". */
export const COMPARACAO = [
  { o: "Marca no rodapé de todas as telas",        apoiador: true,  parceiro: true,  fundador: true },
  { o: "Marca na fita do topo da página inicial",  apoiador: true,  parceiro: true,  fundador: true },
  { o: "Selo para usar no seu site",               apoiador: true,  parceiro: true,  fundador: true },
  { o: "Um roadmap sobre a sua stack",             apoiador: false, parceiro: true,  fundador: true },
  { o: "Seu nome na carta dessa trilha",           apoiador: false, parceiro: true,  fundador: true },
  { o: "Revisão técnica do conteúdo com o seu time", apoiador: false, parceiro: true, fundador: true },
  { o: "Nome na página de quem faz o site",        apoiador: false, parceiro: false, fundador: true },
  { o: "Voz nas próximas trilhas",                 apoiador: false, parceiro: false, fundador: true },
  { o: "Falar com quem estuda",                    apoiador: false, parceiro: true, fundador: true },
];
