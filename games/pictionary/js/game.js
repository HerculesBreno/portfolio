// ============================================================
//  Pictionário — orquestração (máquina de estados + telas)
//  Modo LOCAL (solo / passa-e-joga) roda 100% aqui.
//  Modo ONLINE reaproveita a MESMA lógica via store sincronizado.
// ============================================================
(function () {
  "use strict";

  const { calcularPontos, criarPartida, drawerDaRodada, jogadorPorId, ranking, ehUltimaRodada, ROUND_TIME, BONUS_ARTISTA } = window.GameState;

  const COLORS = ["#FF5A5F", "#22C7B8", "#FFC63B", "#9B5DE5", "#3B82F6", "#35C46A", "#F97316", "#EC4899"];
  const uid = () => Math.random().toString(36).slice(2, 9);
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const iniciais = (nome) => nome.trim().slice(0, 2).toUpperCase();

  // ---------- Estado de sessão (fora da partida) ----------
  let session = { mode: "local", tema: "livre", rounds: 5, players: [] };
  let store = null;
  let unsub = null;
  let myId = null;      // id do jogador neste aparelho (online)
  let G = null;         // estado da partida (sincronizado)
  let tick = null;      // interval do timer
  let board = null;     // instância do canvas de desenho

  const isLocal = () => !store || store.isLocal || (store instanceof window.Room.LocalStore);
  const amDrawer = () => isLocal() || (G && myId === G.drawerId);
  const isController = () => isLocal() || (G && myId === G.drawerId);
  const isSolo = () => G && G.players.length === 1;

  // ============================================================
  //  Navegação de telas
  // ============================================================
  function show(id) {
    $$(".screen").forEach((s) => s.classList.toggle("active", s.id === id));
    window.scrollTo(0, 0);
  }

  function setStatusbar(visible) {
    const bar = $("#statusbar");
    bar.hidden = !visible;
  }

  function updateStatusbar() {
    if (!G || G.phase === "lobby") { setStatusbar(false); return; }
    setStatusbar(true);
    $("#status-round").textContent = `Rodada ${Math.min(G.roundIndex + 1, G.totalRounds)}/${G.totalRounds}`;
    $("#status-conn").textContent = isLocal() ? "🕹️ Local" : "📡 " + (store.roomId || "");
  }

  // ============================================================
  //  HOME
  // ============================================================
  function initHome() {
    const cfg = window.FIREBASE_CONFIG;
    const configOk = cfg && cfg.apiKey && !String(cfg.apiKey).includes("SUA_");
    $("#home-note").innerHTML = configOk
      ? "Online ativo ✅ — crie uma sala e chame a galera."
      : "Modo local pronto. <i>Online multi-aparelho exige configurar o Firebase (veja o README).</i>";
  }

  $$("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dest = btn.dataset.go;
      if (dest === "setup") {
        session.mode = btn.dataset.mode || "local";
        openSetup();
      } else if (dest === "join") {
        openJoin();
      } else if (dest === "rules") {
        show("screen-rules");
      }
    });
  });
  $$("[data-back]").forEach((btn) => btn.addEventListener("click", () => show("screen-" + btn.dataset.back)));

  // ============================================================
  //  SETUP
  // ============================================================
  function renderThemeChips() {
    const box = $("#setup-themes");
    box.innerHTML = "";
    window.Words.listaTemas().forEach((t) => {
      const b = document.createElement("button");
      b.className = "chip";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", String(t.id === session.tema));
      b.dataset.theme = t.id;
      b.innerHTML = `<span aria-hidden="true">${t.emoji}</span> ${t.nome}`;
      b.addEventListener("click", () => {
        session.tema = t.id;
        renderThemeChips();
      });
      box.appendChild(b);
    });
  }

  function renderRoundChips() {
    $$("#setup-rounds .chip").forEach((c) => {
      c.setAttribute("aria-checked", String(Number(c.dataset.rounds) === session.rounds));
    });
  }
  $$("#setup-rounds .chip").forEach((c) =>
    c.addEventListener("click", () => {
      session.rounds = Number(c.dataset.rounds);
      renderRoundChips();
    })
  );

  function renderPlayersDraft() {
    const ul = $("#setup-players");
    ul.innerHTML = "";
    session.players.forEach((p) => {
      const li = document.createElement("li");
      li.className = "player-item";
      li.innerHTML =
        `<span class="player-avatar" style="background:${p.color}">${iniciais(p.name)}</span>` +
        `<span class="player-name">${p.name}</span>` +
        `<button class="player-remove" aria-label="Remover ${p.name}">✕</button>`;
      li.querySelector(".player-remove").addEventListener("click", () => {
        session.players = session.players.filter((x) => x.id !== p.id);
        renderPlayersDraft();
      });
      ul.appendChild(li);
    });
  }

  $("#add-player-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#player-input");
    const name = input.value.trim();
    if (!name) return;
    if (session.players.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      flash("#setup-error", "Já tem alguém com esse nome.");
      return;
    }
    session.players.push({ id: uid(), name, color: COLORS[session.players.length % COLORS.length] });
    input.value = "";
    input.focus();
    hide("#setup-error");
    renderPlayersDraft();
  });

  function openSetup() {
    const online = session.mode === "online";
    session.players = [];
    $("#setup-title").textContent = online ? "Criar sala online" : "Nova partida";
    // Rótulo do bloco de jogadores muda conforme o modo
    const label = $("#setup-players-field .field-label");
    label.innerHTML = online
      ? "Seu nome <span class='field-hint'>(host)</span>"
      : "Jogadores <span class='field-hint'>(1 = modo treino)</span>";
    $("#setup-players").style.display = online ? "none" : "";
    $(".btn--add").style.display = online ? "none" : "";
    $("#player-input").placeholder = online ? "Seu nome" : "Nome do jogador";
    renderThemeChips();
    renderRoundChips();
    renderPlayersDraft();
    hide("#setup-error");
    show("screen-setup");
  }

  $("#setup-continue").addEventListener("click", () => {
    const online = session.mode === "online";
    if (online) {
      const name = $("#player-input").value.trim();
      if (!name) { flash("#setup-error", "Digite seu nome pra criar a sala."); return; }
      const host = { id: uid(), name, color: COLORS[0] };
      myId = host.id;
      startRoom({ mode: "online", isHost: true }, [host]);
    } else {
      if (session.players.length < 1) { flash("#setup-error", "Adicione ao menos 1 jogador."); return; }
      startRoom({ mode: "local", isHost: true }, session.players.slice());
    }
  });

  // ============================================================
  //  JOIN (convidado online)
  // ============================================================
  function openJoin() {
    const params = new URLSearchParams(location.search);
    if (params.get("room")) $("#join-code").value = params.get("room").toUpperCase();
    hide("#join-error");
    show("screen-join");
    setTimeout(() => $("#join-code").focus(), 100);
  }

  $("#join-continue").addEventListener("click", async () => {
    const code = $("#join-code").value.trim().toUpperCase();
    const name = $("#join-name").value.trim();
    if (code.length !== 4) { flash("#join-error", "O código tem 4 letras."); return; }
    if (!name) { flash("#join-error", "Digite seu nome."); return; }

    const cfg = window.FIREBASE_CONFIG;
    const configOk = cfg && cfg.apiKey && !String(cfg.apiKey).includes("SUA_");
    if (!configOk) { flash("#join-error", "Multiplayer online não está configurado neste site (veja README)."); return; }

    try {
      const me = { id: uid(), name, color: COLORS[0], _pending: true };
      myId = me.id;
      store = window.Room.criarStore({ mode: "online", roomId: code, isHost: false });
      await store.ready();
      bindStore();
      // entra na lista de jogadores da sala
      store.update((st) => {
        if (!st) return;
        if (!st.players.some((p) => p.id === me.id)) {
          me.color = COLORS[st.players.length % COLORS.length];
          delete me._pending;
          st.players.push(me);
        }
      });
    } catch (err) {
      if (String(err.message).includes("SALA_INEXISTENTE")) flash("#join-error", "Sala não encontrada. Confira o código.");
      else flash("#join-error", "Não deu pra conectar. Tente de novo.");
      store = null;
    }
  });

  // ============================================================
  //  Criar sala / iniciar store
  // ============================================================
  function startRoom(opts, players) {
    store = window.Room.criarStore({ mode: opts.mode, isHost: true });
    bindStore();
    const online = opts.mode === "online";
    const base = {
      phase: online ? "lobby" : null,
      config: { tema: session.tema, rounds: session.rounds, mode: opts.mode },
      players,
      order: [], totalRounds: session.rounds, roundIndex: 0,
      drawerId: null, choices: null, chosen: null, roundEndsAt: null, startedAt: null, lastResult: null,
    };

    if (online) {
      store.set(base);              // fica no lobby aguardando a galera
    } else {
      const g = criarPartida(base.config, players); // começa direto
      store.set(g);
    }
  }

  function bindStore() {
    if (unsub) unsub();
    unsub = store.subscribe((state) => {
      G = state;
      route();
    });
    if (store.get()) { G = store.get(); route(); }
  }

  // Decide a tela a partir do estado sincronizado
  function route() {
    if (!G) return;
    if (G.phase === "lobby") return renderLobby();
    updateStatusbar();
    if (tick) { clearInterval(tick); tick = null; }
    if (G.phase !== "play" && board) { board.destroy(); board = null; }
    switch (G.phase) {
      case "turn":   return renderTurn();
      case "pick":   return renderPick();
      case "play":   return renderPlay();
      case "winner": return renderWinner();
      case "round":  return renderRound();
      case "final":  return renderFinal();
    }
  }

  // ============================================================
  //  LOBBY (online)
  // ============================================================
  function renderLobby() {
    setStatusbar(false);
    const host = isLocal() || store.isHost;
    $("#lobby-share").hidden = false;
    const url = `${location.origin}${location.pathname}?room=${store.roomId}`;
    $("#room-code-value").textContent = store.roomId || "----";
    window.QR.renderQR($("#qr-box"), url);

    const temaNome = window.Words.listaTemas().find((t) => t.id === G.config.tema)?.nome || "Livre";
    const aviso = store._fallback
      ? `<span class="summary-pill" style="background:var(--coral);color:#fff">⚠️ Online não configurado — QR não sincroniza. Veja o README.</span>`
      : "";
    $("#lobby-summary").innerHTML =
      `<span class="summary-pill">🎨 ${temaNome}</span><span class="summary-pill">🔁 ${G.config.rounds} rodadas</span>${aviso}`;

    const ul = $("#lobby-players");
    ul.innerHTML = "";
    G.players.forEach((p) => {
      const li = document.createElement("li");
      li.className = "player-item";
      li.innerHTML = `<span class="player-avatar" style="background:${p.color}">${iniciais(p.name)}</span><span class="player-name">${p.name}${p.id === myId ? " (você)" : ""}</span>`;
      ul.appendChild(li);
    });
    $("#lobby-count").textContent = `· ${G.players.length}`;

    $("#lobby-start").hidden = !host;
    $("#lobby-wait").hidden = host;
    $("#lobby-start").disabled = G.players.length < 1;
    show("screen-lobby");
  }

  $("#lobby-start").addEventListener("click", () => {
    if (!G || G.players.length < 1) return;
    const g = criarPartida(G.config, G.players);
    store.set(g);
  });
  $("#lobby-back").addEventListener("click", leaveFlow);

  // ============================================================
  //  TURN — vez de desenhar
  // ============================================================
  function renderTurn() {
    const drawer = jogadorPorId(G, G.drawerId);
    $("#turn-round").textContent = `Rodada ${G.roundIndex + 1}/${G.totalRounds}`;
    $("#turn-name").textContent = drawer.name;
    $("#turn-name").style.color = drawer.color;
    $("#turn-sub").textContent = isSolo() ? "sua vez!" : "desenhar!";

    const eu = amDrawer();
    $("#turn-start").hidden = !eu;
    $("#turn-start").textContent = isSolo() ? "Escolher palavra" : "Sou eu — escolher palavra";
    $("#turn-wait").hidden = eu;
    $("#turn-wait").textContent = isLocal()
      ? `Passe o aparelho para ${drawer.name} 👀`
      : `Aguarde ${drawer.name} escolher…`;
    show("screen-turn");
  }
  $("#turn-start").addEventListener("click", () => {
    if (!isController()) return;
    store.update((st) => {
      st.choices = window.Words.sortearPalavras(st.config.tema);
      st.chosen = null;
      st.phase = "pick";
    });
  });

  // ============================================================
  //  PICK — escolher 1 de 3 palavras
  // ============================================================
  function renderPick() {
    const drawer = jogadorPorId(G, G.drawerId);
    const eu = amDrawer();
    const box = $("#word-cards");
    box.hidden = !eu;
    $("#pick-wait").hidden = eu;
    $("#pick-drawer").textContent = drawer.name;

    if (eu) {
      box.innerHTML = "";
      G.choices.forEach((c, i) => {
        const btn = document.createElement("button");
        btn.className = "word-card";
        btn.innerHTML =
          `<span class="word-main"><span class="word-text">${c.palavra}</span>` +
          `<span class="badge badge--${c.dificuldade}">${window.Words.ROTULO_DIF[c.dificuldade]}</span></span>` +
          `<span class="word-pts">${c.base}</span>`;
        btn.addEventListener("click", () => choosePalavra(i));
        box.appendChild(btn);
      });
    }
    show("screen-pick");
  }
  function choosePalavra(i) {
    if (!isController()) return;
    store.update((st) => {
      st.chosen = st.choices[i];
      st.roundEndsAt = Date.now() + ROUND_TIME * 1000;
      st.phase = "play";
    });
  }

  // ============================================================
  //  PLAY — canvas + timer
  // ============================================================
  function renderPlay() {
    const drawer = jogadorPorId(G, G.drawerId);
    const eu = amDrawer();

    // Cabeçalho: desenhista vê a palavra; quem adivinha vê quem desenha.
    if (eu) {
      $("#play-head-info").innerHTML =
        `${isSolo() ? "Desenhe:" : "Você desenha:"} <b>${G.chosen.palavra}</b> ` +
        `<span class="badge badge--${G.chosen.dificuldade}">${window.Words.ROTULO_DIF[G.chosen.dificuldade]} · ${G.chosen.base}</span>`;
    } else {
      $("#play-head-info").innerHTML = `🎨 <b style="color:${drawer.color}">${drawer.name}</b> está desenhando…`;
    }

    $("#tools").hidden = !eu;
    const canControl = isController();
    $("#play-actions").hidden = !canControl;
    $("#btn-got-it").textContent = isSolo() ? "✅ Terminei!" : "✅ Alguém acertou!";
    $("#status-timer").hidden = false;

    show("screen-play");
    setupBoard(eu);
    startTimer();
  }

  function setupBoard(eu) {
    if (board) { board.destroy(); board = null; }
    const canvas = $("#board");
    const channel = isLocal() ? null : store.drawChannel(G.roundIndex);
    board = new window.Board(canvas, { role: eu ? "draw" : "view", channel });
    // garante dimensionamento correto após o layout
    requestAnimationFrame(() => { if (board) board.refit(); });
    if (eu) syncSwatches();
  }

  // ----- ferramentas de desenho -----
  const DRAW_COLORS = ["#1A1712", "#FF5A5F", "#3B82F6", "#35C46A", "#FFC63B"];
  const SIZE_ORDER = ["S", "M", "L"];
  function buildSwatches() {
    const box = $("#swatches");
    box.innerHTML = "";
    DRAW_COLORS.forEach((c, i) => {
      const b = document.createElement("button");
      b.className = "swatch" + (i === 0 ? " is-active" : "");
      b.style.background = c;
      b.dataset.color = c;
      b.setAttribute("aria-label", "Cor");
      b.addEventListener("click", () => {
        if (!board) return;
        board.setColor(c);
        $("#tool-eraser").setAttribute("aria-pressed", "false");
        syncSwatches(c);
      });
      box.appendChild(b);
    });
  }
  function syncSwatches(active) {
    const cur = active || (board && !board.eraser ? board.color : null);
    $$("#swatches .swatch").forEach((s) => s.classList.toggle("is-active", s.dataset.color === cur));
  }
  buildSwatches();
  $("#tool-size").addEventListener("click", () => {
    if (!board) return;
    const i = (SIZE_ORDER.indexOf(board.sizeKey) + 1) % SIZE_ORDER.length;
    board.setSize(SIZE_ORDER[i]);
    $("#tool-size").textContent = "● " + SIZE_ORDER[i];
  });
  $("#tool-eraser").addEventListener("click", () => {
    if (!board) return;
    const on = $("#tool-eraser").getAttribute("aria-pressed") !== "true";
    board.setEraser(on);
    $("#tool-eraser").setAttribute("aria-pressed", String(on));
    if (on) syncSwatches("__none__");
  });
  $("#tool-undo").addEventListener("click", () => board && board.undo());
  $("#tool-clear").addEventListener("click", () => board && board.clear());

  function startTimer() {
    if (tick) clearInterval(tick);
    const paint = () => {
      const remaining = Math.max(0, (G.roundEndsAt - Date.now()) / 1000);
      const mm = Math.floor(remaining / 60);
      const ss = Math.floor(remaining % 60);
      const label = `${mm}:${String(ss).padStart(2, "0")}`;
      $("#mini-timer").textContent = label;
      $("#status-timer").textContent = label;
      const pct = Math.max(0, remaining / ROUND_TIME) * 100;
      $("#timerbar-fill").style.width = pct + "%";
      const low = remaining <= 15;
      $("#timerbar-fill").classList.toggle("is-low", low);
      $("#mini-timer").classList.toggle("is-low", low);
      $("#status-timer").classList.toggle("is-low", low);
      if (remaining <= 0) {
        clearInterval(tick); tick = null;
        if (isController()) resolveRound(null); // ninguém acertou
      }
    };
    paint();
    tick = setInterval(paint, 250);
  }

  $("#btn-got-it").addEventListener("click", () => {
    if (!isController()) return;
    if (isSolo()) { resolveRound(G.drawerId); return; } // treino: o próprio jogador pontua
    if (tick) { clearInterval(tick); tick = null; }
    store.update((st) => { st.phase = "winner"; });
  });
  $("#btn-skip").addEventListener("click", () => {
    if (!isController()) return;
    resolveRound(null);
  });

  // ============================================================
  //  WINNER — quem acertou
  // ============================================================
  function renderWinner() {
    const remaining = Math.max(0, (G.roundEndsAt - Date.now()) / 1000);
    const usados = ROUND_TIME - remaining;
    $("#winner-time").textContent = `Tempo até o acerto: ${Math.floor(usados)}s · vale mais quem acertou rápido`;
    const box = $("#winner-people");
    box.innerHTML = "";
    G.players.filter((p) => p.id !== G.drawerId).forEach((p) => {
      const btn = document.createElement("button");
      btn.className = "person-btn";
      btn.innerHTML = `<span class="player-avatar" style="background:${p.color}">${iniciais(p.name)}</span><span class="person-name">${p.name}</span>`;
      btn.addEventListener("click", () => resolveRound(p.id));
      box.appendChild(btn);
    });
    show("screen-winner");
  }
  $("#winner-back").addEventListener("click", () => {
    if (!isController()) return;
    store.update((st) => { st.phase = "play"; }); // voltou: ainda desenhando
  });

  // ============================================================
  //  Resolver rodada (aplica pontos) — só o controlador chama
  // ============================================================
  function resolveRound(winnerId) {
    if (tick) { clearInterval(tick); tick = null; }
    store.update((st) => {
      const remaining = Math.max(0, (st.roundEndsAt - Date.now()) / 1000);
      const drawer = jogadorPorId(st, st.drawerId);
      if (winnerId) {
        const winner = jogadorPorId(st, winnerId);
        const pts = calcularPontos(st.chosen.base, remaining);
        winner.score += pts.total;
        let bonus = 0;
        if (winnerId !== st.drawerId) { bonus = BONUS_ARTISTA; drawer.score += bonus; }
        st.lastResult = {
          winnerId, drawerId: st.drawerId, word: st.chosen.palavra, dif: st.chosen.dificuldade,
          usados: Math.round(ROUND_TIME - remaining), ...pts, bonus, solo: st.players.length === 1,
        };
      } else {
        st.lastResult = { winnerId: null, drawerId: st.drawerId, word: st.chosen.palavra, dif: st.chosen.dificuldade };
      }
      st.phase = "round";
    });
  }

  // ============================================================
  //  ROUND — resultado + placar
  // ============================================================
  function renderRound() {
    const r = G.lastResult;
    const card = $("#result-card");
    if (r.winnerId) {
      const winner = jogadorPorId(G, r.winnerId);
      const drawer = jogadorPorId(G, r.drawerId);
      const bonusLine = r.bonus ? `<div class="hint">✏️ +${r.bonus} pra ${drawer.name} pelo desenho</div>` : "";
      card.innerHTML =
        `<div class="result-word">“${r.word}” <span class="badge badge--${r.dif}">${window.Words.ROTULO_DIF[r.dif]}</span></div>` +
        `<div class="result-who">${r.solo ? "Você fechou em" : `<b style="color:${winner.color}">${winner.name}</b> acertou em`} ${r.usados}s</div>` +
        `<div class="result-breakdown"><span>${r.base}</span><span class="result-plus">+ ${r.bonusRapidez} rapidez</span><span class="result-plus">=</span><span class="result-total">${r.total} pts</span></div>` +
        bonusLine;
    } else {
      card.innerHTML =
        `<div class="result-word">“${r.word}” <span class="badge badge--${r.dif}">${window.Words.ROTULO_DIF[r.dif]}</span></div>` +
        `<div class="result-miss">Tempo esgotado — ninguém acertou 😬</div>`;
    }
    renderBoard($("#round-board"));
    $("#round-next").textContent = ehUltimaRodada(G) ? "Ver resultado final 🏁" : "Próxima rodada →";
    show("screen-round");
  }

  $("#round-next").addEventListener("click", () => {
    if (!isController()) return;
    store.update((st) => {
      if (st.roundIndex >= st.totalRounds - 1) {
        st.phase = "final";
      } else {
        st.roundIndex += 1;
        st.drawerId = drawerDaRodada(st, st.roundIndex);
        st.choices = null; st.chosen = null; st.roundEndsAt = null; st.lastResult = null;
        st.phase = "turn";
      }
    });
  });

  function renderBoard(el) {
    const rank = ranking(G);
    el.innerHTML = "";
    rank.forEach((p, i) => {
      const row = document.createElement("div");
      row.className = "board-row" + (i === 0 && p.score > 0 ? " is-leader" : "");
      row.innerHTML =
        `<span class="board-rank">${i + 1}º</span>` +
        `<span class="player-avatar" style="background:${p.color}">${iniciais(p.name)}</span>` +
        `<span class="board-name">${p.name}</span>` +
        `<span class="board-pts">${p.score}</span>`;
      el.appendChild(row);
    });
  }

  // ============================================================
  //  FINAL — pódio
  // ============================================================
  function renderFinal() {
    setStatusbar(false);
    const rank = ranking(G);
    const podium = $("#podium");
    podium.innerHTML = "";
    const ordem = [1, 0, 2]; // 2º, 1º, 3º (visual)
    const medal = ["🥇", "🥈", "🥉"];
    ordem.forEach((idx) => {
      const p = rank[idx];
      if (!p) return;
      const col = document.createElement("div");
      col.className = `podium-col podium-${idx + 1}`;
      col.innerHTML =
        `<span class="player-avatar podium-avatar" style="background:${p.color}">${iniciais(p.name)}</span>` +
        `<div class="podium-bar"><span class="medal">${medal[idx]}</span></div>` +
        `<span class="podium-name">${p.name}</span><span class="podium-pts">${p.score} pts</span>`;
      podium.appendChild(col);
    });
    renderBoard($("#final-board"));
    show("screen-final");
  }

  $("#final-again").addEventListener("click", () => {
    if (!isController()) return;
    const g = criarPartida(G.config, G.players.map((p) => ({ id: p.id, name: p.name, color: p.color })));
    store.set(g);
  });
  $("#final-home").addEventListener("click", resetToHome);

  // ============================================================
  //  Sair / reset
  // ============================================================
  function leaveFlow() {
    if (!G || G.phase === "lobby") { resetToHome(); return; }
    $("#modal-leave").hidden = false;
  }
  $("#btn-leave").addEventListener("click", leaveFlow);
  $("#leave-cancel").addEventListener("click", () => ($("#modal-leave").hidden = true));
  $("#leave-confirm").addEventListener("click", () => { $("#modal-leave").hidden = true; resetToHome(); });

  function resetToHome() {
    if (tick) { clearInterval(tick); tick = null; }
    if (board) { board.destroy(); board = null; }
    if (unsub) { unsub(); unsub = null; }
    if (store && store.close) store.close();
    store = null; G = null; myId = null;
    setStatusbar(false);
    history.replaceState(null, "", location.pathname);
    show("screen-home");
  }

  // ============================================================
  //  Helpers de UI
  // ============================================================
  function flash(sel, msg) {
    const el = $(sel);
    el.textContent = msg;
    el.hidden = false;
  }
  function hide(sel) { $(sel).hidden = true; }

  // ============================================================
  //  Boot
  // ============================================================
  initHome();
  const params = new URLSearchParams(location.search);
  if (params.get("room")) openJoin(); // veio de um QR escaneado
})();
