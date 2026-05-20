# Ibiti Jhovas Chalés — Landing Page

Site estático para tráfego pago e captação direta. Pronto para deploy no Vercel.

## Estrutura

```
ibiti-jhovas/
├── index.html        ← Página principal
├── styles.css        ← Estilos
├── script.js         ← Interações (nav, carrossel, reveal)
├── images/           ← Imagens da página
│   ├── chalet-trem-bao-exterior.webp
│   ├── breakfast-trem-bao.webp
│   └── logo.webp
└── README.md
```

## Como subir no Vercel (5 minutos)

1. Crie uma conta gratuita em [vercel.com](https://vercel.com).
2. Instale o CLI: `npm i -g vercel`, ou use o método sem CLI:
3. **Sem CLI (mais rápido):** abra [vercel.com/new](https://vercel.com/new) → "Deploy a Template" → arraste a pasta `ibiti-jhovas/` inteira para a área de upload.
4. Pronto. O Vercel gera um domínio tipo `ibiti-jhovas.vercel.app` que já está vivo.
5. Use esse domínio nos seus anúncios.

Quando comprar um domínio próprio (ex: `ibitijhovas.com.br`), basta plugar no painel do Vercel em **Project → Settings → Domains**.

## O que ainda precisa ser ajustado

Tem alguns pontos no código marcados como placeholder — abra os arquivos e procure os comentários:

### 1. Pixel do Facebook e Google Analytics
No `index.html`, procure o bloco:
```html
<!-- TRACKING — instale aqui depois (Meta Pixel + Google Analytics) -->
```
Descomente e substitua `SEU_PIXEL_ID_AQUI` e `G-XXXXXXXXXX` pelos IDs reais.

No `script.js`, descomente as linhas dentro do bloco "Tracking helper" para passar a disparar eventos de clique de CTA para o Pixel/GA.

### 2. Fotos dos outros 3 chalés
Hoje, os chalés **Uai Sô**, **Pode Crê** e **Demais da Conta** têm placeholder com gradiente da paleta da marca + nome em itálico. Quando tiver as fotos:
- Coloque as imagens em `images/` com nomes tipo `chalet-uai-so.webp`, `chalet-pode-cre.webp`, `chalet-demais-da-conta.webp`.
- No `index.html`, em cada um dos 3 cards, troque o `<div class="chale-card__media chale-card__media--placeholder ...">` por:
```html
<div class="chale-card__media">
  <img src="./images/chalet-uai-so.webp" alt="Chalé Uai Sô" loading="lazy" />
</div>
```

### 3. Logo sem fundo
A logo atual é a circular do Instagram (78x78). Quando você anexar uma versão horizontal com fundo transparente, salve como `images/logo.webp` (substituindo o atual) ou ajuste o `<img class="nav__logo">` no `index.html`.

## CTAs e mensagens do WhatsApp

Todos os botões de WhatsApp já abrem com **mensagem pré-preenchida** diferente por origem:

| Origem | Mensagem |
|---|---|
| Hero, Nav, Float, Footer | "Olá! Vim pelo site e gostaria de saber sobre disponibilidade." |
| Card de cada chalé | "Olá! Vim pelo site e tenho interesse no Chalé [NOME]." |
| Bloco de tarifas | "Olá! Vim pelo site e gostaria de verificar disponibilidade e valores." |
| Bloco de eventos | "Olá! Vim pelo site e gostaria de consultar disponibilidade do espaço para eventos." |
| CTA final | "Olá! Vim pelo site e gostaria de fazer uma reserva." |

Isso ajuda na hora de identificar de onde veio cada lead.

## Identidade visual aplicada

Paleta (do relatório de marca):
- **Terracota** `#CA8146` — CTAs, destaques
- **Marrom madeira** `#844C27` / `#5C3219` — títulos, seções escuras
- **Azul piscina** `#3A5E92` — uso sutil em badges
- **Creme/papel** `#FAF6EF` / `#F0E7D6` — fundos
- **Tinta** `#2C2419` — texto

Tipografia:
- **Fraunces** (Google Fonts) — display, com itálico editorial
- **Manrope** (Google Fonts) — corpo de texto

## Performance

- Imagens em WebP
- Preload da imagem do hero (LCP rápido)
- Fonts com `display=swap`
- Lazy loading nas imagens abaixo da dobra
- CSS e JS pequenos, sem dependências externas
- Carrossel CSS scroll-snap (zero biblioteca)

## Próximos passos sugeridos

1. Subir no Vercel e mandar o link.
2. Instalar o Pixel e GA assim que tiver os IDs.
3. Trocar as fotos dos placeholders pelas reais quando chegarem.
4. (Opcional) Comprar domínio próprio para anúncios mais profissionais.
