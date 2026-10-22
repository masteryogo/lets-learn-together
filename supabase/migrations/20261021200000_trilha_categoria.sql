-- 21/10/2026 — as trilhas ganham categoria.
--
-- A mesa era uma pilha indiferenciada: quatro cartas em ordem de
-- chegada, sem dizer como se relacionam. O eixo é o do roadmap.sh —
-- papel ou ferramenta — escolhido não por ser o deles, mas porque
-- sobrevive a qualquer trilha futura: tudo que alguém escreva é um
-- cargo que se quer ter ou uma ferramenta que se quer usar. Eixos de
-- domínio (dados / modelos / aplicações) repartem melhor as quatro de
-- hoje e quebram na primeira trilha de fora do domínio — um Rust, um
-- Git, um System Design não são nenhum dos três.
--
-- Sem default, de propósito: trilha nova tem de dizer o que é, e o
-- insert que esquecer falha em vez de nascer num grupo arbitrário. É a
-- mesma postura do "erro nunca vira vazio" — o pior desfecho aqui seria
-- a carta aparecer na gaveta errada sem ninguém notar.
--
-- O rótulo de cada categoria ("Por papel") não vem daqui: é texto de
-- interface e vive em src/lib/trilhas.js, porque a mesa precisa da ordem
-- das seções antes de qualquer trilha chegar. A consequência assumida:
-- trilha nova numa categoria que já existe não pede deploy; categoria
-- nova pede.

alter table trilha add column categoria text;

update trilha set categoria = 'papel'
 where id in ('ml', 'cv', 'engenharia-dados');

update trilha set categoria = 'ferramenta'
 where id = 'langchain';

alter table trilha
  alter column categoria set not null,
  add check (categoria in ('papel', 'ferramenta'));
