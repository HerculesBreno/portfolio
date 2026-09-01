import type { Vec2 } from '../types';

/** Ponto local (relativo ao elemento) mais o instante do evento. */
export interface PointerSample {
  point: Vec2;
  time: number;
}

export interface DragHandlers {
  /** Retorne false em onStart para ignorar este gesto. */
  onStart?: (sample: PointerSample, event: PointerEvent) => boolean | void;
  onMove?: (start: PointerSample, current: PointerSample) => void;
  onEnd?: (start: PointerSample, end: PointerSample) => void;
  onCancel?: () => void;
}

/** Converte um PointerEvent em coordenadas locais do elemento. */
export function localPoint(el: HTMLElement, event: { clientX: number; clientY: number }): Vec2 {
  const rect = el.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

/**
 * Rastreia um unico ponteiro (dedo ou mouse) sobre um elemento, reportando
 * inicio/movimento/fim em coordenadas locais. Retorna funcao de desconexao.
 */
export function attachPointerDrag(el: HTMLElement, handlers: DragHandlers): () => void {
  let activeId: number | null = null;
  let start: PointerSample | null = null;

  const onDown = (event: PointerEvent) => {
    if (activeId !== null) return;
    const sample: PointerSample = { point: localPoint(el, event), time: event.timeStamp };
    const accepted = handlers.onStart?.(sample, event);
    if (accepted === false) return;
    activeId = event.pointerId;
    start = sample;
    el.setPointerCapture?.(event.pointerId);
  };

  const onMove = (event: PointerEvent) => {
    if (event.pointerId !== activeId || !start) return;
    const current: PointerSample = { point: localPoint(el, event), time: event.timeStamp };
    handlers.onMove?.(start, current);
  };

  const finish = (event: PointerEvent, cancelled: boolean) => {
    if (event.pointerId !== activeId || !start) return;
    const end: PointerSample = { point: localPoint(el, event), time: event.timeStamp };
    const startedAt = start;
    activeId = null;
    start = null;
    el.releasePointerCapture?.(event.pointerId);
    if (cancelled) handlers.onCancel?.();
    else handlers.onEnd?.(startedAt, end);
  };

  const onUp = (event: PointerEvent) => finish(event, false);
  const onCancel = (event: PointerEvent) => finish(event, true);

  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onCancel);

  return () => {
    el.removeEventListener('pointerdown', onDown);
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerup', onUp);
    el.removeEventListener('pointercancel', onCancel);
  };
}
