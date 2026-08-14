# Documentação NexoFlux

Este diretório é a fonte de verdade técnica do projeto. Toda mudança de comportamento, contrato, modelo de dados ou operação deve atualizar o documento correspondente no mesmo marco.

## Mapa documental

- [Marco 02 — Identidade, workspaces e RBAC](./marco-02-identidade-workspaces-rbac.md): escopo, critérios de aceite, implementação e rastreabilidade.
- [Marco 02.1 — Validação de integração](./marco-02-1-validacao-integracao.md): preflight, smoke HTTP, limpeza e resultado do ambiente.
- [Marco 03 — Simulação web autenticada](./marco-03-simulacao-web.md): contas locais, workspaces, membros, RBAC e limites da demonstração.
- [Marco 04 — Agenda operacional simulada](./marco-04-agenda-operacional-simulada.md): tarefas permitidas, agenda, logs e adaptador X local.
- [Marco 05 — Planos e consumo simulados](./marco-05-planos-consumo-simulado.md): cotas por plano, bloqueio e upgrade local.
- [Marco 06 — Cobrança sandbox simulada](./marco-06-cobranca-sandbox-simulada.md): assinatura, eventos e reconciliação local.
- [Marco 07 — Administração simulada](./marco-07-administracao-simulada.md): consultas locais, pesquisa e trilha de auditoria.
- [Marco 08 — Prontidão de integrações simulada](./marco-08-prontidao-integracoes-simulada.md): feature flag local, estados e fronteiras de integração.
- [Marco 09 — Correções de homologação](./marco-09-correcao-homologacao.md): correções do relatório, critérios de reteste e dependências externas.
- [Publicação no GitHub Pages](./publicacao-github-pages.md): build estático, URL pública e operação do deploy.
- [Arquitetura](./arquitetura.md): componentes, limites, fluxos e decisões estruturais.
- [Modelo de dados](./modelo-de-dados.md): tabelas, relacionamentos, constraints e invariantes.
- [API HTTP](./api-http.md): autenticação, endpoints, payloads, respostas e erros.
- [RBAC](./rbac.md): matriz de permissões e regras administrativas.
- [Operação local](./operacao-local.md): ambiente, migrações, execução e diagnóstico.
- [Validação](./validacao.md): estratégia de testes, comandos e limitações conhecidas.

## Regra de manutenção

Uma alteração só é considerada concluída quando código, testes e documentação estão coerentes. O arquivo [README](../README.md) funciona como porta de entrada; os detalhes ficam nestes documentos.
