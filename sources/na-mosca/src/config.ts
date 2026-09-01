import type { ScoringRing } from './types';

/**
 * Configuracao central do jogo. Todos os valores "magicos" vivem aqui para
 * facilitar ajuste e integracao futura. Nao usar numeros soltos nos modulos.
 */

/** Regras de gesto (swipe). */
export const SWIPE = {
  /** Abaixo disso o gesto e ignorado (px). */
  minDistance: 28,
  /** Distancia que corresponde a intensidade 0 (px). */
  intensityMinDistance: 40,
  /** Distancia que corresponde a intensidade maxima (px). */
  intensityMaxDistance: 320,
} as const;

/** Modelo de trajetoria / mapeamento do swipe para o ponto de impacto. */
export const TRAJECTORY = {
  /** Alcance base (intensidade 0) a partir da origem, em px. */
  baseReach: 120,
  /** Alcance extra somado na intensidade maxima, em px. */
  intensityReach: 620,
  /** Altura relativa do arco visual (fracao do alcance). */
  arcHeightFactor: 0.18,
  /** Quantidade de pontos amostrados para animar a trajetoria. */
  steps: 24,
} as const;

/** Alvo. */
export const TARGET = {
  /** Raio padrao como fracao da menor dimensao da area jogavel. */
  defaultRadiusFactor: 0.22,
  minRadius: 48,
  maxRadius: 220,
  /** Posicao vertical padrao como fracao da altura (0 = topo). */
  defaultCenterYFactor: 0.4,
} as const;

/** Rodada. */
export const ROUND = {
  dartsPerRound: 3,
} as const;

/**
 * Aneis de pontuacao, do centro para fora. `outerFraction` e o raio externo
 * do anel como fracao do raio total do alvo. A ordem importa: do menor para
 * o maior. Impactos com normalizedDistance <= outerFraction pertencem ao anel.
 */
export const SCORING_RINGS: readonly ScoringRing[] = [
  { id: 'bull', label: 'Mosca', outerFraction: 0.12, points: 50, color: '#ffd23f' },
  { id: 'inner', label: 'Anel 1', outerFraction: 0.3, points: 25, color: '#ff6b35' },
  { id: 'mid', label: 'Anel 2', outerFraction: 0.55, points: 15, color: '#e8412d' },
  { id: 'outer', label: 'Anel 3', outerFraction: 0.78, points: 10, color: '#2ec4b6' },
  { id: 'rim', label: 'Borda', outerFraction: 1.0, points: 5, color: '#3a86ff' },
] as const;

/** Pontuacao quando o impacto cai fora do alvo. */
export const MISS_POINTS = 0;
