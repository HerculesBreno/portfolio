import { describe, it, expect } from 'vitest';
import { scoreNormalizedDistance, scoreImpact } from '../src/core/scoring';
import { evaluateImpact } from '../src/core/impact';
import type { Target } from '../src/types';

describe('scoring — aneis por distancia normalizada', () => {
  it('centro (mosca) vale 50', () => {
    expect(scoreNormalizedDistance(0).points).toBe(50);
    expect(scoreNormalizedDistance(0.1).ringId).toBe('bull');
  });

  it('anel 1 vale 25', () => {
    expect(scoreNormalizedDistance(0.2).points).toBe(25);
  });

  it('anel 2 vale 15', () => {
    expect(scoreNormalizedDistance(0.45).points).toBe(15);
  });

  it('anel 3 vale 10', () => {
    expect(scoreNormalizedDistance(0.7).points).toBe(10);
  });

  it('borda vale 5 (inclusive na borda exata)', () => {
    expect(scoreNormalizedDistance(0.9).points).toBe(5);
    expect(scoreNormalizedDistance(1).points).toBe(5);
  });

  it('fora do alvo vale 0', () => {
    expect(scoreNormalizedDistance(1.01).points).toBe(0);
    expect(scoreNormalizedDistance(1.01).ringId).toBe('miss');
  });

  it('distancia negativa (invalida) vale 0', () => {
    expect(scoreNormalizedDistance(-0.5).points).toBe(0);
  });
});

describe('scoring — considera o tamanho do alvo', () => {
  it('o mesmo ponto pontua diferente conforme o raio', () => {
    const big: Target = { x: 100, y: 100, radius: 200 };
    const small: Target = { x: 100, y: 100, radius: 40 };
    const point = { x: 120, y: 100 }; // 20px do centro

    // 20/200 = 0.1 -> mosca (50)
    expect(scoreImpact(evaluateImpact(point, big)).points).toBe(50);
    // 20/40 = 0.5 -> anel 2 (15)
    expect(scoreImpact(evaluateImpact(point, small)).points).toBe(15);
  });

  it('impacto fora do alvo pequeno pontua 0', () => {
    const small: Target = { x: 100, y: 100, radius: 40 };
    expect(scoreImpact(evaluateImpact({ x: 200, y: 100 }, small)).points).toBe(0);
  });
});
