# Validação

Data da execução documentada: 13 de agosto de 2026.

## Estratégia

- Contratos: normalização de e-mail, política de senha, papéis e isolamento de payloads.
- Autenticação: hash salgado, verificação, cadastro, conflito, login genérico e AuthGuard.
- RBAC: metadata de rota, membership permitida/negada, concessão de Owner, usuário inexistente, último Owner e proteção de Owner contra Admin.
- Saúde: degradação quando uma dependência falha.
- Worker: idempotência e limites já cobertos pela baseline anterior.

## Comandos obrigatórios

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Resultado final

| Verificação               | Resultado                                                     |
| ------------------------- | ------------------------------------------------------------- |
| Prettier                  | Aprovado; todos os arquivos aderentes                         |
| ESLint                    | Aprovado; zero erros e zero avisos                            |
| TypeScript                | Aprovado nos contratos, API, web e worker                     |
| Vitest                    | Aprovado; 8 arquivos e 20 testes                              |
| Build                     | Aprovado nos contratos, API, web e worker                     |
| API compilada             | Inicialização aprovada                                        |
| GET /health/live          | 200, status ok                                                |
| GET /workspaces sem token | 401, proteção global confirmada                               |
| GET /health/ready         | status degraded; PostgreSQL e Redis indisponíveis no ambiente |

## Validação de infraestrutura

O ambiente de execução atual não possui Docker disponível. Portanto:

- a migração foi revisada e o executor foi incluído na checagem de tipos;
- os serviços e regras foram exercitados com doubles unitários;
- o processo compilado da API e os guards foram exercitados por smoke test HTTP;
- foi criado o comando pnpm verify:integration, com preflight, migração, API temporária, 17 verificações e limpeza;
- a tentativa real foi interrompida corretamente no preflight porque PostgreSQL e Redis não estão acessíveis;
- não foi possível executar o cenário persistente completo nesta máquina.

Quando Docker estiver disponível, executar docker compose up -d e pnpm verify:integration. O relatório completo do verificador está em marco-02-1-validacao-integracao.md.

## Riscos residuais

- Falta teste de integração SQL contra a versão real do PostgreSQL.
- Falta rate limiting nos endpoints de autenticação.
- Falta verificação de e-mail, recuperação de senha e rotação administrativa de sessões.
- Falta interface web autenticada.
