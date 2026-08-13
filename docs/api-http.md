# API HTTP

Base local: http://localhost:3333/api/v1

Formato: JSON UTF-8. Datas são ISO 8601. IDs são UUID. Endpoints privados exigem Authorization: Bearer <token>.

## Erros

- 400: payload ou UUID inválido.
- 401: token ausente, inválido ou expirado; também usado para login inválido.
- 403: usuário autenticado sem função suficiente.
- 404: workspace, membro ou usuário alvo não encontrado.
- 409: e-mail/membership duplicado ou tentativa de remover o último Owner.

Falhas de validação usam o formato:

```json
{
  "message": "Os dados enviados são inválidos.",
  "issues": [{ "path": "email", "message": "Informe um e-mail válido." }]
}
```

## Saúde

### GET /health/live

Público. Retorna 200 quando o processo HTTP está respondendo.

### GET /health/ready

Público. Verifica PostgreSQL e Redis. Pode retornar status degraded mesmo com HTTP 200; o campo dependencies indica a causa.

## Autenticação

### POST /auth/register

Público. Cria usuário, workspace inicial, membership Owner e sessão na mesma transação.

```json
{
  "name": "Ana Silva",
  "email": "ana@example.test",
  "password": "uma-senha-com-12-caracteres",
  "workspaceName": "Operação Ana"
}
```

Resposta 201:

```json
{
  "accessToken": "token-opaco",
  "expiresAt": "2026-09-12T12:00:00.000Z",
  "user": {
    "id": "uuid",
    "name": "Ana Silva",
    "email": "ana@example.test"
  },
  "workspace": {
    "id": "uuid",
    "name": "Operação Ana",
    "slug": "operacao-ana-a1b2c3",
    "role": "OWNER"
  }
}
```

### POST /auth/login

Público. Retorna 200 com accessToken, expiresAt e user. A mensagem de falha é a mesma para e-mail inexistente e senha incorreta.

### POST /auth/logout

Privado. Revoga a sessão atual e retorna 204 sem corpo.

### GET /auth/me

Privado. Retorna o usuário da sessão e expiresAt.

## Workspaces

### POST /workspaces

Privado. Cria um workspace e vincula o usuário atual como Owner.

```json
{ "name": "Nova Operação" }
```

Resposta 201 contém id, name, slug e role OWNER.

### GET /workspaces

Privado. Lista somente os workspaces em que o usuário possui membership. Cada item contém id, name, slug, role e createdAt.

### GET /workspaces/:workspaceId

Privado para qualquer membro. Retorna o workspace com a função do usuário atual.

## Membros

### GET /workspaces/:workspaceId/members

Privado para qualquer membro. Lista userId, name, email, role e createdAt.

### POST /workspaces/:workspaceId/members

Permitido para Owner e Admin. O usuário alvo já precisa possuir conta.

```json
{
  "email": "membro@example.test",
  "role": "OPERATOR"
}
```

Admin não pode adicionar Owner. Resposta 201 contém workspaceId, userId e role.

### PATCH /workspaces/:workspaceId/members/:userId

Permitido somente para Owner.

```json
{ "role": "ADMIN" }
```

Retorna 200 com workspaceId, userId e role. Retorna 409 se a mudança remover a última função Owner.

### DELETE /workspaces/:workspaceId/members/:userId

Permitido para Owner e Admin. Admin não pode remover Owner. Nenhum ator pode remover o último Owner. Sucesso retorna 204.

## Exemplo de sessão

```bash
curl -X POST http://localhost:3333/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@example.test","password":"uma-senha-com-12-caracteres"}'

curl http://localhost:3333/api/v1/workspaces \
  -H "Authorization: Bearer SEU_TOKEN"
```
