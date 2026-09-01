import type { Swipe, SwipeResult, Vec2 } from '../types';
import { SWIPE } from '../config';

/** Vetor do swipe (do inicio ao fim). */
export function swipeVector(swipe: Swipe): Vec2 {
  return {
    x: swipe.end.x - swipe.start.x,
    y: swipe.end.y - swipe.start.y,
  };
}

/** Comprimento (px) do swipe. */
export function swipeDistance(swipe: Swipe): number {
  const v = swipeVector(swipe);
  return Math.hypot(v.x, v.y);
}

/** Angulo do swipe em radianos (atan2 no espaco de tela). */
export function swipeAngle(swipe: Swipe): number {
  const v = swipeVector(swipe);
  return Math.atan2(v.y, v.x);
}

/** Vetor unitario da direcao do swipe; {0,0} para swipe nulo. */
export function swipeDirection(swipe: Swipe): Vec2 {
  const v = swipeVector(swipe);
  const len = Math.hypot(v.x, v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

/**
 * Normaliza a intensidade do gesto para 0..1 com base em min/max de distancia.
 * Distancias abaixo de min => 0; acima de max => 1.
 */
export function normalizeIntensity(
  distance: number,
  min: number = SWIPE.intensityMinDistance,
  max: number = SWIPE.intensityMaxDistance,
): number {
  if (max <= min) return 0;
  const t = (distance - min) / (max - min);
  return Math.min(1, Math.max(0, t));
}

/** true quando o swipe e longo o suficiente para valer um lancamento. */
export function isValidSwipe(distance: number, minDistance: number = SWIPE.minDistance): boolean {
  return distance >= minDistance;
}

/** Analise completa de um swipe: vetor, angulo, distancia, intensidade e validade. */
export function analyzeSwipe(swipe: Swipe): SwipeResult {
  const vector = swipeVector(swipe);
  const distance = Math.hypot(vector.x, vector.y);
  return {
    vector,
    angle: Math.atan2(vector.y, vector.x),
    distance,
    intensity: normalizeIntensity(distance),
    valid: isValidSwipe(distance),
  };
}
