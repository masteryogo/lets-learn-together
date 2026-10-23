# Executor Python isolado

A Edge Function envia código para um Judge0 auto-hospedado; nem o navegador nem o processo principal da plataforma executam Python. O serviço usa o isolamento do Judge0 e só é chamado por HTTPS através do proxy que confere `X-API-Key`.

## Preparar um host dedicado

Use uma VM Linux dedicada ao executor, com Docker Compose e um domínio HTTPS. As imagens do Judge0 precisam de contêineres privilegiados para administrar o sandbox Isolate; por isso, não compartilhe essa VM com aplicações ou dados de outros clientes.

Na raiz do repositório, crie as cópias locais dos arquivos de configuração:

```sh
cp infra/executor-python/.env.exemplo infra/executor-python/.env
cp infra/executor-python/judge0.conf.exemplo infra/executor-python/judge0.conf
```

Troque os três valores de exemplo por segredos aleatórios diferentes; não versione os arquivos copiados. Inicie os serviços:

```sh
docker compose --project-directory infra/executor-python --env-file infra/executor-python/.env -f infra/executor-python/compose.yaml up -d
```

O proxy só publica `127.0.0.1:2359`; o serviço Judge0, o PostgreSQL e o Redis não têm porta pública. Configure o proxy TLS já usado no host para encaminhar o domínio HTTPS a `127.0.0.1:2359`, preservando o cabeçalho `X-API-Key`. Não publique a porta 2359 diretamente na internet.

O arquivo `judge0.conf.exemplo` desativa a rede para cada submissão e impede que quem envia código altere essa opção. Também fixa limites máximos de CPU, tempo de parede, memória, pilha, processos e tamanho de arquivos. A Edge Function envia limites igualmente restritos; o executor recusa qualquer valor maior que os máximos do host.

## Conectar o Supabase

Defina os segredos da Edge Function no projeto Supabase:

```sh
npx supabase secrets set --project-ref atmotqhqvhfaeoirdnzo \
  JUDGE0_URL=https://executor.seu-dominio.example \
  JUDGE0_API_KEY=mesmo-segredo-configurado-no-proxy \
  JUDGE0_PYTHON_LANGUAGE_ID=71
```

O ID 71 é o Python 3 do Judge0 CE usado nesta configuração. Se a imagem escolhida publicar outro ID, ajuste o segredo — nunca aceite o ID de linguagem enviado pelo navegador. Depois de configurar e validar o host, publique a função `executar-desafio` com o processo de deploy Supabase do projeto.

Não use a instância pública compartilhada do Judge0: o runner precisa ser dedicado, autenticado e configurado com o isolamento de rede desativado. A Edge Function valida a sessão, o desafio publicado, o tamanho do código e a frequência de execuções antes de encaminhar a solicitação.
