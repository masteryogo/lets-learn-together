/* ============================================================
   O progresso salvo, lido do localStorage.

   Uma chave por trilha, sem servidor nem conta. Toda leitura é
   envolvida em try/catch: com cookies bloqueados o site funciona,
   só não lembra — e a trilha aparece como intocada em vez de a
   página quebrar.

   Quando o Supabase entrar, é este arquivo que ganha a outra
   fonte. Quem chama só pede o número.
   ============================================================ */

/* de antes das trilhas: o ml ainda lê esta chave como alternativa,
   porque há quem tenha progresso gravado nela e nunca mais voltou */
const CHAVE_LEGADA = "roadmap-ml:progresso:v1";

export function chaveProgresso(trilha) {
  return "roadmap:" + trilha + ":progresso:v1";
}

export function chaveSub(trilha) {
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

/* quantos tópicos estão marcados como feito nesta trilha */
export function feitosDe(trilha) {
  const chaves = [chaveProgresso(trilha)];
  if (trilha === "ml") chaves.push(CHAVE_LEGADA);

  for (const chave of chaves) {
    const mapa = ler(chave);
    /* a primeira chave que existir responde: achar a nova e ignorá-la
       porque está vazia faria o ml cair na legada e mostrar progresso
       que a pessoa já apagou */
    if (mapa) {
      return Object.values(mapa).filter((e) => e === "feito").length;
    }
  }
  return 0;
}
