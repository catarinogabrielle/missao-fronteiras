import { BiomeId } from "@/types/game";
import { resolveMissionBiome } from "./assets";
import { GtaVehicleKind } from "./character3d";

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

export interface RadioTowerMission {
  id: string;
  name: string;
  district: string;
  x: number;
  z: number;
  broadcastMessage: string;
  pointsReward: number;
  xpReward: number;
}

export interface CheckpointRaceConfig {
  id: string;
  title: string;
  description: string;
  startX: number;
  startZ: number;
  timeLimitSeconds: number;
  pointsReward: number;
  xpReward: number;
  checkpoints: { x: number; z: number }[];
}

export interface VehicleSpawnConfig {
  id: string;
  kind: GtaVehicleKind;
  name: string;
  color: number;
  x: number;
  z: number;
  rotY: number;
  topSpeed: number;
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
  storeSigns: string[];
  people: StreetPersonQuest[];
  radioTowers: RadioTowerMission[];
  race: CheckpointRaceConfig;
  vehicles: VehicleSpawnConfig[];
  collectibles: WorldCollectibleSpawn[];
  enemies: EnemySpawn[];
}

function generateCollectibles(supplyLabel: string): WorldCollectibleSpawn[] {
  const scrolls: [number, number][] = [
    [-46, 54],
    [46, 54],
    [-46, 0],
    [46, -18],
    [-46, -54],
    [46, -54],
  ];
  const supplies: [number, number][] = [
    [-22, 54],
    [24, 54],
    [-46, 34],
    [46, 34],
    [-24, 18],
    [24, 18],
    [-26, -18],
    [26, -18],
  ];
  const gems: [number, number][] = [
    [-8, 58],
    [8, 58],
    [0, 38],
    [-46, 18],
    [46, 18],
    [-16, 0],
    [16, 0],
    [0, -18],
    [-46, -34],
    [46, -34],
    [-22, -54],
    [22, -54],
  ];
  const hearts: [number, number][] = [
    [-14, 20],
    [14, 20],
    [-34, -18],
    [34, -18],
    [-14, -50],
    [14, -50],
  ];

  const list: WorldCollectibleSpawn[] = [];
  scrolls.forEach(([x, z], i) =>
    list.push({
      id: `scr-${i}`,
      kind: "scroll",
      label: "Pergaminho da Palavra",
      x,
      z,
      points: 200,
    })
  );
  supplies.forEach(([x, z], i) =>
    list.push({
      id: `sup-${i}`,
      kind: "supply",
      label: supplyLabel,
      x,
      z,
      points: 130,
    })
  );
  gems.forEach(([x, z], i) =>
    list.push({
      id: `gem-${i}`,
      kind: "gem",
      label: "Cristal de Sabedoria",
      x,
      z,
      points: 75,
    })
  );
  hearts.forEach(([x, z], i) =>
    list.push({
      id: `hrt-${i}`,
      kind: "heart",
      label: "Orbe de Restauração",
      x,
      z,
      points: 60,
    })
  );
  return list;
}

function generateEnemies(
  minionName: string,
  bossName: string
): EnemySpawn[] {
  const coords: [number, number][] = [
    // East Rescue Zone 1 (around 46, 18)
    [43, 21],
    [49, 15],
    // North-West Rescue Zone 2 (around -46, -20)
    [-43, -17],
    [-49, -23],
    // Street Patrols across the districts
    [-46, 40],
    [46, 40],
    [-30, 18],
    [30, -18],
    [-46, -42],
    [46, -42],
    [-18, -54],
    [18, -54],
    [-8, -36],
    [8, -36],
  ];

  const enemies: EnemySpawn[] = coords.map(([x, z], idx) => ({
    id: `enemy-${idx}`,
    name: minionName,
    x,
    z,
    hp: 95,
    points: 160,
  }));

  enemies.push({
    id: "boss-main",
    name: bossName,
    x: 0,
    z: -42,
    hp: 420,
    isBoss: true,
    points: 750,
  });

  return enemies;
}

function buildRegionalVehicles(missionId: string): VehicleSpawnConfig[] {
  if (missionId === "amazonia") {
    return [
      {
        id: "veh-suv",
        kind: "suv",
        name: "SUV Anfíbio 4x4 Ide",
        color: 0x10b981,
        x: 7.5,
        z: 65,
        rotY: Math.PI,
        topSpeed: 21,
      },
      {
        id: "veh-sports",
        kind: "sports",
        name: "Buggy GT Ribeirinho",
        color: 0xf59e0b,
        x: 13.5,
        z: 50,
        rotY: Math.PI * 0.5,
        topSpeed: 26,
      },
      {
        id: "veh-moto",
        kind: "moto",
        name: "Moto Trilha Floresta",
        color: 0x38bdf8,
        x: -12,
        z: 5,
        rotY: Math.PI,
        topSpeed: 24,
      },
    ];
  }
  if (missionId === "toquio") {
    return [
      {
        id: "veh-sports",
        kind: "sports",
        name: "Cyber GT Shibuya",
        color: 0x06b6d4,
        x: 7.5,
        z: 65,
        rotY: Math.PI,
        topSpeed: 27,
      },
      {
        id: "veh-moto",
        kind: "moto",
        name: "Moto Neon Akihabara",
        color: 0xf43f5e,
        x: 13.5,
        z: 50,
        rotY: Math.PI * 0.5,
        topSpeed: 25.5,
      },
      {
        id: "veh-suv",
        kind: "suv",
        name: "SUV Blindado Ide",
        color: 0x6366f1,
        x: -12,
        z: 5,
        rotY: Math.PI,
        topSpeed: 21.5,
      },
    ];
  }
  if (missionId === "janela1040") {
    return [
      {
        id: "veh-suv",
        kind: "suv",
        name: "SUV Deserto 4x4 Ide",
        color: 0xf59e0b,
        x: 7.5,
        z: 65,
        rotY: Math.PI,
        topSpeed: 21.5,
      },
      {
        id: "veh-sports",
        kind: "sports",
        name: "Coupe GT Oásis",
        color: 0xe11d48,
        x: 13.5,
        z: 50,
        rotY: Math.PI * 0.5,
        topSpeed: 26.5,
      },
      {
        id: "veh-moto",
        kind: "moto",
        name: "Moto Rápida Bazar",
        color: 0x10b981,
        x: -12,
        z: 5,
        rotY: Math.PI,
        topSpeed: 24.5,
      },
    ];
  }
  if (missionId === "sertao") {
    return [
      {
        id: "veh-suv",
        kind: "suv",
        name: "Picape Sertaneja 4x4",
        color: 0xd97706,
        x: 7.5,
        z: 65,
        rotY: Math.PI,
        topSpeed: 22,
      },
      {
        id: "veh-sports",
        kind: "sports",
        name: "Buggy Caatinga Rally",
        color: 0xea580c,
        x: 13.5,
        z: 50,
        rotY: Math.PI * 0.5,
        topSpeed: 26,
      },
      {
        id: "veh-moto",
        kind: "moto",
        name: "Moto Trail Sertão",
        color: 0x16a34a,
        x: -12,
        z: 5,
        rotY: Math.PI,
        topSpeed: 25,
      },
    ];
  }
  if (missionId === "andes") {
    return [
      {
        id: "veh-suv",
        kind: "suv",
        name: "Van Expedicionária 4x4",
        color: 0x0284c7,
        x: 7.5,
        z: 65,
        rotY: Math.PI,
        topSpeed: 21,
      },
      {
        id: "veh-sports",
        kind: "sports",
        name: "Jipe Andino GT",
        color: 0xef4444,
        x: 13.5,
        z: 50,
        rotY: Math.PI * 0.5,
        topSpeed: 26,
      },
      {
        id: "veh-moto",
        kind: "moto",
        name: "Moto Trial Montanha",
        color: 0xf59e0b,
        x: -12,
        z: 5,
        rotY: Math.PI,
        topSpeed: 24.5,
      },
    ];
  }
  if (missionId === "himalaia") {
    return [
      {
        id: "veh-suv",
        kind: "suv",
        name: "Snow Cruiser 4x4",
        color: 0x38bdf8,
        x: 7.5,
        z: 65,
        rotY: Math.PI,
        topSpeed: 21,
      },
      {
        id: "veh-sports",
        kind: "sports",
        name: "Alpine Rescue GT",
        color: 0x0284c7,
        x: 13.5,
        z: 50,
        rotY: Math.PI * 0.5,
        topSpeed: 26,
      },
      {
        id: "veh-moto",
        kind: "moto",
        name: "Moto Trial Neve",
        color: 0x6366f1,
        x: -12,
        z: 5,
        rotY: Math.PI,
        topSpeed: 25,
      },
    ];
  }
  if (missionId === "europa") {
    return [
      {
        id: "veh-sports",
        kind: "sports",
        name: "E-Runner Gran Turismo",
        color: 0x8b5cf6,
        x: 7.5,
        z: 65,
        rotY: Math.PI,
        topSpeed: 27.5,
      },
      {
        id: "veh-suv",
        kind: "suv",
        name: "Van Humanitária 4x4",
        color: 0x06b6d4,
        x: 13.5,
        z: 50,
        rotY: Math.PI * 0.5,
        topSpeed: 22,
      },
      {
        id: "veh-moto",
        kind: "moto",
        name: "Scooter Elétrica Urbana",
        color: 0x10b981,
        x: -12,
        z: 5,
        rotY: Math.PI,
        topSpeed: 24.5,
      },
    ];
  }
  return [
    {
      id: "veh-suv",
      kind: "suv",
      name: "SUV Safari 4x4 Ide",
      color: 0x8b5cf6,
      x: 7.5,
      z: 65,
      rotY: Math.PI,
      topSpeed: 21.5,
    },
    {
      id: "veh-sports",
      kind: "sports",
      name: "Rally GT Savana",
      color: 0xf59e0b,
      x: 13.5,
      z: 50,
      rotY: Math.PI * 0.5,
      topSpeed: 26,
    },
    {
      id: "veh-moto",
      kind: "moto",
      name: "Moto Expressa Vila",
      color: 0x10b981,
      x: -12,
      z: 5,
      rotY: Math.PI,
      topSpeed: 24.5,
    },
  ];
}

function buildDefaultRace(title: string, description: string): CheckpointRaceConfig {
  return {
    id: "gta-express-race",
    title,
    description,
    startX: 18,
    startZ: 54,
    timeLimitSeconds: 55,
    pointsReward: 650,
    xpReward: 85,
    checkpoints: [
      { x: 46, z: 54 },
      { x: 46, z: 0 },
      { x: 46, z: -54 },
      { x: -46, z: -54 },
      { x: -46, z: 18 },
    ],
  };
}

export function getOpenWorldConfig(
  missionId: string,
  biomeId?: BiomeId
): OpenWorldConfig {
  const resolvedBiome = resolveMissionBiome(missionId, biomeId);
  switch (resolvedBiome) {
    case "amazonia":
      return {
        supplyLabel: "Kit Médico Ribeirinho",
        bossName: "Titã do Esquecimento",
        vehicleName: "SUV Anfíbio 4x4 Ide",
        storeSigns: [
          "POSTO DE SAÚDE",
          "ESCOLA RIBEIRINHA",
          "COOPERATIVA AÇAÍ",
          "RÁDIO FLORESTA",
          "PORTO ESPERANÇA",
          "OFICINA BARCOS",
        ],
        people: [
          {
            id: "amz-p1",
            name: "Dona Raimunda",
            role: "Moradora das Palafitas Sul",
            x: -32,
            z: 50,
            skin: "#b87a4b",
            shirt: 0xd97706,
            questType: "supply",
            neededSupplies: 2,
            speechBefore:
              "A cheia molhou tudo em casa! Você consegue recolher 2 Kits Médicos pelo mapa para nossa família?",
            speechAfter:
              "Deus abençoe vocês! Fazia tempo que ninguém vinha até nossa palafita cuidar da gente!",
            pointsReward: 320,
            xpReward: 45,
          },
          {
            id: "amz-p2",
            name: "Seu Pedro",
            role: "Pescador do Cais Leste",
            x: 46,
            z: 18,
            skin: "#9c6234",
            shirt: 0x0284c7,
            hatType: "straw",
            questType: "rescue",
            speechBefore:
              "Socorro! As Sombras do Desânimo cercaram meu barco aqui no cais leste! Derrote-as!",
            speechAfter:
              "Que coragem! A luz de Cristo brilhou forte aqui no cais hoje!",
            pointsReward: 360,
            xpReward: 50,
          },
          {
            id: "amz-p3",
            name: "Dr. Henrique",
            role: "Médico do Barco-Hospital",
            x: -46,
            z: -20,
            skin: "#e5a975",
            shirt: 0x0ea5e9,
            hatType: "glasses",
            questType: "rescue",
            speechBefore:
              "As Sombras bloquearam a ponte norte com os remédios das crianças! Limpe o cruzamento!",
            speechAfter:
              "Caminho liberado! Agora o atendimento médico e a Palavra chegarão a todas as famílias!",
            pointsReward: 360,
            xpReward: 50,
          },
          {
            id: "amz-p4",
            name: "Profª. Ana",
            role: "Escolinha da Comunidade",
            x: 32,
            z: -18,
            skin: "#e5a975",
            shirt: 0x10b981,
            questType: "supply",
            neededSupplies: 2,
            speechBefore:
              "Estamos montando o kit de primeiros socorros da escola! Pode trazer 2 Kits Médicos?",
            speechAfter:
              "Maravilha! As crianças estão seguras e animadas para ouvir as histórias de Jesus!",
            pointsReward: 320,
            xpReward: 45,
          },
          {
            id: "amz-p5",
            name: "Mateus (10a)",
            role: "Amigo do Cauã",
            x: 11,
            z: -8,
            skin: "#c68652",
            shirt: 0x14b8a6,
            hatType: "cap",
            questType: "encourage",
            speechBefore:
              "Ei! O Cauã está bem ali na Praça da Fonte esperando você! Já chamamos toda a turma!",
            speechAfter:
              "Demais! Hoje à noite toda a vila vai se reunir na roda de histórias!",
            pointsReward: 240,
            xpReward: 35,
          },
          {
            id: "amz-p6",
            name: "Vovô Bento",
            role: "Contador de Histórias",
            x: -30,
            z: 18,
            skin: "#8c522b",
            shirt: 0x16a34a,
            hatType: "straw",
            questType: "encourage",
            speechBefore:
              "Muitos barcos passam direto pelo nosso rio, mas vocês pararam para nos abraçar.",
            speechAfter:
              "Sua oração aqueceu meu coração! Que o Criador multiplique a fé nessa juventude!",
            pointsReward: 260,
            xpReward: 35,
          },
        ],
        radioTowers: [
          {
            id: "amz-tw1",
            name: "Antena Ribeirinha Sul",
            district: "Porto das Palafitas",
            x: -60,
            z: 52,
            broadcastMessage: "Rádio Boas Novas sintonizada para as comunidades do Rio Sul!",
            pointsReward: 260,
            xpReward: 35,
          },
          {
            id: "amz-tw2",
            name: "Antena do Igarapé Leste",
            district: "Cais dos Pescadores",
            x: 62,
            z: 0,
            broadcastMessage: "Louvores e avisos do Barco-Hospital transmitidos no Igarapé!",
            pointsReward: 260,
            xpReward: 35,
          },
          {
            id: "amz-tw3",
            name: "Antena Floresta Norte",
            district: "Vila Alta",
            x: -60,
            z: -52,
            broadcastMessage: "Cobertura 100%! Todas as aldeias conectadas à mensagem de esperança!",
            pointsReward: 280,
            xpReward: 40,
          },
        ],
        race: buildDefaultRace(
          "Rota Expressa: Resgate Ribeirinho",
          "Pegue um veículo [V], use o Turbo [Shift] e atravesse os 5 Checkpoints Dourados levando medicamentos urgentes antes do tempo acabar!"
        ),
        vehicles: buildRegionalVehicles("amazonia"),
        collectibles: generateCollectibles("Kit Médico Ribeirinho"),
        enemies: generateEnemies("Sombra do Desânimo", "Titã do Esquecimento"),
      };

    case "janela1040":
      return {
        supplyLabel: "Pacote de Apoio & Esporte",
        bossName: "Guardião do Orgulho",
        vehicleName: "SUV Deserto 4x4 Ide",
        storeSigns: [
          "CAFÉ AL-NOOR",
          "BAZAR CENTRAL",
          "ARENA FUTEBOL",
          "TECH HUB JOVEM",
          "PADARIA ARTESANAL",
          "BIBLIOTECA OÁSIS",
        ],
        people: [
          {
            id: "j10-p1",
            name: "Sr. Karim",
            role: "Mestre do Grande Bazar",
            x: -32,
            z: 50,
            skin: "#d49a6a",
            shirt: 0xb45309,
            questType: "encourage",
            speechBefore:
              "Bem-vindo ao Bazar! Poucos jovens estrangeiros param para tomar um chá de hortelã e ouvir os mais velhos.",
            speechAfter:
              "Sua educação e paz honram a Deus. As portas do bairro estão abertas para você!",
            pointsReward: 260,
            xpReward: 35,
          },
          {
            id: "j10-p2",
            name: "Zayd",
            role: "Capitão do Futebol de Rua",
            x: 46,
            z: 18,
            skin: "#c68652",
            shirt: 0xe11d48,
            questType: "rescue",
            speechBefore:
              "As Sombras da Raiva estão cercando nossa quadra leste! Ajude a limpar a rua!",
            speechAfter:
              "Impressionante! Você defendeu nossa turma com coragem e espírito de paz!",
            pointsReward: 360,
            xpReward: 50,
          },
          {
            id: "j10-p3",
            name: "Amira",
            role: "Líder do Clube de Robótica",
            x: -32,
            z: 18,
            skin: "#e5a975",
            shirt: 0x7c3aed,
            hatType: "glasses",
            questType: "supply",
            neededSupplies: 2,
            speechBefore:
              "Estamos abrindo a oficina gratuita para jovens! Consegue trazer 2 Pacotes de Apoio pela cidade?",
            speechAfter:
              "Muito obrigada! Dezenas de adolescentes terão um lugar seguro para aprender!",
            pointsReward: 330,
            xpReward: 45,
          },
          {
            id: "j10-p4",
            name: "Youssef",
            role: "Artesão do Distrito Norte",
            x: -46,
            z: -20,
            skin: "#b87a4b",
            shirt: 0x0284c7,
            questType: "rescue",
            speechBefore:
              "As Sombras da Intolerância bloquearam minha oficina! Preciso de ajuda!",
            speechAfter:
              "Obrigado, amigo! Seu testemunho silencioso vale mais do que mil discursos!",
            pointsReward: 360,
            xpReward: 50,
          },
          {
            id: "j10-p5",
            name: "Layla",
            role: "Voluntária Social",
            x: 32,
            z: -18,
            skin: "#d49a6a",
            shirt: 0x10b981,
            questType: "supply",
            neededSupplies: 2,
            speechBefore:
              "Faltam 2 Pacotes de Apoio para as famílias recém-chegadas ao bairro norte!",
            speechAfter:
              "Que bênção! Esse amor prático está tocando toda a vizinhança!",
            pointsReward: 330,
            xpReward: 45,
          },
          {
            id: "j10-p6",
            name: "Omar",
            role: "Buscador Secreto",
            x: 11,
            z: -8,
            skin: "#b87a4b",
            shirt: 0x0ea5e9,
            questType: "encourage",
            speechBefore:
              "Li os ensinamentos de Jesus escondido no celular... Ele realmente perdoa e dá paz?",
            speechAfter:
              "Obrigado por orar comigo perto da fonte! Sinto uma paz que nunca senti antes!",
            pointsReward: 280,
            xpReward: 40,
          },
        ],
        radioTowers: [
          {
            id: "j10-tw1",
            name: "Transmissor Oásis Sul",
            district: "Portão do Bazar",
            x: -60,
            z: 52,
            broadcastMessage: "Podcast de Esperança no idioma local transmitido para celulares do Sul!",
            pointsReward: 260,
            xpReward: 35,
          },
          {
            id: "j10-tw2",
            name: "Transmissor Quadra Leste",
            district: "Avenida das Palmeiras",
            x: 62,
            z: 0,
            broadcastMessage: "Sinal de Paz ativo! Jovens baixando o Evangelho em áudio!",
            pointsReward: 260,
            xpReward: 35,
          },
          {
            id: "j10-tw3",
            name: "Transmissor Medina Norte",
            district: "Cidade Antiga",
            x: -60,
            z: -52,
            broadcastMessage: "Rede completa! Toda a cidade conectada às transmissões de fé!",
            pointsReward: 280,
            xpReward: 40,
          },
        ],
        race: buildDefaultRace(
          "Entrega Expressa pelo Oásis",
          "Acelere pelas avenidas da cidade e passe pelos 5 Checkpoints Dourados entregando bolas e materiais para o torneio da juventude!"
        ),
        vehicles: buildRegionalVehicles("janela1040"),
        collectibles: generateCollectibles("Pacote de Apoio & Esporte"),
        enemies: generateEnemies("Sombra da Intolerância", "Guardião do Orgulho"),
      };

    case "toquio":
      return {
        supplyLabel: "Sketchbook de Esperança",
        bossName: "Mecha da Solidão Urbana",
        vehicleName: "Cyber GT Shibuya",
        storeSigns: [
          "AKIHABARA ARCADE",
          "MANGÁ STUDIO",
          "RAMEN EXPRESS",
          "SHIBUYA MUSIC",
          "CYBER CAFÉ IDE",
          "KONBINI 24H",
        ],
        people: [
          {
            id: "tyo-p1",
            name: "Kenji",
            role: "Pro-Gamer de Akihabara",
            x: 46,
            z: 18,
            skin: "#fde2ce",
            shirt: 0x2563eb,
            hatType: "headphones",
            questType: "rescue",
            speechBefore:
              "Os Drones da Solidão cercaram o fliperama leste! Me ajude a destruí-los!",
            speechAfter:
              "Incrível! Fazia meses que ninguém parava na rua para saber se eu estava bem!",
            pointsReward: 360,
            xpReward: 50,
          },
          {
            id: "tyo-p2",
            name: "Yuki",
            role: "Estudante do Cursinho",
            x: -32,
            z: 50,
            skin: "#fad0b1",
            shirt: 0x1e3a8a,
            hatType: "glasses",
            questType: "encourage",
            speechBefore:
              "Tirei 8.5 no simulado nacional e senti que não tenho valor nenhum...",
            speechAfter:
              "Ouvir que Deus me ama pelo que sou — e não pelo meu ranking — tirou um peso enorme do meu peito!",
            pointsReward: 280,
            xpReward: 40,
          },
          {
            id: "tyo-p3",
            name: "Sra. Sato",
            role: "Clube de Mangá & Arte",
            x: -32,
            z: 18,
            skin: "#fde2ce",
            shirt: 0xec4899,
            questType: "supply",
            neededSupplies: 2,
            speechBefore:
              "Precisamos de 2 Sketchbooks de Esperança para a exposição dos adolescentes!",
            speechAfter:
              "Arigatou! Hina vai ficar emocionada ao ver os murais prontos!",
            pointsReward: 330,
            xpReward: 45,
          },
          {
            id: "tyo-p4",
            name: "Daichi",
            role: "Programador Exausto",
            x: -46,
            z: -20,
            skin: "#f3c19d",
            shirt: 0x0f172a,
            hatType: "glasses",
            questType: "rescue",
            speechBefore:
              "Os Drones da Pressão me encurralaram na estação norte! Socorro!",
            speechAfter:
              "Obrigado! Saber que em Cristo há descanso real mudou minha noite!",
            pointsReward: 360,
            xpReward: 50,
          },
          {
            id: "tyo-p5",
            name: "Mei",
            role: "Barista do Café Acolhedor",
            x: 32,
            z: -18,
            skin: "#fde2ce",
            shirt: 0x14b8a6,
            questType: "supply",
            neededSupplies: 2,
            speechBefore:
              "Consegue trazer 2 Sketchbooks ilustrados para deixarmos nas mesas dos jovens solitários?",
            speechAfter:
              "Perfeito! Cada mesa agora tem uma mensagem viva de esperança!",
            pointsReward: 330,
            xpReward: 45,
          },
          {
            id: "tyo-p6",
            name: "Ren",
            role: "Violinista de Shibuya",
            x: 11,
            z: -8,
            skin: "#f3c19d",
            shirt: 0x06b6d4,
            hatType: "headphones",
            questType: "encourage",
            speechBefore:
              "Toco para milhares passando apressados no cruzamento, mas quase ninguém sorri.",
            speechAfter:
              "Essa melodia de esperança sobre Jesus renovou minha alegria! Nos vemos no clube!",
            pointsReward: 270,
            xpReward: 35,
          },
        ],
        radioTowers: [
          {
            id: "tyo-tw1",
            name: "Painel Neon Shibuya Sul",
            district: "Cruzamento Sul",
            x: -60,
            z: 52,
            broadcastMessage: "Outdoor Digital exibindo versículo de esperança em Tóquio Sul!",
            pointsReward: 260,
            xpReward: 35,
          },
          {
            id: "tyo-tw2",
            name: "Torre Wi-Fi Akihabara",
            district: "Distrito Gamer Leste",
            x: 62,
            z: 0,
            broadcastMessage: "Web-Rádio Lo-Fi Gospel conectada para jovens estudantes!",
            pointsReward: 260,
            xpReward: 35,
          },
          {
            id: "tyo-tw3",
            name: "Antena Shinjuku Norte",
            district: "Arranha-Céus Norte",
            x: -60,
            z: -52,
            broadcastMessage: "Metrópole Iluminada! As 3 torres digitais estão transmitindo vida!",
            pointsReward: 280,
            xpReward: 40,
          },
        ],
        race: buildDefaultRace(
          "Drift Neon: Expresso Shibuya",
          "Suba no Cyber GT ou na Moto Neon [V], ative o Turbo [Shift] e cruze os 5 Checkpoints pelas avenidas iluminadas de Tóquio!"
        ),
        vehicles: buildRegionalVehicles("toquio"),
        collectibles: generateCollectibles("Sketchbook de Esperança"),
        enemies: generateEnemies("Drone da Pressão", "Mecha da Solidão Urbana"),
      };

    case "mocambique":
      return {
        supplyLabel: "Página Traduzida (Macua)",
        bossName: "Titã da Divisão",
        vehicleName: "SUV Safari 4x4 Ide",
        storeSigns: [
          "ESCOLA NAMPULA",
          "CENTRO TRADUÇÃO",
          "POÇO ÁGUA VIVA",
          "MERCADO CAPULANA",
          "CLÍNICA ESPERANÇA",
          "RÁDIO COMUNIDADE",
        ],
        people: [
          {
            id: "moz-p1",
            name: "Vovó Lurdes",
            role: "Anciã da Vila Sul",
            x: -32,
            z: 50,
            skin: "#6b3e1e",
            shirt: 0xf59e0b,
            hatType: "curls",
            questType: "supply",
            neededSupplies: 2,
            speechBefore:
              "Meu sonho é ler as palavras de Jesus na língua Macua! Traga 2 Páginas Traduzidas!",
            speechAfter:
              "Muluku ti mwanene! Deus fala a minha língua! Meu coração está em festa!",
            pointsReward: 350,
            xpReward: 50,
          },
          {
            id: "moz-p2",
            name: "Tomás",
            role: "Guardião do Poço Leste",
            x: 46,
            z: 18,
            skin: "#7c4722",
            shirt: 0x10b981,
            questType: "rescue",
            speechBefore:
              "As Sombras estão bloqueando o acesso das famílias ao poço leste! Ajude-nos!",
            speechAfter:
              "Caminho livre! Água limpa para o corpo e Água da Vida para o espírito!",
            pointsReward: 360,
            xpReward: 50,
          },
          {
            id: "moz-p3",
            name: "Pr. Joaquim",
            role: "Tradutor Bíblico Local",
            x: -32,
            z: 18,
            skin: "#5c3417",
            shirt: 0x8b5cf6,
            hatType: "glasses",
            questType: "encourage",
            speechBefore:
              "Revisar cada versículo em Macua exige muita dedicação, mas o fruto é eterno!",
            speechAfter:
              "Obrigado por orar conosco! A Palavra está ganhando raízes profundas aqui!",
            pointsReward: 270,
            xpReward: 40,
          },
          {
            id: "moz-p4",
            name: "Enfermeira Célia",
            role: "Clínica do Bairro Norte",
            x: -46,
            z: -20,
            skin: "#7c4722",
            shirt: 0x06b6d4,
            questType: "rescue",
            speechBefore:
              "As Sombras cercaram a clínica comunitária norte! Afaste-as com a Luz!",
            speechAfter:
              "Glória a Deus! Os pacientes e crianças já podem entrar em paz!",
            pointsReward: 360,
            xpReward: 50,
          },
          {
            id: "moz-p5",
            name: "Prof. Armando",
            role: "Alfabetização Jovem",
            x: 32,
            z: -18,
            skin: "#6b3e1e",
            shirt: 0xeab308,
            hatType: "cap",
            questType: "supply",
            neededSupplies: 2,
            speechBefore:
              "Faltam 2 Páginas Traduzidas para a aula de leitura bíblica das crianças!",
            speechAfter:
              "Que alegria! Hoje 30 alunos vão ler João 3:16 no próprio idioma pela primeira vez!",
            pointsReward: 340,
            xpReward: 45,
          },
          {
            id: "moz-p6",
            name: "Amina (12a)",
            role: "Líder do Coral Infantil",
            x: 11,
            z: -8,
            skin: "#7c4722",
            shirt: 0xec4899,
            hatType: "curls",
            questType: "encourage",
            speechBefore:
              "Estamos ensaiando um cântico novo perto da fonte com o Samora!",
            speechAfter:
              "Venha celebrar com a gente! Toda Nampula vai ouvir as boas novas!",
            pointsReward: 260,
            xpReward: 35,
          },
        ],
        radioTowers: [
          {
            id: "moz-tw1",
            name: "Rádio Comunitária Sul",
            district: "Estrada Vermelha",
            x: -60,
            z: 52,
            broadcastMessage: "Evangelho narrado em Macua transmitido para as vilas do Sul!",
            pointsReward: 260,
            xpReward: 35,
          },
          {
            id: "moz-tw2",
            name: "Antena do Vale Leste",
            district: "Poço Comunitário",
            x: 62,
            z: 0,
            broadcastMessage: "Cânticos do coral jovem ecoando em todas as rádios do Leste!",
            pointsReward: 260,
            xpReward: 35,
          },
          {
            id: "moz-tw3",
            name: "Torre Savana Norte",
            district: "Colina do Baobá",
            x: -60,
            z: -52,
            broadcastMessage: "Sinal 100%! Todas as aldeias de Nampula conectadas à Palavra!",
            pointsReward: 280,
            xpReward: 40,
          },
        ],
        race: buildDefaultRace(
          "Rota Safari: Bíblias nas Vilas",
          "Pilote o SUV Safari ou o Rally GT [V], acione o Turbo [Shift] e cruze os 5 Checkpoints levando Bíblias recém-impressas!"
        ),
        vehicles: buildRegionalVehicles("mocambique"),
        collectibles: generateCollectibles("Página Traduzida (Macua)"),
        enemies: generateEnemies("Sombra da Barreira", "Titã da Divisão"),
      };

    case "sertao":
      return {
        supplyLabel: "Cântaro de Água Viva",
        bossName: "Colosso da Seca Espiritual",
        vehicleName: "Picape Sertaneja 4x4",
        storeSigns: [
          "FEIRA DO CORDEIRO",
          "POÇO DA ESPERANÇA",
          "OFICINA RURAL",
          "CASA DE FARINHA",
          "CORDEL & LUZ",
          "RÁDIO ASA BRANCA",
        ],
        people: [
          {
            id: "ser-p1",
            name: "Seu Tião",
            role: "Vaqueiro do Sertão",
            x: -32,
            z: 50,
            skin: "#a16207",
            shirt: 0xd97706,
            hatType: "straw",
            questType: "supply",
            neededSupplies: 2,
            speechBefore: "A seca foi braba esse ano, traga 2 Cântaros de Água Viva para o rebanho!",
            speechAfter: "Ô glória! A chuva de bênção chegou no sertão profundo!",
            pointsReward: 350,
            xpReward: 50,
          },
          {
            id: "ser-p2",
            name: "Dona Maria",
            role: "Artesã de Barro",
            x: 46,
            z: 18,
            skin: "#854d0e",
            shirt: 0xe11d48,
            questType: "rescue",
            speechBefore: "As Sombras do Desalento estão assustando as rendeiras na praça!",
            speechAfter: "Deus abençoe suas mãos! A alegria voltou à feira!",
            pointsReward: 360,
            xpReward: 50,
          },
          {
            id: "ser-p3",
            name: "Mateus (Missionário)",
            role: "Educador Social",
            x: -32,
            z: 18,
            skin: "#ca8a04",
            shirt: 0x16a34a,
            hatType: "cap",
            questType: "encourage",
            speechBefore: "Estamos instalando filtros de água nas casas com o Mateus!",
            speechAfter: "Água potável e Evangelho de amor caminhando juntos!",
            pointsReward: 270,
            xpReward: 40,
          },
          {
            id: "ser-p4",
            name: "Enfermeira Dalva",
            role: "Posto de Saúde Rural",
            x: -46,
            z: -20,
            skin: "#a16207",
            shirt: 0x0284c7,
            questType: "rescue",
            speechBefore: "Afaste as sombras da entrada do posto de saúde!",
            speechAfter: "Caminho livre! Nossas crianças já podem ser atendidas!",
            pointsReward: 360,
            xpReward: 50,
          },
          {
            id: "ser-p5",
            name: "Seu Zé da Cisterna",
            role: "Pioneiro Comunitário",
            x: 32,
            z: -18,
            skin: "#78350f",
            shirt: 0xeab308,
            hatType: "straw",
            questType: "supply",
            neededSupplies: 2,
            speechBefore: "Precisamos de 2 Cântaros de Água para inaugurar a nova cisterna escolar!",
            speechAfter: "Cisterna cheia e corações cheios de esperança!",
            pointsReward: 340,
            xpReward: 45,
          },
          {
            id: "ser-p6",
            name: "Ritinha (10a)",
            role: "Contadora de Cordel",
            x: 11,
            z: -8,
            skin: "#a16207",
            shirt: 0xf59e0b,
            questType: "encourage",
            speechBefore: "Fiz um cordel rimado contando sobre Jesus no sertão!",
            speechAfter: "Eita coisa boa! Vamos recitar para toda a vila ouvir!",
            pointsReward: 260,
            xpReward: 35,
          },
        ],
        radioTowers: [
          {
            id: "ser-tw1",
            name: "Torre Alto do Mandacaru",
            district: "Cisterna Central",
            x: -60,
            z: 52,
            broadcastMessage: "Voz do Sertão transmitindo esperança para os vales da Caatinga!",
            pointsReward: 260,
            xpReward: 35,
          },
          {
            id: "ser-tw2",
            name: "Antena Vale do São Francisco",
            district: "Povoado das Rendas",
            x: 62,
            z: 0,
            broadcastMessage: "Louvores com sanfona e violão ecoando no sertão!",
            pointsReward: 260,
            xpReward: 35,
          },
          {
            id: "ser-tw3",
            name: "Torre Asa Branca Norte",
            district: "Colina da Caatinga",
            x: -60,
            z: -52,
            broadcastMessage: "Sinal 100%! Toda a comunidade conectada à Água da Vida!",
            pointsReward: 280,
            xpReward: 40,
          },
        ],
        race: buildDefaultRace(
          "Circuito da Caatinga: Rota da Água Viva",
          "Acelere a Picape 4x4 ou a Moto Trail [V], use o Turbo [Shift] e leve os Cântaros pelos 5 Checkpoints antes que o sol se ponha!"
        ),
        vehicles: buildRegionalVehicles("sertao"),
        collectibles: generateCollectibles("Cântaro de Água Viva"),
        enemies: generateEnemies("Sombra da Seca", "Colosso da Seca Espiritual"),
      };

    case "andes":
      return {
        supplyLabel: "Manta & Alimento Andino",
        bossName: "Espírito das Neves Solitárias",
        vehicleName: "Van Expedicionária 4x4",
        storeSigns: [
          "MERCADO PISAC",
          "TECELAGEM ANDINA",
          "CLÍNICA DAS ALTURAS",
          "REFÚGIO DA PAZ",
          "ESCOLA QUECHUA",
          "RÁDIO CÓNDOR",
        ],
        people: [
          {
            id: "and-p1",
            name: "Abuela Rosa",
            role: "Mestra Tecelã Quechua",
            x: -32,
            z: 50,
            skin: "#9a3412",
            shirt: 0xef4444,
            hatType: "straw",
            questType: "supply",
            neededSupplies: 2,
            speechBefore: "O vento frio do altiplano está forte, traga 2 Mantas para os idosos!",
            speechAfter: "Sulpayki! Deus te abençoe! Agora estamos aquecidos e felizes!",
            pointsReward: 350,
            xpReward: 50,
          },
          {
            id: "and-p2",
            name: "Mateo",
            role: "Pastor de Alpacas",
            x: 46,
            z: 18,
            skin: "#b45309",
            shirt: 0x0284c7,
            questType: "rescue",
            speechBefore: "Sombras bloquearam a subida da colina das alpacas!",
            speechAfter: "O rebanho está a salvo nos pastos altos! Graças a Deus!",
            pointsReward: 360,
            xpReward: 50,
          },
          {
            id: "and-p3",
            name: "Yara (Enfermeira)",
            role: "Resgatista Andina",
            x: -32,
            z: 18,
            skin: "#c2410c",
            shirt: 0x10b981,
            questType: "encourage",
            speechBefore: "Vamos levar medicamentos para as cabanas a 4.000m de altitude!",
            speechAfter: "Amor em ação! Nenhum povoado das montanhas será esquecido!",
            pointsReward: 270,
            xpReward: 40,
          },
          {
            id: "and-p4",
            name: "Dr. Carlos",
            role: "Posto Médico da Montanha",
            x: -46,
            z: -20,
            skin: "#9a3412",
            shirt: 0x6366f1,
            questType: "rescue",
            speechBefore: "Libere o acesso ao posto médico da encosta!",
            speechAfter: "Muito obrigado! As mães e bebês já podem ser vacinados!",
            pointsReward: 360,
            xpReward: 50,
          },
          {
            id: "and-p5",
            name: "Prof. Inti",
            role: "Escola Quechua",
            x: 32,
            z: -18,
            skin: "#b45309",
            shirt: 0xf59e0b,
            hatType: "cap",
            questType: "supply",
            neededSupplies: 2,
            speechBefore: "Faltam 2 provisões de merenda para as crianças da escola andina!",
            speechAfter: "As crianças agradecem! Que festa bonita na sala de aula!",
            pointsReward: 340,
            xpReward: 45,
          },
          {
            id: "and-p6",
            name: "Nina (11a)",
            role: "Tocadora de Flauta Pan",
            x: 11,
            z: -8,
            skin: "#c2410c",
            shirt: 0xec4899,
            questType: "encourage",
            speechBefore: "Aprendi uma canção de gratidão na flauta tradicional!",
            speechAfter: "O som ecoou por toda a cordilheira! Glória a Deus!",
            pointsReward: 260,
            xpReward: 35,
          },
        ],
        radioTowers: [
          {
            id: "and-tw1",
            name: "Torre Altiplano Sul",
            district: "Terraços de Cultivo",
            x: -60,
            z: 52,
            broadcastMessage: "Sermão da Montanha em Quéchua transmitido pelos Andes!",
            pointsReward: 260,
            xpReward: 35,
          },
          {
            id: "and-tw2",
            name: "Antena Vale Sagrado",
            district: "Vila dos Tecelões",
            x: 62,
            z: 0,
            broadcastMessage: "Música andina de louvor alcançando os vales profundos!",
            pointsReward: 260,
            xpReward: 35,
          },
          {
            id: "and-tw3",
            name: "Torre Pico Nevado",
            district: "Cume da Paz",
            x: -60,
            z: -52,
            broadcastMessage: "Conexão 100%! Toda a cordilheira unida em oração!",
            pointsReward: 280,
            xpReward: 40,
          },
        ],
        race: buildDefaultRace(
          "Rali dos Andes: Trilha Inca Express",
          "Pilote a Van 4x4 ou o Jipe Andino [V], use o Turbo [Shift] e cruze os 5 Checkpoints das montanhas entregando mantas de socorro!"
        ),
        vehicles: buildRegionalVehicles("andes"),
        collectibles: generateCollectibles("Manta & Alimento Andino"),
        enemies: generateEnemies("Sombra do Isolamento", "Espírito das Neves Solitárias"),
      };

    case "himalaia":
      return {
        supplyLabel: "Termo & Provisão do Cume",
        bossName: "Monstro da Geada Eterna",
        vehicleName: "Snow Cruiser 4x4",
        storeSigns: [
          "BAZAR KHUMBU",
          "CHURRASQUEIRA SHERPA",
          "CLÍNICA DO CUME",
          "CASA DO CHÁ DE GENGIBRE",
          "REFÚGIO TIBETANO",
          "RÁDIO EVEREST",
        ],
        people: [
          {
            id: "him-p1",
            name: "Sherpa Pasang",
            role: "Guia Lendário do Cume",
            x: -32,
            z: 50,
            skin: "#9a3412",
            shirt: 0x0284c7,
            hatType: "cap",
            questType: "supply",
            neededSupplies: 2,
            speechBefore: "A nevasca bloqueou os passos altos! Traga 2 Termos de Provisão quente!",
            speechAfter: "Tashi Delek! Você salvou nossa expedição no gelo!",
            pointsReward: 350,
            xpReward: 50,
          },
          {
            id: "him-p2",
            name: "Karma",
            role: "Ancião do Vilarejo Khumbu",
            x: 46,
            z: 18,
            skin: "#b45309",
            shirt: 0xd97706,
            questType: "rescue",
            speechBefore: "Sombras gélidas cercaram as pontes suspensas de oração!",
            speechAfter: "A luz de Cristo aqueceu nosso vale! As pontes estão livres!",
            pointsReward: 360,
            xpReward: 50,
          },
          {
            id: "him-p3",
            name: "Tenzin (Tradutor)",
            role: "Linguista Tibetano",
            x: -32,
            z: 18,
            skin: "#a16207",
            shirt: 0x16a34a,
            hatType: "glasses",
            questType: "encourage",
            speechBefore: "Estamos traduzindo os Provérbios para o dialeto Sherpa!",
            speechAfter: "Palavras de vida eterna agora em sua língua materna!",
            pointsReward: 270,
            xpReward: 40,
          },
          {
            id: "him-p4",
            name: "Dra. Maya",
            role: "Hospital de Alta Altitude",
            x: -46,
            z: -20,
            skin: "#c2410c",
            shirt: 0x06b6d4,
            questType: "rescue",
            speechBefore: "Afaste as sombras da tenda de oxigênio médico!",
            speechAfter: "Suprimento de oxigênio garantido para todos os alpinistas!",
            pointsReward: 360,
            xpReward: 50,
          },
          {
            id: "him-p5",
            name: "Dawa",
            role: "Guardião dos Yaks",
            x: 32,
            z: -18,
            skin: "#78350f",
            shirt: 0x8b5cf6,
            questType: "supply",
            neededSupplies: 2,
            speechBefore: "Traga 2 Provisões para a caravana de yaks continuar viagem!",
            speechAfter: "A caravana partiu com sucesso levando Bíblias de áudio!",
            pointsReward: 340,
            xpReward: 45,
          },
          {
            id: "him-p6",
            name: "Pema (9a)",
            role: "Menina das Montanhas",
            x: 11,
            z: -8,
            skin: "#9a3412",
            shirt: 0xf43f5e,
            questType: "encourage",
            speechBefore: "Pendurei bandeiras de paz com mensagens de Jesus perto da escola!",
            speechAfter: "O vento do Himalaia sopra as boas novas por todo o mundo!",
            pointsReward: 260,
            xpReward: 35,
          },
        ],
        radioTowers: [
          {
            id: "him-tw1",
            name: "Torre Vale de Khumbu",
            district: "Passo da Neve",
            x: -60,
            z: 52,
            broadcastMessage: "Evangelho em áudio transmitido para as cabanas mais isoladas do cume!",
            pointsReward: 260,
            xpReward: 35,
          },
          {
            id: "him-tw2",
            name: "Antena Ponte Suspensa",
            district: "Vilarejo Sherpa",
            x: 62,
            z: 0,
            broadcastMessage: "Testemunhos de fé ecoando nos paredões de gelo do Everest!",
            pointsReward: 260,
            xpReward: 35,
          },
          {
            id: "him-tw3",
            name: "Torre Cume da Paz",
            district: "Acampamento Base",
            x: -60,
            z: -52,
            broadcastMessage: "Sinal 100%! Toda a região do Himalaia iluminada pela Verdade!",
            pointsReward: 280,
            xpReward: 40,
          },
        ],
        race: buildDefaultRace(
          "Travessia Glacial: Expresso Himalaia",
          "Pilote o Snow Cruiser ou a Moto de Neve [V], use o Turbo [Shift] e passe pelos 5 Checkpoints no gelo levando socorro antes da tempestade!"
        ),
        vehicles: buildRegionalVehicles("himalaia"),
        collectibles: generateCollectibles("Termo & Provisão do Cume"),
        enemies: generateEnemies("Sombra da Frieza", "Monstro da Geada Eterna"),
      };

    case "europa":
      return {
        supplyLabel: "Kit Dignidade & Acolhimento",
        bossName: "Monólito da Burocracia Fria",
        vehicleName: "E-Runner Gran Turismo",
        storeSigns: [
          "CENTRO RECOLHIMENTO",
          "CAFÉ SOLIDÁRIO",
          "ESCOLA DE IDIOMAS",
          "ESPAÇO JUVENTUDE",
          "INFOCENTER IDE",
          "BIBLIOTECA DAS NAÇÕES",
        ],
        people: [
          {
            id: "eur-p1",
            name: "Amira (Assistente)",
            role: "Coordenadora de Acolhimento",
            x: -32,
            z: 50,
            skin: "#c2410c",
            shirt: 0x8b5cf6,
            hatType: "curls",
            questType: "supply",
            neededSupplies: 2,
            speechBefore: "Uma nova família de refugiados acabou de chegar! Traga 2 Kits de Dignidade!",
            speechAfter: "Eles foram recebidos com abraço fraterno e lágrimas de alívio!",
            pointsReward: 350,
            xpReward: 50,
          },
          {
            id: "eur-p2",
            name: "Dimitri",
            role: "Voluntário na Estação",
            x: 46,
            z: 18,
            skin: "#fed7aa",
            shirt: 0x0284c7,
            questType: "rescue",
            speechBefore: "Sombras da Rejeição cercaram a praça da estação de trem!",
            speechAfter: "A luz de acolhimento venceu! As portas estão abertas com segurança!",
            pointsReward: 360,
            xpReward: 50,
          },
          {
            id: "eur-p3",
            name: "Farhad",
            role: "Poeta e Tradutor Árabe",
            x: -32,
            z: 18,
            skin: "#b45309",
            shirt: 0x10b981,
            hatType: "glasses",
            questType: "encourage",
            speechBefore: "Estou ajudando a traduzir os documentos de asilo e cartas de paz!",
            speechAfter: "Agora eles sabem que têm um lar seguro e irmãos em Cristo!",
            pointsReward: 270,
            xpReward: 40,
          },
          {
            id: "eur-p4",
            name: "Marie",
            role: "Cozinha Comunitária",
            x: -46,
            z: -20,
            skin: "#fde68a",
            shirt: 0xe11d48,
            questType: "rescue",
            speechBefore: "Proteja a entrega de refeições quentes das sombras do egoísmo!",
            speechAfter: "Mais de 100 refeições servidas hoje com um sorriso carinhoso!",
            pointsReward: 360,
            xpReward: 50,
          },
          {
            id: "eur-p5",
            name: "Lukas",
            role: "Professor de Idiomas",
            x: 32,
            z: -18,
            skin: "#fed7aa",
            shirt: 0xf59e0b,
            hatType: "cap",
            questType: "supply",
            neededSupplies: 2,
            speechBefore: "Precisamos de 2 Kits Educacionais para a primeira aula de grego e alemão!",
            speechAfter: "Aprender a língua local é o primeiro passo para a dignidade!",
            pointsReward: 340,
            xpReward: 45,
          },
          {
            id: "eur-p6",
            name: "Leila (8a)",
            role: "Criança Artista",
            x: 11,
            z: -8,
            skin: "#ca8a04",
            shirt: 0x06b6d4,
            questType: "encourage",
            speechBefore: "Desenhei um mural lindo de pássaros voando em direção à luz!",
            speechAfter: "Que lindo! O mural virou o símbolo da esperança de toda a cidade!",
            pointsReward: 260,
            xpReward: 35,
          },
        ],
        radioTowers: [
          {
            id: "eur-tw1",
            name: "Torre Praça da Estação",
            district: "Bairro Central",
            x: -60,
            z: 52,
            broadcastMessage: "Mensagem de acolhimento e paz transmitida em 6 idiomas diferentes!",
            pointsReward: 260,
            xpReward: 35,
          },
          {
            id: "eur-tw2",
            name: "Antena Centro Humanitário",
            district: "Porto de Acolhida",
            x: 62,
            z: 0,
            broadcastMessage: "Músicas de comunhão e esperança tocando nas praças públicas!",
            pointsReward: 260,
            xpReward: 35,
          },
          {
            id: "eur-tw3",
            name: "Torre Parque das Nações",
            district: "Campus Universitário",
            x: -60,
            z: -52,
            broadcastMessage: "Sinal 100%! Todas as comunidades unidas num só coração!",
            pointsReward: 280,
            xpReward: 40,
          },
        ],
        race: buildDefaultRace(
          "Grand Prix da Esperança: Circuito Europeu",
          "Pilote o E-Runner GT ou a Scooter Urbana [V], acione o Turbo [Shift] e entregue os Kits pelos 5 Checkpoints das avenidas!"
        ),
        vehicles: buildRegionalVehicles("europa"),
        collectibles: generateCollectibles("Kit Dignidade & Acolhimento"),
        enemies: generateEnemies("Sombra da Indiferença", "Monólito da Burocracia Fria"),
      };

    default:
      return {
        supplyLabel: "Página Traduzida (Macua)",
        bossName: "Titã da Divisão",
        vehicleName: "SUV Safari 4x4 Ide",
        storeSigns: [
          "ESCOLA NAMPULA",
          "CENTRO TRADUÇÃO",
          "POÇO ÁGUA VIVA",
          "MERCADO CAPULANA",
          "CLÍNICA ESPERANÇA",
          "RÁDIO COMUNIDADE",
        ],
        people: [
          {
            id: "moz-p1",
            name: "Vovó Lurdes",
            role: "Anciã da Vila Sul",
            x: -32,
            z: 50,
            skin: "#6b3e1e",
            shirt: 0xf59e0b,
            hatType: "curls",
            questType: "supply",
            neededSupplies: 2,
            speechBefore:
              "Meu sonho é ler as palavras de Jesus na língua Macua! Traga 2 Páginas Traduzidas!",
            speechAfter:
              "Muluku ti mwanene! Deus fala a minha língua! Meu coração está em festa!",
            pointsReward: 350,
            xpReward: 50,
          },
          {
            id: "moz-p2",
            name: "Tomás",
            role: "Guardião do Poço Leste",
            x: 46,
            z: 18,
            skin: "#7c4722",
            shirt: 0x10b981,
            questType: "rescue",
            speechBefore:
              "As Sombras estão bloqueando o acesso das famílias ao poço leste! Ajude-nos!",
            speechAfter:
              "Caminho livre! Água limpa para o corpo e Água da Vida para o espírito!",
            pointsReward: 360,
            xpReward: 50,
          },
          {
            id: "moz-p3",
            name: "Pr. Joaquim",
            role: "Tradutor Bíblico Local",
            x: -32,
            z: 18,
            skin: "#5c3417",
            shirt: 0x8b5cf6,
            hatType: "glasses",
            questType: "encourage",
            speechBefore:
              "Revisar cada versículo em Macua exige muita dedicação, mas o fruto é eterno!",
            speechAfter:
              "Obrigado por orar conosco! A Palavra está ganhando raízes profundas aqui!",
            pointsReward: 270,
            xpReward: 40,
          },
          {
            id: "moz-p4",
            name: "Enfermeira Célia",
            role: "Clínica do Bairro Norte",
            x: -46,
            z: -20,
            skin: "#7c4722",
            shirt: 0x06b6d4,
            questType: "rescue",
            speechBefore:
              "As Sombras cercaram a clínica comunitária norte! Afaste-as com a Luz!",
            speechAfter:
              "Glória a Deus! Os pacientes e crianças já podem entrar em paz!",
            pointsReward: 360,
            xpReward: 50,
          },
          {
            id: "moz-p5",
            name: "Prof. Armando",
            role: "Alfabetização Jovem",
            x: 32,
            z: -18,
            skin: "#6b3e1e",
            shirt: 0xeab308,
            hatType: "cap",
            questType: "supply",
            neededSupplies: 2,
            speechBefore:
              "Faltam 2 Páginas Traduzidas para a aula de leitura bíblica das crianças!",
            speechAfter:
              "Que alegria! Hoje 30 alunos vão ler João 3:16 no próprio idioma pela primeira vez!",
            pointsReward: 340,
            xpReward: 45,
          },
          {
            id: "moz-p6",
            name: "Amina (12a)",
            role: "Líder do Coral Infantil",
            x: 11,
            z: -8,
            skin: "#7c4722",
            shirt: 0xec4899,
            hatType: "curls",
            questType: "encourage",
            speechBefore:
              "Estamos ensaiando um cântico novo perto da fonte com o Samora!",
            speechAfter:
              "Venha celebrar com a gente! Toda Nampula vai ouvir as boas novas!",
            pointsReward: 260,
            xpReward: 35,
          },
        ],
        radioTowers: [
          {
            id: "moz-tw1",
            name: "Rádio Comunitária Sul",
            district: "Estrada Vermelha",
            x: -60,
            z: 52,
            broadcastMessage: "Evangelho narrado em Macua transmitido para as vilas do Sul!",
            pointsReward: 260,
            xpReward: 35,
          },
          {
            id: "moz-tw2",
            name: "Antena do Vale Leste",
            district: "Poço Comunitário",
            x: 62,
            z: 0,
            broadcastMessage: "Cânticos do coral jovem ecoando em todas as rádios do Leste!",
            pointsReward: 260,
            xpReward: 35,
          },
          {
            id: "moz-tw3",
            name: "Torre Savana Norte",
            district: "Colina do Baobá",
            x: -60,
            z: -52,
            broadcastMessage: "Sinal 100%! Todas as aldeias de Nampula conectadas à Palavra!",
            pointsReward: 280,
            xpReward: 40,
          },
        ],
        race: buildDefaultRace(
          "Rota Safari: Bíblias nas Vilas",
          "Pilote o SUV Safari ou o Rally GT [V], acione o Turbo [Shift] e cruze os 5 Checkpoints levando Bíblias recém-impressas!"
        ),
        vehicles: buildRegionalVehicles("mocambique"),
        collectibles: generateCollectibles("Página Traduzida (Macua)"),
        enemies: generateEnemies("Sombra da Barreira", "Titã da Divisão"),
      };
  }
}
