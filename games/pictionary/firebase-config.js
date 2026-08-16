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
  apiKey: "AIzaSyCZr1M6_ExA2Y9PXvXbo_yvDgTMwhwFBk4",
  authDomain: "pictionario.firebaseapp.com",
  databaseURL: "https://pictionario-default-rtdb.firebaseio.com",
  projectId: "pictionario",
  storageBucket: "pictionario.firebasestorage.app",
  messagingSenderId: "607579311484",
  appId: "1:607579311484:web:0b01e4b83f77346ed228f9",
};
