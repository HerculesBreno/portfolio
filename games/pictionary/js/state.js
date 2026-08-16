// Lógica pura do jogo: criação de partida, ordem de desenho e pontuação.
// Sem DOM, sem rede — só regras. Facilita testar e reaproveitar no modo online.

const ROUND_TIME = 90; // segundos por rodada (1:30)
const BONUS_ARTISTA = 50; // pontos para quem desenhou quando alguém acerta

// Cruzamento tempo × dificuldade:
// ganha os pontos-base da palavra + um bônus de rapidez proporcional ao tempo restante.
// Acerto instantâneo ≈ 2× base. Acerto no estouro do tempo ≈ base.
function calcularPontos(base, tempoRestante) {
  const restante = Math.max(0, Math.min(ROUND_TIME, tempoRestante));
  const bonusRapidez = Math.round(base * (restante / ROUND_TIME));
  return { base, bonusRapidez, total: base + bonusRapidez };
}

function criarPartida(config, players) {
  const jogadores = players.map((p) => ({ ...p, score: 0 }));
  // Ordem de desenho embaralhada.
  const order = jogadores.map((p) => p.id).sort(() => Math.random() - 0.5);
  return {
    phase: "turn",
    config: { ...config },
    players: jogadores,
    order,
    totalRounds: config.rounds,
    roundIndex: 0,
    drawerId: order[0],
    choices: null,
    chosen: null,
    roundEndsAt: null,
    startedAt: null,
    lastResult: null,
  };
}

function drawerDaRodada(state, roundIndex) {
  return state.order[roundIndex % state.order.length];
}

function jogadorPorId(state, id) {
  return state.players.find((p) => p.id === id);
}

// Ranking decrescente por pontos (empate mantém ordem estável).
function ranking(state) {
  return [...state.players].sort((a, b) => b.score - a.score);
}

function ehUltimaRodada(state) {
  return state.roundIndex >= state.totalRounds - 1;
}

window.GameState = {
  ROUND_TIME,
  BONUS_ARTISTA,
  calcularPontos,
  criarPartida,
  drawerDaRodada,
  jogadorPorId,
  ranking,
  ehUltimaRodada,
};
