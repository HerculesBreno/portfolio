import { describe, it, expect } from 'vitest';
import { evaluateImpact, distance } from '../src/core/impact';
import type { Target } from '../src/types';

const target: Target = { x: 100, y: 100, radius: 100 };

describe('impact — distancia e avaliacao', () => {
  it('calcula distancia euclidiana', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it('impacto no centro tem distancia 0 e normalizada 0', () => {
    const impact = evaluateImpact({ x: 100, y: 100 }, target);
    expect(impact.distanceToCenter).toBe(0);
    expect(impact.normalizedDistance).toBe(0);
    expect(impact.onTarget).toBe(true);
  });

  it('impacto na borda tem distancia normalizada 1', () => {
    const impact = evaluateImpact({ x: 200, y: 100 }, target);
    expect(impact.normalizedDistance).toBeCloseTo(1);
    expect(impact.onTarget).toBe(true);
  });

  it('impacto fora do alvo tem normalizada > 1 e onTarget false', () => {
    const impact = evaluateImpact({ x: 250, y: 100 }, target);
    expect(impact.normalizedDistance).toBeGreaterThan(1);
    expect(impact.onTarget).toBe(false);
  });

  it('alvo redimensionado muda a distancia normalizada do mesmo ponto', () => {
    const small: Target = { x: 100, y: 100, radius: 50 };
    const point = { x: 150, y: 100 };
    expect(evaluateImpact(point, target).normalizedDistance).toBeCloseTo(0.5);
    expect(evaluateImpact(point, small).normalizedDistance).toBeCloseTo(1);
  });
});
