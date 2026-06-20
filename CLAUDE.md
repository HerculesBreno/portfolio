# Portfolio — Diretrizes do Projeto

## Contexto
Portfólio de Product Designer com estética "video call em andamento". HTML/CSS/JS puro, sem frameworks.

## Arquivos principais
- `index.html` — página principal
- `assets/css/style.css` — único arquivo de estilos
- `assets/js/main.js` — interações (scroll reveal, clock, callbar active state)
- `playground.html` — mini-games
- `case-studies/_template.html` — template de case study

---

## Design System: Liquid Glass

Este projeto segue o padrão **Liquid Glass** da Apple (introduzido no iOS 26 / WWDC 2025).

### O que é Liquid Glass
Superfícies translúcidas que simulam vidro fosco com profundidade, luz ambiente e reflexos especulares. Os materiais "deixam passar" a cor do ambiente por baixo, criando camadas de profundidade.

### Tokens obrigatórios no `:root`
```css
--glass-bg:           rgba(255, 255, 255, 0.05);
--glass-bg-hover:     rgba(255, 255, 255, 0.09);
--glass-border:       rgba(255, 255, 255, 0.10);
--glass-border-hover: rgba(255, 255, 255, 0.18);
--glass-blur:         blur(24px) saturate(180%);
--glass-blur-sm:      blur(12px) saturate(150%);
--glass-shadow:       0 8px 32px rgba(0,0,0,0.40), 0 1px 0 rgba(255,255,255,0.10) inset;
--glass-shadow-lg:    0 20px 60px rgba(0,0,0,0.50), 0 1px 0 rgba(255,255,255,0.12) inset;
--glass-shine:        linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 55%);
```

### Regras por componente

#### Painéis e Cards (`.rec-card`, `.screen-card`, `.participant-card`, `.schedule-panel`)
```
background:       var(--glass-bg)
border:           1px solid var(--glass-border)
backdrop-filter:  var(--glass-blur)
box-shadow:       var(--glass-shadow)
position:         relative  ← obrigatório para o ::before shine
overflow:         hidden     ← obrigatório para cortar o ::before
```
Pseudo-elemento `::before` obrigatório para o reflexo especular:
```
content: ""
position: absolute; inset: 0; pointer-events: none
background: var(--glass-shine)
border-radius: inherit
```

#### Hover state de cards
```
background:   var(--glass-bg-hover)
border-color: var(--glass-border-hover)  ← ou tint de cor (ex: amber 0.25)
box-shadow:   var(--glass-shadow-lg)
transform:    translateY(-4px)
```

#### Navegação flutuante (`.callbar-inner`, `.topbar.solid`)
```
background:      rgba(18, 16, 14, 0.72)   ← fundo mais escuro que os cards
backdrop-filter: var(--glass-blur)
border:          1px solid var(--glass-border)
box-shadow:      var(--glass-shadow-lg)
```

#### Drawers e overlays (`.about-panel`, `.dropdown`)
```
background:      rgba(22, 20, 18, 0.75)
backdrop-filter: var(--glass-blur)
border:          1px solid var(--glass-border)
```

#### Chips e pills (`.skill-chips span`, `.rec-tags span`, `.status-pill`)
```
background:      rgba(255, 255, 255, 0.06)
border:          1px solid var(--glass-border)
backdrop-filter: var(--glass-blur-sm)
```

#### Botões filled (`.btn-filled`)
Manter amber como cor, mas adicionar shimmer sutil:
```
box-shadow: 0 1px 0 rgba(255,255,255,0.25) inset, 0 4px 16px rgba(232,162,61,0.30)
```

### Checklist de conformidade — rode antes de qualquer PR
Ao revisar um componente, verifique:
- [ ] `backdrop-filter` presente com pelo menos `blur(12px)`
- [ ] `background` usa `rgba()` com alpha < 0.15 (não cor sólida)
- [ ] `border` usa `rgba(255,255,255, 0.08–0.18)` — não `var(--hairline)` em cards principais
- [ ] `box-shadow` inclui o highlight interno `0 1px 0 rgba(255,255,255,N) inset`
- [ ] Pseudo-elemento `::before` com `var(--glass-shine)` nos cards
- [ ] `position: relative` + `overflow: hidden` nos cards para o shine funcionar
- [ ] Hover aumenta opacidade do background e eleva o card
- [ ] `@media (prefers-reduced-motion)` desativa transforms (já presente no CSS global)

### O que NÃO fazer
- Não usar `background: var(--panel)` (cor sólida) em cards ou painéis principais
- Não usar `border: 1px solid var(--hairline)` em cards — substitua por border em rgba branco
- Não empilhar mais de 3 camadas de blur (performance)
- Não aplicar `backdrop-filter` em elementos sem conteúdo atrás deles

---

## Agente de UI

Use `/liquid-glass` para invocar o agente de revisão de UI. Ele:
1. Lê todos os arquivos CSS e HTML
2. Analisa cada componente contra as regras acima
3. Reporta o que está em conformidade e o que não está
4. Aplica as correções necessárias

---

## Convenções de código
- Zero frameworks — HTML/CSS/JS vanilla
- Sem comentários óbvios no CSS
- Tokens no `:root`, nunca valores mágicos inline
- Mobile-first só nos breakpoints; a base é desktop
- Acessibilidade: `focus-visible`, `aria-*`, `role` onde necessário
