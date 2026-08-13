# RBAC de workspace

## Funções

- OWNER: controle administrativo completo e responsabilidade pela continuidade de ownership.
- ADMIN: gerencia membros não-Owner, além de operar e consultar.
- OPERATOR: acessa recursos operacionais do workspace; neste marco possui somente leitura de workspace/membros porque as rotas operacionais ainda não existem.
- VIEWER: leitura do workspace e de seus membros.

## Matriz

| Ação                            | Owner                | Admin | Operator | Viewer |
| ------------------------------- | -------------------- | ----- | -------- | ------ |
| Listar seus workspaces          | Sim                  | Sim   | Sim      | Sim    |
| Consultar workspace             | Sim                  | Sim   | Sim      | Sim    |
| Listar membros                  | Sim                  | Sim   | Sim      | Sim    |
| Adicionar Viewer/Operator/Admin | Sim                  | Sim   | Não      | Não    |
| Adicionar Owner                 | Sim                  | Não   | Não      | Não    |
| Alterar função de membro        | Sim                  | Não   | Não      | Não    |
| Remover membro não-Owner        | Sim                  | Sim   | Não      | Não    |
| Remover Owner                   | Sim, se restar outro | Não   | Não      | Não    |
| Criar outro workspace           | Sim                  | Sim   | Sim      | Sim    |

Criar outro workspace é uma capacidade da identidade autenticada, não uma permissão herdada do workspace atual; o criador torna-se Owner do novo tenant.

## Aplicação da política

1. AuthGuard resolve a sessão e anexa usuário e sessionId.
2. WorkspaceRolesGuard lê as funções declaradas na rota.
3. O guard valida workspaceId, busca a membership do usuário e nega ausência ou função insuficiente.
4. WorkspaceService aplica restrições dependentes do payload e da função do ator.
5. WorkspaceRepository executa invariantes concorrentes e auditoria na mesma transação.

## Regra do último Owner

Uma alteração que rebaixe ou remova um Owner:

- bloqueia a membership alvo;
- bloqueia as memberships Owner do workspace;
- conta Owners dentro da transação;
- retorna conflito se houver apenas um;
- somente então atualiza/remove e grava o evento de auditoria.

Esse fluxo impede que operações concorrentes deixem o workspace sem Owner; uma transação pode aguardar ou ser abortada pelo PostgreSQL e deve ser repetida pelo cliente em caso de falha transitória.
