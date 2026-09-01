import { describe, it, expect } from 'vitest';
import {
  swipeVector,
  swipeDistance,
  swipeAngle,
  swipeDirection,
  normalizeIntensity,
  isValidSwipe,
  analyzeSwipe,
} from '../src/core/swipe';
import type { Swipe } from '../src/types';

const swipe = (x1: number, y1: number, x2: number, y2: number, dur = 100): Swipe => ({
  start: { x: x1, y: y1 },
  end: { x: x2, y: y2 },
  durationMs: dur,
});

describe('swipe — direcao e vetor', () => {
  it('calcula o vetor do gesto', () => {
    expect(swipeVector(swipe(0, 0, 30, -40))).toEqual({ x: 30, y: -40 });
  });

  it('calcula a distancia (hipotenusa)', () => {
    expect(swipeDistance(swipe(0, 0, 30, 40))).toBe(50);
  });

  it('calcula o angulo em radianos', () => {
    expect(swipeAngle(swipe(0, 0, 10, 0))).toBeCloseTo(0);
    expect(swipeAngle(swipe(0, 0, 0, 10))).toBeCloseTo(Math.PI / 2);
  });

  it('retorna direcao unitaria e {0,0} para gesto nulo', () => {
    const dir = swipeDirection(swipe(0, 0, 0, -10));
    expect(dir.x).toBeCloseTo(0);
    expect(dir.y).toBeCloseTo(-1);
    expect(swipeDirection(swipe(5, 5, 5, 5))).toEqual({ x: 0, y: 0 });
  });
});

describe('swipe — normalizacao de intensidade', () => {
  it('retorna 0 abaixo do minimo e 1 acima do maximo', () => {
    expect(normalizeIntensity(0, 40, 320)).toBe(0);
    expect(normalizeIntensity(40, 40, 320)).toBe(0);
    expect(normalizeIntensity(400, 40, 320)).toBe(1);
  });

  it('interpola linearmente no meio', () => {
    expect(normalizeIntensity(180, 40, 320)).toBeCloseTo(0.5);
  });

  it('nao quebra quando max <= min', () => {
    expect(normalizeIntensity(100, 100, 100)).toBe(0);
  });
});

describe('swipe — rejeicao de gesto curto', () => {
  it('rejeita gesto abaixo do minimo', () => {
    expect(isValidSwipe(10, 28)).toBe(false);
  });
  it('aceita gesto igual ou acima do minimo', () => {
    expect(isValidSwipe(28, 28)).toBe(true);
    expect(isValidSwipe(120, 28)).toBe(true);
  });
  it('analyzeSwipe marca gesto curto como invalido', () => {
    expect(analyzeSwipe(swipe(0, 0, 5, 5)).valid).toBe(false);
    expect(analyzeSwipe(swipe(0, 0, 0, -200)).valid).toBe(true);
  });
});
