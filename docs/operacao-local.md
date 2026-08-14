# Operação local

## Pré-requisitos

- Node.js 24 ou superior.
- pnpm 11.
- PostgreSQL 17 e Redis 8; o compose.yaml fornece ambos quando Docker Compose está disponível.

## Variáveis

| Variável            | Padrão                                                 | Uso                                 |
| ------------------- | ------------------------------------------------------ | ----------------------------------- |
| NODE_ENV            | development                                            | Perfil de execução                  |
| API_PORT            | 3333                                                   | Porta HTTP da API                   |
| DATABASE_URL        | postgresql://nexoflux:nexoflux@localhost:5432/nexoflux | Conexão PostgreSQL                  |
| REDIS_URL           | redis://localhost:6379                                 | Conexão Redis                       |
| SESSION_TTL_DAYS    | 30                                                     | Validade de sessão, de 1 a 365 dias |
| NEXT_PUBLIC_API_URL | http://localhost:3333/api/v1                           | Base pública usada pelo web         |

Copie .env.example para .env e altere credenciais fora do desenvolvimento local.

## Inicialização

```bash
pnpm install
docker compose up -d
pnpm db:migrate
pnpm dev
```

A migração deve ser executada antes de testar cadastro ou login. O executor aplica arquivos SQL em ordem lexical, dentro de transação, e registra checksum.

## Simulação web sem banco de dados

Para apresentar o Marco 3 não é necessário iniciar Docker, PostgreSQL, Redis ou
a API. Execute somente a aplicação web:

\`\`\`bash
pnpm --filter @nexoflux/web dev
\`\`\`

Abra http://localhost:3000/entrar e use qualquer conta demonstrativa descrita
em [marco-03-simulacao-web.md](marco-03-simulacao-web.md). O estado de
demonstração fica exclusivamente no navegador:

- localStorage guarda contas, workspaces e memberships simulados;
- sessionStorage guarda a sessão da aba atual;
- o botão **Restaurar dados** apaga as alterações locais e recria o seed
  versionado no repositório.

Não há sincronização dessa simulação com GitHub, API ou banco de dados. GitHub
armazena o código e o seed; interações feitas no navegador não são publicadas.

## Verificação

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Validação persistente em um comando

Com PostgreSQL e Redis ativos, execute:

```bash
pnpm verify:integration
```

O comando verifica a infraestrutura, compila a API, aplica migrações, inicia o processo compilado, executa 17 verificações HTTP, remove os dados temporários e encerra apenas o processo que ele próprio iniciou.

Para executar somente o cenário HTTP contra uma API já ativa:

```bash
pnpm smoke:auth
```

Use SMOKE_KEEP_DATA=true somente quando precisar inspecionar os registros criados pelo cenário.

## Endpoints de diagnóstico

- GET /api/v1/health/live: processo HTTP disponível.
- GET /api/v1/health/ready: PostgreSQL e Redis acessíveis.

## Falhas comuns

### ready retorna degraded

Confirme DATABASE_URL, REDIS_URL e se os serviços estão ativos. O processo da API pode estar vivo enquanto dependências estão indisponíveis.

### Migração aplicada foi alterada

Não edite uma migração já aplicada. Restaure o conteúdo original e crie um novo arquivo numerado.

### Cadastro retorna conflito

O e-mail já existe ou ocorreu uma colisão de chave única. Para memberships, confira se o usuário já pertence ao workspace.

### Token deixa de funcionar

A sessão pode estar expirada ou revogada. Faça login novamente. SESSION_TTL_DAYS só afeta novas sessões.

## Produção

Antes de produção, usar credenciais fortes, TLS na conexão, gestão externa de segredos, política de backup, observabilidade, rate limiting e testes de restauração. Esses controles ainda não fazem parte da baseline executável deste marco.
