import { describe, it, expect } from 'vitest';
import { computeImpactPoint, buildTrajectory } from '../src/core/trajectory';
import type { Swipe, Vec2 } from '../src/types';

const origin: Vec2 = { x: 200, y: 600 };
const swipeUp: Swipe = { start: { x: 200, y: 600 }, end: { x: 200, y: 300 }, durationMs: 120 };

describe('trajectory — impacto deterministico', () => {
  it('produz o mesmo resultado para a mesma entrada', () => {
    const a = computeImpactPoint(origin, swipeUp);
    const b = computeImpactPoint(origin, swipeUp);
    expect(a).toEqual(b);
  });

  it('um swipe para cima leva o impacto para cima (y menor)', () => {
    const impact = computeImpactPoint(origin, swipeUp);
    expect(impact.y).toBeLessThan(origin.y);
    expect(impact.x).toBeCloseTo(origin.x);
  });

  it('maior intensidade alcanca mais longe', () => {
    const curto: Swipe = { start: { x: 200, y: 600 }, end: { x: 200, y: 520 }, durationMs: 100 };
    const longo: Swipe = { start: { x: 200, y: 600 }, end: { x: 200, y: 250 }, durationMs: 100 };
    const dCurto = origin.y - computeImpactPoint(origin, curto).y;
    const dLongo = origin.y - computeImpactPoint(origin, longo).y;
    expect(dLongo).toBeGreaterThan(dCurto);
  });
});

describe('trajectory — arco visual', () => {
  it('comeca na origem e termina no impacto', () => {
    const impact = computeImpactPoint(origin, swipeUp);
    const points = buildTrajectory(origin, impact);
    expect(points[0].x).toBeCloseTo(origin.x);
    expect(points[0].y).toBeCloseTo(origin.y);
    expect(points[points.length - 1].x).toBeCloseTo(impact.x);
    expect(points[points.length - 1].y).toBeCloseTo(impact.y);
  });

  it('respeita a quantidade de passos configurada', () => {
    const impact = computeImpactPoint(origin, swipeUp);
    const points = buildTrajectory(origin, impact, {
      baseReach: 120,
      intensityReach: 620,
      arcHeightFactor: 0.18,
      steps: 10,
    });
    expect(points).toHaveLength(10);
  });

  it('o ponto do meio sobe (arco) em relacao a linha reta', () => {
    const impact: Vec2 = { x: 400, y: 600 };
    const points = buildTrajectory({ x: 0, y: 600 }, impact);
    const mid = points[Math.floor(points.length / 2)];
    expect(mid.y).toBeLessThan(600);
  });
});
