# Marco 02 — Identidade, workspaces e RBAC

Data de execução: 13 de agosto de 2026.

## Objetivo

Disponibilizar a primeira fronteira autenticada e multi-tenant da NexoFlux, permitindo criar contas, manter sessões revogáveis, criar workspaces e administrar membros com autorização baseada em função.

## Escopo entregue

- Cadastro transacional de usuário, workspace inicial, vínculo Owner, sessão e evento de auditoria.
- Login com resposta genérica para credenciais inválidas.
- Sessões opacas com expiração configurável e revogação por logout.
- Proteção global das rotas; somente endpoints explicitamente públicos ignoram autenticação.
- Criação e listagem de workspaces do usuário autenticado.
- Consulta de workspace e membros isolada por vínculo de membership.
- Inclusão de usuários já cadastrados no workspace.
- Alteração de função e remoção de membros.
- Proteção contra remoção ou rebaixamento do último Owner.
- Auditoria das mutações de workspace e membership.
- Migração SQL versionada e executor com checksum.
- Contratos Zod compartilhados e testes unitários das regras críticas.

## Critérios de aceite

| Critério                                          | Implementação                                               | Evidência                                                 |
| ------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------- |
| Cadastro é atômico                                | AuthRepository usa uma transação para cinco gravações       | Teste de AuthService e revisão do repositório             |
| Senhas não são persistidas em texto puro          | PasswordHasher deriva hash scrypt com salt aleatório        | Testes de hash e verificação                              |
| Token de sessão não é persistido em texto puro    | SessionTokenService armazena somente SHA-256 do token opaco | Testes de autenticação e revisão do schema                |
| Rotas são privadas por padrão                     | AuthGuard registrado como APP_GUARD                         | Testes do guard                                           |
| Dados são isolados por workspace                  | WorkspaceRolesGuard exige membership no workspace da rota   | Matriz de RBAC e consultas parametrizadas                 |
| Admin não administra Owners                       | Regras no service/repository                                | Testes do WorkspaceService                                |
| Sempre existe ao menos um Owner                   | Lock transacional antes de remover/rebaixar                 | Testes do WorkspaceService e implementação do repositório |
| Migrações não podem ser alteradas silenciosamente | schema_migrations guarda checksum SHA-256                   | Executor de migrações                                     |

## Fora do escopo deste marco

- Recuperação de senha e verificação de e-mail.
- Convites para pessoas ainda sem conta.
- Interface web de cadastro e gestão de membros.
- OAuth com o X e gestão de credenciais externas.
- Cobrança, limites de plano e faturamento.
- Testes de integração com PostgreSQL real no ambiente atual.

## Rastreabilidade de código

- Contratos: packages/contracts/src/index.ts
- Migração: apps/api/migrations/001_identity_and_workspaces.sql
- Executor: apps/api/scripts/migrate.ts
- Autenticação: apps/api/src/auth
- Persistência: apps/api/src/database
- Workspaces e RBAC: apps/api/src/workspaces
- Composição global: apps/api/src/app.module.ts
