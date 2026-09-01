import type { Target, Vec2 } from '../types';
import { SCORING_RINGS } from '../config';

export interface AimVisual {
  origin: Vec2;
  current: Vec2;
  intensity: number;
  valid: boolean;
}

export interface ImpactMarker {
  point: Vec2;
  color: string;
}

export interface Scene {
  target: Target;
  showTarget: boolean;
  aim?: AimVisual;
  trail?: Vec2[];
  flyingDart?: Vec2;
  impacts: ImpactMarker[];
}

/** Desenha a cena do jogo em um canvas 2D. Todo o alvo e feito por codigo. */
export class Renderer {
  private ctx: CanvasRenderingContext2D;
  width = 0;
  height = 0;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D nao disponivel.');
    this.ctx = ctx;
  }

  /** Ajusta o tamanho do canvas ao CSS + devicePixelRatio. */
  resize(cssWidth: number, cssHeight: number, dpr: number = window.devicePixelRatio || 1): void {
    this.width = cssWidth;
    this.height = cssHeight;
    this.canvas.width = Math.round(cssWidth * dpr);
    this.canvas.height = Math.round(cssHeight * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  render(scene: Scene): void {
    this.clear();
    if (scene.showTarget) this.drawTarget(scene.target);
    if (scene.trail && scene.trail.length > 1) this.drawTrail(scene.trail);
    for (const impact of scene.impacts) this.drawDart(impact.point, impact.color);
    if (scene.flyingDart) this.drawDart(scene.flyingDart, '#ffffff');
    if (scene.aim) this.drawAim(scene.aim);
  }

  private drawTarget(target: Target): void {
    const { ctx } = this;
    // Aneis do maior para o menor, para o centro ficar por cima.
    const rings = [...SCORING_RINGS].reverse();
    for (const ring of rings) {
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius * ring.outerFraction, 0, Math.PI * 2);
      ctx.fillStyle = ring.color;
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.stroke();
    }
    // Marca central.
    ctx.beginPath();
    ctx.arc(target.x, target.y, Math.max(3, target.radius * 0.03), 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();
    // Anel de contorno externo.
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.stroke();
  }

  private drawDart(point: Vec2, color: string): void {
    const { ctx } = this;
    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.stroke();
    // Haste do dardo.
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(point.x + 10, point.y - 16);
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.restore();
  }

  private drawTrail(points: Vec2[]): void {
    const { ctx } = this;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.restore();
  }

  private drawAim(aim: AimVisual): void {
    const { ctx } = this;
    const color = aim.valid ? '#ffd23f' : 'rgba(255,255,255,0.4)';
    ctx.save();
    // Linha de mira do ponto de toque ate o dedo.
    ctx.beginPath();
    ctx.moveTo(aim.origin.x, aim.origin.y);
    ctx.lineTo(aim.current.x, aim.current.y);
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.stroke();
    // Ponto de origem.
    ctx.beginPath();
    ctx.arc(aim.origin.x, aim.origin.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    // Barra de intensidade.
    const barW = 120;
    const barH = 8;
    const bx = aim.origin.x - barW / 2;
    const by = aim.origin.y + 24;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(bx, by, barW, barH);
    ctx.fillStyle = color;
    ctx.fillRect(bx, by, barW * aim.intensity, barH);
    ctx.restore();
  }
}
