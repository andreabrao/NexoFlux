# Marco 08 - Prontidão de integrações simulada

Data: 14 de agosto de 2026.

## Objetivo

Tornar explícita a fronteira entre os recursos que a demonstração executa
localmente e os serviços que ainda não foram integrados. Este marco não inicia
OAuth, não chama APIs externas e não cria banco de dados.

## Escopo entregue

- Painel de prontidão exibido na área autenticada para todos os membros do
  workspace.
- Indicadores para o adaptador local do X, API oficial do X, cobrança e a
  infraestrutura de API, banco e fila.
- Flag persistida no `localStorage` para ativar ou desativar o adaptador local
  do X.
- Alteração da flag limitada a Owners e registrada na trilha de auditoria.
- Bloqueio de novas execuções simuladas enquanto o adaptador local estiver
  desativado.

## Estados e significado

| Estado           | Significado na demonstração                                           |
| ---------------- | --------------------------------------------------------------------- |
| `SIMULATED`      | Comportamento sintético, local ao navegador e sem credenciais.        |
| `PENDING`        | Integração real depende de autorização, configuração e implementação. |
| `NOT_CONFIGURED` | Serviço deliberadamente ausente deste site estático.                  |
| `DISABLED`       | Recurso simulado desligado por um Owner.                              |

O controle do adaptador é global ao armazenamento local deste navegador. Ele
existe para demonstrar uma feature flag operacional, não como modelo de
configuração multi-tenant para produção.

## Garantias e limites

- O botão **não** autoriza nem acessa a API do X.
- Não há OAuth, token, publicação, conta externa, webhook real, Stripe real,
  banco de dados, Redis, BullMQ ou API executando no GitHub Pages.
- O adaptador continua retornando eventos sintéticos; a flag apenas permite ou
  bloqueia novas execuções desse adaptador.
- A auditoria, a flag e todos os demais dados somem quando o usuário escolhe
  **Restaurar dados** ou limpa o armazenamento do navegador.
- Em produção, feature flags, autorização, auditoria e bloqueios devem ser
  aplicados pela API e persistidos em infraestrutura controlada.

## Critérios de aceite verificados

- Qualquer membro visualiza a matriz de prontidão sem receber uma falsa
  indicação de integração externa ativa.
- Apenas Owner pode mudar o adaptador local.
- Admin recebe erro de autorização ao tentar alterar a flag diretamente.
- Com o adaptador desativado, uma tarefa agendada não é executada.
- Cada alteração da flag gera o evento `X_MOCK_ADAPTER_UPDATED` na auditoria.
