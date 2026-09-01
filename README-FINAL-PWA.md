# Orlando Flow v41.4.3 — Final PWA

Esta é a versão final do front com o novo ícone de viagem.

## Incluído
Android / Chrome:
- icons/icon-192.png
- icons/icon-512.png
- icons/icon-maskable-192.png
- icons/icon-maskable-512.png

Apple / iPhone / iPad:
- icons/apple-touch-icon.png
- icons/apple-touch-icon-152.png
- icons/apple-touch-icon-167.png
- icons/apple-touch-icon-180.png

Navegadores:
- icons/favicon.ico
- icons/favicon-16.png
- icons/favicon-32.png

Também foram atualizados:
- index.html
- manifest.webmanifest
- sw.js
- app.js (somente identificação da versão)
- styles.css (somente identificação do freeze)

O motor permanece inalterado.

## Como aplicar
Extraia este ZIP POR CIMA da pasta atual do Orlando Flow, permitindo substituir os arquivos.
Não apague as pastas `data/` nem os demais ícones temáticos que já existem no projeto.

Depois:
1. Feche todas as abas do localhost:8000.
2. Abra novamente.
3. Faça um F5.
4. No celular, desinstale o atalho/app antigo e instale novamente para o sistema buscar o novo ícone.

## Verificação
No Console:

```js
console.log(window.__ORLANDO_FLOW_FRONT_UX__.version);
caches.keys().then(console.log);
```

Esperado:
- 41.4.3-final
- orlando-flow-static-v41-4-1-final
- orlando-flow-runtime-v41-4-1-final


Ajuste desta versão:
- o logo do Animal Kingdom mantém a arte original tanto no modo claro quanto no modo escuro.
