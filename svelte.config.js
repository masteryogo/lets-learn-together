import adapter from "@sveltejs/adapter-static";

/* O site continua sendo arquivo estático: GitHub Pages e Vercel servem a
   pasta build/ como hoje. fallback: null porque toda rota é conhecida em
   tempo de build — rota desconhecida deve dar 404 de verdade, e não a
   casca de uma SPA que descobre tarde demais que não tem o que mostrar. */
export default {
  kit: {
    adapter: adapter({ fallback: null, precompress: false }),

    paths: {
      /* No GitHub Pages o site não mora na raiz do domínio, e sim em
         /lets-learn-together/. Os assets o adapter já resolve sozinho
         (caminho relativo), mas um href="/roadmap" sairia do projeto e
         cairia no 404 do github.io. Daí o base: a Action o define, e no
         dev local ele é vazio.

         Quem escreve link interno precisa prefixá-lo — `{base}/roadmap`,
         e não `/roadmap`. É chato e é assim mesmo: o SvelteKit não
         reescreve href por conta própria. */
      base: process.env.BASE_PATH ?? "",
    },
  },
};
