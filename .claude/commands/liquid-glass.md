# /liquid-glass — Agente de Revisão UI Liquid Glass

Você é o agente de UI deste portfólio. Sua única responsabilidade é garantir que todos os componentes sigam o padrão **Liquid Glass** definido no CLAUDE.md deste projeto.

## Como executar a revisão

### Passo 1 — Ler os arquivos
Leia `assets/css/style.css` e `index.html` na íntegra. Se houver outros arquivos HTML (`playground.html`, `case-studies/*.html`), leia-os também.

### Passo 2 — Verificar tokens globais
Confirme que `:root` em `style.css` contém todos os tokens `--glass-*`:
- `--glass-bg`, `--glass-bg-hover`
- `--glass-border`, `--glass-border-hover`
- `--glass-blur`, `--glass-blur-sm`
- `--glass-shadow`, `--glass-shadow-lg`
- `--glass-shine`

Se algum estiver faltando, adicione-o antes de continuar.

### Passo 3 — Auditar cada componente

Para cada componente listado abaixo, verifique os 6 critérios:

| # | Critério | O que checar |
|---|----------|-------------|
| 1 | `backdrop-filter` | presente, mínimo `blur(12px)` |
| 2 | `background` translúcido | `rgba()` com alpha ≤ 0.15, nunca cor sólida |
| 3 | `border` em vidro | `rgba(255,255,255, 0.08–0.18)`, não `var(--hairline)` |
| 4 | `box-shadow` com shine interno | contém `0 1px 0 rgba(255,255,255,N) inset` |
| 5 | `::before` shine | pseudo-elemento com `var(--glass-shine)` |
| 6 | Hover correto | opacidade sobe, card eleva com `translateY(-4px)`, shadow aumenta |

**Componentes a auditar:**
- `.rec-card` (cards de work)
- `.screen-card` (cards de AI/automations)
- `.participant-card` (card do about)
- `.schedule-panel` (painel de contact)
- `.about-panel` (drawer lateral)
- `.dropdown` (menu do topbar)
- `.callbar-inner` (navegação flutuante)
- `.topbar.solid` (header fixo)
- `.status-pill` (pill de disponibilidade)
- `.skill-chips span` (chips de habilidades)
- `.rec-tags span` (tags dos projetos)
- `.btn-filled` (botão primário)

### Passo 4 — Reportar

Exiba um relatório no formato:

```
## Relatório Liquid Glass

### ✅ Em conformidade
- .componente — breve justificativa

### ⚠️ Fora do padrão
- .componente — critérios ausentes: [lista]

### 🔧 Ações necessárias
1. Adicionar token --glass-X ao :root
2. Atualizar .componente: adicionar backdrop-filter + border rgba + ::before shine
...
```

### Passo 5 — Aplicar correções

Após o relatório, pergunte: **"Aplicar todas as correções agora?"**

Se o usuário confirmar:
1. Edite `assets/css/style.css` aplicando todas as correções identificadas
2. Mantenha os design tokens existentes (`--amber`, `--panel`, etc.) — apenas **adicione** os tokens `--glass-*` sem remover os anteriores
3. Não quebre o layout responsivo — preserve todos os `@media` existentes
4. Após editar, informe quais classes foram alteradas

## Regras de comportamento deste agente

- **Nunca** remova tokens existentes do `:root`
- **Nunca** altere HTML — apenas CSS
- **Sempre** preserve os breakpoints responsivos
- **Sempre** teste se `overflow: hidden` + `position: relative` estão nos cards antes de adicionar `::before`
- Se um componente já estiver 80%+ conforme, ajuste apenas o que falta em vez de reescrever

## Quando o usuário adiciona um novo componente

Se o usuário pedir para criar um novo card, painel ou chip, crie já aplicando o padrão Liquid Glass completo:

```css
.novo-componente {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  box-shadow: var(--glass-shadow);
  border-radius: var(--radius);
  position: relative;
  overflow: hidden;
  transition: background 0.25s, border-color 0.25s, box-shadow 0.25s, transform 0.25s;
}
.novo-componente::before {
  content: "";
  position: absolute; inset: 0; pointer-events: none;
  background: var(--glass-shine);
  border-radius: inherit;
}
.novo-componente:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
  box-shadow: var(--glass-shadow-lg);
  transform: translateY(-4px);
}
```
