const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

const state = { running: true, won: false, lost: false, score: 0 };

const player = { x: W / 2 - 20, y: H - 50, w: 40, h: 16, speed: 6 };
let bullets = []; // player bullets
let enemyBullets = [];
let keys = {};

function makeSignals() {
  const rows = 4, cols = 9;
  const arr = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      arr.push({
        x: 70 + c * 76,
        y: 60 + r * 50,
        w: 36, h: 22,
        alive: true,
      });
    }
  }
  return arr;
}
let signals = makeSignals();
let dir = 1;
let dropTimer = 0;

document.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
document.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

let shootCooldown = 0;

function update() {
  if (!state.running) return;

  if (keys['arrowleft'] || keys['a']) player.x -= player.speed;
  if (keys['arrowright'] || keys['d']) player.x += player.speed;
  player.x = Math.max(0, Math.min(W - player.w, player.x));

  if (shootCooldown > 0) shootCooldown--;
  if (keys[' '] && shootCooldown === 0) {
    bullets.push({ x: player.x + player.w / 2 - 2, y: player.y, w: 4, h: 12 });
    shootCooldown = 14;
  }

  bullets.forEach((b) => (b.y -= 9));
  bullets = bullets.filter((b) => b.y > -20);

  enemyBullets.forEach((b) => (b.y += 5));
  enemyBullets = enemyBullets.filter((b) => b.y < H + 20);

  // move signals as a block
  let edge = false;
  signals.forEach((s) => {
    if (!s.alive) return;
    if (s.x <= 10 || s.x + s.w >= W - 10) edge = true;
  });
  dropTimer++;
  const stepEvery = Math.max(4, 16 - Math.floor(state.score / 200));
  if (dropTimer >= stepEvery) {
    dropTimer = 0;
    if (edge) {
      dir *= -1;
      signals.forEach((s) => (s.y += 16));
    } else {
      signals.forEach((s) => (s.x += dir * 8));
    }
  }

  // random enemy fire
  if (Math.random() < 0.025) {
    const alive = signals.filter((s) => s.alive);
    if (alive.length) {
      const s = alive[Math.floor(Math.random() * alive.length)];
      enemyBullets.push({ x: s.x + s.w / 2 - 2, y: s.y + s.h, w: 4, h: 12 });
    }
  }

  // collisions: player bullets vs signals
  bullets.forEach((b) => {
    signals.forEach((s) => {
      if (!s.alive) return;
      if (b.x < s.x + s.w && b.x + b.w > s.x && b.y < s.y + s.h && b.y + b.h > s.y) {
        s.alive = false;
        b.y = -999;
        state.score += 10;
      }
    });
  });
  bullets = bullets.filter((b) => b.y > -50);

  // collisions: enemy bullets vs player
  enemyBullets.forEach((b) => {
    if (b.x < player.x + player.w && b.x + b.w > player.x && b.y < player.y + player.h && b.y + b.h > player.y) {
      state.lost = true;
      state.running = false;
    }
  });

  // signals reach player line
  signals.forEach((s) => {
    if (s.alive && s.y + s.h >= player.y) {
      state.lost = true;
      state.running = false;
    }
  });

  if (signals.every((s) => !s.alive)) {
    state.won = true;
    state.running = false;
  }
}

function draw() {
  ctx.fillStyle = '#070605';
  ctx.fillRect(0, 0, W, H);

  // score
  ctx.fillStyle = 'rgba(243,238,230,0.85)';
  ctx.font = '16px monospace';
  ctx.fillText('SCORE ' + String(state.score).padStart(4, '0'), 18, 26);

  // signals
  signals.forEach((s) => {
    if (!s.alive) return;
    ctx.fillStyle = '#E8A23D';
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.strokeRect(s.x, s.y, s.w, s.h);
  });

  // player
  ctx.fillStyle = '#5FD98A';
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // bullets
  ctx.fillStyle = '#F3EEE6';
  bullets.forEach((b) => ctx.fillRect(b.x, b.y, b.w, b.h));
  ctx.fillStyle = '#E5483D';
  enemyBullets.forEach((b) => ctx.fillRect(b.x, b.y, b.w, b.h));

  if (state.won || state.lost) {
    ctx.fillStyle = 'rgba(7,6,5,0.78)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#F3EEE6';
    ctx.font = '28px monospace';
    ctx.fillText(state.won ? 'SINAL DEFENDIDO' : 'SINAL PERDIDO', W / 2, H / 2 - 10);
    ctx.font = '14px monospace';
    ctx.fillText('clique em Reiniciar', W / 2, H / 2 + 24);
    ctx.textAlign = 'left';
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

document.getElementById('restart').addEventListener('click', () => {
  signals = makeSignals();
  bullets = [];
  enemyBullets = [];
  dir = 1;
  state.running = true;
  state.won = false;
  state.lost = false;
  state.score = 0;
});

loop();
