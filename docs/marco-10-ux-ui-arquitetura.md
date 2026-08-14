# Marco 10 - UX/UI e arquitetura inicial

Início da fase: 07 de setembro de 2026, conforme o cronograma pós-kickoff.

## Objetivo

Iniciar a fase autorizada de UX/UI e arquitetura com uma jornada de perfil
coerente com a experiência já homologada, sem antecipar integrações ou
persistência de produção.

## Entrega inicial

- Nova rota `/perfil`, acessível a partir do workspace autenticado.
- Alteração do nome exibido na demonstração local.
- E-mail apresentado somente para leitura.
- Registro `PROFILE_UPDATED_LOCAL` na auditoria.
- Mensagens de sucesso e erro no mesmo padrão das demais jornadas.
- Interface responsiva e separada em componente, rota e repositório local.

## Fronteira arquitetural

O componente de perfil não decide autorização nem acessa serviços externos. Ele
obtém a sessão da aba, solicita a mudança ao repositório de demonstração e
renderiza o resultado. A futura API assumirá autenticação, validação de
identidade, histórico imutável e sincronização entre dispositivos.

## Limites intencionais

- Não há alteração de e-mail, senha, avatar ou conta externa por esta tela.
- O perfil existe apenas no `localStorage` do navegador.
- O caminho não substitui a gestão de usuários em servidor nem OAuth.

## Critérios de aceite

- Usuário com sessão local visualiza nome e e-mail.
- Nome entre 2 e 80 caracteres é salvo e refletido no workspace.
- Mudança inválida apresenta erro sem alterar o estado.
- A auditoria registra a alteração do perfil.
