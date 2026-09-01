import type { Bounds, Target, Vec2, Swipe } from '../types';
import { ROUND, SCORING_RINGS, TARGET } from '../config';
import { StateMachine } from '../state/machine';
import { CameraController, CameraError } from './camera';
import { Renderer, type ImpactMarker, type Scene } from './renderer';
import { UI, type GameMode } from './ui';
import { attachPointerDrag, type PointerSample } from './input';
import { analyzeSwipe } from '../core/swipe';
import { computeImpactPoint, buildTrajectory } from '../core/trajectory';
import { evaluateImpact } from '../core/impact';
import { scoreImpact } from '../core/scoring';
import { defaultTarget, moveTarget, resizeTarget, clampTargetToBounds } from '../core/target';

/** Estados em que o alvo deve ser desenhado. */
const SHOW_TARGET_STATES = new Set(['placingTarget', 'ready', 'dartFlying', 'result']);
/** Fracao inferior da tela reservada ao gesto de lancamento. */
const LAUNCH_ZONE_TOP = 0.6;
const FLIGHT_DURATION_MS = 620;

interface Flight {
  trail: Vec2[];
  impactPoint: Vec2;
  startTime: number;
  finalized: boolean;
}

export class Game {
  private machine = new StateMachine('intro');
  private camera = new CameraController();
  private renderer: Renderer;
  private ui: UI;
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;

  private bounds: Bounds = { width: 0, height: 0 };
  private target: Target = { x: 0, y: 0, radius: TARGET.minRadius };
  private impacts: ImpactMarker[] = [];
  private dartsLeft: number = ROUND.dartsPerRound;
  private totalScore = 0;
  private mode: GameMode = 'demo';

  private aim: { origin: Vec2; current: Vec2; intensity: number; valid: boolean } | null = null;
  private flight: Flight | null = null;
  private dragTargetStart: { pointer: Vec2; center: Vec2 } | null = null;
  private reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor(root: { canvas: HTMLCanvasElement; video: HTMLVideoElement }) {
    this.renderer = new Renderer(root.canvas);
    this.canvas = root.canvas;
    this.video = root.video;
    this.ui = new UI({
      onStart: () => this.startWithCamera(),
      onStartDemo: () => this.startDemo(),
      onConfirmTarget: () => this.confirmTarget(),
      onResetTarget: () => this.resetTarget(),
      onResizeTarget: (r) => this.setTargetRadius(r),
      onReposition: () => this.reposition(),
      onPlayAgain: () => this.playAgain(),
      onExit: () => this.exit(),
      onRetry: () => this.retry(),
    });

    this.machine.subscribe((state) => this.ui.setState(state));
    this.attachInput(root.canvas);
    this.installLifecycleGuards();
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
    window.visualViewport?.addEventListener('resize', () => this.handleResize());

    this.ui.setState(this.machine.current);
    this.ui.setMode(this.mode);
    requestAnimationFrame((t) => this.loop(t));
  }

  // ---------- Ciclo de vida / recursos ----------

  private installLifecycleGuards(): void {
    // Encerra a camera quando a pagina e descarregada definitivamente.
    window.addEventListener('pagehide', (e) => {
      if (!e.persisted) this.camera.stop();
    });
  }

  private handleResize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;
    this.bounds = { width, height };
    this.renderer.resize(width, height);
    this.target = clampTargetToBounds(this.target, this.bounds);
    this.configureSlider();
  }

  private configureSlider(): void {
    const maxRadius = Math.min(TARGET.maxRadius, Math.min(this.bounds.width, this.bounds.height) / 2);
    this.ui.configureSlider(TARGET.minRadius, Math.round(maxRadius), Math.round(this.target.radius));
  }

  // ---------- Fluxo de estados ----------

  private async startWithCamera(): Promise<void> {
    if (!this.machine.send('START')) return;
    this.mode = 'camera';
    this.ui.setMode('camera');
    try {
      await this.camera.start(this.video);
      this.beginPlacement();
      this.machine.send('CAMERA_GRANTED');
    } catch (err) {
      const message =
        err instanceof CameraError
          ? this.cameraMessage(err)
          : 'Erro inesperado ao acessar a câmera.';
      this.ui.setError(message);
      this.machine.send('CAMERA_DENIED');
    }
  }

  private cameraMessage(err: CameraError): string {
    switch (err.kind) {
      case 'denied':
        return 'Permissão negada. Você pode liberar a câmera nas configurações do navegador ou jogar em modo demo.';
      case 'notFound':
        return 'Nenhuma câmera foi encontrada neste dispositivo.';
      case 'unsupported':
        return 'Este navegador não expõe a câmera (verifique HTTPS ou localhost).';
      default:
        return err.message;
    }
  }

  private startDemo(): void {
    this.camera.stop();
    this.mode = 'demo';
    this.ui.setMode('demo');
    this.beginPlacement();
    // Aceita tanto a partir da intro (START_DEMO) quanto do erro (START_DEMO).
    this.machine.send('START_DEMO');
  }

  private beginPlacement(): void {
    this.resetRound();
    this.target = defaultTarget(this.bounds);
    this.configureSlider();
  }

  private resetRound(): void {
    this.impacts = [];
    this.dartsLeft = ROUND.dartsPerRound;
    this.totalScore = 0;
    this.aim = null;
    this.flight = null;
    this.ui.setRoundComplete(false);
    this.ui.setDartsLeft(this.dartsLeft);
    this.ui.setScore(this.totalScore);
  }

  private confirmTarget(): void {
    this.machine.send('CONFIRM_TARGET');
  }

  private resetTarget(): void {
    this.target = defaultTarget(this.bounds);
    this.ui.setSliderValue(Math.round(this.target.radius));
  }

  private setTargetRadius(radius: number): void {
    this.target = resizeTarget(this.target, radius, this.bounds);
  }

  private reposition(): void {
    // Permitido a partir de "ready" ou "result".
    if (this.machine.send('REPOSITION')) {
      this.impacts = [];
      this.ui.setRoundComplete(false);
      this.configureSlider();
    }
  }

  private playAgain(): void {
    if (this.machine.send('PLAY_AGAIN')) {
      this.resetRound();
    }
  }

  private retry(): void {
    this.machine.send('RETRY');
  }

  private exit(): void {
    this.machine.send('EXIT');
    this.camera.stop();
    this.mode = 'demo';
    this.ui.setMode('demo');
    // Volta a intro para permitir novo inicio.
    this.machine.send('RETRY');
    this.resetRound();
  }

  // ---------- Entrada ----------

  private attachInput(canvas: HTMLCanvasElement): void {
    attachPointerDrag(canvas, {
      onStart: (sample) => this.onPointerStart(sample),
      onMove: (start, current) => this.onPointerMove(start, current),
      onEnd: (start, end) => this.onPointerEnd(start, end),
      onCancel: () => this.onPointerCancel(),
    });
  }

  private onPointerStart(sample: PointerSample): boolean {
    const state = this.machine.current;
    if (state === 'placingTarget') {
      const d = Math.hypot(sample.point.x - this.target.x, sample.point.y - this.target.y);
      if (d > this.target.radius + 60) return false;
      this.dragTargetStart = {
        pointer: sample.point,
        center: { x: this.target.x, y: this.target.y },
      };
      return true;
    }
    if (state === 'ready') {
      if (sample.point.y < this.bounds.height * LAUNCH_ZONE_TOP) return false;
      this.aim = { origin: sample.point, current: sample.point, intensity: 0, valid: false };
      return true;
    }
    return false;
  }

  private onPointerMove(start: PointerSample, current: PointerSample): void {
    if (this.machine.current === 'placingTarget' && this.dragTargetStart) {
      const dx = current.point.x - this.dragTargetStart.pointer.x;
      const dy = current.point.y - this.dragTargetStart.pointer.y;
      this.target = moveTarget(
        this.target,
        this.dragTargetStart.center.x + dx,
        this.dragTargetStart.center.y + dy,
        this.bounds,
      );
      return;
    }
    if (this.machine.current === 'ready' && this.aim) {
      const swipe = this.toSwipe(start, current);
      const analysis = analyzeSwipe(swipe);
      this.aim = {
        origin: this.aim.origin,
        current: current.point,
        intensity: analysis.intensity,
        valid: analysis.valid,
      };
    }
  }

  private onPointerEnd(start: PointerSample, end: PointerSample): void {
    if (this.machine.current === 'placingTarget') {
      this.dragTargetStart = null;
      return;
    }
    if (this.machine.current === 'ready' && this.aim) {
      const swipe = this.toSwipe(start, end);
      this.aim = null;
      const analysis = analyzeSwipe(swipe);
      if (!analysis.valid) return;
      this.launch(swipe);
    }
  }

  private onPointerCancel(): void {
    this.dragTargetStart = null;
    this.aim = null;
  }

  private toSwipe(start: PointerSample, end: PointerSample): Swipe {
    return {
      start: start.point,
      end: end.point,
      durationMs: Math.max(0, end.time - start.time),
    };
  }

  // ---------- Lancamento / impacto / pontuacao ----------

  private launch(swipe: Swipe): void {
    if (!this.machine.send('LAUNCH')) return;
    const origin = swipe.start;
    const impactPoint = computeImpactPoint(origin, swipe);
    const trail = buildTrajectory(origin, impactPoint);
    this.flight = {
      trail,
      impactPoint,
      startTime: performance.now(),
      finalized: false,
    };
  }

  private finalizeFlight(): void {
    if (!this.flight) return;
    const impactPoint = this.flight.impactPoint;
    this.flight = null;

    const impact = evaluateImpact(impactPoint, this.target);
    const score = scoreImpact(impact);
    const color = this.ringColor(score.ringId);
    this.impacts.push({ point: impactPoint, color });

    this.dartsLeft = Math.max(0, this.dartsLeft - 1);
    this.totalScore += score.points;
    this.ui.setDartsLeft(this.dartsLeft);
    this.ui.setScore(this.totalScore);

    this.machine.send('IMPACT_RESOLVED');
    this.ui.showThrowResult(score.points, score.ringLabel);

    if (this.dartsLeft <= 0) {
      this.ui.setRoundTotal(this.totalScore);
      this.ui.setRoundComplete(true);
    } else {
      const delay = this.reducedMotion ? 400 : 1050;
      window.setTimeout(() => {
        if (this.machine.current === 'result') this.machine.send('NEXT_THROW');
      }, delay);
    }
  }

  private ringColor(ringId: string): string {
    return SCORING_RINGS.find((r) => r.id === ringId)?.color ?? '#ffffff';
  }

  // ---------- Loop de render ----------

  private loop(now: number): void {
    this.update(now);
    this.renderer.render(this.buildScene());
    requestAnimationFrame((t) => this.loop(t));
  }

  private update(now: number): void {
    if (this.flight) {
      const elapsed = now - this.flight.startTime;
      const duration = this.reducedMotion ? 1 : FLIGHT_DURATION_MS;
      if (elapsed >= duration && !this.flight.finalized) {
        this.flight.finalized = true;
        this.finalizeFlight();
      }
    }
  }

  private buildScene(): Scene {
    const state = this.machine.current;
    const scene: Scene = {
      target: this.target,
      showTarget: SHOW_TARGET_STATES.has(state),
      impacts: this.impacts,
    };
    if (this.aim) scene.aim = this.aim;
    if (this.flight) {
      const elapsed = performance.now() - this.flight.startTime;
      const duration = this.reducedMotion ? 1 : FLIGHT_DURATION_MS;
      const p = Math.min(1, elapsed / duration);
      const idx = Math.min(this.flight.trail.length - 1, Math.floor(p * (this.flight.trail.length - 1)));
      scene.trail = this.flight.trail.slice(0, idx + 1);
      scene.flyingDart = this.flight.trail[idx];
    }
    return scene;
  }
}
