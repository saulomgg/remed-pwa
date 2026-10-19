# ReMed PWA

PWA para organizar medicamentos, horários, doses, estoque, notificações e pedidos via WhatsApp. Os dados ficam localmente no navegador.

## Rodar localmente

```bash
npm install
npm run dev
```

## Publicar no GitHub Pages

```bash
npm run build
```

Publique o conteúdo de `dist/` no GitHub Pages. Não publique os arquivos-fonte diretamente: o build corrige a base `/remed-pwa/`, gera o JavaScript minificado, o manifesto e o service worker.

> O app é uma ferramenta de organização e não substitui orientação médica.
