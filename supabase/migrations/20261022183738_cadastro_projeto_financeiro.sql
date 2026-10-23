-- O projeto final usa tentativas existentes; a revisão humana fica registrada
-- na mesma linha para que histórico e domínio da competência sigam um único fluxo.
insert into public.competencia (id, trilha, topico_id, titulo, descricao, criterio, ordem)
values (
  'py-comp-projeto-financeiro', 'python', 'py-fin-10',
  'Entregar uma aplicação Python utilizável por outra pessoa',
  'Planeja, implementa, testa, documenta e apresenta um controle financeiro pessoal com persistência SQLite.',
  'Uma pessoa consegue instalar e executar o projeto seguindo o README; as operações principais persistem e os testes verificam as regras.',
  10
)
on conflict (id) do nothing;

insert into public.atividade (id, trilha, topico_id, tipo, titulo, enunciado, configuracao, dificuldade, ordem, publicada)
values (
  'py-projeto-financeiro', 'python', 'py-fin-10', 'projeto',
  'Projeto integrador — controle financeiro pessoal',
  'Construa uma aplicação de linha de comando para registrar receitas e despesas. O sistema deve persistir os dados com SQLite e ser compreensível para alguém que não participou do desenvolvimento.',
  '{
    "objetivo":"Consolidar Python, persistência, testes e documentação em uma aplicação pequena, funcional e reproduzível.",
    "requisitos":[
      {"id":"transacoes","titulo":"Cadastrar receitas e despesas","descricao":"Guardar tipo, valor positivo, categoria e data de cada lançamento."},
      {"id":"consultas","titulo":"Consultar e filtrar lançamentos","descricao":"Listar transações e permitir filtrar por tipo, categoria ou período."},
      {"id":"saldo","titulo":"Calcular saldos","descricao":"Exibir saldo geral e totais de receitas e despesas a partir dos registros persistidos."},
      {"id":"sqlite","titulo":"Persistir com SQLite","descricao":"Criar e consultar os dados em um banco local, usando consultas parametrizadas."},
      {"id":"validacao","titulo":"Validar e tratar erros","descricao":"Recusar valores ou datas inválidos e explicar como corrigir a entrada."},
      {"id":"testes","titulo":"Testar as regras principais","descricao":"Cobrir cálculos, filtros e validações com testes automatizados."},
      {"id":"documentacao","titulo":"Documentar e apresentar","descricao":"Incluir README com instalação, execução, testes, exemplo de uso e limitações conhecidas."}
    ],
    "criterios":[
      {"id":"funcional","titulo":"Funcionalidade","descricao":"As operações exigidas podem ser realizadas pela interface de linha de comando."},
      {"id":"dados","titulo":"Integridade dos dados","descricao":"Os lançamentos continuam disponíveis após encerrar e reabrir o programa; o saldo corresponde às transações."},
      {"id":"qualidade","titulo":"Qualidade e testes","descricao":"As regras estão organizadas em partes compreensíveis e os testes automatizados passam."},
      {"id":"entrega","titulo":"Reprodução e documentação","descricao":"O repositório contém instruções suficientes para instalar, executar e testar em outra máquina."}
    ],
    "entregaveis":["Link público do repositório GitHub, GitLab ou Bitbucket","Resumo curto explicando as decisões e o que foi aprendido","Marcação honesta dos requisitos concluídos"],
    "instrucoes":"Envie um repositório público HTTPS e um resumo de até 2.000 caracteres. Marque apenas os requisitos que você verificou. A autoavaliação orienta a revisão, mas a competência só será demonstrada após avaliação.",
    "limiteResumo":2000,
    "plataformas":["github.com","gitlab.com","bitbucket.org"]
  }'::jsonb,
  'intermediario', 10, true
)
on conflict (id) do nothing;

insert into public.atividade_competencia (atividade_id, competencia_id)
values ('py-projeto-financeiro', 'py-comp-projeto-financeiro')
on conflict do nothing;
