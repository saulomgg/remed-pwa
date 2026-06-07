<div align="center">

# 💊 ReMed PWA

**Gestão inteligente de medicamentos, estoque e pedidos via WhatsApp. PWA Offline-First focado em privacidade.**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-Offline--First-purple?logo=googlechrome)](https://saulomgg.github.io/remed-pwa)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue?logo=github)](https://saulomgg.github.io/remed-pwa)
[![WhatsApp](https://img.shields.io/badge/Pedidos-WhatsApp-25D366?logo=whatsapp&logoColor=white)]()
[![Status](https://img.shields.io/badge/Status-Active-brightgreen)]()

<br/>

### 🌐 **[▶ Acesse o App Agora](https://saulomgg.github.io/remed-pwa)**

<br/>

> Seus medicamentos organizados, seu estoque sob controle, seus pedidos no WhatsApp — tudo **100% privado e offline**.

</div>

---

## 📸 Preview

<div align="center">
  <img width="392" height="845" alt="saulomgg" src="https://github.com/user-attachments/assets/392ad283-66bb-4d0f-91ff-1581eae5a449" />
</div>

---

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 💊 **Controle de Medicamentos** | Cadastre remédios com nome, dosagem, fabricante e horário |
| 📦 **Acompanhamento de Estoque** | Alertas automáticos: crítico 🔴, atenção 🟡, ok 🟢 |
| ⏰ **Lembretes de Dosagem** | Veja os horários do dia e receba notificações |
| 🔔 **Notificações** | Alertas de estoque baixo e hora do remédio no celular |
| 🏪 **Gerenciamento de Farmácias** | Lista de farmácias com contato via WhatsApp |
| 📲 **Pedidos via WhatsApp** | Mensagem pré-formatada com seus remédios, editável antes de enviar |
| 👤 **Perfil do Usuário** | Salve seu nome, endereço e telefone — aparece na mensagem do pedido |
| 🔒 **Privacidade Total** | Dados armazenados apenas no seu dispositivo (LocalStorage) |
| 💾 **Backup e Restauração** | Exporte e importe tudo via arquivo JSON |
| 🌙 **Tema Claro/Escuro** | Personalização de cores e aparência |
| ✈️ **Offline First** | Funciona completamente sem internet |
| 📲 **Instalável** | Comporta-se como app nativo no Android e iOS |

---

## 🛠️ Tecnologias

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat&logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-Service%20Workers-5A0FC8?style=flat&logo=googlechrome&logoColor=white)

- **HTML5 & CSS3** — Estrutura semântica com Design Tokens e componentes modulares
- **JavaScript ES6+** — Módulos independentes: `storage.js`, `ui.js`, `auth.js`, `app.js`
- **Service Workers** — Cache completo para funcionamento offline
- **Web App Manifest** — Instalação como app nativo
- **LocalStorage API** — Persistência 100% local e privada
- **Notifications API** — Alertas nativos de estoque e horário de remédios

---

## 📁 Estrutura do Projeto

```
remed-pwa/
├── assets/
│   ├── remed-logo.png   # Logo 1024×1024
│   ├── icon-192.png     # Ícone PWA pequeno
│   └── icon-512.png     # Ícone PWA grande
├── css/
│   ├── tokens.css       # Variáveis globais (cores, espaçamentos)
│   └── components.css   # Estilos dos componentes
├── js/
│   ├── storage.js       # Gerenciamento de dados no LocalStorage
│   ├── ui.js            # Interface: modais, tema, PWA, notificações
│   ├── auth.js          # Perfil do usuário
│   └── app.js           # Lógica principal: medicamentos, farmácias, pedidos
├── index.html           # Entrada principal
├── manifest.json        # Configuração PWA
└── sw.js                # Service Worker (cache offline)
```

---

## 🔒 Privacidade

- ✅ Todos os dados ficam **exclusivamente no seu dispositivo**
- ✅ Sem servidores, sem cadastro obrigatório, sem rastreamento
- ✅ Funciona 100% offline após o primeiro acesso
- ✅ Backup exportável a qualquer momento em formato JSON

---

## 🚀 Como Usar

### Opção 1 — Acesso direto (recomendado)

Acesse **[saulomgg.github.io/remed-pwa](https://saulomgg.github.io/remed-pwa)** e instale como app clicando em "Adicionar à tela inicial".

### Opção 2 — Rodar localmente

```bash
git clone https://github.com/saulomgg/remed-pwa.git
cd remed-pwa
npx serve .
```

> ⚠️ Para PWA funcionar (instalação + notificações), o projeto precisa ser servido via **HTTPS**.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Abra uma [issue](https://github.com/saulomgg/remed-pwa/issues) ou envie um pull request.

---

## 📄 Licença

Distribuído sob a licença [MIT](LICENSE).

---

<div align="center">

Desenvolvido com 💊 por [**Saulomgg**](https://github.com/saulomgg)

⭐ Se o projeto te ajudou, deixe uma estrela no repositório!

</div>
