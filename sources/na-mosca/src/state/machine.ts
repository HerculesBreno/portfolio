/** Maquina de estados explicita da experiencia. */

export type GameState =
  | 'intro'
  | 'requestingCamera'
  | 'placingTarget'
  | 'ready'
  | 'dartFlying'
  | 'result'
  | 'error'
  | 'ended';

export type GameEvent =
  | 'START' // intro -> pede camera
  | 'START_DEMO' // intro -> modo demo (sem camera)
  | 'CAMERA_GRANTED'
  | 'CAMERA_DENIED'
  | 'CONFIRM_TARGET'
  | 'REPOSITION'
  | 'LAUNCH'
  | 'IMPACT_RESOLVED'
  | 'NEXT_THROW'
  | 'PLAY_AGAIN'
  | 'RETRY'
  | 'EXIT';

/** Tabela de transicoes valida: estado -> evento -> proximo estado. */
const TRANSITIONS: Record<GameState, Partial<Record<GameEvent, GameState>>> = {
  intro: {
    START: 'requestingCamera',
    START_DEMO: 'placingTarget',
    EXIT: 'ended',
  },
  requestingCamera: {
    CAMERA_GRANTED: 'placingTarget',
    CAMERA_DENIED: 'error',
    EXIT: 'ended',
  },
  placingTarget: {
    CONFIRM_TARGET: 'ready',
    EXIT: 'ended',
  },
  ready: {
    LAUNCH: 'dartFlying',
    REPOSITION: 'placingTarget',
    EXIT: 'ended',
  },
  dartFlying: {
    IMPACT_RESOLVED: 'result',
    EXIT: 'ended',
  },
  result: {
    NEXT_THROW: 'ready',
    PLAY_AGAIN: 'ready',
    REPOSITION: 'placingTarget',
    EXIT: 'ended',
  },
  error: {
    RETRY: 'intro',
    START_DEMO: 'placingTarget',
    EXIT: 'ended',
  },
  ended: {
    RETRY: 'intro',
  },
};

/** Retorna true se a transicao existe. */
export function canTransition(state: GameState, event: GameEvent): boolean {
  return TRANSITIONS[state]?.[event] !== undefined;
}

/** Proximo estado dado um evento, ou o estado atual se a transicao for invalida. */
export function nextState(state: GameState, event: GameEvent): GameState {
  return TRANSITIONS[state]?.[event] ?? state;
}

export type StateListener = (state: GameState, previous: GameState, event: GameEvent) => void;

/** Pequena maquina de estados observavel. */
export class StateMachine {
  private state: GameState;
  private listeners = new Set<StateListener>();

  constructor(initial: GameState = 'intro') {
    this.state = initial;
  }

  get current(): GameState {
    return this.state;
  }

  can(event: GameEvent): boolean {
    return canTransition(this.state, event);
  }

  /** Dispara um evento. Retorna true se houve transicao. */
  send(event: GameEvent): boolean {
    if (!this.can(event)) return false;
    const previous = this.state;
    this.state = nextState(this.state, event);
    for (const listener of this.listeners) listener(this.state, previous, event);
    return true;
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
