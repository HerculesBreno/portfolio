import { describe, it, expect } from 'vitest';
import {
  clamp,
  clampTargetRadius,
  clampTargetToBounds,
  defaultTarget,
  moveTarget,
  resizeTarget,
} from '../src/core/target';
import { TARGET } from '../src/config';
import type { Bounds, Target } from '../src/types';

const bounds: Bounds = { width: 400, height: 800 };

describe('target — clamps basicos', () => {
  it('clamp limita ao intervalo', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });

  it('clampTargetRadius respeita min e max', () => {
    expect(clampTargetRadius(10)).toBe(TARGET.minRadius);
    expect(clampTargetRadius(9999)).toBe(TARGET.maxRadius);
  });
});

describe('target — limites de posicionamento', () => {
  it('mantem o alvo inteiramente dentro da area', () => {
    const t: Target = { x: 0, y: 0, radius: 60 };
    const c = clampTargetToBounds(t, bounds);
    expect(c.x).toBeGreaterThanOrEqual(c.radius);
    expect(c.y).toBeGreaterThanOrEqual(c.radius);
    expect(c.x).toBeLessThanOrEqual(bounds.width - c.radius);
    expect(c.y).toBeLessThanOrEqual(bounds.height - c.radius);
  });

  it('reduz o raio quando o alvo e maior que a area', () => {
    const t: Target = { x: 200, y: 400, radius: 999 };
    const c = clampTargetToBounds(t, bounds);
    expect(c.radius).toBeLessThanOrEqual(Math.min(bounds.width, bounds.height) / 2);
  });

  it('moveTarget respeita os limites', () => {
    const t = defaultTarget(bounds);
    const moved = moveTarget(t, -500, 5000, bounds);
    expect(moved.x).toBeGreaterThanOrEqual(moved.radius);
    expect(moved.y).toBeLessThanOrEqual(bounds.height - moved.radius);
  });

  it('resizeTarget aplica limites de raio', () => {
    const t = defaultTarget(bounds);
    expect(resizeTarget(t, 5, bounds).radius).toBeGreaterThanOrEqual(TARGET.minRadius);
  });
});

describe('target — alvo padrao', () => {
  it('cria alvo dentro dos limites', () => {
    const t = defaultTarget(bounds);
    expect(t.x).toBeGreaterThanOrEqual(t.radius);
    expect(t.y).toBeGreaterThanOrEqual(t.radius);
    expect(t.x).toBeLessThanOrEqual(bounds.width - t.radius);
    expect(t.y).toBeLessThanOrEqual(bounds.height - t.radius);
  });
});
