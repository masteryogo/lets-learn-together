/* A trilha vem da querystring, que a pré-renderização não vê — mesma
   razão do roadmap. O HTML sai pronto e vazio; o mural é montado no
   cliente, que é o que acontecia antes. */
export const ssr = false;
