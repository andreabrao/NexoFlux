# Publicação no GitHub Pages

## Objetivo

Disponibilizar a demonstração web do Marco 3 no endereço público:

<https://andreabrao.github.io/NexoFlux/>

## Fluxo automatizado

O workflow .github/workflows/deploy-pages.yml é executado a cada push na branch
main e pode ser iniciado manualmente na aba **Actions** do GitHub. Ele instala
as dependências, compila os contratos, gera a exportação estática do Next.js e
publica somente o artefato de apps/web/out.

Durante essa compilação, a configuração web adiciona o prefixo /NexoFlux.
Assim, links, rotas e arquivos estáticos funcionam tanto no GitHub Pages quanto
no desenvolvimento local, que continua em http://localhost:3000.

## Configuração única no GitHub

Em **Settings → Pages** do repositório, a opção **Source** deve estar como
**GitHub Actions**. A opção anterior, de publicar o conteúdo da branch main, é
a causa de exibir o README em vez do site.

Depois de selecionada uma vez, cada push futuro na main atualiza o site
automaticamente.

## Limites da demonstração

O GitHub Pages serve arquivos estáticos. Por isso o login, as contas, os
workspaces e as permissões demonstrativas continuam locais ao navegador, como
definido no Marco 3. Não há banco de dados, API executando ou sincronização de
interações do visitante com o repositório.
