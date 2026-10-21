/* ============================================================
   A distribuição do modelo do mês.

   Lógica pura, sem banco e sem DOM, porque é a única parte do
   calendário que erra em silêncio: um mês mal distribuído parece
   um mês.

   As três decisões que ela carrega, do quadro:

   1. A porcentagem é de DIAS, não de horas — é o que se confere
      olhando a grade. Por horas, a duração teria que variar por
      assunto.
   2. Aplicar nunca reescreve o passado. Escreve de hoje em diante;
      os dias já estudados contam na cota. Efeito aceito: dia
      elegível que passou em branco some da conta, em vez de
      empilhar três sessões na mesma semana para compensar.
   3. Distribuição intercalada, e não em bloco: 13 dias seguidos de
      ML fecham a mesma conta e matam a outra trilha na semana.

      O déficit é PROPORCIONAL ao ponto do mês, não absoluto. Pelo
      absoluto, o assunto de 10% só é escolhido quando os grandes já
      encheram — e vai todo para o fim do mês. Pelo proporcional,
      ele cai no 5º, 13º e 23º dia, que é o que "10% dos dias"
      significa para quem olha a grade.
   ============================================================ */

/* quantos dias cabem a cada assunto, pelo maior resto. Somar os
   arredondamentos de cada um daria 26 ou 28 dias num mês de 27 —
   o maior resto distribui a sobra onde ela foi maior. */
export function cotas(mistura, totalDeDias) {
  const partes = Object.entries(mistura).filter(([, p]) => p > 0);
  if (!partes.length || totalDeDias <= 0) return {};

  const soma = partes.reduce((t, [, p]) => t + p, 0);
  const exatos = partes.map(([assunto, p]) => {
    const ideal = (p / soma) * totalDeDias;
    return { assunto, inteiro: Math.floor(ideal), resto: ideal - Math.floor(ideal) };
  });

  let faltam = totalDeDias - exatos.reduce((t, e) => t + e.inteiro, 0);
  exatos.sort((a, b) => b.resto - a.resto);
  for (let i = 0; faltam > 0; i = (i + 1) % exatos.length, faltam--) {
    exatos[i].inteiro += 1;
  }

  return Object.fromEntries(exatos.map((e) => [e.assunto, e.inteiro]));
}

/* um assunto por dia, sempre o que está mais atrasado em relação ao
   que já deveria ter recebido até aqui. */
export function distribuir(diasElegiveis, mistura, jaFeitos = {}) {
  const feitos = contar(jaFeitos);
  const total = diasElegiveis.length + feitos;
  const alvo = cotas(mistura, total);
  const dados = { ...jaFeitos };
  const plano = [];

  diasElegiveis.forEach((dia, i) => {
    /* quantos dias do mês já passaram por aqui, contando os que foram
       estudados antes de aplicar: é o que torna o déficit proporcional
       ao ponto do mês, e não ao começo da aplicação */
    const posicao = feitos + i + 1;

    let escolhido = null;
    let maior = -Infinity;
    for (const assunto of Object.keys(alvo)) {
      const devido = (alvo[assunto] * posicao) / total;
      const deficit = devido - (dados[assunto] ?? 0);
      if (deficit > maior) {
        maior = deficit;
        escolhido = assunto;
      }
    }

    /* cota cumprida: o dia fica livre, em vez de receber sessão que o
       modelo não pediu */
    if (!escolhido) return;
    if ((alvo[escolhido] ?? 0) - (dados[escolhido] ?? 0) <= 0) return;

    dados[escolhido] = (dados[escolhido] ?? 0) + 1;
    plano.push({ dia, assunto: escolhido });
  });

  return plano;
}

function contar(mapa) {
  return Object.values(mapa).reduce((t, n) => t + n, 0);
}

/* os dias do mês que a janela aceita, a partir de uma data. `dias`
   usa a convenção do getDay(): 0 é domingo. */
export function diasElegiveis(ano, mes, diasDaSemana, aPartirDe) {
  const ultimo = new Date(ano, mes + 1, 0).getDate();
  const fora = new Set();
  for (let d = 0; d < 7; d++) if (!diasDaSemana.includes(d)) fora.add(d);

  const lista = [];
  for (let d = 1; d <= ultimo; d++) {
    const data = new Date(ano, mes, d);
    if (fora.has(data.getDay())) continue;
    if (aPartirDe && data < aPartirDe) continue;
    lista.push(data);
  }
  return lista;
}
