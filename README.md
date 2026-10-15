# lets-learn-together

## Para quem é

- Quem está **migrando para a área** e precisa de um norte.
- **Cientistas de dados, Engenheiros de IA e engenheiros de ML**

## O que você encontra

- **Prioridade** (fundamental, importante, opcional), para decidir com
  honestidade o que dá para pular.
- **Por que existe e quando morde** - a explicação que falta nos checklists.
- **Critérios de conclusão**: marque como feito quando *isso* for verdade, não
  quando o vídeo acabar.
- **Recursos e projetos sugeridos**, porque fundamento sem prática evapora.

Seu progresso fica salvo no próprio navegador, via `localStorage`. Sem conta,
sem servidor, sem ninguém medindo o seu ritmo.

## Rodando

Sem build, sem dependência, sem `npm install`. Abra o `index.html` no navegador,
ou sirva a pasta:

```bash
python -m http.server 8000
```

Troque de trilha pelo seletor no topo ou pela URL: `?trilha=ml` (padrão),
`?trilha=cv`, `?trilha=langchain`.

## Usando o mapa

- **Clique** em um tópico cicla o estado dele (não iniciado → em andamento →
  concluído).
- **Shift + clique** abre o painel lateral com a explicação completa, os
  critérios, os recursos e os projetos daquela etapa.
- A barra no topo acompanha o progresso da trilha inteira.
- Há busca por tópico e alternância entre tema claro e escuro.


## Ajude a popular o roadmap

Este roadmap é uma tentativa de juntar esse conhecimento em um lugar aberto e
em português. Cada coisa que você acrescenta aqui chega a alguém que, agora
mesmo, está procurando exatamente aquilo:

- **Um tópico que faltou.** Procurou no mapa e não achou? Outra pessoa também
  não vai achar. Abre uma issue, mesmo sem propor o texto.
- **Detalhe e critério.** É o que separa um título solto de algo que seja usado por pessoas da área.
- **O recurso que te fez entender.** O que funcionou para você vale mais que a lista canônica que todo mundo linka e ninguém termina.
- **Projetos pequenos** que provam que o tópico foi aprendido.
- **Trilhas novas**: Como inicio, adicionei apenas areas em que ja trabalhei, mas há muito mais a se colocado: **NLP, Robótica, GenAI etc.**

Quanto mais gente contribui, mais a trilha reflete a área de verdade e menos
ela reflete a experiência de uma pessoa só. Não precisa ser especialista: um
tópico, um critério ou um link já colocam alguém alguns passos à frente.

## Como contribuir

Toda contribuição aqui é alguém dizendo "no mundo real não é bem assim":

- **Corrigir um conceito** ou apertar um critério frouxo.
- **Rediscutir prioridades** - o que é fundamental para quem faz NLP não é o
  mesmo para quem faz visão.
- **Trocar um recurso** por um melhor, ou aposentar um desatualizado.
- **Abrir uma trilha nova**: crie `trilhas/<id>/` com um `data.js` e os
  `conteudo-*.js`, e registre o id no manifesto em `trilhas.js`.

Um tópico tem esta cara, mexer nele é editar cinco campos:

```js
{
  id: "validacao-cruzada",       // estável: é a chave do seu progresso salvo
  titulo: "Validação cruzada",
  prioridade: "fundamental",     // fundamental | importante | opcional
  desc: "A linha do checklist - o quê.",
  detalhe: "O porquê, e quando isso morde na prática.",
}
```

Mantenha o `id` quando editar um tópico existente: é ele que preserva o
progresso de quem já marcou aquele item.

O nome do repositório é literal. Se você aprendeu algo da maneira difícil, essa
cicatriz vale mais que um link de curso.