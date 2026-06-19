// WIP — minimal side-scroll movement + jump + shoot skeleton.
// TODO next pass: parallax background, real sprite animation, enemies, levels.

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const groundY = H - 80;

const player = { x: 80, y: groundY - 40, w: 28, h: 40, vy: 0, onGround: true, facing: 1 };
let bullets = [];
let keys = {};
const GRAVITY = 0.7;
const JUMP_V = -12;

document.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  if ((e.key === 'f') ) shoot();
});
document.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

function shoot() {
  bullets.push({ x: player.x + (player.facing > 0 ? player.w : -8), y: player.y + 16, vx: 10 * player.facing });
}

function update() {
  if (keys['arrowleft'] || keys['a']) { player.x -= 4; player.facing = -1; }
  if (keys['arrowright'] || keys['d']) { player.x += 4; player.facing = 1; }
  player.x = Math.max(0, Math.min(W - player.w, player.x));

  if ((keys['arrowup'] || keys[' ']) && player.onGround) {
    player.vy = JUMP_V;
    player.onGround = false;
  }

  player.vy += GRAVITY;
  player.y += player.vy;
  if (player.y + player.h >= groundY) {
    player.y = groundY - player.h;
    player.vy = 0;
    player.onGround = true;
  }

  bullets.forEach((b) => (b.x += b.vx));
  bullets = bullets.filter((b) => b.x > -20 && b.x < W + 20);
}

function draw() {
  // sky
  ctx.fillStyle = '#0c1410';
  ctx.fillRect(0, 0, W, H);

  // ground
  ctx.fillStyle = '#1c2a20';
  ctx.fillRect(0, groundY, W, H - groundY);
  ctx.strokeStyle = 'rgba(232,162,61,0.25)';
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, groundY); ctx.lineTo(x, H); ctx.stroke();
  }

  // player
  ctx.fillStyle = '#5FD98A';
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.fillStyle = '#0c1410';
  ctx.fillRect(player.x + (player.facing > 0 ? player.w - 6 : 0), player.y + 8, 6, 6);

  // bullets
  ctx.fillStyle = '#E8A23D';
  bullets.forEach((b) => ctx.fillRect(b.x, b.y, 8, 3));

  ctx.fillStyle = 'rgba(243,238,230,0.6)';
  ctx.font = '13px monospace';
  ctx.fillText('protótipo de movimento — sem inimigos ainda', 18, 26);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
