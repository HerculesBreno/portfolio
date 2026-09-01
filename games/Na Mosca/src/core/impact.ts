import type { Impact, Target, Vec2 } from '../types';

/** Distancia euclidiana entre dois pontos. */
export function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Avalia um ponto de impacto contra o alvo atual.
 * `normalizedDistance` = distancia / raio: 0 no centro, 1 na borda, >1 fora.
 */
export function evaluateImpact(point: Vec2, target: Target): Impact {
  const d = distance(point, { x: target.x, y: target.y });
  const normalized = target.radius > 0 ? d / target.radius : Infinity;
  return {
    point,
    distanceToCenter: d,
    normalizedDistance: normalized,
    onTarget: normalized <= 1,
  };
}
