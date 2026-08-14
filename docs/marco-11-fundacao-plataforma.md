# Marco 11 - Fundação da Plataforma

Período da fase: 05 a 30 de outubro de 2026.

## Objetivo

Iniciar a fundação da plataforma com uma configuração de workspace que aplica
as mesmas fronteiras de autorização, auditoria e experiência local já validadas
nas entregas anteriores.

## Entrega

- Rota `/configuracoes` para consultar os workspaces locais disponíveis.
- Atualização do nome exibido do workspace exclusivamente por Owner.
- Slug mantido somente para leitura como identificador estável.
- Registro `WORKSPACE_NAME_UPDATED` na auditoria.
- Aviso de somente leitura para Admin, Operator e Viewer.
- Atalho de configurações no dashboard autenticado.

## Regra de arquitetura

A interface seleciona um workspace, mas a regra de Owner é aplicada pelo
repositório de demonstração. A futura API deverá assumir essa validação,
persistência e auditoria em servidor sem alterar a jornada de UX.

## Limites

- Nome e auditoria ficam exclusivamente no `localStorage`.
- Não há domínio personalizado, transferência de propriedade, deleção de
  workspace ou sincronização entre navegadores.
- O slug não é recalculado ao renomear o workspace para não quebrar referências
  já exibidas na simulação.

## Critérios de aceite

- Owner altera o nome entre 2 e 80 caracteres e recebe confirmação.
- Admin não consegue alterar o nome, nem pela interface nem pelo repositório.
- O novo nome aparece no dashboard depois da atualização.
- O evento de auditoria identifica a mudança.
