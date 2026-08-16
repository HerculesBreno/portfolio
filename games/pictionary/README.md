# Pictionário 🎨

Jogo de desenho e adivinhação, web e **mobile-first**, sem instalar app. O app é o **juiz** da
partida: sorteia palavras, controla o tempo (1:30 por rodada) e a pontuação. O desenho em si é
feito no papel/quadro — a tela cuida das regras.

Estilo visual: cartoon anos 90 (vibe Cartoon Network), minimalista. Construído seguindo as
**10 heurísticas de Nielsen** (status sempre visível, botão de voltar em todas as telas,
prevenção de erro, confirmação ao sair, recognition over recall, etc.).

## Como rodar

Servido pela raiz do portfólio:

```bash
npx serve . -p 3000 --no-clipboard
```

Abra: <http://localhost:3000/games/pictionary/>

## Modos

- **Jogar aqui (local)** — solo (modo treino) ou passa-e-joga num único aparelho. Funciona 100%
  offline, sem configuração.
- **Criar sala online** — cada jogador no seu celular. Um cria a sala, os outros escaneiam o QR
  (ou digitam o código de 4 letras). **Exige configurar o Firebase** (abaixo). Sem config, cai
  no modo local com um aviso.

## Regras do jogo

1. Escolha tema (ou **Livre**) e número de rodadas: **3, 5, 10 ou 15**.
2. A vez de desenhar gira entre os jogadores. Quem desenha vê **3 palavras** — fácil (100),
   média (200) e difícil (300) — e escolhe uma.
3. Todos têm **1min30** para adivinhar. Quem controla toca em **“Alguém acertou!”** e seleciona
   quem foi.
4. **Pontos = base da palavra + bônus de rapidez** (proporcional ao tempo restante). Acerto
   instantâneo ≈ dobro da base; no estouro do tempo ≈ só a base. Quem desenhou ganha +50 quando
   alguém acerta.
5. Vence quem tiver mais pontos ao fim das rodadas.

## Arquitetura

Zero frameworks — HTML/CSS/JS puro.

| Arquivo | Papel |
|---|---|
| `index.html` | Todas as telas (uma máquina de estados) |
| `css/pictionary.css` | Estilo cartoon 90s |
| `js/words.js` | Banco de palavras por tema/dificuldade |
| `js/state.js` | Regras puras: criação de partida, ordem, **pontuação** |
| `js/room.js` | Camada de sala: `LocalStore` (memória) e `FirebaseStore` (nuvem), mesma interface |
| `js/qr.js` | Geração do QR (lib `qrcode-generator` via CDN, com fallback de texto) |
| `js/game.js` | Orquestração: telas, timer, fluxo |
| `firebase-config.js` | Chaves do Firebase (opcional, para o online) |

O modo local e o online compartilham **exatamente a mesma lógica** — só muda onde o estado da
partida vive (memória vs. Realtime Database).

## Ativar o multiplayer online (Firebase)

1. Crie um projeto grátis em <https://console.firebase.google.com> → **Adicionar projeto**.
2. No projeto: **Build → Realtime Database → Criar banco de dados** (comece em modo de teste).
3. **Configurações do projeto (⚙️) → Seus apps → Web (`</>`)** → registre o app e copie o
   objeto `firebaseConfig`.
4. Cole os valores em `firebase-config.js` (substituindo os que começam com `SUA_`).

### Regras de segurança sugeridas (Realtime Database)

Modo de teste expira e libera tudo. Para um jogo público, restrinja ao ramo das salas:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

> Isso deixa qualquer um ler/escrever nas salas (suficiente para um jogo casual sem login).
> Para produção séria, adicione autenticação anônima e valide o formato do estado.

## Publicar no GitHub Pages

O jogo é 100% estático, então roda no GitHub Pages sem servidor.

1. No repositório: **Settings → Pages** → *Source: Deploy from a branch* → branch `main`, pasta `/ (root)`.
2. Aguarde o deploy. O portfólio fica em `https://SEU_USUARIO.github.io/portfolio/` e o jogo em
   `https://SEU_USUARIO.github.io/portfolio/games/pictionary/`.
3. O link já está na **aba de games** (card no Playground + menu “Games” do portfólio).

> ⚠️ **Para testar com vários jogadores em celulares diferentes, o Firebase precisa estar
> configurado** (seção acima). Sem isso, o online cai no modo local. O modo local (solo /
> passa-e-joga) funciona publicado normalmente.

O desenho ao vivo (um desenha, todos veem) usa o **mesmo Firebase** — some vez configurado, tanto
o estado da partida quanto os traços sincronizam entre os aparelhos.

## Limitações conhecidas (v1)

- O online usa **last-write-wins** no objeto de estado inteiro. Em partidas pequenas funciona
  bem; dois convidados entrando no exato mesmo instante podem, raramente, se sobrescrever.
- O aparelho de **quem desenha** é o controlador da rodada (toca em “alguém acertou”, escolhe o
  vencedor). Os demais acompanham o tempo e o placar.
- As salas ficam no banco após o jogo (sem limpeza automática).

## Próximos passos possíveis

- Testar o fluxo online real com as chaves do Firebase.
- Limpeza de salas antigas / reconexão.
- Sons e microanimações de acerto.
- Mais temas e palavras.
