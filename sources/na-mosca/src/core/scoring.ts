import type { Impact, ScoringRing } from '../types';
import { SCORING_RINGS, MISS_POINTS } from '../config';

export interface ScoreResult {
  points: number;
  /** id do anel atingido, ou 'miss' quando fora do alvo. */
  ringId: string;
  ringLabel: string;
}

/**
 * Pontua uma distancia normalizada (0 = centro, 1 = borda externa, >1 = fora)
 * segundo os aneis configurados. Funcao pura e deterministica.
 */
export function scoreNormalizedDistance(
  normalizedDistance: number,
  rings: readonly ScoringRing[] = SCORING_RINGS,
): ScoreResult {
  if (normalizedDistance < 0 || normalizedDistance > 1) {
    return { points: MISS_POINTS, ringId: 'miss', ringLabel: 'Fora' };
  }
  for (const ring of rings) {
    if (normalizedDistance <= ring.outerFraction) {
      return { points: ring.points, ringId: ring.id, ringLabel: ring.label };
    }
  }
  return { points: MISS_POINTS, ringId: 'miss', ringLabel: 'Fora' };
}

/** Pontua um impacto ja avaliado contra o alvo. */
export function scoreImpact(
  impact: Impact,
  rings: readonly ScoringRing[] = SCORING_RINGS,
): ScoreResult {
  return scoreNormalizedDistance(impact.normalizedDistance, rings);
}
