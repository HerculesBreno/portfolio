# Na Mosca — jogo de dardos com câmera (MVP local)

Prova de conceito **local, mobile-first** de um jogo de dardos jogado com o dedo
sobre a imagem da câmera. Esta é a **Fase 1**: uma simulação 2D sobre o vídeo da
câmera. **Ainda não é AR espacial** — não há detecção de parede, âncoras nem
profundidade. O celular permanece firme na mão; o lançamento é feito **apenas
arrastando e soltando o dedo**.

> Projeto independente, isolado do portfólio. Não integra, não publica e não faz
> deploy nesta fase.

## Visão do jogo

Você aponta um alvo virtual sobre o que a câmera está vendo, ajusta o tamanho,
trava a posição e lança dardos com um swipe. Cada dardo recebe uma pontuação
conforme a distância do impacto ao centro do alvo. Uma rodada tem três dardos.

## Escopo do MVP (Fase 1)

Incluído:

- Tela inicial com avisos de segurança e escolha entre câmera e modo demonstração.
- Acesso à câmera traseira via `getUserMedia` (`facingMode: environment`), sem gravar/enviar nada.
- Modo demonstração sem câmera (desktop, testes, permissão negada, sem câmera).
- Posicionamento do alvo: arrastar, redimensionar, restaurar, confirmar (travar).
- Alvo desenhado por código no Canvas 2D (anéis concêntricos).
- Lançamento por swipe com indicador de direção e intensidade.
- Trajetória animada determinística e dardo preso no ponto de impacto.
- Pontuação por anéis, três dardos por rodada, soma e reinício.
- Máquina de estados explícita e tratamento de erros/permissão negada.
- Liberação da câmera ao sair e ao descarregar a página.

Fora do escopo desta fase: WebXR/AR, detecção de parede, sensores, multiplayer,
QR Code, backend, persistência, login, deploy.

## Tecnologias

- [Vite](https://vitejs.dev/) + TypeScript
- HTML + CSS puro (mobile-first, `dvh`, safe-area insets)
- Canvas 2D para o render do jogo
- MediaDevices API (câmera)
- [Vitest](https://vitest.dev/) para a lógica pura
- ESLint + `tsc` para lint e tipagem

Zero frameworks de UI, zero física pesada, zero serviços externos.

## Arquitetura

Lógica pura (testável, sem DOM) separada do runtime (DOM/Canvas/câmera).

```
src/
  config.ts            Configuração central (aneis, limites, thresholds)
  types.ts             Tipos compartilhados
  core/
    swipe.ts           Vetor, ângulo, intensidade e validade do swipe
    trajectory.ts      Ponto de impacto determinístico + arco visual
    impact.ts          Distância ao centro e distância normalizada
    scoring.ts         Pontuação por anéis
    target.ts          Modelo do alvo, clamps de posição e tamanho
  state/
    machine.ts         Máquina de estados (transições explícitas)
  game/
    camera.ts          Wrapper MediaDevices + limpeza de tracks
    input.ts           Captura de ponteiro (toque/mouse)
    renderer.ts        Desenho do alvo, dardos, mira e trajetória
    ui.ts              Telas, HUD e controles (bind ao DOM por estado)
    game.ts            Orquestrador: liga estado, entrada, física e render
  main.ts              Bootstrap
tests/                 Testes de swipe, trajetória, impacto, pontuação,
                       alvo e máquina de estados
```

**Fluxo de estados:** `intro → requestingCamera → placingTarget → ready →
dartFlying → result → (ready | round completo)`; mais `error` e `ended`.
O modo demo pula `requestingCamera`.

**Modelo de lançamento (determinístico):** o dardo parte da origem do swipe na
direção do gesto; o alcance depende da intensidade normalizada. A mesma entrada
sempre produz o mesmo impacto. Sem aleatoriedade nem física realista.

## Instalar

Pré-requisitos: Node 18+ e npm.

```bash
cd "games/Na Mosca"
npm install
```

## Executar

```bash
npm run dev
```

Abre em `http://localhost:5180`.

## Testar

```bash
npm run test        # Vitest (lógica pura)
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint
npm run build       # tsc + build de produção (gera dist/)
```

## Abrir no celular (mesma rede)

1. Rode `npm run dev` (o servidor já escuta em `0.0.0.0`).
2. Descubra o IP da máquina na rede local (ex.: `192.168.0.10`).
3. No celular, na **mesma rede Wi-Fi**, acesse `http://192.168.0.10:5180`.

### Câmera exige contexto seguro

`getUserMedia` só funciona em **HTTPS** ou em **localhost**. Acessar por IP puro
(`http://192.168.x.x`) normalmente **bloqueia a câmera**. Opções para testar a
câmera no celular:

- Use um túnel HTTPS (ex.: `npx localtunnel --port 5180` ou similar), ou
- Rode um proxy HTTPS local, ou
- Teste a mecânica pelo **modo demonstração**, que não precisa de câmera.

O modo demo tem exatamente a mesma jogabilidade, apenas com um fundo simulado.

## Limitações atuais

- Simulação 2D sobre a câmera — **não** é AR espacial; o alvo não se ancora ao mundo.
- Trajetória é uma aproximação determinística, não física real.
- Sem persistência, conta, ranking ou histórico.
- A câmera exige HTTPS/localhost fora do desktop.
- Render depende de `requestAnimationFrame` (pausa quando a aba fica em segundo plano).

## Próximos passos

- Validar em aparelhos reais (iOS Safari e Android Chrome), retrato.
- Ajustar a curva de intensidade/alcance com base em testes de toque reais.
- Evoluir o modelo de mira (calibração do alvo em relação à câmera).
- Preparar a ponte para WebAR (Fase 2): detecção de superfície e âncoras.
- Integração opcional ao portfólio (somente após aprovação).

## Privacidade da câmera

A imagem da câmera é usada **somente ao vivo, durante a partida**. O jogo não
grava, não fotografa, não armazena frames e não envia imagens para lugar nenhum.
As tracks são encerradas ao sair da partida e quando a página é descarregada.
