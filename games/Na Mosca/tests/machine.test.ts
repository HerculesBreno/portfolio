import { describe, it, expect } from 'vitest';
import { StateMachine, canTransition, nextState } from '../src/state/machine';

describe('machine — transicoes validas', () => {
  it('reconhece transicoes validas', () => {
    expect(canTransition('intro', 'START')).toBe(true);
    expect(canTransition('intro', 'START_DEMO')).toBe(true);
    expect(canTransition('requestingCamera', 'CAMERA_GRANTED')).toBe(true);
    expect(canTransition('placingTarget', 'CONFIRM_TARGET')).toBe(true);
    expect(canTransition('ready', 'LAUNCH')).toBe(true);
    expect(canTransition('dartFlying', 'IMPACT_RESOLVED')).toBe(true);
    expect(canTransition('result', 'NEXT_THROW')).toBe(true);
    expect(canTransition('result', 'REPOSITION')).toBe(true);
  });

  it('rejeita transicoes invalidas', () => {
    expect(canTransition('intro', 'LAUNCH')).toBe(false);
    expect(canTransition('ready', 'CONFIRM_TARGET')).toBe(false);
    expect(canTransition('dartFlying', 'LAUNCH')).toBe(false);
  });

  it('nextState mantem o estado em transicao invalida', () => {
    expect(nextState('intro', 'LAUNCH')).toBe('intro');
    expect(nextState('intro', 'START')).toBe('requestingCamera');
  });
});

describe('machine — instancia observavel', () => {
  it('send retorna false em transicao invalida e nao muda o estado', () => {
    const m = new StateMachine('intro');
    expect(m.send('LAUNCH')).toBe(false);
    expect(m.current).toBe('intro');
  });

  it('notifica listeners em transicoes validas', () => {
    const m = new StateMachine('intro');
    const seen: string[] = [];
    m.subscribe((state) => seen.push(state));
    m.send('START_DEMO');
    m.send('CONFIRM_TARGET');
    expect(m.current).toBe('ready');
    expect(seen).toEqual(['placingTarget', 'ready']);
  });

  it('percorre o caminho feliz ate o resultado', () => {
    const m = new StateMachine('intro');
    expect(m.send('START')).toBe(true); // requestingCamera
    expect(m.send('CAMERA_GRANTED')).toBe(true); // placingTarget
    expect(m.send('CONFIRM_TARGET')).toBe(true); // ready
    expect(m.send('LAUNCH')).toBe(true); // dartFlying
    expect(m.send('IMPACT_RESOLVED')).toBe(true); // result
    expect(m.send('NEXT_THROW')).toBe(true); // ready
    expect(m.current).toBe('ready');
  });

  it('permite sair de qualquer estado de jogo', () => {
    const m = new StateMachine('ready');
    expect(m.send('EXIT')).toBe(true);
    expect(m.current).toBe('ended');
  });
});
