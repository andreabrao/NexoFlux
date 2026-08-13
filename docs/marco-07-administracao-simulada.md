# Marco 07 - Administração simulada

Data: 13 de agosto de 2026.

## Objetivo

Demonstrar o recorte inicial de BLG-008 do dossiê técnico-operacional:
consultar usuários, workspaces, planos, assinaturas e ações sensíveis de forma
pesquisável e auditável, mantendo o ambiente inteiramente local.

## Escopo entregue

- Painel de administração visível apenas a Owners.
- Contadores de usuários, workspaces e eventos auditados.
- Pesquisa por usuário, e-mail, workspace, plano e status da assinatura.
- Lista de workspaces, participantes, plano e estado de cobrança.
- Lista de usuários locais sem senhas.
- Trilha de auditoria com ator, alvo, ação, detalhe e data.
- Registro local de criação de workspace, mudança de plano, gestão de membros,
  criação, cancelamento e execução de tarefa, além de webhook de cobrança.

## Autorização

O repositório demonstrativo exige que o usuário tenha pelo menos uma membership
OWNER para consultar a visão administrativa. Admin, Operator e Viewer recebem
erro de autorização e não veem a seção na interface.

Essa regra é somente para o modo local. Uma administração produtiva precisa de
permissão de plataforma específica, validada pela API no servidor, e não deve
conceder acesso global apenas por ser Owner de um workspace.

## Dados exibidos e proteção

Todos os dados são originados do localStorage do navegador. A tela omite
senhas e não possui tokens, credenciais, cartões, chaves de Stripe ou segredos
de proxy. O campo de evento do billing mostra somente o identificador sintético
gerado pelo adapter local.

**Restaurar dados** remove também a trilha local e volta ao seed versionado.

## Limites conhecidos

- Não existe conta de suporte ou administrador global real.
- Não há paginação, exportação CSV, busca no servidor ou retenção configurável.
- Eventos anteriores ao M7 não são reconstruídos retroativamente, exceto o
  evento inicial presente no seed.
- A auditoria não é imutável e não possui correlação distribuída porque a
  demonstração não usa servidor.

## Evidência automatizada

Os testes verificam que:

- um Owner consulta a visão administrativa;
- Admin não consulta essa visão;
- totais de usuários e workspaces são apresentados;
- agendar uma tarefa gera um evento de auditoria.
