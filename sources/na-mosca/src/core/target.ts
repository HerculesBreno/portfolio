import type { Bounds, Target } from '../types';
import { TARGET } from '../config';

/** Limita um numero ao intervalo [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Raio limitado aos limites configurados. */
export function clampTargetRadius(
  radius: number,
  min: number = TARGET.minRadius,
  max: number = TARGET.maxRadius,
): number {
  return clamp(radius, min, max);
}

/**
 * Mantem o alvo inteiramente dentro da area jogavel. Se o alvo for maior que a
 * area, o raio e reduzido antes de recentralizar.
 */
export function clampTargetToBounds(target: Target, bounds: Bounds): Target {
  const maxRadiusForBounds = Math.min(bounds.width, bounds.height) / 2;
  const radius = clamp(target.radius, TARGET.minRadius, Math.min(TARGET.maxRadius, maxRadiusForBounds));
  return {
    radius,
    x: clamp(target.x, radius, bounds.width - radius),
    y: clamp(target.y, radius, bounds.height - radius),
  };
}

/** Alvo padrao: centralizado na horizontal, um pouco acima do meio. */
export function defaultTarget(bounds: Bounds): Target {
  const radius = clampTargetRadius(Math.min(bounds.width, bounds.height) * TARGET.defaultRadiusFactor);
  return clampTargetToBounds(
    {
      x: bounds.width / 2,
      y: bounds.height * TARGET.defaultCenterYFactor,
      radius,
    },
    bounds,
  );
}

/** Reposiciona o alvo mantendo o raio, respeitando os limites. */
export function moveTarget(target: Target, x: number, y: number, bounds: Bounds): Target {
  return clampTargetToBounds({ ...target, x, y }, bounds);
}

/** Redimensiona o alvo mantendo o centro, respeitando limites de raio e area. */
export function resizeTarget(target: Target, radius: number, bounds: Bounds): Target {
  return clampTargetToBounds({ ...target, radius: clampTargetRadius(radius) }, bounds);
}
