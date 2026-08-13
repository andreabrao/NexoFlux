# Marco 05 - Planos e consumo simulados

Data: 13 de agosto de 2026.

## Objetivo

Demonstrar a regra de consumo do MVP: cada execução concluída é contabilizada
por workspace; ao esgotar a cota do plano, novas execuções são bloqueadas,
enquanto tarefas e logs existentes são preservados.

## Fonte dos limites

Os valores foram transcritos da aba **Limites e Recursos** da matriz
Matriz_Planos_Limites_NexoFlux.xlsx, entregue no checkpoint de 28/08/2026.
Continuam sendo hipóteses comerciais de simulação, sujeitas à validação antes
de qualquer cobrança real.

| Plano   | Mensalidade simulada | Execuções/mês | Retenção de logs |
| ------- | -------------------: | ------------: | ---------------: |
| Starter |                R$ 49 |           500 |          30 dias |
| Pro     |               R$ 129 |         3.000 |          90 dias |
| Agência |               R$ 299 |        20.000 |         180 dias |

## Escopo entregue

- Plano Starter como padrão de cada novo workspace.
- Medidor de consumo no dashboard.
- Contagem de tarefas concluídas por workspace.
- Cota restante e percentual de uso.
- Bloqueio da execução quando a cota estiver esgotada.
- Simulação local de troca entre Starter, Pro e Agência.
- Troca de plano exclusiva ao Owner.
- Visualização de plano e consumo disponível para todos os papéis.

## Regras

- Uma tarefa só consome uma unidade quando chega ao estado SUCCEEDED.
- Criar ou cancelar uma tarefa não consome cota.
- O bloqueio ocorre antes de iniciar uma nova execução.
- A mudança de plano recalcula a cota disponível preservando o consumo já
  registrado.
- Owner, Admin e Operator podem operar tarefas respeitando o limite.
- Viewer não cria, executa, cancela nem altera plano.
- Somente Owner pode simular a troca de plano.

## Limites assumidos

- Não há ciclo mensal real, renovação, crédito, fatura ou pagamento.
- A troca de plano não tem Stripe, webhook, contrato ou efeito financeiro.
- O consumo é local ao navegador e é apagado por **Restaurar dados**.
- O contador usa execuções concluídas na demonstração, não uma fila real.

## Evidência automatizada

Os testes do repositório de demonstração verificam:

- consumo inicial no plano Starter;
- mudança de plano permitida somente ao Owner;
- manutenção do consumo ao mudar de plano;
- bloqueio da execução de número 501 do Starter;
- preservação de uma tarefa bloqueada na agenda.
