import adapter from "@sveltejs/adapter-static";

/* O site continua sendo arquivo estático: GitHub Pages e Vercel servem a
   pasta build/ como hoje. fallback: null porque toda rota é conhecida em
   tempo de build — rota desconhecida deve dar 404 de verdade, e não a
   casca de uma SPA que descobre tarde demais que não tem o que mostrar. */
export default {
  kit: {
    adapter: adapter({ fallback: null, precompress: false }),
  },
};
