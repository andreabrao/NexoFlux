# Marco 09 - Correções de homologação

Data: 14 de agosto de 2026.

## Objetivo

Atender aos achados passíveis de correção no relatório de revisão do cliente
simulado, preservando o escopo acordado de demonstração sem banco de dados nem
integrações externas.

## Correções entregues

| Achado                                | Tratamento no M9                                                                                                                                                                                             | Estado                  |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| REV-001: agendamento sem retorno      | O formulário passa a informar campos ausentes e envia a data bruta ao repositório, que é a única camada que valida e normaliza o agendamento. A criação atualiza lista, contador, log e mensagem de sucesso. | Corrigido               |
| REV-003: recuperação de senha ausente | Criada a rota `/recuperar-senha` para redefinir exclusivamente a senha local e registrar a ação na auditoria.                                                                                                | Corrigido na simulação  |
| REV-004: páginas públicas incompletas | Criadas as rotas `/planos` e `/funcionalidades`, com limites, valores, capacidades e fronteiras da demonstração.                                                                                             | Corrigido               |
| REV-005: `1 pessoas`                  | A interface usa singular para um membro e plural para os demais.                                                                                                                                             | Corrigido               |
| REV-006: data do navegador            | O banner autenticado informa que horários e eventos usam a data e hora do navegador.                                                                                                                         | Corrigido e documentado |

## Dependência mantida bloqueada

O REV-002 não é corrigido neste marco: API oficial do X, API própria, banco de
dados, Redis, fila e pagamentos reais permanecem fora da demonstração por
decisão de escopo. O painel do Marco 08 mantém esse estado visível como
`PENDING` ou `NOT_CONFIGURED`; ele não simula uma integração real.

Uma correção desse item requer uma decisão explícita para iniciar infraestrutura,
credenciais, autorização do provedor e arquitetura de produção. Até lá, a
aprovação da interface se limita à homologação local.

## Critérios de reteste

- Owner agenda uma tarefa válida e recebe confirmação; a tarefa aparece na
  lista, aumenta o contador e recebe evento `SCHEDULED`.
- Dados inválidos mostram mensagem de erro em vez de falha silenciosa.
- Viewer continua sem permissão para criar, executar ou cancelar tarefas.
- Uma senha local redefinida permite novo login e gera o evento
  `PASSWORD_RECOVERED_LOCAL`.
- As páginas públicas informam, sem ambiguidade, que planos e cobrança não são
  contratação ou pagamento real.

## Limites da recuperação local

Não há e-mail transacional, token de recuperação, verificação de identidade ou
segurança de produção. Qualquer recuperação opera somente sobre o
`localStorage` daquele navegador e é apagada por **Restaurar dados**. A versão
produtiva deverá tratar esse fluxo exclusivamente no servidor.
