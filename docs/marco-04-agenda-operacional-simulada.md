# Marco 04 - Agenda operacional simulada

Data: 13 de agosto de 2026.

## Objetivo

Demonstrar as jornadas JRN-04 e JRN-05 do dossiê técnico-operacional: criar
uma tarefa permitida, agendá-la, executá-la em ambiente seguro e acompanhar seu
histórico. O Marco 4 não depende de banco de dados, Redis, worker, OAuth ou
permissões reais da API do X.

## Escopo entregue

- Agenda local por workspace.
- Criação de tarefa com conteúdo de 3 a 280 caracteres e data/hora.
- Execução manual da simulação para uma tarefa agendada.
- Cancelamento de tarefa ainda agendada.
- Estados SCHEDULED, RUNNING, SUCCEEDED e CANCELED.
- Log por tarefa, com data, estado e descrição do evento.
- Controle de acesso: Owner, Admin e Operator podem criar, executar e
  cancelar; Viewer apenas acompanha agenda e logs.
- Seed demonstrativo com uma tarefa concluída.

## Fronteira do adaptador X

apps/web/app/lib/demo-x-adapter.ts representa o único ponto de integração usado
pelo M4. Ele retorna uma confirmação simulada e não chama a API do X, não
inicia OAuth, não armazena tokens, não publica conteúdo externo e não usa
proxies ou segredos.

Essa separação atende à decisão DEC-008 e prepara a troca pelo adaptador real
quando as permissões forem confirmadas.

## Dados e persistência

Tarefas e eventos pertencem ao mesmo objeto persistido em localStorage do
Marco 3. São isolados por navegador e podem ser apagados por **Restaurar
dados**. A sessão permanece em sessionStorage. Não há sincronização com GitHub
Pages, banco de dados ou qualquer provedor externo.

## Fluxo de demonstração

1. Entre como Ana, Bruno ou Carla.
2. Escreva o conteúdo e escolha uma data/hora em **Agenda de tarefas
   permitidas**.
3. Clique em **Agendar tarefa**.
4. Clique em **Executar simulação** para registrar RUNNING e SUCCEEDED.
5. Entre como Diego para validar o modo somente leitura.
6. Use **Restaurar dados** para retornar ao seed versionado.

## Critérios de aceite verificados

| Critério                                             | Evidência                             |
| ---------------------------------------------------- | ------------------------------------- |
| Uma tarefa permitida é criada e recebe identificador | createTask e teste unitário           |
| Execução não chama o X nem armazena credenciais      | Adaptador local explícito             |
| Estado e eventos são visíveis no dashboard           | Lista de tarefas e trilha por cartão  |
| Viewer não opera tarefas                             | Regra no repositório e teste unitário |
| Tarefa cancelada não pode ser executada              | Regra no repositório e teste unitário |

## Limites conhecidos

- Não há agendador real: a execução é manual na interface.
- Não há fila BullMQ, retries, idempotência persistente ou dead-letter.
- Não existe conexão ou publicação real no X.
- Não existe consumo, cobrança ou bloqueio por plano.
