/* A aba de trilha vem da querystring, que a pré-renderização não vê —
   mesma razão do roadmap e das notas. Passou a importar porque a tela
   deixou de ser maquete: antes os dias eram HTML escrito à mão e nada
   dependia da URL. O HTML sai pronto e vazio; o mês é montado no
   cliente, com as sessões da conta. */
export const ssr = false;
