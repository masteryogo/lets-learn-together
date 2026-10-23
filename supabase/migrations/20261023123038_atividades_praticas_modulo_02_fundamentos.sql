-- Quiz e prática aplicada para cada tópico de Fundamentos do Python.
-- Os três exercícios preexistentes são preservados e associados às mesmas competências.

insert into public.competencia (id, trilha, topico_id, titulo, descricao, criterio, ordem) values
  ('py-comp-variaveis', 'python', 'py-fun-01', 'Nomear e atualizar valores', 'Usa variáveis com nomes claros e acompanha a mudança de seus valores.', 'Escreve um programa curto que atribui, atualiza e exibe valores sem confundir o nome com o conteúdo.', 10),
  ('py-comp-tipos', 'python', 'py-fun-02', 'Distinguir tipos básicos', 'Reconhece texto, inteiro, decimal, booleano e ausência.', 'Prevê o tipo e a operação válida para valores simples.', 20),
  ('py-comp-operadores', 'python', 'py-fun-03', 'Calcular expressões', 'Aplica operadores aritméticos e precedência.', 'Prevê a saída de uma expressão e justifica a ordem do cálculo.', 30),
  ('py-comp-comparacoes', 'python', 'py-fun-04', 'Combinar comparações lógicas', 'Usa comparações e and, or, not para produzir condições verdadeiras ou falsas.', 'Testa uma condição com casos que devem passar e não passar.', 40),
  ('py-comp-conversao', 'python', 'py-fun-05', 'Converter valores de entrada', 'Converte texto para números ou números para texto quando a operação exige.', 'Converte uma entrada antes do cálculo e reconhece que um texto inválido não vira número automaticamente.', 50),
  ('py-comp-strings', 'python', 'py-fun-06', 'Montar e tratar mensagens', 'Combina texto, f-strings e métodos básicos para limpar entradas.', 'Monta uma mensagem com valores e remove espaços indesejados de uma entrada textual.', 60),
  ('py-comp-condicao', 'python', 'py-fun-07', 'Tomar decisões com condições', 'Escolhe um caminho a partir de uma comparação.', 'Escreve uma condição válida e cobre o caso alternativo.', 70),
  ('py-comp-repeticao', 'python', 'py-fun-08', 'Repetir um processo', 'Percorre valores com for e range() e acumula resultados.', 'Usa for para percorrer uma sequência e testa limites como zero e um.', 80),
  ('py-comp-while', 'python', 'py-fun-09', 'Repetir enquanto uma condição for verdadeira', 'Usa while quando a quantidade de tentativas depende das entradas.', 'Atualiza o estado do laço para alcançar a parada e demonstra que não há repetição infinita.', 90),
  ('py-comp-validacao', 'python', 'py-fun-10', 'Validar entradas em um laço', 'Usa break, continue e repetição para lidar com entradas inválidas.', 'Pede novamente quando a entrada não atende à regra e explica quando o laço termina.', 100)
on conflict (id) do update set
  trilha = excluded.trilha,
  topico_id = excluded.topico_id,
  titulo = excluded.titulo,
  descricao = excluded.descricao,
  criterio = excluded.criterio,
  ordem = excluded.ordem;

insert into public.atividade (id, trilha, topico_id, tipo, titulo, enunciado, configuracao, dificuldade, ordem, publicada) values
  ('py-quiz-fun-01', 'python', 'py-fun-01', 'quiz', 'O nome aponta para um valor', 'Depois destas instruções, qual valor está guardado em total?', '{"multipla":false,"alternativas":[{"id":"a","texto":"12"},{"id":"b","texto":"7"},{"id":"c","texto":"total"},{"id":"d","texto":"O valor não pode mudar depois da primeira atribuição."}]}'::jsonb, 'iniciante', 10, true),
  ('py-saida-fun-01', 'python', 'py-fun-01', 'saida', 'Acompanhe a atualização', 'Leia cada atribuição em ordem e informe o que aparece.', '{"codigo":"total = 5\ntotal = total + 2\nprint(total)","rotuloResposta":"Saída exibida"}'::jsonb, 'iniciante', 20, true),
  ('py-quiz-fun-02', 'python', 'py-fun-02', 'quiz', 'Texto ou número?', 'Qual afirmação distingue corretamente os dois valores?', '{"multipla":false,"alternativas":[{"id":"a","texto":"12 é inteiro; \"12\" é texto."},{"id":"b","texto":"12 e \"12\" são sempre o mesmo tipo."},{"id":"c","texto":"None significa o número zero."},{"id":"d","texto":"True é um texto escrito sem aspas."}]}'::jsonb, 'iniciante', 10, true),
  ('py-erro-fun-02', 'python', 'py-fun-02', 'erro', 'Encontre a incompatibilidade de tipos', 'O programa tenta juntar um texto a um número. Qual explicação ajuda a corrigir o problema?', '{"multipla":false,"alternativas":[{"id":"a","texto":"\"18\" é texto; é preciso converter para int antes de somar 2."},{"id":"b","texto":"O operador + nunca funciona em Python."},{"id":"c","texto":"A variável idade precisa começar com letra maiúscula."},{"id":"d","texto":"print só aceita valores booleanos."}]}'::jsonb, 'iniciante', 20, true),
  ('py-quiz-fun-03', 'python', 'py-fun-03', 'quiz', 'Escolha o operador', 'Qual operador calcula o resto da divisão inteira de 17 por 5?', '{"multipla":false,"alternativas":[{"id":"a","texto":"%"},{"id":"b","texto":"//"},{"id":"c","texto":"**"},{"id":"d","texto":"/"}]}'::jsonb, 'iniciante', 10, true),
  ('py-completar-fun-03', 'python', 'py-fun-03', 'completar', 'Divisão inteira', 'Complete o código para exibir quantas vezes 5 cabe inteiramente em 17.', '{"codigo":"print(17 ___ 5)","lacunas":[{"id":"operador","rotulo":"Operador de divisão inteira"}]}'::jsonb, 'iniciante', 20, true),
  ('py-quiz-fun-04', 'python', 'py-fun-04', 'quiz', 'Combine duas condições', 'Uma pessoa precisa ter 18 anos ou mais e apresentar autorização. Qual expressão exige as duas condições?', '{"multipla":false,"alternativas":[{"id":"a","texto":"idade >= 18 and tem_autorizacao"},{"id":"b","texto":"idade >= 18 or tem_autorizacao"},{"id":"c","texto":"idade = 18 and tem_autorizacao"},{"id":"d","texto":"not idade and tem_autorizacao"}]}'::jsonb, 'iniciante', 10, true),
  ('py-completar-fun-04', 'python', 'py-fun-04', 'completar', 'Complete a condição lógica', 'A pessoa só pode entrar se tiver 18 anos ou mais e estiver acompanhada.', '{"codigo":"idade >= 18 ___ acompanhada","lacunas":[{"id":"conector","rotulo":"Conector que exige as duas condições"}]}'::jsonb, 'iniciante', 20, true),
  ('py-quiz-fun-05', 'python', 'py-fun-05', 'quiz', 'Converta antes de calcular', 'input() recebeu o texto 12. O que permite somar esse valor ao número 3?', '{"multipla":false,"alternativas":[{"id":"a","texto":"Converter para inteiro com int() antes da soma."},{"id":"b","texto":"Usar str() e somar os caracteres como números."},{"id":"c","texto":"Chamar print() duas vezes."},{"id":"d","texto":"Remover os parênteses de input()."}]}'::jsonb, 'iniciante', 10, true),
  ('py-saida-fun-05', 'python', 'py-fun-05', 'saida', 'Preveja uma conversão', 'Qual valor numérico aparece?', '{"codigo":"preco = int(\"12\")\nprint(preco + 3)","rotuloResposta":"Número exibido"}'::jsonb, 'iniciante', 20, true),
  ('py-quiz-fun-06', 'python', 'py-fun-06', 'quiz', 'Monte uma mensagem dinâmica', 'Qual recurso permite inserir o valor de nome dentro de uma frase de maneira legível?', '{"multipla":false,"alternativas":[{"id":"a","texto":"Uma f-string, como f\"Olá, {nome}!\"."},{"id":"b","texto":"Somente concatenar números com +."},{"id":"c","texto":"Usar input() para imprimir automaticamente o nome."},{"id":"d","texto":"Escrever o nome da variável entre aspas simples."}]}'::jsonb, 'iniciante', 10, true),
  ('py-completar-fun-06', 'python', 'py-fun-06', 'completar', 'Insira o nome na f-string', 'Complete o código para que a mensagem use o valor guardado na variável nome.', '{"codigo":"nome = \"Bia\"\nprint(f\"Olá, {___}!\")","lacunas":[{"id":"variavel","rotulo":"Nome da variável a interpolar"}]}'::jsonb, 'iniciante', 20, true),
  ('py-saida-fun-06', 'python', 'py-fun-06', 'saida', 'Remova espaços extras', 'O método strip remove espaços das extremidades. Qual palavra será exibida?', '{"codigo":"nome = \"  Bia  \"\nprint(nome.strip())","rotuloResposta":"Texto exibido"}'::jsonb, 'iniciante', 30, true),
  ('py-quiz-fun-07', 'python', 'py-fun-07', 'quiz', 'Limite da condição', 'Com idade = 18, qual condição também considera a pessoa maior de idade?', '{"multipla":false,"alternativas":[{"id":"a","texto":"idade >= 18"},{"id":"b","texto":"idade > 18"},{"id":"c","texto":"idade = 18"},{"id":"d","texto":"idade < 18"}]}'::jsonb, 'iniciante', 5, true),
  ('py-quiz-fun-08', 'python', 'py-fun-08', 'quiz', 'Quando usar for?', 'Você sabe que precisa executar uma ação exatamente cinco vezes. Qual construção é mais direta?', '{"multipla":false,"alternativas":[{"id":"a","texto":"for com range(5)."},{"id":"b","texto":"Uma sequência de cinco cópias do mesmo comando."},{"id":"c","texto":"while sem alterar nenhuma condição."},{"id":"d","texto":"if, porque ele repete o bloco."}]}'::jsonb, 'iniciante', 10, true),
  ('py-desafio-fun-08', 'python', 'py-fun-08', 'desafio', 'Some de 1 até N', 'Leia um número inteiro N e mostre a soma de todos os números de 1 até N. Use um laço for e um acumulador; não use sum(). Se N for 0, mostre 0.', '{"codigoInicial":"n = int(input())\ntotal = 0\n\n# Percorra os números de 1 até n e atualize total.\n\nprint(total)","entradaExemplo":"4\n","saidaExemplo":"10\n","linguagem":"python","limiteCaracteres":12000}'::jsonb, 'iniciante', 20, true),
  ('py-quiz-fun-09', 'python', 'py-fun-09', 'quiz', 'Uma repetição com parada', 'O que precisa acontecer dentro de um while para que ele não repita para sempre?', '{"multipla":false,"alternativas":[{"id":"a","texto":"Algum valor usado na condição precisa mudar para que ela possa se tornar falsa."},{"id":"b","texto":"A condição deve permanecer verdadeira para sempre."},{"id":"c","texto":"Todo while precisa conter um for."},{"id":"d","texto":"A variável de controle nunca pode receber outro valor."}]}'::jsonb, 'iniciante', 10, true),
  ('py-desafio-fun-09', 'python', 'py-fun-09', 'desafio', 'Peça a senha até acertar', 'Leia tentativas de senha até que a pessoa digite python. Depois, mostre Acesso liberado. Use while; não imprima mensagens para cada tentativa.', '{"codigoInicial":"senha = input()\n\n# Continue lendo enquanto a senha estiver incorreta.\n\nprint(\"Acesso liberado\")","entradaExemplo":"oi\npython\n","saidaExemplo":"Acesso liberado\n","linguagem":"python","limiteCaracteres":12000}'::jsonb, 'iniciante', 20, true),
  ('py-quiz-fun-10', 'python', 'py-fun-10', 'quiz', 'Valide sem travar o programa', 'Um programa só aceita uma quantidade maior que zero. Qual estratégia é mais segura para uma entrada fora dessa regra?', '{"multipla":false,"alternativas":[{"id":"a","texto":"Informar que a entrada é inválida e pedir novamente até receber uma válida."},{"id":"b","texto":"Tratar qualquer valor como válido sem conferir."},{"id":"c","texto":"Encerrar sem explicar o motivo."},{"id":"d","texto":"Repetir o mesmo valor inválido para sempre."}]}'::jsonb, 'iniciante', 10, true),
  ('py-completar-fun-10', 'python', 'py-fun-10', 'completar', 'Interrompa o laço no momento certo', 'Complete o comando para parar a repetição quando o número 4 for encontrado.', '{"codigo":"for numero in range(1, 6):\n    if numero == 4:\n        ___\n    print(numero)","lacunas":[{"id":"comando","rotulo":"Comando que encerra o laço"}]}'::jsonb, 'iniciante', 20, true),
  ('py-completar-fun-10-continue', 'python', 'py-fun-10', 'completar', 'Pule uma repetição', 'Complete o comando para não exibir o número 2 e continuar o laço com os valores seguintes.', '{"codigo":"for numero in range(5):\n    if numero == 2:\n        ___\n    print(numero)","lacunas":[{"id":"comando","rotulo":"Comando que pula para a próxima repetição"}]}'::jsonb, 'iniciante', 30, true),
  ('py-projeto-calculadora', 'python', 'py-fun-10', 'projeto', 'Projeto — calculadora interativa', 'Crie uma calculadora de terminal que receba dois números e uma operação, valide a escolha e apresente o resultado com uma mensagem clara.', '{"objetivo":"Praticar variáveis, entrada, conversão, operadores, decisões e validação em um programa útil.","requisitos":[{"id":"entradas","titulo":"Receber os valores","descricao":"Pedir dois números e converter o texto recebido para um tipo numérico apropriado."},{"id":"operacao","titulo":"Escolher a operação","descricao":"Aceitar pelo menos soma, subtração, multiplicação e divisão."},{"id":"calculo","titulo":"Calcular o resultado","descricao":"Usar a operação selecionada para calcular e apresentar o resultado."},{"id":"validacao","titulo":"Validar entradas","descricao":"Informar quando a operação não é reconhecida e impedir divisão por zero."},{"id":"mensagem","titulo":"Exibir uma resposta clara","descricao":"Mostrar os valores, a operação e o resultado de forma compreensível."}],"criterios":[{"id":"corretude","titulo":"Cálculos corretos","descricao":"As quatro operações produzem resultados corretos para entradas válidas."},{"id":"limites","titulo":"Casos de limite","descricao":"A divisão por zero é tratada sem encerrar com erro técnico."},{"id":"compreensao","titulo":"Compreensão","descricao":"O resumo explica como entradas, conversão e condição se conectam."}],"entregaveis":["Link público do repositório ou arquivo .zip","Resumo de pelo menos 20 caracteres explicando testes e aprendizados","Autoavaliação honesta dos requisitos concluídos"],"instrucoes":"Envie o repositório público ou o projeto em .zip, conte em pelo menos 20 caracteres o que testou e aprendeu, e marque apenas o que verificou. A equipe dará feedback antes de validar a competência.","limiteResumo":2000,"plataformas":["github.com","gitlab.com","bitbucket.org"]}'::jsonb, 'iniciante', 30, true),
  ('py-projeto-media', 'python', 'py-fun-10', 'projeto', 'Projeto — simulador de média escolar', 'Crie um programa que receba notas, calcule uma média e informe aprovação, recuperação ou reprovação conforme critérios definidos.', '{"objetivo":"Consolidar entrada, conversão, cálculos, comparações e mensagens condicionais em um programa guiado por regras explícitas.","requisitos":[{"id":"notas","titulo":"Receber notas","descricao":"Pedir ao menos duas notas e converter as entradas para números decimais."},{"id":"media","titulo":"Calcular a média","descricao":"Somar as notas e dividir pela quantidade considerada."},{"id":"criterios","titulo":"Definir os critérios","descricao":"Documentar limites de aprovação, recuperação e reprovação no próprio programa ou no README."},{"id":"decisao","titulo":"Informar a situação","descricao":"Usar if, elif e else para escolher a mensagem correspondente à média."},{"id":"validacao","titulo":"Conferir os valores","descricao":"Rejeitar notas fora do intervalo permitido e explicar como corrigir."}],"criterios":[{"id":"calculo","titulo":"Cálculo verificável","descricao":"A média corresponde às notas recebidas e os limites são aplicados corretamente."},{"id":"limites","titulo":"Casos de limite","descricao":"Testa valores exatamente nos limites e imediatamente acima ou abaixo deles."},{"id":"compreensao","titulo":"Explicação","descricao":"O resumo descreve os critérios adotados e ao menos um caso testado."}],"entregaveis":["Link público do repositório ou arquivo .zip","Resumo de pelo menos 20 caracteres explicando critérios e testes","Autoavaliação honesta dos requisitos concluídos"],"instrucoes":"Envie o repositório público ou o projeto em .zip. Explique em um resumo de pelo menos 20 caracteres os limites escolhidos e os casos que testou; marque apenas requisitos conferidos.","limiteResumo":2000,"plataformas":["github.com","gitlab.com","bitbucket.org"]}'::jsonb, 'iniciante', 40, true)
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
  ('py-quiz-fun-01', '{"corretas":["a"],"explicacao":"total começa em 5 e depois recebe o resultado de 5 + 7. A atribuição atualiza o valor associado ao nome total."}'::jsonb),
  ('py-saida-fun-01', '{"aceitas":["7"],"explicacao":"A primeira linha associa 5 a total. A segunda lê o valor atual, soma 2 e atualiza total. Por isso print mostra 7."}'::jsonb),
  ('py-quiz-fun-02', '{"corretas":["a"],"explicacao":"Sem aspas, 12 é um inteiro. Entre aspas, \"12\" é texto. None representa ausência e True é um valor booleano, não texto."}'::jsonb),
  ('py-erro-fun-02', '{"corretas":["a"],"explicacao":"input() e valores entre aspas são texto. Para fazer uma soma numérica, converta um texto numérico com int() ou float() antes de somar."}'::jsonb),
  ('py-quiz-fun-03', '{"corretas":["a"],"explicacao":"O operador % devolve o resto da divisão. Como 17 dividido por 5 deixa resto 2, 17 % 5 resulta em 2."}'::jsonb),
  ('py-completar-fun-03', '{"lacunas":{"operador":["//"]},"explicacao":"// é a divisão inteira: 17 // 5 resulta em 3. O operador /, por outro lado, devolve a divisão com resultado decimal."}'::jsonb),
  ('py-quiz-fun-04', '{"corretas":["a"],"explicacao":"and exige que as duas condições sejam verdadeiras. or aceitaria uma só, e a comparação usa ==, não o operador de atribuição =."}'::jsonb),
  ('py-completar-fun-04', '{"lacunas":{"conector":["and"]},"explicacao":"and combina condições e só resulta verdadeiro quando os dois lados também são verdadeiros."}'::jsonb),
  ('py-quiz-fun-05', '{"corretas":["a"],"explicacao":"input() devolve texto. int() converte um texto como \"12\" para inteiro; se a pessoa digitar algo que não representa um inteiro, a conversão falha e deverá ser tratada em um tópico posterior."}'::jsonb),
  ('py-saida-fun-05', '{"aceitas":["15"],"explicacao":"int(\"12\") converte o texto para o número inteiro 12. A soma numérica com 3 produz 15."}'::jsonb),
  ('py-quiz-fun-06', '{"corretas":["a"],"explicacao":"Uma f-string marcada pelo prefixo f permite colocar expressões entre chaves e produzir uma mensagem legível."}'::jsonb),
  ('py-completar-fun-06', '{"lacunas":{"variavel":["nome"]},"explicacao":"A expressão {nome} dentro da f-string é substituída pelo valor atual guardado na variável nome."}'::jsonb),
  ('py-saida-fun-06', '{"aceitas":["Bia"],"explicacao":"strip() remove os espaços no começo e no fim do texto. A variável original permanece como estava; o método devolve um texto sem esses espaços."}'::jsonb),
  ('py-quiz-fun-07', '{"corretas":["a"],"explicacao":">= significa maior ou igual. Com 18, a condição é verdadeira; > 18 excluiria exatamente esse limite."}'::jsonb),
  ('py-quiz-fun-08', '{"corretas":["a"],"explicacao":"range(5) fornece cinco valores: 0, 1, 2, 3 e 4. O laço for executa o bloco uma vez para cada valor."}'::jsonb),
  ('py-desafio-fun-08', '{"testes":[{"entrada":"4\n","saida":"10\n"},{"entrada":"1\n","saida":"1\n"},{"entrada":"0\n","saida":"0\n"},{"entrada":"6\n","saida":"21\n"}],"explicacao":"Percorra os valores de 1 até N incluindo N e some cada valor ao acumulador. range termina antes do limite final, então pense em como incluir N."}'::jsonb),
  ('py-quiz-fun-09', '{"corretas":["a"],"explicacao":"A condição de while é testada antes de cada repetição. Se os valores não mudarem, ela continuará verdadeira e o programa pode não terminar."}'::jsonb),
  ('py-desafio-fun-09', '{"testes":[{"entrada":"python\n","saida":"Acesso liberado\n"},{"entrada":"oi\npython\n","saida":"Acesso liberado\n"},{"entrada":"123\nPython\npython\n","saida":"Acesso liberado\n"}],"explicacao":"Mantenha a leitura dentro de while enquanto senha for diferente de python. Cada nova tentativa atualiza senha; quando ela corresponde, o laço termina e a mensagem aparece."}'::jsonb),
  ('py-quiz-fun-10', '{"corretas":["a"],"explicacao":"Validar significa conferir uma regra e orientar a pessoa quando ela não é atendida. Um laço pode repetir a pergunta, mas precisa de uma saída quando a entrada é válida."}'::jsonb),
  ('py-completar-fun-10', '{"lacunas":{"comando":["break"]},"explicacao":"break encerra o laço imediatamente. Assim, quando numero vale 4, a execução sai do for antes de imprimir esse valor."}'::jsonb),
  ('py-completar-fun-10-continue', '{"lacunas":{"comando":["continue"]},"explicacao":"continue encerra apenas a repetição atual e segue para o próximo valor. Diferente de break, ele não termina o laço inteiro."}'::jsonb)
on conflict (atividade_id) do update set
  configuracao = excluded.configuracao,
  atualizado_em = now();

insert into public.atividade_competencia (atividade_id, competencia_id) values
  ('py-quiz-fun-01', 'py-comp-variaveis'), ('py-saida-fun-01', 'py-comp-variaveis'),
  ('py-quiz-fun-02', 'py-comp-tipos'), ('py-erro-fun-02', 'py-comp-tipos'),
  ('py-quiz-fun-03', 'py-comp-operadores'), ('py-completar-fun-03', 'py-comp-operadores'), ('py-saida-precedencia', 'py-comp-operadores'),
  ('py-quiz-fun-04', 'py-comp-comparacoes'), ('py-completar-fun-04', 'py-comp-comparacoes'),
  ('py-quiz-fun-05', 'py-comp-conversao'), ('py-saida-fun-05', 'py-comp-conversao'),
  ('py-quiz-fun-06', 'py-comp-strings'), ('py-completar-fun-06', 'py-comp-strings'), ('py-saida-fun-06', 'py-comp-strings'),
  ('py-quiz-fun-07', 'py-comp-condicao'), ('py-completar-maioridade', 'py-comp-condicao'), ('py-erro-igualdade', 'py-comp-condicao'),
  ('py-quiz-fun-08', 'py-comp-repeticao'), ('py-desafio-fun-08', 'py-comp-repeticao'),
  ('py-quiz-fun-09', 'py-comp-while'), ('py-desafio-fun-09', 'py-comp-while'),
  ('py-quiz-fun-10', 'py-comp-validacao'), ('py-completar-fun-10', 'py-comp-validacao'), ('py-completar-fun-10-continue', 'py-comp-validacao')
on conflict do nothing;

-- A questão deve aparecer antes dos exercícios existentes; IDs e respostas ficam intactos.
update public.atividade
set ordem = 30, atualizado_em = now()
where id = 'py-saida-precedencia';

insert into public.competencia (id, trilha, topico_id, titulo, descricao, criterio, ordem) values
  ('py-comp-projeto-calculadora', 'python', 'py-fun-10', 'Construir uma calculadora interativa', 'Aplica entrada, conversão, operadores, decisões e validação em uma aplicação de terminal.', 'Executa as quatro operações, trata divisão por zero e explica os casos testados.', 110),
  ('py-comp-projeto-media', 'python', 'py-fun-10', 'Criar um simulador de média escolar', 'Calcula médias e aplica critérios de aprovação com validação de valores.', 'Calcula corretamente e demonstra os limites dos critérios com testes de caso.', 120)
on conflict (id) do update set
  titulo = excluded.titulo,
  descricao = excluded.descricao,
  criterio = excluded.criterio,
  ordem = excluded.ordem;

insert into public.atividade_competencia (atividade_id, competencia_id) values
  ('py-projeto-calculadora', 'py-comp-projeto-calculadora'),
  ('py-projeto-media', 'py-comp-projeto-media')
on conflict do nothing;

-- O bucket segue privado e limitado ao diretório pessoal e aos projetos cadastrados.
drop policy if exists "Alunos enviam seus arquivos de projeto" on storage.objects;
create policy "Alunos enviam seus arquivos de projeto"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'entregas-projetos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and (storage.foldername(name))[2] in (
    'py-projeto-financeiro', 'py-projeto-apresentacao',
    'py-projeto-calculadora', 'py-projeto-media'
  )
  and storage.extension(name) = 'zip'
);
