import './style.css';
import { Game } from './game/game';

function boot(): void {
  const canvas = document.getElementById('stage') as HTMLCanvasElement | null;
  const video = document.getElementById('camera') as HTMLVideoElement | null;
  if (!canvas || !video) {
    throw new Error('Elementos essenciais (#stage / #camera) nao encontrados.');
  }

  // Evita zoom por gesto (iOS) dentro do jogo, sem impedir a saida da pagina.
  const app = document.getElementById('app');
  app?.addEventListener('gesturestart', (e) => e.preventDefault());
  // Evita zoom por duplo-toque dentro do canvas.
  canvas.addEventListener('dblclick', (e) => e.preventDefault());

  new Game({ canvas, video });
}

boot();
