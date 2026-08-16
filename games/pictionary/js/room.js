// Camada de sala. Abstrai ONDE o estado da partida vive.
//
//  - LocalStore   → tudo em memória, num único aparelho (solo / passa-e-joga). Testável sem rede.
//  - FirebaseStore → estado sincronizado na nuvem entre celulares diferentes (multiplayer real).
//
// Ambos expõem a MESMA interface, então game.js não sabe (nem precisa saber) qual está em uso:
//   store.get()                -> estado atual
//   store.set(state)           -> substitui e notifica
//   store.update(fn)           -> muta via função e notifica
//   store.subscribe(cb) -> unsub
//   store.roomId               -> código da sala (ou null no local)
//   store.isHost               -> este aparelho controla a partida?
//   store.ready()              -> Promise que resolve quando conectado

class LocalStore {
  constructor() {
    this.state = null;
    this.roomId = null;
    this.isHost = true;
    this._subs = new Set();
  }
  ready() { return Promise.resolve(this); }
  get() { return this.state; }
  set(state) { this.state = state; this._emit(); }
  update(fn) { fn(this.state); this._emit(); }
  subscribe(cb) { this._subs.add(cb); return () => this._subs.delete(cb); }
  _emit() { for (const cb of this._subs) cb(this.state); }
  drawChannel() { return null; } // modo local desenha direto na tela, sem rede
  reactionsChannel() {
    const subs = new Set();
    return {
      send: (e, from) => { const v = { e, from, t: Date.now() }; subs.forEach((cb) => cb(v)); },
      subscribe: (cb) => { subs.add(cb); return () => subs.delete(cb); },
    };
  }
  close() {}
}

// Gera código de sala curto e legível (sem caracteres ambíguos como 0/O, 1/I).
function gerarCodigoSala() {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 4; i++) out += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  return out;
}

// Sincroniza o MESMO objeto de estado via Firebase Realtime Database.
// Modelo: o host escreve o estado autoritativo; todos leem. Ações dos convidados
// (entrar na sala, reivindicar acerto) entram por /rooms/{id}/inbox e o host resolve.
class FirebaseStore {
  constructor(cfg, { roomId, isHost }) {
    this._cfg = cfg;
    this.roomId = roomId || gerarCodigoSala();
    this.isHost = isHost;
    this.state = null;
    this._subs = new Set();
    this._db = null;
    this._ref = null;
    this._pendingSet = null;
    this._readyPromise = this._connect();
  }

  async _connect() {
    // Import dinâmico do SDK modular — só carrega a rede quando o online é usado.
    const [{ initializeApp, getApps }, { getDatabase, ref, onValue, set, get, push, onChildAdded, remove }] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"),
    ]);
    const app = getApps().length ? getApps()[0] : initializeApp(this._cfg);
    this._db = getDatabase(app);
    this._fb = { ref, onValue, set, get, push, onChildAdded, remove };
    this._ref = ref(this._db, `rooms/${this.roomId}/state`);

    if (!this.isHost) {
      // Convidado: confere se a sala existe antes de escutar.
      const snap = await get(this._ref);
      if (!snap.exists()) throw new Error("SALA_INEXISTENTE");
      this.state = snap.val(); // já entra com o estado atual (evita corrida ao se adicionar)
    }

    this._off = onValue(this._ref, (snap) => {
      const val = snap.val();
      if (val) { this.state = val; this._emit(); }
    });

    // Escrita pendente (set() chamado antes da conexão terminar) é gravada agora.
    if (this._pendingSet) { this._fb.set(this._ref, this._pendingSet); this._pendingSet = null; }
    return this;
  }

  close() { if (this._off) this._off(); this._off = null; }

  ready() { return this._readyPromise; }
  get() { return this.state; }

  set(state) {
    this.state = state;
    this._emit();
    if (this._ref) this._fb.set(this._ref, state);
    else this._pendingSet = state; // ainda conectando: grava ao terminar
  }
  update(fn) {
    fn(this.state);
    this.set(this.state);
  }
  subscribe(cb) { this._subs.add(cb); return () => this._subs.delete(cb); }
  _emit() { for (const cb of this._subs) cb(this.state); }

  // Canal de desenho ao vivo: log append-only por rodada em /rooms/{id}/draw/{round}.
  drawChannel(round = 0) {
    const { ref, push, onChildAdded, remove } = this._fb;
    const drawRef = ref(this._db, `rooms/${this.roomId}/draw/${round}`);
    return {
      reset: () => remove(drawRef),
      send: (ev) => push(drawRef, ev),
      subscribe: (cb) => onChildAdded(drawRef, (snap) => cb(snap.val())),
    };
  }

  // Canal de reações (emojis) — log append-only em /rooms/{id}/reactions.
  reactionsChannel() {
    const { ref, push, onChildAdded } = this._fb;
    const rRef = ref(this._db, `rooms/${this.roomId}/reactions`);
    return {
      send: (e, from) => push(rRef, { e, from, t: Date.now() }),
      subscribe: (cb) => {
        const since = Date.now() - 1500; // ignora reações antigas ao entrar
        return onChildAdded(rRef, (snap) => { const v = snap.val(); if (v && (v.t || 0) >= since) cb(v); });
      },
    };
  }
}

// Fábrica: decide o transporte. Sem config válida → sempre local.
function criarStore({ mode, roomId, isHost }) {
  const cfg = window.FIREBASE_CONFIG;
  const online = mode === "online";
  const configOk = cfg && cfg.apiKey && !String(cfg.apiKey).includes("SUA_");

  if (online && configOk) {
    return new FirebaseStore(cfg, { roomId, isHost });
  }
  if (online && !configOk) {
    console.warn("[Pictionário] Modo online pedido, mas FIREBASE_CONFIG não está preenchido. Caindo para modo local.");
    const s = new LocalStore();
    s.roomId = gerarCodigoSala();
    s._fallback = true;
    return s;
  }
  return new LocalStore();
}

window.Room = { criarStore, gerarCodigoSala, LocalStore, FirebaseStore };
