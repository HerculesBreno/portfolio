// Renderiza um QR Code dentro de `el` apontando para `text` (a URL de entrada da sala).
// Usa a lib global `qrcode` (qrcode-generator, carregada via CDN no index.html).
// Se a lib não carregar (offline/CDN bloqueado), mostra o link como fallback legível.

function renderQR(el, text) {
  el.innerHTML = "";
  try {
    if (typeof window.qrcode !== "function") throw new Error("lib indisponível");
    const qr = window.qrcode(0, "M");
    qr.addData(text);
    qr.make();
    el.innerHTML = qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
    const svg = el.querySelector("svg");
    if (svg) {
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.setAttribute("shape-rendering", "crispEdges");
    }
    return true;
  } catch (e) {
    el.innerHTML =
      '<div class="qr-fallback">QR indisponível.<br>Compartilhe o link:<br>' +
      '<code>' + text + "</code></div>";
    return false;
  }
}

window.QR = { renderQR };
