import type { GameState } from '../state/machine';

export interface UICallbacks {
  onStart: () => void;
  onStartDemo: () => void;
  onConfirmTarget: () => void;
  onResetTarget: () => void;
  onResizeTarget: (radius: number) => void;
  onReposition: () => void;
  onPlayAgain: () => void;
  onExit: () => void;
  onRetry: () => void;
}

export type GameMode = 'camera' | 'demo';

const HINTS: Partial<Record<GameState, string>> = {
  placingTarget: 'Arraste o alvo e ajuste o tamanho. Depois toque em Confirmar.',
  ready: 'Arraste o dedo na parte de baixo em direção ao alvo e solte.',
  dartFlying: '',
  result: '',
};

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Elemento #${id} nao encontrado.`);
  return node as T;
}

/** Controla telas, HUD e controles a partir do estado do jogo. */
export class UI {
  private app = el<HTMLDivElement>('app');
  private hud = { darts: el('hud-darts'), score: el('hud-score') };
  private hint = el('hint');
  private toast = el('throw-toast');
  private sizeSlider = el<HTMLInputElement>('target-size');
  private errorMessage = el('error-message');
  private roundTotal = el('round-total');
  private toastTimer: number | null = null;

  constructor(private cb: UICallbacks) {
    this.bind();
  }

  private bind(): void {
    el('btn-play').addEventListener('click', () => this.cb.onStart());
    el('btn-demo').addEventListener('click', () => this.cb.onStartDemo());
    el('btn-error-demo').addEventListener('click', () => this.cb.onStartDemo());
    el('btn-confirm-target').addEventListener('click', () => this.cb.onConfirmTarget());
    el('btn-reset-target').addEventListener('click', () => this.cb.onResetTarget());
    el('btn-reposition').addEventListener('click', () => this.cb.onReposition());
    el('btn-round-reposition').addEventListener('click', () => this.cb.onReposition());
    el('btn-play-again').addEventListener('click', () => this.cb.onPlayAgain());
    el('btn-exit').addEventListener('click', () => this.cb.onExit());
    el('btn-retry').addEventListener('click', () => this.cb.onRetry());
    this.sizeSlider.addEventListener('input', () => this.cb.onResizeTarget(Number(this.sizeSlider.value)));
  }

  setState(state: GameState): void {
    this.app.dataset.state = state;
    const hint = HINTS[state];
    this.hint.textContent = hint ?? '';
  }

  setMode(mode: GameMode): void {
    this.app.dataset.mode = mode;
  }

  setRoundComplete(complete: boolean): void {
    if (complete) this.app.dataset.round = 'complete';
    else delete this.app.dataset.round;
  }

  setDartsLeft(n: number): void {
    this.hud.darts.textContent = String(n);
  }

  setScore(total: number): void {
    this.hud.score.textContent = String(total);
  }

  configureSlider(min: number, max: number, value: number): void {
    this.sizeSlider.min = String(min);
    this.sizeSlider.max = String(max);
    this.sizeSlider.value = String(value);
  }

  setSliderValue(value: number): void {
    this.sizeSlider.value = String(value);
  }

  setError(message: string): void {
    this.errorMessage.textContent = message;
  }

  setRoundTotal(total: number): void {
    this.roundTotal.textContent = String(total);
  }

  showThrowResult(points: number, ringLabel: string, holdMs = 1100): void {
    this.toast.innerHTML = `<span class="pts">${points}</span><span class="ring">${ringLabel}</span>`;
    this.toast.classList.add('show');
    if (this.toastTimer !== null) window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => this.toast.classList.remove('show'), holdMs);
  }
}
