-- Prática completa do módulo Primeiros passos: cada tópico tem uma competência,
-- um quiz e uma atividade aplicada. O projeto fecha o módulo com revisão humana.

insert into public.competencia (id, trilha, topico_id, titulo, descricao, criterio, ordem) values
  ('py-comp-ini-01', 'python', 'py-ini-01', 'Explicar o que é um programa', 'Compreende programa como instruções precisas para automatizar uma tarefa.', 'Descreve uma tarefa cotidiana como passos claros que um computador poderia seguir.', 10),
  ('py-comp-executar', 'python', 'py-ini-08', 'Executar um programa simples', 'Executa um script e explica sua saída.', 'Roda um arquivo próprio pelo terminal e altera uma mensagem sem ajuda.', 10),
  ('py-comp-ini-02', 'python', 'py-ini-02', 'Rastrear instruções em sequência', 'Explica como instruções em ordem produzem uma saída.', 'Acompanha a execução linha por linha e prevê a saída sem pular etapas.', 20),
  ('py-comp-ini-03', 'python', 'py-ini-03', 'Descrever um algoritmo', 'Divide uma tarefa em passos claros, finitos e verificáveis.', 'Escreve passos que outra pessoa consegue executar sem adivinhar.', 30),
  ('py-comp-ini-04', 'python', 'py-ini-04', 'Planejar uma solução com lógica', 'Representa sequência, decisão e repetição antes de codificar.', 'Transforma um problema simples em passos e identifica a ordem correta.', 40),
  ('py-comp-ini-05', 'python', 'py-ini-05', 'Escolher Python para um problema', 'Reconhece usos e limites básicos da linguagem.', 'Relaciona um caso de uso a Python e identifica quando a escolha depende do contexto.', 50),
  ('py-comp-ini-06', 'python', 'py-ini-06', 'Verificar a instalação do Python', 'Confirma que o interpretador está disponível no ambiente.', 'Executa python --version ou python3 --version e reconhece uma instalação funcional.', 60),
  ('py-comp-ini-07', 'python', 'py-ini-07', 'Executar um arquivo Python pelo terminal', 'Organiza um arquivo .py e o executa a partir da pasta do projeto.', 'Salva um arquivo e o executa no terminal sem depender do botão do editor.', 70),
  ('py-comp-entrada', 'python', 'py-ini-09', 'Receber entrada textual', 'Lê uma resposta de quem usa o programa.', 'Usa input e inclui o valor recebido numa saída compreensível.', 90),
  ('py-comp-ini-10', 'python', 'py-ini-10', 'Rastrear a ordem de execução', 'Prevê o resultado de instruções executadas em sequência.', 'Anota a saída na ordem correta e explica como a troca de linhas a altera.', 100)
on conflict (id) do update set
  trilha = excluded.trilha,
  topico_id = excluded.topico_id,
  titulo = excluded.titulo,
  descricao = excluded.descricao,
  criterio = excluded.criterio,
  ordem = excluded.ordem;

insert into public.atividade (id, trilha, topico_id, tipo, titulo, enunciado, configuracao, dificuldade, ordem, publicada) values
  ('py-quiz-ini-01', 'python', 'py-ini-01', 'quiz', 'O que é um programa?', 'Uma pessoa quer automatizar uma tarefa repetitiva. Qual descrição melhor representa um programa?', '{"multipla":false,"alternativas":[{"id":"a","texto":"Uma sequência de instruções que descreve ao computador como realizar uma tarefa."},{"id":"b","texto":"Uma máquina que adivinha o que a pessoa deseja."},{"id":"c","texto":"Qualquer arquivo salvo no computador."},{"id":"d","texto":"Uma lista de palavras sem ordem definida."}]}'::jsonb, 'iniciante', 10, true),
  ('py-completar-ini-01', 'python', 'py-ini-01', 'completar', 'Complete a ideia de programa', 'Uma tarefa automatizada precisa ser descrita com passos que o computador consiga seguir.', '{"lacunas":[{"id":"passos","rotulo":"Complete: um programa é uma sequência de ___"}]}'::jsonb, 'iniciante', 20, true),
  ('py-quiz-ini-02', 'python', 'py-ini-02', 'quiz', 'A máquina lê a sequência', 'Em um script com três instruções, o que normalmente acontece quando ele é executado?', '{"multipla":false,"alternativas":[{"id":"a","texto":"As instruções são executadas em ordem, uma após a outra."},{"id":"b","texto":"O computador escolhe uma ordem diferente a cada execução."},{"id":"c","texto":"Somente a última instrução é executada."},{"id":"d","texto":"O computador entende a intenção mesmo quando faltam instruções."}]}'::jsonb, 'iniciante', 10, true),
  ('py-saida-ini-02', 'python', 'py-ini-02', 'saida', 'Preveja a saída em ordem', 'Leia de cima para baixo. O que aparece no terminal?', '{"codigo":"print(\"Primeiro\")\nprint(\"Depois\")","rotuloResposta":"Escreva as duas linhas na ordem exibida"}'::jsonb, 'iniciante', 20, true),
  ('py-quiz-ini-03', 'python', 'py-ini-03', 'quiz', 'Um algoritmo sem adivinhação', 'Qual conjunto de passos é um algoritmo mais claro para preparar uma bebida?', '{"multipla":false,"alternativas":[{"id":"a","texto":"Faça do jeito normal e termine quando estiver bom."},{"id":"b","texto":"Coloque água na chaleira, aqueça a água, despeje na xícara e sirva."},{"id":"c","texto":"Bebida, xícara, água."},{"id":"d","texto":"Comece pelo último passo e descubra o restante."}]}'::jsonb, 'iniciante', 10, true),
  ('py-completar-ini-03', 'python', 'py-ini-03', 'completar', 'Complete as etapas do algoritmo', 'Um programa simples costuma receber dados, transformá-los e apresentar um resultado.', '{"lacunas":[{"id":"processar","rotulo":"Complete: entrada, ___ e saída"}]}'::jsonb, 'iniciante', 20, true),
  ('py-quiz-ini-04', 'python', 'py-ini-04', 'quiz', 'Lógica antes da sintaxe', 'Antes de escolher comandos Python para decidir se uma pessoa pode entrar, o que ajuda a planejar a solução?', '{"multipla":false,"alternativas":[{"id":"a","texto":"Descrever em português a condição e os caminhos possíveis."},{"id":"b","texto":"Digitar vários comandos até um deles funcionar."},{"id":"c","texto":"Memorizar toda a documentação do Python."},{"id":"d","texto":"Pular o planejamento porque pseudocódigo precisa compilar."}]}'::jsonb, 'iniciante', 10, true),
  ('py-completar-ini-04', 'python', 'py-ini-04', 'completar', 'Monte um pseudocódigo', 'Organize a ideia de cumprimentar alguém antes de escrever o programa.', '{"lacunas":[{"id":"passo1","rotulo":"Primeiro: ___ o nome"},{"id":"passo2","rotulo":"Depois: ___ uma saudação com esse nome"}]}'::jsonb, 'iniciante', 20, true),
  ('py-quiz-ini-05', 'python', 'py-ini-05', 'quiz', 'Onde Python pode ajudar?', 'Qual afirmação sobre Python é mais equilibrada?', '{"multipla":false,"alternativas":[{"id":"a","texto":"É usada em áreas como automação, web, dados e ensino, mas não é a melhor escolha para todo problema."},{"id":"b","texto":"Só serve para fazer páginas web."},{"id":"c","texto":"Resolve qualquer problema sem bibliotecas ou planejamento."},{"id":"d","texto":"É uma ferramenta exclusiva para criar jogos."}]}'::jsonb, 'iniciante', 10, true),
  ('py-completar-ini-05', 'python', 'py-ini-05', 'completar', 'Escolha uma aplicação', 'Python pode automatizar uma tarefa repetitiva como organizar arquivos. Complete a justificativa.', '{"lacunas":[{"id":"uso","rotulo":"Python pode ser usada em ___"}]}'::jsonb, 'iniciante', 20, true),
  ('py-quiz-ini-06', 'python', 'py-ini-06', 'quiz', 'Como confirmar a instalação?', 'Depois de instalar Python, qual é uma forma simples de verificar se o interpretador responde no terminal?', '{"multipla":false,"alternativas":[{"id":"a","texto":"Executar python --version ou python3 --version."},{"id":"b","texto":"Criar uma conta em uma rede social."},{"id":"c","texto":"Abrir qualquer arquivo de texto."},{"id":"d","texto":"Digitar print no navegador."}]}'::jsonb, 'iniciante', 10, true),
  ('py-completar-ini-06', 'python', 'py-ini-06', 'completar', 'Complete o comando de verificação', 'No terminal, o nome pode variar conforme o sistema. Complete com um comando válido.', '{"lacunas":[{"id":"comando","rotulo":"Comando para consultar a versão"}]}'::jsonb, 'iniciante', 20, true),
  ('py-quiz-ini-07', 'python', 'py-ini-07', 'quiz', 'Editor, arquivo e terminal', 'Qual fluxo permite executar um script Python salvo como ola.py?', '{"multipla":false,"alternativas":[{"id":"a","texto":"Salvar ola.py, abrir o terminal na pasta do projeto e executar python ola.py (ou python3 ola.py)."},{"id":"b","texto":"Renomear o arquivo para ola.docx e abrir uma planilha."},{"id":"c","texto":"Escrever o código no nome da pasta."},{"id":"d","texto":"Abrir o terminal sem salvar o arquivo e esperar que ele apareça."}]}'::jsonb, 'iniciante', 10, true),
  ('py-erro-ini-07', 'python', 'py-ini-07', 'erro', 'Encontre o problema no fluxo', 'Uma pessoa salvou o arquivo como ola.py, mas o terminal está aberto em outra pasta e informa que não encontrou o arquivo. Qual é o primeiro passo?', '{"multipla":false,"alternativas":[{"id":"a","texto":"Abrir o terminal na pasta onde ola.py foi salvo ou navegar até ela."},{"id":"b","texto":"Reinstalar o computador."},{"id":"c","texto":"Apagar a extensão .py."},{"id":"d","texto":"Trocar o nome para qualquer palavra sem verificar a pasta."}]}'::jsonb, 'iniciante', 20, true),
  ('py-quiz-print', 'python', 'py-ini-08', 'quiz', 'Primeira saída', 'Qual chamada mostra o texto Olá na tela?', '{"multipla":false,"alternativas":[{"id":"a","texto":"print(Olá)"},{"id":"b","texto":"print(\"Olá\")"},{"id":"c","texto":"input(\"Olá\")"}]}'::jsonb, 'iniciante', 10, true),
  ('py-completar-ini-08', 'python', 'py-ini-08', 'completar', 'Complete seu primeiro print', 'Complete o código para exibir a mensagem Olá, mundo! no terminal.', '{"codigo":"___(\"Olá, mundo!\")","lacunas":[{"id":"funcao","rotulo":"Função que exibe a mensagem"}]}'::jsonb, 'iniciante', 20, true),
  ('py-quiz-ini-09', 'python', 'py-ini-09', 'quiz', 'O que input devolve?', 'Ao executar nome = input("Seu nome: "), qual tipo de valor nome recebe neste módulo?', '{"multipla":false,"alternativas":[{"id":"a","texto":"Texto (str), mesmo que a pessoa digite algarismos."},{"id":"b","texto":"Sempre um número inteiro."},{"id":"c","texto":"Sempre verdadeiro ou falso."},{"id":"d","texto":"Uma lista de respostas."}]}'::jsonb, 'iniciante', 10, true),
  ('py-desafio-ini-09', 'python', 'py-ini-09', 'desafio', 'Cumprimente quem está usando', 'Escreva um programa que leia um nome e mostre uma saudação no formato Olá, Ana! Use a resposta de input na mensagem. O avaliador testará nomes diferentes.', '{"codigoInicial":"nome = input()\n\n# Use o nome recebido para criar a saudação.\n","entradaExemplo":"Ana\n","saidaExemplo":"Olá, Ana!\n","linguagem":"python","limiteCaracteres":12000}'::jsonb, 'iniciante', 20, true),
  ('py-quiz-ini-10', 'python', 'py-ini-10', 'quiz', 'A ordem altera o resultado', 'O que muda quando duas instruções de saída trocam de lugar?', '{"multipla":false,"alternativas":[{"id":"a","texto":"A ordem em que as mensagens aparecem no terminal."},{"id":"b","texto":"O computador deixa de executar qualquer instrução."},{"id":"c","texto":"O nome da linguagem Python."},{"id":"d","texto":"Nada: a ordem nunca importa."}]}'::jsonb, 'iniciante', 10, true),
  ('py-saida-ini-10', 'python', 'py-ini-10', 'saida', 'Rastreie a sequência', 'Anote exatamente a ordem em que as mensagens aparecem.', '{"codigo":"print(\"1. Abra o caderno\")\nprint(\"2. Escreva a ideia\")\nprint(\"3. Revise os passos\")","rotuloResposta":"Saída, uma linha por vez"}'::jsonb, 'iniciante', 20, true),
  ('py-projeto-apresentacao', 'python', 'py-ini-10', 'projeto', 'Miniprojeto — apresentação pessoal interativa', 'Crie seu primeiro programa interativo de terminal. Ele deve perguntar seu nome, sua cidade e o que deseja aprender, depois apresentar as respostas de forma acolhedora.', '{"objetivo":"Juntar execução, print, input e sequência em um programa pequeno que você consegue explicar.","requisitos":[{"id":"nome","titulo":"Perguntar o nome","descricao":"Usar input() e guardar a resposta em uma variável."},{"id":"cidade","titulo":"Perguntar a cidade","descricao":"Fazer uma segunda pergunta e guardar a resposta."},{"id":"objetivo","titulo":"Perguntar o objetivo de estudo","descricao":"Ler o que a pessoa quer aprender com Python."},{"id":"apresentacao","titulo":"Exibir uma apresentação","descricao":"Usar print() para mostrar as três respostas em uma ordem fácil de ler."},{"id":"execucao","titulo":"Executar e explicar","descricao":"Rodar o arquivo .py pelo terminal e explicar, com suas palavras, o que cada parte faz."}],"criterios":[{"id":"interacao","titulo":"Interação completa","descricao":"As três perguntas aparecem e as respostas da pessoa são usadas na apresentação."},{"id":"execucao","titulo":"Execução reproduzível","descricao":"O arquivo roda sem erro pelo terminal seguindo as instruções de entrega."},{"id":"compreensao","titulo":"Compreensão","descricao":"O resumo explica o papel de input(), das variáveis e de print()."}],"entregaveis":["Link público de um repositório GitHub, GitLab ou Bitbucket ou arquivo .zip","Resumo de pelo menos 20 caracteres explicando como executou e o que aprendeu","Autoavaliação dos requisitos realmente concluídos"],"instrucoes":"Envie o link público do repositório ou o arquivo .zip do projeto, escreva um resumo de pelo menos 20 caracteres e marque apenas o que verificou. A equipe revisará a entrega e dará feedback para seu próximo passo.","limiteResumo":2000,"plataformas":["github.com","gitlab.com","bitbucket.com"]}'::jsonb, 'iniciante', 30, true)
on conflict (id) do update set
  trilha = excluded.trilha,
  topico_id = excluded.topico_id,
  tipo = excluded.tipo,
  titulo = excluded.titulo,
  enunciado = excluded.enunciado,
  configuracao = excluded.configuracao,
  dificuldade = excluded.dificuldade,
  ordem = excluded.ordem,
  publicada = excluded.publicada,
  atualizado_em = now();

insert into public.atividade_gabarito (atividade_id, configuracao) values
  ('py-quiz-ini-01', '{"corretas":["a"],"explicacao":"Um programa descreve instruções para uma tarefa. O computador não adivinha a intenção: ele segue o que foi especificado."}'::jsonb),
  ('py-completar-ini-01', '{"lacunas":{"passos":["instruções","instrucoes"]},"explicacao":"Um programa é uma sequência de instruções precisas. A máquina segue esses passos; por isso, dividir uma tarefa em partes claras ajuda a automatizá-la."}'::jsonb),
  ('py-quiz-ini-02', '{"corretas":["a"],"explicacao":"Neste começo, pense no programa como uma lista lida de cima para baixo. Acompanhar uma linha por vez ajuda a descobrir onde o resultado mudou."}'::jsonb),
  ('py-saida-ini-02', '{"aceitas":["Primeiro\nDepois","Primeiro\nDepois\n"],"explicacao":"O primeiro print é executado antes do segundo. Cada chamada de print termina a linha, então as mensagens aparecem em linhas separadas e nessa ordem."}'::jsonb),
  ('py-quiz-ini-03', '{"corretas":["b"],"explicacao":"Os passos estão numa ordem finita e descrevem ações observáveis. Expressões como “do jeito normal” exigem adivinhação e deixam o algoritmo ambíguo."}'::jsonb),
  ('py-completar-ini-03', '{"lacunas":{"processar":["processamento","processar"]},"explicacao":"Muitos programas recebem uma entrada, processam os dados e apresentam uma saída. Nomear essas partes facilita planejar o algoritmo."}'::jsonb),
  ('py-quiz-ini-04', '{"corretas":["a"],"explicacao":"Descrever a condição e os caminhos em linguagem simples permite verificar a lógica antes de lidar com a sintaxe do Python."}'::jsonb),
  ('py-completar-ini-04', '{"lacunas":{"passo1":["perguntar","receber","ler"],"passo2":["mostrar","exibir","apresentar"]},"explicacao":"Primeiro obtemos a informação; depois usamos essa informação para montar e apresentar a saudação. Pseudocódigo organiza o raciocínio, sem exigir sintaxe de uma linguagem."}'::jsonb),
  ('py-quiz-ini-05', '{"corretas":["a"],"explicacao":"Python é versátil e muito usada, mas toda tecnologia tem limites. A escolha deve considerar o problema, o ambiente e as ferramentas disponíveis."}'::jsonb),
  ('py-completar-ini-05', '{"lacunas":{"uso":["automação","automacao","dados","web","ensino","ciência","ciencia"]},"explicacao":"Python tem aplicações em áreas diversas, como automação, web, análise de dados e ensino. O importante é relacionar a ferramenta à tarefa real."}'::jsonb),
  ('py-quiz-ini-06', '{"corretas":["a"],"explicacao":"O terminal informa a versão quando o interpretador está acessível. Alguns sistemas usam o comando python e outros, python3."}'::jsonb),
  ('py-completar-ini-06', '{"lacunas":{"comando":["python --version","python3 --version"]},"explicacao":"Os dois comandos são comuns. Se nenhum funcionar, confira a instalação e se o interpretador foi adicionado ao PATH do sistema."}'::jsonb),
  ('py-quiz-ini-07', '{"corretas":["a"],"explicacao":"O arquivo precisa estar salvo e o terminal precisa apontar para a pasta correta. O comando chama o interpretador e passa o arquivo a executar."}'::jsonb),
  ('py-erro-ini-07', '{"corretas":["a"],"explicacao":"O erro indica que o terminal não está encontrando o arquivo naquela pasta. Navegue até a pasta do projeto ou abra um terminal nela antes de executar o script."}'::jsonb),
  ('py-quiz-print', '{"corretas":["b"],"explicacao":"print recebe um texto entre aspas e o exibe. input espera uma resposta; sem aspas, Olá seria interpretado como um nome de variável."}'::jsonb),
  ('py-completar-ini-08', '{"lacunas":{"funcao":["print"]},"explicacao":"print() exibe o texto passado entre parênteses. Aspas indicam que Olá, mundo! é texto literal, e não o nome de uma variável."}'::jsonb),
  ('py-quiz-ini-09', '{"corretas":["a"],"explicacao":"input() devolve texto. Mesmo que a pessoa digite 25, o valor recebido é texto nesta etapa; a conversão para número será estudada depois."}'::jsonb),
  ('py-desafio-ini-09', '{"testes":[{"entrada":"Ana\n","saida":"Olá, Ana!\n"},{"entrada":"Ravi\n","saida":"Olá, Ravi!\n"},{"entrada":"Lia Maria\n","saida":"Olá, Lia Maria!\n"}],"explicacao":"Guarde o texto retornado por input() e use esse valor na mensagem exibida por print(). A solução deve aproveitar a entrada, não repetir um nome fixo."}'::jsonb),
  ('py-quiz-ini-10', '{"corretas":["a"],"explicacao":"Cada print é executado na posição em que aparece. Trocar as instruções troca a ordem das mensagens; rastrear essa sequência é uma forma simples de depuração."}'::jsonb),
  ('py-saida-ini-10', '{"aceitas":["1. Abra o caderno\n2. Escreva a ideia\n3. Revise os passos","1. Abra o caderno\n2. Escreva a ideia\n3. Revise os passos\n"],"explicacao":"A execução começa na primeira linha e segue para baixo. Cada print mostra uma mensagem e termina a linha antes da próxima instrução."}'::jsonb)
on conflict (atividade_id) do update set
  configuracao = excluded.configuracao,
  atualizado_em = now();

insert into public.atividade_competencia (atividade_id, competencia_id) values
  ('py-quiz-ini-01', 'py-comp-ini-01'), ('py-completar-ini-01', 'py-comp-ini-01'),
  ('py-quiz-ini-02', 'py-comp-ini-02'), ('py-saida-ini-02', 'py-comp-ini-02'),
  ('py-quiz-ini-03', 'py-comp-ini-03'), ('py-completar-ini-03', 'py-comp-ini-03'),
  ('py-quiz-ini-04', 'py-comp-ini-04'), ('py-completar-ini-04', 'py-comp-ini-04'),
  ('py-quiz-ini-05', 'py-comp-ini-05'), ('py-completar-ini-05', 'py-comp-ini-05'),
  ('py-quiz-ini-06', 'py-comp-ini-06'), ('py-completar-ini-06', 'py-comp-ini-06'),
  ('py-quiz-ini-07', 'py-comp-ini-07'), ('py-erro-ini-07', 'py-comp-ini-07'),
  ('py-quiz-print', 'py-comp-executar'), ('py-completar-ini-08', 'py-comp-executar'),
  ('py-quiz-ini-09', 'py-comp-entrada'), ('py-desafio-ini-09', 'py-comp-entrada'),
  ('py-quiz-ini-10', 'py-comp-ini-10'), ('py-saida-ini-10', 'py-comp-ini-10')
on conflict do nothing;

insert into public.competencia (id, trilha, topico_id, titulo, descricao, criterio, ordem)
values (
  'py-comp-projeto-apresentacao', 'python', 'py-ini-10',
  'Criar uma apresentação interativa no terminal',
  'Combina input(), variáveis e print() em uma pequena experiência interativa.',
  'Outra pessoa executa o arquivo, responde às três perguntas e vê suas respostas apresentadas; a pessoa estudante consegue explicar cada etapa.',
  110
)
on conflict (id) do update set
  titulo = excluded.titulo,
  descricao = excluded.descricao,
  criterio = excluded.criterio,
  ordem = excluded.ordem;

insert into public.atividade_competencia (atividade_id, competencia_id)
values ('py-projeto-apresentacao', 'py-comp-projeto-apresentacao')
on conflict do nothing;

-- O bucket continua privado: apenas amplia o projeto de destino permitido.
drop policy if exists "Alunos enviam seus arquivos de projeto" on storage.objects;
create policy "Alunos enviam seus arquivos de projeto"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'entregas-projetos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and (storage.foldername(name))[2] in ('py-projeto-financeiro', 'py-projeto-apresentacao')
  and storage.extension(name) = 'zip'
);
