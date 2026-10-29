export interface StreetPersonQuest {
  id: string;
  name: string;
  role: string;
  x: number;
  z: number;
  skin: string;
  shirt: number;
  hatType?: "cap" | "straw" | "headphones" | "glasses" | "curls";
  questType: "rescue" | "supply" | "encourage";
  neededSupplies?: number;
  speechBefore: string;
  speechAfter: string;
  pointsReward: number;
  xpReward: number;
}

export interface WorldCollectibleSpawn {
  id: string;
  kind: "scroll" | "supply" | "gem" | "heart";
  label: string;
  x: number;
  z: number;
  points: number;
}

export interface EnemySpawn {
  id: string;
  name: string;
  x: number;
  z: number;
  hp: number;
  isBoss?: boolean;
  points: number;
}

export interface OpenWorldConfig {
  supplyLabel: string;
  bossName: string;
  vehicleName: string;
  people: StreetPersonQuest[];
  collectibles: WorldCollectibleSpawn[];
  enemies: EnemySpawn[];
}

function generateCollectibles(supplyLabel: string): WorldCollectibleSpawn[] {
  const scrolls: [number, number][] = [
    [-46, 38],
    [48, 34],
    [-52, -26],
    [50, -32],
    [0, -60],
  ];
  const supplies: [number, number][] = [
    [-22, 36],
    [24, 32],
    [-38, 4],
    [36, 6],
    [-26, -34],
    [28, -36],
  ];
  const gems: [number, number][] = [
    [-12, 42],
    [12, 42],
    [-30, 20],
    [30, 20],
    [0, 24],
    [-18, -14],
    [18, -14],
    [-44, -46],
    [44, -46],
    [0, -42],
  ];
  const hearts: [number, number][] = [
    [-16, 10],
    [16, 10],
    [-16, -28],
    [16, -28],
  ];

  const list: WorldCollectibleSpawn[] = [];
  scrolls.forEach(([x, z], i) =>
    list.push({
      id: `scr-${i}`,
      kind: "scroll",
      label: "Pergaminho da Palavra",
      x,
      z,
      points: 180,
    })
  );
  supplies.forEach(([x, z], i) =>
    list.push({
      id: `sup-${i}`,
      kind: "supply",
      label: supplyLabel,
      x,
      z,
      points: 120,
    })
  );
  gems.forEach(([x, z], i) =>
    list.push({
      id: `gem-${i}`,
      kind: "gem",
      label: "Cristal de Sabedoria",
      x,
      z,
      points: 65,
    })
  );
  hearts.forEach(([x, z], i) =>
    list.push({
      id: `hrt-${i}`,
      kind: "heart",
      label: "Orbe de Restauração",
      x,
      z,
      points: 50,
    })
  );
  return list;
}

function generateEnemies(
  minionName: string,
  bossName: string
): EnemySpawn[] {
  const coords: [number, number][] = [
    [-34, 24],
    [-38, 18],
    [34, 18],
    [39, 12],
    [-28, -18],
    [28, -18],
    [-42, -36],
    [42, -36],
    [-14, -44],
    [14, -44],
  ];
  const enemies: EnemySpawn[] = coords.map(([x, z], idx) => ({
    id: `enemy-${idx}`,
    name: minionName,
    x,
    z,
    hp: 90,
    points: 150,
  }));

  // Giant Shadow Boss guarding the northern Nexus District!
  enemies.push({
    id: "boss-main",
    name: bossName,
    x: 0,
    z: -36,
    hp: 360,
    isBoss: true,
    points: 600,
  });

  return enemies;
}

export function getOpenWorldConfig(missionId: string): OpenWorldConfig {
  switch (missionId) {
    case "amazonia":
      return {
        supplyLabel: "Kit Médico Ribeirinho",
        bossName: "Tempestade do Abandono",
        vehicleName: "Quadriciclo Anfíbio Ide",
        people: [
          {
            id: "amz-p1",
            name: "Dona Raimunda",
            role: "Moradora das Palafitas",
            x: -28,
            z: 30,
            skin: "#b87a4b",
            shirt: 0xd97706,
            questType: "supply",
            neededSupplies: 2,
            speechBefore:
              "A cheia molhou tudo em casa! Você consegue recolher 2 Kits Médicos pelo mapa para nossa família?",
            speechAfter:
              "Deus abençoe vocês! Fazia tempo que ninguém vinha até nossa palafita cuidar da gente!",
            pointsReward: 300,
            xpReward: 40,
          },
          {
            id: "amz-p2",
            name: "Seu Pedro",
            role: "Pescador Veterano",
            x: 34,
            z: 16,
            skin: "#9c6234",
            shirt: 0x0284c7,
            hatType: "straw",
            questType: "rescue",
            speechBefore:
              "Socorro! As Sombras do Desânimo cercaram meu barco aqui no cais leste! Derrote-as!",
            speechAfter:
              "Que coragem! A luz de Cristo brilhou forte aqui no cais hoje!",
            pointsReward: 320,
            xpReward: 45,
          },
          {
            id: "amz-p3",
            name: "Profª. Ana",
            role: "Escola da Comunidade",
            x: -36,
            z: -24,
            skin: "#e5a975",
            shirt: 0x10b981,
            questType: "encourage",
            speechBefore:
              "Estava quase desistindo de reabrir a escolinha depois da enchente...",
            speechAfter:
              "Sua oração e apoio renovaram minhas forças! Vamos recomeçar com fé!",
            pointsReward: 250,
            xpReward: 35,
          },
          {
            id: "amz-p4",
            name: "Mateus (10a)",
            role: "Amigo do Cauã",
            x: 32,
            z: -26,
            skin: "#c68652",
            shirt: 0x14b8a6,
            hatType: "cap",
            questType: "encourage",
            speechBefore:
              "Ei! O Cauã está lá na praça central esperando você! Já avisou a turma da fogueira!",
            speechAfter:
              "Irado! Hoje à noite toda a galera da vila vai ouvir sobre Jesus!",
            pointsReward: 220,
            xpReward: 30,
          },
        ],
        collectibles: generateCollectibles("Kit Médico Ribeirinho"),
        enemies: generateEnemies(
          "Sombra do Desânimo",
          "Titã do Esquecimento"
        ),
      };

    case "janela1040":
      return {
        supplyLabel: "Pacote de Apoio & Esporte",
        bossName: "Fortaleza do Medo",
        vehicleName: "Jipe 4x4 Tático Ide",
        people: [
          {
            id: "j10-p1",
            name: "Sr. Karim",
            role: "Comerciante do Bazar",
            x: -30,
            z: 28,
            skin: "#d49a6a",
            shirt: 0xb45309,
            questType: "encourage",
            speechBefore:
              "Bem-vindo ao Grande Bazar! Poucos jovens estrangeiros param para cumprimentar os mais velhos com respeito.",
            speechAfter:
              "Sua educação e paz honram a Deus. As portas do bairro estão abertas para você!",
            pointsReward: 260,
            xpReward: 35,
          },
          {
            id: "j10-p2",
            name: "Zayd",
            role: "Goleiro da Rua Leste",
            x: 35,
            z: 15,
            skin: "#c68652",
            shirt: 0xe11d48,
            questType: "rescue",
            speechBefore:
              "As Sombras da Raiva e da Briga estão dominando a quadra leste! Limpe a área com a Luz!",
            speechAfter:
              "Uau! Nunca vi alguém vencer a provocação com tanta força e paz!",
            pointsReward: 330,
            xpReward: 45,
          },
          {
            id: "j10-p3",
            name: "Amira",
            role: "Estudante de Programação",
            x: -35,
            z: -24,
            skin: "#e5a975",
            shirt: 0x7c3aed,
            hatType: "glasses",
            questType: "supply",
            neededSupplies: 2,
            speechBefore:
              "Estamos montando a oficina jovem! Consegue trazer 2 Pacotes de Apoio espalhados pela cidade?",
            speechAfter:
              "Muito obrigada! Agora mais adolescentes vão poder participar do clube!",
            pointsReward: 310,
            xpReward: 40,
          },
          {
            id: "j10-p4",
            name: "Omar",
            role: "Buscador Secreto",
            x: 34,
            z: -28,
            skin: "#b87a4b",
            shirt: 0x0ea5e9,
            questType: "encourage",
            speechBefore:
              "Eu também ouvi falar das palavras de Jesus no celular... é verdade que Ele traz paz ao coração?",
            speechAfter:
              "Obrigado por orar comigo em segredo! Não me sinto mais sozinho!",
            pointsReward: 280,
            xpReward: 40,
          },
        ],
        collectibles: generateCollectibles("Pacote de Apoio & Esporte"),
        enemies: generateEnemies(
          "Sombra da Intolerância",
          "Guardião do Orgulho"
        ),
      };

    case "toquio":
      return {
        supplyLabel: "Sketchbook de Esperança",
        bossName: "Colosso da Ansiedade",
        vehicleName: "Cyber-Moto Neon Ide",
        people: [
          {
            id: "tyo-p1",
            name: "Kenji",
            role: "Gamer de Akihabara",
            x: 35,
            z: 16,
            skin: "#fde2ce",
            shirt: 0x2563eb,
            hatType: "headphones",
            questType: "rescue",
            speechBefore:
              "Os Drones da Solidão tomaram conta deste quarteirão! Me ajude a afastá-los!",
            speechAfter:
              "Incrível! Fazia meses que ninguém parava na rua para saber se eu estava bem!",
            pointsReward: 340,
            xpReward: 45,
          },
          {
            id: "tyo-p2",
            name: "Yuki",
            role: "Estudante do Cursinho",
            x: -30,
            z: 28,
            skin: "#fad0b1",
            shirt: 0x1e3a8a,
            hatType: "glasses",
            questType: "encourage",
            speechBefore:
              "Tirei 8.5 no simulado e achei que minha vida tinha acabado...",
            speechAfter:
              "Saber que Deus me ama pelo que sou e não pela minha nota tirou uma tonelada das minhas costas!",
            pointsReward: 280,
            xpReward: 40,
          },
          {
            id: "tyo-p3",
            name: "Sra. Sato",
            role: "Coordenadora do Clube de Arte",
            x: -36,
            z: -24,
            skin: "#fde2ce",
            shirt: 0xec4899,
            questType: "supply",
            neededSupplies: 2,
            speechBefore:
              "Precisamos de 2 Sketchbooks de Esperança para os novos alunos da exposição de mangá!",
            speechAfter:
              "Arigatou! Hina vai ficar radiante ao ver o mural completo!",
            pointsReward: 320,
            xpReward: 40,
          },
          {
            id: "tyo-p4",
            name: "Ren",
            role: "Músico de Shibuya",
            x: 33,
            z: -26,
            skin: "#f3c19d",
            shirt: 0x06b6d4,
            questType: "encourage",
            speechBefore:
              "Toco para milhares de pessoas passando apressadas, mas quase ninguém olha nos olhos.",
            speechAfter:
              "Essa canção de esperança sobre Jesus tocou minha alma! Vou aparecer no clube!",
            pointsReward: 260,
            xpReward: 35,
          },
        ],
        collectibles: generateCollectibles("Sketchbook de Esperança"),
        enemies: generateEnemies(
          "Drone da Pressão",
          "Mecha da Solidão Urbana"
        ),
      };

    default:
      return {
        supplyLabel: "Página Traduzida (Macua)",
        bossName: "Golem do Silêncio",
        vehicleName: "Jipe Safari 4x4 Ide",
        people: [
          {
            id: "moz-p1",
            name: "Vovó Lurdes",
            role: "Anciã da Vila Macua",
            x: -30,
            z: 28,
            skin: "#6b3e1e",
            shirt: 0xf59e0b,
            hatType: "curls",
            questType: "supply",
            neededSupplies: 2,
            speechBefore:
              "Meu sonho é ouvir as palavras de Jesus na língua Macua antes de partir! Traga 2 Páginas Traduzidas!",
            speechAfter:
              "Muluku ti mwanene! Deus fala a minha língua! Meu coração está cantando de alegria!",
            pointsReward: 350,
            xpReward: 50,
          },
          {
            id: "moz-p2",
            name: "Tomás",
            role: "Guardião do Poço Leste",
            x: 35,
            z: 15,
            skin: "#7c4722",
            shirt: 0x10b981,
            questType: "rescue",
            speechBefore:
              "As Sombras estão bloqueando o caminho das crianças até o poço comunitário! Ajude-nos!",
            speechAfter:
              "Caminho livre! Água limpa para o corpo e Água da Vida para a alma!",
            pointsReward: 330,
            xpReward: 45,
          },
          {
            id: "moz-p3",
            name: "Pr. Joaquim",
            role: "Tradutor Nacional",
            x: -36,
            z: -24,
            skin: "#5c3417",
            shirt: 0x8b5cf6,
            hatType: "glasses",
            questType: "encourage",
            speechBefore:
              "Traduzir cada capítulo dá muito trabalho, mas ver os jovens lendo compensa tudo!",
            speechAfter:
              "Obrigado por interceder pela nossa equipe de tradução! Juntos alcançaremos toda tribo!",
            pointsReward: 280,
            xpReward: 40,
          },
          {
            id: "moz-p4",
            name: "Amina (12a)",
            role: "Líder do Coral Infantil",
            x: 33,
            z: -26,
            skin: "#7c4722",
            shirt: 0xec4899,
            hatType: "curls",
            questType: "encourage",
            speechBefore:
              "Estamos ensaiando um louvor novo debaixo do grande Baobá com o Samora!",
            speechAfter:
              "Venha cantar com a gente! Toda a vila vai ouvir as boas novas hoje!",
            pointsReward: 260,
            xpReward: 35,
          },
        ],
        collectibles: generateCollectibles("Página Traduzida (Macua)"),
        enemies: generateEnemies("Sombra da Barreira", "Titã da Divisão"),
      };
  }
}
