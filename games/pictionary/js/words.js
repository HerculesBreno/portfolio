// Banco de palavras do Pictionário.
// Cada tema tem palavras separadas por dificuldade: facil (100), medio (200), dificil (300).
// O tema "livre" é montado juntando todos os outros.

const THEMES = {
  animais: {
    nome: "Animais",
    emoji: "🐙",
    facil: ["Gato", "Cachorro", "Peixe", "Pato", "Vaca", "Cobra", "Abelha", "Coelho", "Galinha", "Sapo"],
    medio: ["Pinguim", "Tubarão", "Girafa", "Camaleão", "Polvo", "Morcego", "Ouriço", "Caranguejo", "Tucano", "Preguiça"],
    dificil: ["Ornitorrinco", "Narval", "Axolote", "Tamanduá-bandeira", "Bicho-preguiça", "Águia-harpia", "Peixe-boi", "Louva-a-deus"],
  },
  comida: {
    nome: "Comida",
    emoji: "🍔",
    facil: ["Pizza", "Banana", "Ovo", "Bolo", "Sorvete", "Maçã", "Cachorro-quente", "Pão", "Queijo", "Uva"],
    medio: ["Sushi", "Lasanha", "Brigadeiro", "Taco", "Panqueca", "Espetinho", "Milkshake", "Cupcake", "Salada", "Pastel"],
    dificil: ["Feijoada", "Ratatouille", "Croissant", "Estrogonofe", "Guacamole", "Tiramisù", "Coxinha derretendo", "Fondue"],
  },
  telas: {
    nome: "Filmes & Séries",
    emoji: "🎬",
    facil: ["Rei Leão", "Shrek", "Frozen", "Batman", "Toy Story", "Nemo", "Minions", "Homem-Aranha"],
    medio: ["Stranger Things", "Harry Potter", "Star Wars", "Jurassic Park", "Matrix", "Round 6", "Wandinha", "Titanic"],
    dificil: ["De Volta para o Futuro", "O Poderoso Chefão", "Interestelar", "Cidade de Deus", "A Origem", "Pantera Negra"],
  },
  objetos: {
    nome: "Objetos",
    emoji: "🎒",
    facil: ["Cadeira", "Guarda-chuva", "Relógio", "Chave", "Óculos", "Balão", "Escova", "Tesoura", "Vela", "Chapéu"],
    medio: ["Bússola", "Ampulheta", "Binóculo", "Extintor", "Ventilador", "Aspirador", "Furadeira", "Lanterna", "Cofre"],
    dificil: ["Estetoscópio", "Caleidoscópio", "Metrônomo", "Paraquedas", "Máquina de escrever", "Globo de neve"],
  },
  esportes: {
    nome: "Esportes",
    emoji: "⚽",
    facil: ["Futebol", "Vôlei", "Basquete", "Natação", "Skate", "Tênis", "Boxe", "Ciclismo", "Surfe", "Corrida"],
    medio: ["Esgrima", "Escalada", "Arco e flecha", "Salto com vara", "Judô", "Remo", "Hipismo", "Handebol"],
    dificil: ["Curling", "Salto ornamental", "Ginástica rítmica", "Nado sincronizado", "Triatlo", "Pentatlo"],
  },
  lugares: {
    nome: "Lugares",
    emoji: "🗺️",
    facil: ["Praia", "Escola", "Hospital", "Ponte", "Farol", "Castelo", "Ilha", "Deserto", "Floresta", "Vulcão"],
    medio: ["Torre Eiffel", "Pirâmide", "Aeroporto", "Estádio", "Aquário", "Observatório", "Cachoeira", "Iglu"],
    dificil: ["Coliseu", "Cristo Redentor", "Muralha da China", "Torre de Pisa", "Estação Espacial", "Machu Picchu"],
  },
  profissoes: {
    nome: "Profissões",
    emoji: "🧑‍🚀",
    facil: ["Médico", "Bombeiro", "Chef", "Pintor", "Policial", "Professor", "Palhaço", "Astronauta", "Piloto"],
    medio: ["Arqueólogo", "Malabarista", "Domador", "Fotógrafo", "Encanador", "Costureira", "Vulcanólogo", "DJ"],
    dificil: ["Sommelier", "Taxidermista", "Neurocirurgião", "Escafandrista", "Ventríloquo", "Domador de leões"],
  },
};

const DIFICULDADES = ["facil", "medio", "dificil"];
const PONTOS_BASE = { facil: 100, medio: 200, dificil: 300 };
const ROTULO_DIF = { facil: "Fácil", medio: "Médio", dificil: "Difícil" };

function _todasPalavras(dif) {
  const out = [];
  for (const key in THEMES) out.push(...THEMES[key][dif]);
  return out;
}

// Sorteia 3 palavras (uma fácil, uma média, uma difícil) do tema escolhido.
// tema === "livre" mistura todos os temas.
function sortearPalavras(tema) {
  const fonte =
    tema === "livre"
      ? { facil: _todasPalavras("facil"), medio: _todasPalavras("medio"), dificil: _todasPalavras("dificil") }
      : THEMES[tema];

  return DIFICULDADES.map((dif) => {
    const lista = fonte[dif];
    const palavra = lista[Math.floor(Math.random() * lista.length)];
    return { palavra, dificuldade: dif, base: PONTOS_BASE[dif] };
  });
}

function listaTemas() {
  return [
    { id: "livre", nome: "Livre", emoji: "🎲" },
    ...Object.keys(THEMES).map((id) => ({ id, nome: THEMES[id].nome, emoji: THEMES[id].emoji })),
  ];
}

window.Words = { sortearPalavras, listaTemas, PONTOS_BASE, ROTULO_DIF };
