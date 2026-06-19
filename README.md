# Portfólio — Seu Nome

Site 100% HTML + CSS + JS puro (sem framework, sem build tool). Abre direto no navegador ou publica em qualquer host estático (GitHub Pages, Netlify, Cloudflare Pages).

## Conceito

O site inteiro é encenado como uma **chamada de vídeo em andamento**:
- Barra de topo = status da chamada (disponível, localização, fuso, relógio em tempo real, menu ⋮)
- Barra de baixo (fixa) = controles da chamada → é a navegação principal (Work, AI & Automations, Product Thinking, About, Contact, Let's talk)
- **Work** → seções aparecem como "gravações" (REC 001, REC 002...)
- **AI & Automations** → cards estilo "tela compartilhada"
- **Product Thinking** → lista estilo "legendas/transcript"
- **About** → "cartão do participante"
- **Contact** → "agendar próxima call"

## Estrutura de arquivos

```
index.html                      → página principal (hero + todas as seções)
playground.html                 → hub dos mini-games (acessível pelo menu ⋮)
games/
  signal-defense.html           → jogo jogável (estilo space-shooter, nome/arte originais)
  uplink-run.html                → protótipo WIP (estilo run-and-gun, nome/arte originais)
case-studies/
  _template.html                 → modelo para criar uma página de projeto nova
assets/
  css/style.css                  → todo o design system (cores, tipografia, componentes)
  js/main.js                     → scroll reveal, menu, relógio, nav ativa
  js/games/signal-defense.js     → lógica do jogo 1
  js/games/uplink-run.js         → lógica do jogo 2 (esqueleto)
uploads/
  hero.png                       → imagem de referência da hero (placeholder — troque pela sua foto real)
```

> ⚠️ Nota sobre os jogos: usei nomes e mecânicas inspiradas em clássicos (shooter de invasores / run-and-gun), mas **sem usar os nomes ou personagens originais** (Space Invaders e Contra são marcas registradas). Pode renomear como quiser.

## Como adicionar um novo case study

1. Copie `case-studies/_template.html` para `case-studies/nome-do-projeto.html`
2. Preencha as 4 seções (Problema, Pesquisa, Decisões, Resultado)
3. Adicione um novo `.rec-card` em `index.html` (seção `#work`) apontando pra essa página

## Como adicionar conteúdo nas outras seções

Procure por `<span class="todo">` em `index.html` — marca exatamente onde colocar conteúdo real no lugar dos placeholders.

## Publicar no GitHub Pages

```bash
git init                                          # já feito neste projeto
git add .
git commit -m "estrutura inicial do portfólio"

# crie um repositório vazio em github.com/new, depois:
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git branch -M main
git push -u origin main

# no GitHub: Settings → Pages → Source: main / root
# o site fica em https://SEU-USUARIO.github.io/SEU-REPO/
```

A cada novo conteúdo (case study, nota de Product Thinking, etc.):

```bash
git add .
git commit -m "adiciona case study X"
git push
```
