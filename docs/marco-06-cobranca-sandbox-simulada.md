# Marco 06 - Cobrança sandbox simulada

Data: 13 de agosto de 2026.

## Objetivo

Demonstrar assinatura, eventos de cobrança e reconciliação conforme BLG-007 do
dossiê técnico-operacional, preservando a decisão de usar Stripe somente em
sandbox até que webhooks reais sejam validados.

## Escopo entregue

- Assinatura local por workspace.
- Ciclo mensal simulado e data informativa de próximo ciclo.
- Estados ACTIVE, PAST_DUE e CANCELED.
- Histórico local de eventos de cobrança reconciliados.
- Identificador sintético do evento do provedor.
- Simulação de pagamento aprovado, falha de pagamento e cancelamento.
- Bloqueio de novas execuções quando a assinatura não está ACTIVE.
- Regularização por evento de pagamento aprovado.
- Controles de webhook disponíveis somente ao Owner.
- Compatibilidade automática para workspaces criados nos marcos anteriores.

## Fronteira Stripe

apps/web/app/lib/demo-stripe-adapter.ts é a única fronteira do M6 com o
provedor de cobrança. Ela gera eventos sintéticos e não usa:

- SDK ou API do Stripe;
- chaves secretas ou publicáveis;
- checkout, cartão, cliente ou dados financeiros;
- endpoint HTTP, assinatura de webhook ou transação real.

O adapter mantém o dashboard desacoplado do provedor. Na integração futura, a
API receberá, validará e reconciliará eventos reais do Stripe; o browser não
será fonte de verdade para cobrança.

## Regras demonstradas

| Evento simulado    | Resultado                                                          |
| ------------------ | ------------------------------------------------------------------ |
| Pagamento aprovado | Assinatura fica ACTIVE e novas execuções são liberadas             |
| Falha de pagamento | Assinatura fica PAST_DUE e novas execuções são bloqueadas          |
| Cancelamento       | Assinatura fica CANCELED e novas execuções são bloqueadas          |
| Mudança de plano   | Plano é atualizado e um evento local de reconciliação é registrado |

Tarefas, logs e dados do workspace são preservados em qualquer alteração de
status. A demonstração ainda não implementa fim de ciclo, carência, fatura ou
renovação automática.

## Persistência e limites

Assinaturas e eventos usam localStorage no mesmo objeto dos marcos anteriores.
São locais ao navegador e desaparecem com **Restaurar dados**. Não existe
sincronização com GitHub Pages, Stripe, banco de dados ou qualquer sistema
financeiro.

Os preços e limites continuam sendo hipóteses comerciais transcritas da matriz
de kickoff e não constituem oferta comercial ou cobrança.

## Evidência automatizada

Os testes cobrem:

- reconciliação de falha de pagamento para PAST_DUE;
- bloqueio de execução enquanto o status está pendente;
- reconciliação de pagamento aprovado para ACTIVE;
- retomada da execução após regularização;
- proibição de Admin simular webhook.
