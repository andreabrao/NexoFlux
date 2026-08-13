# NexoFlux

Fundação técnica do MVP fictício da NexoFlux: uma plataforma multi-tenant para automação autorizada no X, com identidade local, workspaces, RBAC, filas idempotentes e rastreabilidade.

## Estado atual

- Marco 01: monorepo, web pública, API de saúde, worker, PostgreSQL e Redis.
- Marco 02: cadastro, login, sessões revogáveis, workspaces, membros, RBAC, auditoria e migrações.
- Marco 02.1: verificador automatizado de integração persistente, aguardando infraestrutura local.
- Próximos marcos: interface autenticada, integrações autorizadas com o X, cobrança e observabilidade de produção.

A documentação completa está em [docs/INDEX.md](./docs/INDEX.md). Código, testes e documentação fazem parte do mesmo critério de conclusão.

## Estrutura

- apps/web: site público e futura área autenticada em Next.js.
- apps/api: API NestJS, autenticação, workspaces, RBAC e saúde.
- apps/worker: consumidor BullMQ para tarefas autorizadas.
- packages/contracts: tipos e schemas Zod compartilhados.
- docs: arquitetura, dados, API, RBAC, operação e validação.
- compose.yaml: PostgreSQL e Redis para desenvolvimento local.

## Pré-requisitos

- Node.js 24 ou superior.
- pnpm 11.
- Docker Compose, PostgreSQL e Redis para fluxos com persistência.

## Execução local

1. Copie .env.example para .env.
2. Inicie a infraestrutura com docker compose up -d.
3. Instale as dependências com pnpm install.
4. Aplique o schema com pnpm db:migrate.
5. Inicie os serviços com pnpm dev.

Por padrão, o site usa http://localhost:3000 e a API usa http://localhost:3333/api/v1.

## Verificações

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm verify:integration
```

O atalho pnpm check executa toda a sequência acima, exceto formatação com escrita.

## Documentação

- [Marco 02](./docs/marco-02-identidade-workspaces-rbac.md)
- [Marco 02.1 — Validação de integração](./docs/marco-02-1-validacao-integracao.md)
- [Arquitetura](./docs/arquitetura.md)
- [Modelo de dados](./docs/modelo-de-dados.md)
- [API HTTP](./docs/api-http.md)
- [RBAC](./docs/rbac.md)
- [Operação local](./docs/operacao-local.md)
- [Validação](./docs/validacao.md)

## Regras da baseline

- Somente OAuth e capacidades permitidas pela API oficial do X.
- Nenhuma senha da conta X deve ser solicitada ou armazenada.
- Segredos e credenciais de proxy devem ser cifrados e mascarados.
- Toda tarefa deve ser idempotente, auditável e limitada a três tentativas.
- Desenvolvimento e testes externos usam adaptadores, mocks e feature flags enquanto permissões reais não estiverem confirmadas.
- Toda mudança funcional deve atualizar testes e documentação no mesmo marco.
