/**
 * Wrapper da MediaDevices API. Nao grava, nao fotografa, nao envia nem
 * armazena frames. Apenas exibe o video ao vivo e garante o encerramento
 * das tracks ao sair.
 */

export type CameraErrorKind = 'denied' | 'notFound' | 'unsupported' | 'unknown';

export class CameraError extends Error {
  kind: CameraErrorKind;
  constructor(kind: CameraErrorKind, message: string) {
    super(message);
    this.name = 'CameraError';
    this.kind = kind;
  }
}

export class CameraController {
  private stream: MediaStream | null = null;

  get active(): boolean {
    return this.stream !== null;
  }

  /**
   * Solicita a camera traseira (facingMode: environment) e conecta ao elemento
   * de video. Lanca CameraError com o tipo apropriado em caso de falha.
   */
  async start(video: HTMLVideoElement): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new CameraError('unsupported', 'Camera nao suportada neste navegador.');
    }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
    } catch (err) {
      throw mapGetUserMediaError(err);
    }

    video.srcObject = this.stream;
    video.setAttribute('playsinline', '');
    video.muted = true;
    try {
      await video.play();
    } catch (err) {
      this.stop();
      throw new CameraError('unknown', `Falha ao iniciar o video: ${(err as Error).message}`);
    }
  }

  /** Encerra todas as tracks e libera a camera. Idempotente. */
  stop(): void {
    if (!this.stream) return;
    for (const track of this.stream.getTracks()) {
      track.stop();
    }
    this.stream = null;
  }
}

function mapGetUserMediaError(err: unknown): CameraError {
  const name = (err as { name?: string })?.name ?? '';
  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return new CameraError('denied', 'Permissao de camera negada.');
    case 'NotFoundError':
    case 'OverconstrainedError':
      return new CameraError('notFound', 'Nenhuma camera disponivel.');
    case 'NotReadableError':
      return new CameraError('unknown', 'A camera esta em uso por outro app.');
    default:
      return new CameraError('unknown', `Erro ao acessar a camera: ${(err as Error)?.message ?? name}`);
  }
}
