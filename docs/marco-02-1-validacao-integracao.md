# Marco 02.1 — Validação de integração

Data: 13 de agosto de 2026.

## Objetivo

Fechar a validação real do Marco 02 contra PostgreSQL e Redis com um único comando reproduzível, sem depender de passos HTTP manuais.

## Comando

```bash
pnpm verify:integration
```

O comando executa, nesta ordem:

1. preflight TCP de PostgreSQL e Redis;
2. build da API;
3. aplicação das migrações com checksum;
4. inicialização temporária da API compilada, caso ela ainda não esteja ativa;
5. smoke test HTTP de identidade, sessão, workspaces e RBAC;
6. limpeza dos usuários, workspaces, sessões e eventos temporários;
7. encerramento da API iniciada pelo verificador.

Se uma API já estiver respondendo em API_URL, o verificador reutiliza esse processo e não o encerra.

## Verificações do fluxo

O smoke test executa 17 verificações:

- quatro cadastros independentes;
- consulta da sessão do Owner;
- inclusão de Admin e Viewer;
- listagem de três membros pelo Admin;
- negação de acesso para usuário sem membership;
- negação para Admin conceder Owner;
- negação para Admin alterar função;
- promoção de Admin para Owner pelo Owner atual;
- remoção segura do Owner original após a promoção;
- negação do acesso do usuário removido;
- proteção contra remover o último Owner;
- logout do novo Owner;
- negação do token revogado.

## Segurança do verificador

- Por padrão, o alvo HTTP precisa ser localhost, 127.0.0.1 ou ::1.
- Um alvo remoto exige ALLOW_REMOTE_INTEGRATION_SMOKE=true de forma explícita.
- E-mails e workspaces recebem sufixos aleatórios por execução.
- A limpeza usa somente UUIDs retornados pelos cadastros daquela execução.
- SMOKE_KEEP_DATA=true preserva os dados temporários para investigação manual.
- URLs exibidas pelo preflight têm senhas mascaradas.
- O preflight interrompe antes do build/migração quando a infraestrutura está ausente.

## Scripts

- apps/api/scripts/integration-preflight.ts: disponibilidade TCP e mensagem operacional.
- apps/api/scripts/auth-integration-smoke.ts: cenário HTTP e limpeza transacional.
- apps/api/scripts/verify-integration.ts: ciclo de vida da API compilada.

## Resultado no ambiente atual

A execução de 13 de agosto de 2026 foi interrompida corretamente no preflight:

```text
Infraestrutura indisponível: PostgreSQL em postgresql://nexoflux:***@localhost:5432/nexoflux, Redis em redis://localhost:6379. Inicie os serviços com docker compose up -d antes de repetir.
```

Não houve migração nem criação de dados. O cenário completo permanece pendente até PostgreSQL e Redis estarem acessíveis.
