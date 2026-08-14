# Marco 13 - Beta fechado simulado

## Objetivo

Organizar participantes-piloto para o reteste da demonstração antes de uma
operação externa, mantendo o beta limitado ao navegador e aos dados locais.

## Entrega

- Rota `/beta-fechado` por workspace.
- Inclusão local de participante por nome e e-mail.
- Estados `INVITED`, `ACTIVE` e `PAUSED`.
- Alterações permitidas somente para Owner.
- Eventos de auditoria para convite e mudança de status.

## Limites do beta

Esta lista não cria contas, não envia e-mails, não fornece link de acesso, não
ativa cobrança e não integra a API do X. É uma ferramenta de organização do
reteste fictício e desaparece ao restaurar os dados do navegador.

## Critérios de aceite

- Owner inclui e ativa um participante-piloto local.
- Admin, Operator e Viewer apenas visualizam a lista.
- A auditoria registra convite e alteração de status.
