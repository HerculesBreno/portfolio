/** Tipos compartilhados entre os modulos do jogo. */

export interface Vec2 {
  x: number;
  y: number;
}

/** Retangulo da area jogavel (em pixels de tela / canvas). */
export interface Bounds {
  width: number;
  height: number;
}

/** Alvo virtual desenhado sobre a camera. */
export interface Target {
  /** Centro do alvo, em pixels da area jogavel. */
  x: number;
  y: number;
  /** Raio externo do alvo, em pixels. */
  radius: number;
}

/** Gesto de swipe capturado (coordenadas em pixels, tempo em ms). */
export interface Swipe {
  start: Vec2;
  end: Vec2;
  /** Duracao do gesto em milissegundos. */
  durationMs: number;
}

/** Resultado do calculo de um swipe. */
export interface SwipeResult {
  vector: Vec2;
  /** Angulo em radianos (atan2), 0 = para a direita, cresce no sentido do eixo Y da tela. */
  angle: number;
  /** Comprimento do swipe em pixels. */
  distance: number;
  /** Intensidade normalizada 0..1. */
  intensity: number;
  /** false quando o gesto e curto demais para valer um lancamento. */
  valid: boolean;
}

/** Impacto do dardo no plano do alvo. */
export interface Impact {
  point: Vec2;
  /** Distancia do impacto ate o centro do alvo, em pixels. */
  distanceToCenter: number;
  /** Distancia normalizada pelo raio do alvo (0 = centro, 1 = borda externa). */
  normalizedDistance: number;
  /** true quando o impacto caiu dentro do alvo. */
  onTarget: boolean;
}

/** Definicao de um anel de pontuacao. */
export interface ScoringRing {
  id: string;
  label: string;
  /** Limite externo do anel, como fracao do raio (0..1]. */
  outerFraction: number;
  points: number;
  color: string;
}
