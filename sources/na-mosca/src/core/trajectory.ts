import type { Swipe, Vec2 } from '../types';
import { TRAJECTORY } from '../config';
import { swipeDirection, swipeDistance, normalizeIntensity } from './swipe';

export interface TrajectoryConfig {
  baseReach: number;
  intensityReach: number;
  arcHeightFactor: number;
  steps: number;
}

const DEFAULT_CONFIG: TrajectoryConfig = TRAJECTORY;

/**
 * Ponto de impacto do dardo no plano do alvo, de forma DETERMINISTICA.
 * A mesma origem + mesmo swipe produzem sempre o mesmo ponto.
 *
 * Modelo: o dardo parte de `origin` na direcao do swipe; o alcance depende da
 * intensidade normalizada do gesto. Nao ha aleatoriedade nem fisica realista.
 */
export function computeImpactPoint(
  origin: Vec2,
  swipe: Swipe,
  config: TrajectoryConfig = DEFAULT_CONFIG,
): Vec2 {
  const dir = swipeDirection(swipe);
  const intensity = normalizeIntensity(swipeDistance(swipe));
  const reach = config.baseReach + intensity * config.intensityReach;
  return {
    x: origin.x + dir.x * reach,
    y: origin.y + dir.y * reach,
  };
}

/**
 * Pontos amostrados de um arco visual entre `origin` e `impact`. Usado apenas
 * para animar a trajetoria; a deteccao de impacto usa o ponto final, nao o arco.
 */
export function buildTrajectory(
  origin: Vec2,
  impact: Vec2,
  config: TrajectoryConfig = DEFAULT_CONFIG,
): Vec2[] {
  const steps = Math.max(2, Math.floor(config.steps));
  const span = Math.hypot(impact.x - origin.x, impact.y - origin.y);
  const arcHeight = span * config.arcHeightFactor;
  const points: Vec2[] = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const x = origin.x + (impact.x - origin.x) * t;
    const y = origin.y + (impact.y - origin.y) * t;
    const lift = arcHeight * Math.sin(Math.PI * t);
    points.push({ x, y: y - lift });
  }
  return points;
}
