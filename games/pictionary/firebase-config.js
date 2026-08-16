// ============================================================================
//  CONFIGURAÇÃO DO MULTIPLAYER ONLINE (opcional)
// ============================================================================
//
// O jogo funciona 100% sem isto no modo LOCAL (solo / passa-e-joga num aparelho).
// Para liberar o multiplayer real (cada jogador no seu celular, entrando via QR),
// crie um projeto gratuito no Firebase e cole as chaves abaixo.
//
//  1. Acesse https://console.firebase.google.com  → "Adicionar projeto"
//  2. No projeto: Build → Realtime Database → "Criar banco de dados"
//     (comece em modo de teste; depois ajuste as regras — ver README.md)
//  3. Configurações do projeto (⚙️) → "Seus apps" → Web (</>) → registre o app
//  4. Copie o objeto firebaseConfig e substitua os valores abaixo.
//
// Enquanto os valores começarem com "SUA_", o jogo ignora o Firebase e roda local.

window.FIREBASE_CONFIG = {
  apiKey: "SUA_API_KEY",
  authDomain: "SUA_APP.firebaseapp.com",
  databaseURL: "https://SUA_APP-default-rtdb.firebaseio.com",
  projectId: "SUA_APP",
  storageBucket: "SUA_APP.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID",
};
