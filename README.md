# 💊 ReMed - Web App Progressivo (PWA)

## Visão Geral

O ReMed é um **aplicativo web progressivo (PWA) offline-first** projetado para ajudar usuários a gerenciar seus medicamentos de forma inteligente, privada e gratuita. Ele permite cadastrar medicamentos, acompanhar o estoque, configurar lembretes de dosagem, gerenciar farmácias e criar pedidos de reposição via WhatsApp.

**Principais Características:**

*   **Offline-First:** Funciona perfeitamente mesmo sem conexão com a internet, garantindo acesso contínuo aos dados dos seus medicamentos.
*   **Privacidade Total:** Todos os dados dos seus medicamentos e farmácias são armazenados **exclusivamente no seu dispositivo** (via `localStorage`). Nenhuma informação sensível é enviada a servidores externos.
*   **Controle de Medicamentos:** Cadastre medicamentos com detalhes, acompanhe o estoque restante e receba alertas de status (crítico, atenção, ok).
*   **Lembretes de Dosagem:** Configure horários para tomar seus medicamentos e receba lembretes diários.
*   **Gerenciamento de Farmácias:** Mantenha uma lista de farmácias com contatos e endereços para facilitar pedidos.
*   **Pedidos via WhatsApp:** Gere listas de medicamentos para reposição e envie-as diretamente para farmácias cadastradas.
*   **Backup e Restauração:** Exporte e importe seus dados em formato JSON para segurança e portabilidade.
*   **Personalização:** Escolha temas de cores e alterne entre modos claro/escuro para uma experiência visual agradável.
*   **PWA Instalável:** Pode ser instalado na tela inicial do seu smartphone ou desktop, comportando-se como um aplicativo nativo.

## Arquitetura Frontend

O ReMed é construído com tecnologias web padrão, focando em performance e usabilidade:

*   **HTML5:** Estrutura semântica da aplicação.
*   **CSS3:** Estilização modular com `tokens.css` (variáveis globais) e `components.css` (estilos de componentes).
*   **JavaScript:** Lógica de negócio e interatividade, organizada em módulos:
    *   `storage.js`: Gerenciamento de dados no `localStorage`.
    *   `ui.js`: Funções de interface do usuário (modais, toasts, tema, PWA).
    *   `app.js`: Lógica principal de gestão de medicamentos, farmácias, lembretes e pedidos.
    *   `auth.js`: Gerenciamento do cadastro do usuário (opcional).

## Funcionalidades Offline

Graças ao **Service Worker (`sw.js`)** e ao armazenamento local, as seguintes funcionalidades estão disponíveis offline:

*   Navegação completa pela interface do aplicativo.
*   Cadastro e edição de medicamentos.
*   Acompanhamento de estoque e status dos medicamentos.
*   Configuração e visualização de lembretes de dosagem.
*   Cadastro e gerenciamento de farmácias.
*   Geração de pedidos via WhatsApp (a ação de envio requer conexão).
*   Personalização de tema e cores.
*   Backup e restauração de dados (exportação/importação de JSON).

## Backend Opcional (Cadastro de Usuário)

Embora a gestão de medicamentos seja totalmente offline, o ReMed oferece um **backend opcional** para o cadastro do usuário. Este cadastro é usado para:

*   Registrar nome, e-mail e telefone do usuário.
*   Gerar uma chave única para identificação futura.

**Importante:** Este backend **não armazena dados dos seus medicamentos ou farmácias**. Ele serve apenas para o registro básico do usuário. A comunicação com o backend é feita através de um **Cloudflare Worker** que, por sua vez, interage com um **Google Apps Script** para salvar os dados em uma planilha Google Sheets.

**O código do backend (`worker.js` e `appscript.js`) está em um repositório separado** para manter a clareza da arquitetura e a independência do frontend. Consulte o repositório `remed-backend` para detalhes sobre sua implementação e deploy.

## Instalação (PWA)

Para instalar o ReMed como um aplicativo em seu dispositivo:

1.  Acesse a URL do aplicativo em seu navegador (ex: `remed.pages.dev`).
2.  Clique no botão de instalação (geralmente um ícone de "+" ou "Instalar" na barra de endereço ou menu do navegador).
3.  Confirme a instalação quando solicitado.

## Deploy do Frontend

O frontend do ReMed pode ser facilmente implantado em serviços de hospedagem estática como **Cloudflare Pages** ou **GitHub Pages**.

**Passos:**

1.  Faça o upload de todos os arquivos e pastas **exceto** a pasta `backend/` para o seu serviço de hospedagem.
2.  Certifique-se de que o `manifest.json` e o `sw.js` estejam na raiz do projeto para que o PWA funcione corretamente.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues, sugerir melhorias ou enviar pull requests. Por favor, siga o [Código de Conduta](CODE_OF_CONDUCT.md) e as [Diretrizes de Contribuição](CONTRIBUTING.md).

## Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Contato

Desenvolvido por [Saulomgg](https://github.com/saulomgg)
