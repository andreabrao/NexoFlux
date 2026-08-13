# Documentação NexoFlux

Este diretório é a fonte de verdade técnica do projeto. Toda mudança de comportamento, contrato, modelo de dados ou operação deve atualizar o documento correspondente no mesmo marco.

## Mapa documental

- [Marco 02 — Identidade, workspaces e RBAC](./marco-02-identidade-workspaces-rbac.md): escopo, critérios de aceite, implementação e rastreabilidade.
- [Marco 02.1 — Validação de integração](./marco-02-1-validacao-integracao.md): preflight, smoke HTTP, limpeza e resultado do ambiente.
- [Arquitetura](./arquitetura.md): componentes, limites, fluxos e decisões estruturais.
- [Modelo de dados](./modelo-de-dados.md): tabelas, relacionamentos, constraints e invariantes.
- [API HTTP](./api-http.md): autenticação, endpoints, payloads, respostas e erros.
- [RBAC](./rbac.md): matriz de permissões e regras administrativas.
- [Operação local](./operacao-local.md): ambiente, migrações, execução e diagnóstico.
- [Validação](./validacao.md): estratégia de testes, comandos e limitações conhecidas.

## Regra de manutenção

Uma alteração só é considerada concluída quando código, testes e documentação estão coerentes. O arquivo [README](../README.md) funciona como porta de entrada; os detalhes ficam nestes documentos.
