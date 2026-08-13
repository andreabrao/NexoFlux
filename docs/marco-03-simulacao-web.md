# Marco 03 — Simulação web autenticada

Data: 13 de agosto de 2026.

## Objetivo

Transformar as regras de identidade, workspaces e RBAC já modeladas no projeto
em uma demonstração navegável, sem exigir banco de dados, Redis ou API em
execução.

## Escopo entregue

- Landing page com entrada para a demonstração.
- Cadastro local de uma conta e de um primeiro workspace.
- Login local com contas de demonstração.
- Sessão limitada à aba atual do navegador.
- Dashboard com seleção e criação de workspaces.
- Lista de membros e indicação clara da função ativa.
- Inclusão de pessoas já existentes na base demonstrativa.
- Alteração de função exclusiva para Owner.
- Remoção de membro para Owner/Admin, com as restrições do RBAC.
- Restauração dos dados iniciais por um botão explícito.
- Layout responsivo para desktop e celular.

## Fonte dos dados

Os dados iniciais existem em \`apps/web/app/lib/demo-repository.ts\` e são
versionados junto com o código. As quatro contas disponíveis são:

| Nome        | E-mail                       | Função inicial |
| ----------- | ---------------------------- | -------------- |
| Ana Martins | ana.owner@nexoflux.demo      | OWNER          |
| Bruno Lima  | bruno.admin@nexoflux.demo    | ADMIN          |
| Carla Souza | carla.operator@nexoflux.demo | OPERATOR       |
| Diego Alves | diego.viewer@nexoflux.demo   | VIEWER         |

Senha comum de demonstração: \`NexoFlux-demo-2026!\`

## Persistência da simulação

| Informação                       | Local              | Duração                                                       |
| -------------------------------- | ------------------ | ------------------------------------------------------------- |
| Contas, workspaces e memberships | localStorage       | Até restaurar os dados ou limpar o armazenamento do navegador |
| Sessão do usuário                | sessionStorage     | Até fechar a aba, sair ou expirar em oito horas               |
| Código e dados iniciais          | Repositório GitHub | Versionado por commit                                         |

O repositório GitHub armazena o código e a base inicial; ele não é banco de
dados e não recebe alterações criadas por quem usa a demonstração.

## Regras reproduzidas

- Todas as funções podem consultar um workspace do qual participam.
- Owner e Admin podem adicionar membros.
- Somente Owner pode adicionar outro Owner.
- Somente Owner pode mudar funções.
- Owner e Admin podem remover membros não-Owner.
- Admin não pode remover Owner.
- O último Owner não pode ser removido nem rebaixado.

O frontend reproduz essas regras para a demonstração. Quando a API real for
conectada, ela continua sendo a fonte de autorização definitiva.

## Limites assumidos

- Não há segurança de produção: senhas demonstrativas ficam no código cliente.
- Não há recuperação de senha, e-mail transacional ou OAuth.
- Não existe sincronização entre navegadores ou dispositivos.
- A proteção de rota é de experiência do usuário; uma versão produtiva depende
  da sessão e da autorização no servidor.

## Como demonstrar

1. Acesse \`/entrar\`.
2. Selecione uma das quatro contas de demonstração.
3. Entre usando a senha exibida na página.
4. Compare os controles de membros entre Owner, Admin, Operator e Viewer.
5. Use **Restaurar dados** para voltar ao estado inicial.

## Testes

\`apps/web/app/lib/demo-repository.spec.ts\` cobre:

- carregamento das quatro funções;
- criação de conta com workspace isolado;
- proibição de Admin adicionar Owner;
- proteção do último Owner;
- restauração do seed versionado.
