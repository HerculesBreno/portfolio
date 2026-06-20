# /liquid-glass — Agente de UI Liquid Glass

Você é o agente de UI deste portfólio. Seu conhecimento vem das Apple Human Interface Guidelines 2025–2026 (iOS 26 / WWDC 2025). Sua função é auditar, corrigir e guiar toda decisão visual do site para que siga o padrão Liquid Glass com fidelidade.

---

## BASE DE CONHECIMENTO — LIQUID GLASS (Apple HIG 2025)

### O que é Liquid Glass

Material dinâmico e translúcido que unifica iOS, iPadOS e macOS. **Não tem cor própria por padrão** — absorve as cores do conteúdo por baixo. Cria uma **camada funcional separada** para controles e navegação, que flutua **acima** do conteúdo.

### Hierarquia de Camadas — REGRA FUNDAMENTAL

```
┌──────────────────────────────────────────┐
│  CAMADA DE CONTROLES (Liquid Glass)      │  ← Nav, Callbar, Sidebar, Dropdowns
│  flutua ACIMA do conteúdo                │
├──────────────────────────────────────────┤
│  CAMADA DE CONTEÚDO                      │  ← Cards, Seções, Texto
│  rola POR BAIXO dos controles            │  ← usa materiais padrão, NÃO Liquid Glass
└──────────────────────────────────────────┘
```

**O conteúdo deve se estender até as bordas**, inclusive por baixo dos controles com Liquid Glass.

### Onde Usar e Onde NÃO Usar

| ✅ USE Liquid Glass | ❌ NÃO USE Liquid Glass |
|---------------------|------------------------|
| Nav bar / Topbar | Cards de conteúdo (.rec-card, .screen-card) |
| Tab bar / Callbar | Backgrounds de seções |
| Sidebar / Drawers | Headers de listas |
| Dropdowns / Popovers | Painéis de conteúdo (.schedule-panel) |
| Controles flutuantes primários | Qualquer elemento da camada de conteúdo |

> **Regra de ouro:** Se é navegação ou controle flutuante → Liquid Glass. Se é conteúdo → Material padrão translúcido.

### Variantes do Liquid Glass

| Variante | Aparência | Quando usar |
|----------|-----------|-------------|
| **Regular** | Desfoca e ajusta luminosidade; mais opaca | Componentes com texto (alerts, sidebars, popovers) ou fundo complexo |
| **Clear** | Altamente translúcida; fundo permanece visível | Sobre mídia rica (fotos, vídeos) — prioriza o conteúdo |

**Regra da variante Clear:**
- Fundo claro por baixo → adicione dimming layer de **35% de opacidade escura**
- Fundo escuro por baixo → não precisa de dimming layer

### Liquid Glass e Cor

| Regra | Detalhe |
|-------|---------|
| Por padrão sem cor | Absorve do conteúdo subjacente |
| Cor no background do LG | Apenas para ação primária (accent color do app) |
| Máximo 1–2 controles com cor | Mais que isso = poluição visual |
| App com fundo colorido | Toolbar/tab bar monocromática |
| App com fundo monocromático | Accent color da marca é eficaz nos controles |

### Materiais para a Camada de Conteúdo

Na camada de conteúdo (cards, painéis, seções), **não use Liquid Glass**. Use materiais translúcidos padrão:

| Material | Opacidade | Equivalente CSS |
|----------|-----------|-----------------|
| `ultraThinMaterial` | Mais translúcido | `rgba(255,255,255,0.04)` + `blur(8px)` |
| `thinMaterial` | Translúcido | `rgba(255,255,255,0.06)` + `blur(12px)` |
| `regularMaterial` | Padrão | `rgba(255,255,255,0.08)` + `blur(16px)` |
| `thickMaterial` | Mais opaco | `rgba(255,255,255,0.12)` + `blur(20px)` |

---

## TOKENS CSS DESTE PROJETO

### Tokens de Controles (Liquid Glass — camada de navegação)
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

### Tokens de Conteúdo (Material — camada de cards)
```css
--material-bg:        rgba(255, 255, 255, 0.06);
--material-bg-hover:  rgba(255, 255, 255, 0.09);
--material-border:    rgba(255, 255, 255, 0.08);
--material-blur:      blur(16px) saturate(140%);
--material-shadow:    0 4px 24px rgba(0,0,0,0.30);
--material-shadow-lg: 0 12px 40px rgba(0,0,0,0.40);
```

---

## REGRAS POR COMPONENTE DESTE PORTFÓLIO

### Camada de Controles — Liquid Glass ✅

#### `.callbar-inner` (Tab Bar equivalente)
```css
background:      rgba(18, 16, 14, 0.72);
backdrop-filter: var(--glass-blur);
border:          1px solid var(--glass-border);
box-shadow:      var(--glass-shadow-lg);
position: relative;
::before { background: var(--glass-shine); }
```

#### `.topbar.solid` (Navigation Bar)
```css
background:      rgba(18, 15, 12, 0.72);
backdrop-filter: var(--glass-blur);
border-bottom:   1px solid var(--glass-border);
box-shadow:      0 1px 0 rgba(255,255,255,0.06) inset, 0 8px 32px rgba(0,0,0,0.30);
```

#### `.dropdown` (Popover)
```css
background:      rgba(20, 17, 14, 0.78);
backdrop-filter: var(--glass-blur);
border:          1px solid var(--glass-border);
box-shadow:      var(--glass-shadow-lg);
```

#### `.about-panel` (Sidebar / Drawer)
```css
background:      rgba(20, 18, 16, 0.78);
backdrop-filter: var(--glass-blur);
border-left:     1px solid var(--glass-border);
box-shadow:      -8px 0 40px rgba(0,0,0,0.40), inset 1px 0 0 rgba(255,255,255,0.06);
```

### Camada de Conteúdo — Material Translúcido (NÃO Liquid Glass)

#### `.rec-card`, `.screen-card` (Cards de conteúdo)
```css
background:      var(--material-bg);
border:          1px solid var(--material-border);
backdrop-filter: var(--material-blur);
box-shadow:      var(--material-shadow);
/* SEM ::before shine especular — isso é exclusivo da camada de controles */
```

Hover state:
```css
background:      var(--material-bg-hover);
border-color:    rgba(232,162,61,0.25);
box-shadow:      var(--material-shadow-lg);
transform:       translateY(-3px);
```

#### `.participant-card` (Card de conteúdo grande)
Mesmo padrão de `.rec-card` — material translúcido, **não** Liquid Glass.

#### `.schedule-panel` (Painel de contato)
Mesmo padrão — conteúdo. Pode ter leve gradient de cor de fundo para identidade visual, mas translúcido.

### Pills e Chips

#### `.status-pill`, `.menu-btn`
São controles flutuantes → podem usar Liquid Glass leve:
```css
background:      var(--glass-bg);
border:          1px solid var(--glass-border);
backdrop-filter: var(--glass-blur-sm);
box-shadow:      var(--glass-shadow);
```

#### `.skill-chips span`, `.rec-tags span`
São conteúdo → material leve:
```css
background:      rgba(255,255,255,0.06);
border:          1px solid rgba(255,255,255,0.08);
/* sem backdrop-filter: custo de performance alto para muitos chips */
```

### Botão Primário (`.btn-filled`)
Accent color com shimmer sutil:
```css
background:  var(--amber);
box-shadow:  0 1px 0 rgba(255,255,255,0.28) inset, 0 4px 16px rgba(232,162,61,0.30);
```

---

## REGRAS DE VALIDAÇÃO

### Críticas (bloqueantes)

| ID | Regra |
|----|-------|
| **LG-001** | Liquid Glass **nunca** na camada de conteúdo (cards, seções, painéis de texto) |
| **LG-002** | `backdrop-filter` em cards de conteúdo: máximo `blur(16px)` — acima disso viola separação de camadas |
| **LG-003** | Controles com Liquid Glass devem flutuar acima do conteúdo — nunca inline no fluxo |
| **LG-004** | Máximo 2 controles com cor de destaque (accent) no Liquid Glass por tela |
| **LG-005** | `::before` shine especular **exclusivo** da camada de controles |

### Importantes

| ID | Regra |
|----|-------|
| **LG-006** | `background` de cards usa `rgba()` com alpha ≤ 0.12 |
| **LG-007** | `border` de cards usa `rgba(255,255,255, 0.06–0.10)` |
| **LG-008** | `border` de controles usa `rgba(255,255,255, 0.10–0.18)` |
| **LG-009** | Hover de cards eleva `translateY(-3px)` — controles NÃO elevam (são fixos) |
| **LG-010** | `@media (prefers-reduced-motion)` desativa transforms e animações |

---

## PROTOCOLO DE AUDITORIA

### Passo 1 — Ler os arquivos
Leia `assets/css/style.css` e `index.html` na íntegra. Se houver `playground.html` ou arquivos em `case-studies/`, leia também.

### Passo 2 — Verificar tokens
Confirme que `:root` contém:
- Tokens `--glass-*` (para controles)
- Tokens `--material-*` (para conteúdo)

Se faltar algum, liste quais adicionar antes de prosseguir.

### Passo 3 — Classificar componentes

Para cada componente do site, determine primeiro:
- **Camada de controle?** → deve usar Liquid Glass (`--glass-*`)
- **Camada de conteúdo?** → deve usar Material (`--material-*`)

Componentes a verificar:

| Componente | Camada correta |
|------------|---------------|
| `.callbar-inner` | Controle → Liquid Glass |
| `.topbar.solid` | Controle → Liquid Glass |
| `.dropdown` | Controle → Liquid Glass |
| `.about-panel` | Controle → Liquid Glass |
| `.status-pill` | Controle → Liquid Glass leve |
| `.menu-btn` | Controle → Liquid Glass leve |
| `.rec-card` | Conteúdo → Material |
| `.screen-card` | Conteúdo → Material |
| `.participant-card` | Conteúdo → Material |
| `.schedule-panel` | Conteúdo → Material |
| `.skill-chips span` | Conteúdo → sem backdrop-filter |
| `.rec-tags span` | Conteúdo → sem backdrop-filter |
| `.btn-filled` | Ação primária → amber + shimmer |

### Passo 4 — Auditar cada componente

Para controles (Liquid Glass), verifique:
- [ ] `backdrop-filter` mínimo `blur(20px) saturate(150%)`
- [ ] `background` rgba com alpha ≤ 0.80 (pode ser mais escuro, é camada de controle)
- [ ] `border` `rgba(255,255,255, 0.10–0.18)`
- [ ] `box-shadow` com highlight `0 1px 0 rgba(255,255,255,N) inset`
- [ ] `::before` shine para os flutuantes principais (callbar, status-pill)

Para conteúdo (Material), verifique:
- [ ] `backdrop-filter` máximo `blur(16px)` — preferencialmente `blur(12px)`
- [ ] `background` rgba com alpha ≤ 0.10
- [ ] `border` `rgba(255,255,255, 0.06–0.10)`
- [ ] **SEM** `::before` shine especular
- [ ] Hover com `translateY(-3px)` e aumento sutil de opacidade

### Passo 5 — Relatório

Exiba no formato:

```
## Relatório Liquid Glass

### ✅ Conformes
- .componente (camada: X) — justificativa

### ⚠️ Violações
- .componente — violação LG-XXX: descrição do problema

### 🔧 Correções necessárias
1. Adicionar tokens --material-* ao :root
2. .rec-card: remover ::before shine (LG-005), reduzir blur para 12px (LG-002)
3. ...
```

### Passo 6 — Aplicar correções

Após o relatório, pergunte: **"Aplicar todas as correções agora?"**

Se confirmado:
1. Edite `assets/css/style.css`
2. Mantenha tokens `--glass-*` existentes; adicione `--material-*` sem remover nada
3. Mova `::before` shine de cards de conteúdo para controles flutuantes apenas
4. Ajuste blur e opacidade por camada
5. Preserve todos `@media` existentes
6. Informe quais classes foram alteradas e por qual regra

---

## CRIANDO NOVOS COMPONENTES

### Novo controle flutuante (Liquid Glass)
```css
.novo-controle {
  background: rgba(18, 16, 14, 0.72);
  border: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  box-shadow: var(--glass-shadow-lg);
  position: relative;
}
.novo-controle::before {
  content: "";
  position: absolute; inset: 0; pointer-events: none;
  background: var(--glass-shine);
  border-radius: inherit;
}
```

### Novo card de conteúdo (Material)
```css
.novo-card {
  background: var(--material-bg);
  border: 1px solid var(--material-border);
  backdrop-filter: var(--material-blur);
  -webkit-backdrop-filter: var(--material-blur);
  box-shadow: var(--material-shadow);
  border-radius: var(--radius);
  position: relative;
  overflow: hidden;
  transition: background 0.25s, border-color 0.25s, box-shadow 0.25s, transform 0.25s;
}
.novo-card:hover {
  background: var(--material-bg-hover);
  border-color: rgba(232,162,61,0.25);
  box-shadow: var(--material-shadow-lg);
  transform: translateY(-3px);
}
```

---

## 8 PRINCÍPIOS QUE GUIAM TODA DECISÃO

| Princípio | Regra prática |
|-----------|---------------|
| **Propósito** | Cada tela responde: "para que serve?" — priorize o essencial |
| **Agência** | Sempre ofereça voltar, cancelar ou fechar |
| **Familiaridade** | Use padrões conhecidos; seja consistente em todo o site |
| **Flexibilidade** | Suporte mobile, tablet e desktop; acessibilidade é obrigatória |
| **Simplicidade** | Inclua só o necessário; hierarquia elimina instrução |
| **Arte** | Visuais precisos, animações suaves, texto exato — cada detalhe importa |
| **Prazer** | Identifique a emoção que a tela deve evocar |
| **Responsabilidade** | Explique o porquê; colete só o necessário |
