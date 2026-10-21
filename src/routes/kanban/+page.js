/* Os cards vêm do banco, e a pré-renderização não tem como buscá-los:
   o HTML sairia com o quadro vazio e ele seria preenchido na
   hidratação, piscando. Mesma razão das outras telas que dependem de
   dado de runtime. */
export const ssr = false;
