# ReMed PWA

PWA responsivo para organizar medicamentos, horários e estoque em um só lugar. O ReMed foi pensado para uso rápido no celular, com dados salvos localmente e recursos que ajudam no acompanhamento diário do tratamento.

## O que o app faz

- Cadastro, edição e exclusão de medicamentos.
- Organização de horários e doses do dia.
- Registro de doses tomadas.
- Controle de estoque e alerta de reposição.
- Notificações de lembrete quando suportadas pelo navegador.
- Integração opcional com Google Agenda.
- Montagem de pedidos para farmácias via WhatsApp.
- Lista de farmácias e anotações.
- Tema claro/escuro e instalação como aplicativo.
- Modo demonstração com dados de exemplo.
- Armazenamento local: os dados ficam no navegador do usuário.

> O ReMed é uma ferramenta de organização. Ele não substitui orientação médica, receita ou acompanhamento profissional.

## Correção da tela branca no GitHub Pages

A tela branca acontecia porque o GitHub Pages estava publicando os arquivos-fonte diretamente. O `index.html` tentava carregar `/src/main.tsx`, mas o navegador não executa TSX bruto. Além disso, os caminhos iniciados por `/` apontavam para a raiz do domínio, e não para `/remed-pwa/`.

Esta versão corrige os dois pontos: `vite.config.ts` usa `base: '/remed-pwa/'`, o projeto é publicado a partir de `dist/`, e manifesto, service worker, ícones e notificações usam o subdiretório correto.

## Requisitos

- Node.js 20.19+ ou 22.12+.
- npm 10+.

## Executar localmente

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite, normalmente `http://localhost:3000`.

## Validar antes de publicar

```bash
npm run lint
npm run build
npm run preview
```

A build final fica em `dist/`.

## Publicar manualmente no GitHub Pages

1. Execute `npm install` e `npm run build`.
2. Publique o **conteúdo interno** da pasta `dist/` no branch configurado para o GitHub Pages, normalmente `gh-pages`.
3. Em **Settings > Pages**, selecione **Deploy from a branch**, escolha o branch e a pasta `/ (root)`.
4. Abra `https://SEU-USUARIO.github.io/remed-pwa/`.

Não publique a raiz do código-fonte diretamente como site. O navegador deve receber o conteúdo gerado dentro de `dist/`.

## Publicar automaticamente por GitHub Actions

O arquivo `.github/workflows/deploy-pages.yml` instala dependências, executa `npm run build` e publica `dist/` no GitHub Pages. No GitHub, em **Settings > Pages > Build and deployment > Source**, escolha **GitHub Actions**.

O workflow usa o nome de repositório `remed-pwa`. Se o repositório tiver outro nome, altere `base` no `vite.config.ts` para `/<nome-do-repositorio>/`.

## Estrutura principal

```text
src/                 Código React, componentes, hooks, utilitários e tipos
public/              Ícones e arquivos públicos
index.html           Entrada HTML
vite.config.ts       Build, base do GitHub Pages e manifesto PWA
```

## Configuração opcional

Copie `.env.example` para `.env.local` apenas se for usar alguma integração que exija configuração. Nunca publique chaves secretas no GitHub.

## Privacidade e dados

O armazenamento principal é local, no navegador do dispositivo. Limpar os dados do site, trocar de navegador ou usar outro aparelho pode remover ou deixar indisponíveis os dados salvos localmente.

## Licença

Defina a licença do projeto antes de torná-lo público. Caso ainda não tenha escolhido uma, mantenha o repositório sem declaração de licença explícita.
