/* ============================================================
   O que ainda mora no localStorage.

   O progresso saiu daqui: ele é do banco, e só dele. Dois donos do
   mesmo dado foi o que fez a mesa contar de um lado e o mapa do
   outro, divergindo sem ninguém estar errado.

   O que ficou são as três coisas que não são progresso:

   - as etapas fechadas e o `revelarPulados`, que descrevem como
     esta pessoa olha a trilha NESTE aparelho — faz sentido a etapa
     estar fechada no celular e aberta no computador;
   - o tema, que o script inline do app.html lê antes de o bundle
     existir: no banco, toda visita começaria com o tema errado;
   - as chaves antigas do progresso, que ninguém escreve mais e
     existem só para serem oferecidas à conta uma última vez.

   Toda leitura é envolvida em try/catch: com cookies bloqueados o
   site funciona, só não lembra da vista.
   ============================================================ */

/* as chaves de quando o progresso morava aqui. Lidas uma vez, para
   oferecer a subida à conta; nunca escritas. Somem quando não houver
   mais quem tenha visitado o site antes do banco. */
export function chaveProgressoLegado(trilha) {
  return "roadmap:" + trilha + ":progresso:v1";
}

export function chaveSubLegado(trilha) {
  return "roadmap:" + trilha + ":sub:v1";
}

export function chaveEtapas(trilha) {
  return "roadmap:" + trilha + ":etapas:v1";
}

/* preferências de exibição do mapa — hoje só os pulados */
export function chaveVista(trilha) {
  return "roadmap:" + trilha + ":vista:v1";
}

/* tema é comum a todas as trilhas */
export const CHAVE_TEMA = "roadmap:tema:v1";

export function ler(chave, padrao = null) {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : padrao;
  } catch {
    return padrao;
  }
}

export function gravar(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}
