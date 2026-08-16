// ============================================================
//  Board — canvas de desenho ao vivo.
//  role "draw": captura o traço e (se online) envia os segmentos.
//  role "view": só recebe e redesenha o que o desenhista mandou.
//
//  Coordenadas são normalizadas (0..1) para funcionar em qualquer
//  tamanho de tela. Um "channel" (opcional) faz a ponte com a rede:
//     channel.reset()          -> limpa o traço remoto (início da rodada)
//     channel.send(evento)     -> {t:'seg'|'undo'|'clear', ...}
//     channel.subscribe(cb)    -> recebe eventos (view)  -> retorna unsub
//  Sem channel (modo local), o desenho vive só neste aparelho.
// ============================================================

const BOARD_BG = "#FFFFFF";
const SIZES = { S: 0.006, M: 0.011, L: 0.02 };

class Board {
  constructor(canvas, { role, channel = null, color = "#1A1712", size = "M" }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.role = role;
    this.channel = channel;
    this.color = color;
    this.sizeKey = size;
    this.eraser = false;
    this.strokes = [];            // {id, c, w, pts:[{x,y}]}  (normalizados)
    this._byId = new Map();       // strokeId -> stroke (para view/undo)
    this._cur = null;             // stroke em andamento (draw)
    this._buf = [];               // pontos ainda não enviados (draw)
    this._lastFlush = 0;
    this._unsub = null;

    this._resize();
    this._onResize = () => this._resize(true);
    window.addEventListener("resize", this._onResize);

    if (role === "draw") this._bindPointer();
    if (role === "view" && channel) {
      this._unsub = channel.subscribe((ev) => this._applyEvent(ev));
    }
  }

  // ---------- dimensionamento ----------
  _resize(redraw) {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this._clearCanvas();
    if (redraw) this._redrawAll();
  }

  _clearCanvas() {
    this.ctx.fillStyle = BOARD_BG;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // ---------- render ----------
  _drawStroke(stroke) {
    const { ctx, canvas } = this;
    const pts = stroke.pts;
    if (!pts.length) return;
    ctx.strokeStyle = stroke.c;
    ctx.lineWidth = stroke.w * canvas.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(pts[0].x * canvas.width, pts[0].y * canvas.height);
    if (pts.length === 1) {
      // ponto único: bolinha
      ctx.lineTo(pts[0].x * canvas.width + 0.01, pts[0].y * canvas.height);
    } else {
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x * canvas.width, pts[i].y * canvas.height);
    }
    ctx.stroke();
  }

  _redrawAll() {
    this._clearCanvas();
    for (const s of this.strokes) this._drawStroke(s);
  }

  // ---------- entrada (draw) ----------
  _bindPointer() {
    const c = this.canvas;
    c.style.touchAction = "none";
    const pos = (e) => {
      const r = c.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    };
    c.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      c.setPointerCapture(e.pointerId);
      const color = this.eraser ? BOARD_BG : this.color;
      const w = SIZES[this.sizeKey] * (this.eraser ? 2.4 : 1);
      this._cur = { id: "s" + Math.random().toString(36).slice(2, 8), c: color, w, pts: [pos(e)] };
      this.strokes.push(this._cur);
      this._byId.set(this._cur.id, this._cur);
      this._buf = [this._cur.pts[0]];
      this._lastFlush = performance.now();
      this._drawStroke({ ...this._cur });
    });
    c.addEventListener("pointermove", (e) => {
      if (!this._cur) return;
      e.preventDefault();
      const p = pos(e);
      const last = this._cur.pts[this._cur.pts.length - 1];
      this._cur.pts.push(p);
      this._buf.push(p);
      // desenha só o segmento novo (incremental)
      const { ctx, canvas } = this;
      ctx.strokeStyle = this._cur.c;
      ctx.lineWidth = this._cur.w * canvas.width;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(last.x * canvas.width, last.y * canvas.height);
      ctx.lineTo(p.x * canvas.width, p.y * canvas.height);
      ctx.stroke();
      const now = performance.now();
      if (this._buf.length >= 6 || now - this._lastFlush > 70) this._flush();
    });
    const end = (e) => {
      if (!this._cur) return;
      this._flush();
      this._cur = null;
      try { c.releasePointerCapture(e.pointerId); } catch (_) {}
    };
    c.addEventListener("pointerup", end);
    c.addEventListener("pointercancel", end);
    c.addEventListener("pointerleave", end);
  }

  _flush() {
    if (!this.channel || !this._cur || this._buf.length === 0) { this._buf = this._cur ? [this._cur.pts[this._cur.pts.length - 1]] : []; this._lastFlush = performance.now(); return; }
    this.channel.send({ t: "seg", s: this._cur.id, c: this._cur.c, w: this._cur.w, p: this._buf.map((p) => [round3(p.x), round3(p.y)]) });
    this._buf = [this._cur.pts[this._cur.pts.length - 1]]; // continuidade
    this._lastFlush = performance.now();
  }

  // ---------- eventos recebidos (view) ----------
  _applyEvent(ev) {
    if (!ev) return;
    if (ev.t === "clear") { this.strokes = []; this._byId.clear(); this._clearCanvas(); return; }
    if (ev.t === "undo") {
      const s = this._byId.get(ev.s);
      if (s) { this._byId.delete(ev.s); this.strokes = this.strokes.filter((x) => x.id !== ev.s); this._redrawAll(); }
      return;
    }
    if (ev.t === "seg") {
      let s = this._byId.get(ev.s);
      const pts = ev.p.map(([x, y]) => ({ x, y }));
      if (!s) { s = { id: ev.s, c: ev.c, w: ev.w, pts }; this._byId.set(ev.s, s); this.strokes.push(s); }
      else { for (const p of pts) s.pts.push(p); }
      // desenha só os pontos novos deste segmento, ligados ao anterior
      this._drawSegment(s, pts);
    }
  }

  _drawSegment(stroke, pts) {
    const { ctx, canvas } = this;
    const start = stroke.pts.length - pts.length; // índice do 1º ponto novo
    const from = Math.max(0, start - 1);
    ctx.strokeStyle = stroke.c;
    ctx.lineWidth = stroke.w * canvas.width;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(stroke.pts[from].x * canvas.width, stroke.pts[from].y * canvas.height);
    for (let i = from + 1; i < stroke.pts.length; i++) ctx.lineTo(stroke.pts[i].x * canvas.width, stroke.pts[i].y * canvas.height);
    ctx.stroke();
  }

  // ---------- ações do desenhista ----------
  setColor(c) { this.color = c; this.eraser = false; }
  setSize(k) { if (SIZES[k]) this.sizeKey = k; }
  setEraser(on) { this.eraser = on; }

  undo() {
    if (!this.strokes.length) return;
    const last = this.strokes.pop();
    this._byId.delete(last.id);
    this._redrawAll();
    if (this.channel) this.channel.send({ t: "undo", s: last.id });
  }
  clear() {
    this.strokes = [];
    this._byId.clear();
    this._clearCanvas();
    if (this.channel) this.channel.send({ t: "clear" });
  }

  refit() { this._resize(true); }

  destroy() {
    window.removeEventListener("resize", this._onResize);
    if (this._unsub) this._unsub();
    this._unsub = null;
  }
}

function round3(n) { return Math.round(n * 1000) / 1000; }

window.Board = Board;
window.BOARD_SIZES = SIZES;
