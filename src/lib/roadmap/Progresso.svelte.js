/* ============================================================
   O progresso de uma trilha, como estado reativo.

   Era o trio de objetos soltos no topo do app.js (`progresso`,
   `subMarcados`, `etapasFechadas`) mais sete funções que liam,
   gravavam e repintavam o DOM à mão. Aqui eles são $state: quem
   muda um valor não repinta nada, e quem mostra não sabe quem
   mudou.

   É também o ponto de troca para o Supabase. Hoje `carregar` e
   `gravar` falam com o localStorage; quando houver conta, falam
   com o banco — e nenhum componente precisa saber.
   ============================================================ */
import {
  chaveProgresso,
  chaveSub,
  chaveEtapas,
  chaveVista,
  ler,
  gravar,
} from "$lib/progresso.js";
import { chaveSub as chaveDoSub } from "./subassuntos.js";

export const CICLO = ["pendente", "estudando", "feito", "pulado"];

/* glifos que a Departure Mono tem — ◔ e ✓ não estão nela. "pendente"
   deixa de ser vazio: o estado passa a ter forma, e não só cor. */
export const MARCAS = {
  pendente: "□",
  estudando: "►",
  feito: "■",
  pulado: "×",
};

/* de antes das trilhas: só o ml a consulta, e só quando a chave nova
   ainda não existe */
const CHAVE_LEGADA = "roadmap-ml:progresso:v1";

export class Progresso {
  estados = $state({});
  sub = $state({});
  /* guarda o que foi FECHADO, não o que foi aberto: o padrão é a etapa
     aberta, então a ausência da chave — primeira visita, localStorage
     bloqueado — já cai no estado certo, sem valor inicial */
  fechadas = $state({});

  /* pulado sai do mapa por padrão: é o que a pessoa decidiu não fazer, e
     mantê-lo ocupando linha é lembrar de uma decisão já tomada. Quem
     revela é o chip, que também é o que explica a ausência — esconder
     sem explicar faz o tópico parecer inexistente. */
  revelarPulados = $state(false);

  constructor(trilha) {
    this.trilha = trilha;
  }

  /* só no navegador: na pré-renderização não há localStorage, e o
     roadmap nasce zerado até a hidratação */
  carregar() {
    const chave = chaveProgresso(this.trilha);
    this.estados =
      ler(chave) ||
      (this.trilha === "ml" ? ler(CHAVE_LEGADA) : null) ||
      {};
    this.sub = ler(chaveSub(this.trilha)) || {};
    this.fechadas = ler(chaveEtapas(this.trilha)) || {};
    this.revelarPulados = !!(ler(chaveVista(this.trilha)) || {}).revelarPulados;
  }

  alternarPulados() {
    this.revelarPulados = !this.revelarPulados;
    gravar(chaveVista(this.trilha), { revelarPulados: this.revelarPulados });
  }

  /* ----------------------------- tópicos ----------------------------- */

  estadoDe(id) {
    return this.estados[id] || "pendente";
  }

  definir(id, estado) {
    const copia = { ...this.estados };
    if (estado === "pendente") delete copia[id];
    else copia[id] = estado;
    this.estados = copia;
    gravar(chaveProgresso(this.trilha), this.estados);
  }

  ciclar(id) {
    const atual = this.estadoDe(id);
    this.definir(id, CICLO[(CICLO.indexOf(atual) + 1) % CICLO.length]);
  }

  get marcados() {
    return Object.keys(this.estados).length;
  }

  zerar() {
    this.estados = {};
    /* senão os subassuntos remarcariam tudo na primeira propagação */
    this.sub = {};
    gravar(chaveProgresso(this.trilha), this.estados);
    gravar(chaveSub(this.trilha), this.sub);
  }

  /* --------------------------- subassuntos --------------------------- */

  subMarcado(topicoId, texto) {
    return !!this.sub[chaveDoSub(topicoId, texto)];
  }

  contarSub(topicoId, subs) {
    return subs.filter((t) => this.subMarcado(topicoId, t)).length;
  }

  alternarSub(topicoId, texto, subs) {
    const chave = chaveDoSub(topicoId, texto);
    const copia = { ...this.sub };
    if (copia[chave]) delete copia[chave];
    else copia[chave] = 1;
    this.sub = copia;
    gravar(chaveSub(this.trilha), this.sub);
    this.propagar(topicoId, subs);
  }

  /* o estado do tópico segue os subassuntos: o primeiro marcado põe em
     estudo, todos marcados concluem, desmarcar volta. "Pulado" é uma
     decisão explícita e fica imune — senão espiar um subassunto
     desfaria o que a pessoa decidiu pular. */
  propagar(topicoId, subs) {
    if (this.estadoDe(topicoId) === "pulado") return;

    const n = this.contarSub(topicoId, subs);
    const alvo = n === 0 ? "pendente" : n === subs.length ? "feito" : "estudando";

    if (this.estadoDe(topicoId) !== alvo) this.definir(topicoId, alvo);
  }

  /* ----------------------------- sanfona ----------------------------- */

  etapaAberta(etapaId) {
    return !this.fechadas[etapaId];
  }

  /* só o gesto explícito vira preferência; abrir pela busca ou pelo
     índice é navegação, e some quando a busca é limpa */
  alternarEtapa(etapaId, abrir) {
    const copia = { ...this.fechadas };
    if (abrir) delete copia[etapaId];
    else copia[etapaId] = 1;
    this.fechadas = copia;
    gravar(chaveEtapas(this.trilha), this.fechadas);
  }
}
