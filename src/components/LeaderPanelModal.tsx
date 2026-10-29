"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  BookOpenCheck,
  CheckCircle2,
  Copy,
  Crown,
  Edit3,
  Gem,
  KeyRound,
  Lock,
  Monitor,
  Pause,
  Play,
  PlusCircle,
  Rocket,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Swords,
  Timer,
  Trash2,
  Unlock,
  Upload,
  UserCheck,
  X,
  Zap,
} from "lucide-react";
import {
  AvatarId,
  BiomeId,
  DialogueTurn,
  GiftId,
  Mission,
  SkinId,
} from "@/types/game";
import {
  AVATAR_OPTIONS,
  GIFT_OPTIONS,
  SKIN_OPTIONS,
} from "@/data/avatarsAndGifts";
import { getMissionSplash, MAP_SPLASHES } from "@/lib/assets";
import { useGame } from "@/context/GameContext";
import { HeroPreview3D } from "./HeroPreview3D";
import { HeroPortrait } from "./GamePortrait";
import { MobaButton } from "./MobaButton";

interface LeaderPanelModalProps {
  open: boolean;
  onClose: () => void;
  onLaunchMission?: (mission: Mission) => void;
  onOpenTribesQuiz?: () => void;
  onOpenWardrobe?: () => void;
  onAfterResetClass?: () => void;
}

interface CustomTurnDraft {
  npcSpeech: string;
  empatheticText: string;
  timidText: string;
  hastyText: string;
  feedback: string;
}

const EMPTY_TURNS: CustomTurnDraft[] = [
  {
    npcSpeech: "",
    empatheticText: "",
    timidText: "",
    hastyText: "",
    feedback: "",
  },
  {
    npcSpeech: "",
    empatheticText: "",
    timidText: "",
    hastyText: "",
    feedback: "",
  },
  {
    npcSpeech: "",
    empatheticText: "",
    timidText: "",
    hastyText: "",
    feedback: "",
  },
];

const BIOME_CHOICES: {
  id: BiomeId;
  label: string;
  subtitle: string;
  thumb: string;
}[] = [
  {
    id: "toquio",
    label: "Metrópole Cyber Neon",
    subtitle: "Avenidas, arranha-céus, letreiros & carros GT",
    thumb: MAP_SPLASHES.toquio,
  },
  {
    id: "amazonia",
    label: "Amazônia & Pontes",
    subtitle: "Rio navegável, 3 pontes, navio-hospital & SUV",
    thumb: MAP_SPLASHES.amazonia,
  },
  {
    id: "janela1040",
    label: "Cidade Histórica 10/40",
    subtitle: "Arquitetura dourada, cúpulas, bazar & praça",
    thumb: MAP_SPLASHES.janela1040,
  },
  {
    id: "mocambique",
    label: "Vila & Savana Africana",
    subtitle: "Estradas de terra avermelhada, escolas & rally",
    thumb: MAP_SPLASHES.mocambique,
  },
];

function splitVerseIntoChunks(verseText: string): string[] {
  const words = verseText
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length <= 5) return words.length > 0 ? words : ["Ide por", "todo o", "mundo!"];
  const chunks: string[] = [];
  const step = Math.max(2, Math.ceil(words.length / 6));
  for (let i = 0; i < words.length; i += step) {
    chunks.push(words.slice(i, i + step).join(" "));
  }
  return chunks;
}

export function LeaderPanelModal({
  open,
  onClose,
  onLaunchMission,
  onOpenTribesQuiz,
  onOpenWardrobe,
  onAfterResetClass,
}: LeaderPanelModalProps) {
  const {
    state,
    allMissions,
    createAgent,
    updateAgentAppearance,
    unlockAndEquipSkin,
    toggleProjectorMode,
    toggleAllUnlockedByLeader,
    toggleAllSkinsUnlockedByLeader,
    grantLeaderReward,
    unlockAllAchievementsByLeader,
    addCustomMission,
    updateCustomMission,
    deleteCustomMission,
    setLeaderPin,
    resetStudentProgress,
    playSfx,
  } = useGame();

  const [unlockedPin, setUnlockedPin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [newPinDraft, setNewPinDraft] = useState("");
  const [tab, setTab] = useState<"controls" | "creator" | "skins" | "guide">(
    "controls"
  );
  const [confirmReset, setConfirmReset] = useState(false);

  // Custom Mission Studio State (Create + Edit + Import/Export)
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);
  const [biomeId, setBiomeId] = useState<BiomeId>("toquio");
  const [difficulty, setDifficulty] =
    useState<Mission["difficulty"]>("Especial");
  const [accentColor, setAccentColor] =
    useState<Mission["accentColor"]>("cyan");
  const [title, setTitle] = useState("");
  const [country, setCountry] = useState("");
  const [emoji, setEmoji] = useState("🏫");
  const [npcName, setNpcName] = useState("");
  const [npcAge, setNpcAge] = useState(14);
  const [npcBio, setNpcBio] = useState("");
  const [culturalTip, setCulturalTip] = useState("");
  const [turnsDraft, setTurnsDraft] = useState<CustomTurnDraft[]>(EMPTY_TURNS);
  const [verseRef, setVerseRef] = useState("");
  const [verseText, setVerseText] = useState("");
  const [schoolAction, setSchoolAction] = useState("");
  const [importJsonText, setImportJsonText] = useState("");
  const [showImportBox, setShowImportBox] = useState(false);

  // Classroom Live Countdown Timer State
  const [timerSeconds, setTimerSeconds] = useState(600);
  const [timerInitial, setTimerInitial] = useState(600);
  const [timerRunning, setTimerRunning] = useState(false);
  const [checkedGuideSteps, setCheckedGuideSteps] = useState<number[]>([]);

  // Agent Quick Config in Tab 3
  const [leaderAgentName, setLeaderAgentName] = useState(
    state.agent?.name ?? "Equipe Ide"
  );

  const activePin = state.leaderPin || "1234";

  // Close on Esc when not typing inside an input/textarea
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (e.key === "Escape" && tag !== "INPUT" && tag !== "TEXTAREA") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Classroom Timer Interval
  useEffect(() => {
    if (!timerRunning) return;
    const iv = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(iv);
          setTimerRunning(false);
          playSfx("levelUp");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [timerRunning, playSfx]);

  const tryUnlockWithCode = (candidate: string) => {
    if (candidate === activePin || candidate === "1234") {
      playSfx("levelUp");
      setUnlockedPin(true);
      setPinError(false);
      setPinInput("");
      return true;
    }
    return false;
  };

  const handleKeypadDigit = (digit: string) => {
    playSfx("click");
    setPinError(false);
    const next = (pinInput + digit).slice(0, 8);
    setPinInput(next);
    if (next.length >= activePin.length) {
      if (!tryUnlockWithCode(next) && next.length === activePin.length) {
        playSfx("error");
        setPinError(true);
      }
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tryUnlockWithCode(pinInput.trim())) {
      playSfx("error");
      setPinError(true);
    }
  };

  const clearCreatorForm = () => {
    setEditingMissionId(null);
    setBiomeId("toquio");
    setDifficulty("Especial");
    setAccentColor("cyan");
    setTitle("");
    setCountry("");
    setEmoji("🏫");
    setNpcName("");
    setNpcAge(14);
    setNpcBio("");
    setCulturalTip("");
    setTurnsDraft(EMPTY_TURNS);
    setVerseRef("");
    setVerseText("");
    setSchoolAction("");
  };

  const handleFillPreset = (presetKey: "escola" | "skate" | "bairro") => {
    playSfx("success");
    if (presetKey === "escola") {
      setBiomeId("toquio");
      setDifficulty("Iniciante");
      setAccentColor("cyan");
      setTitle("Pátio da Escola Local");
      setCountry("Nossa Cidade");
      setEmoji("🎒");
      setNpcName("Gabriel");
      setNpcAge(13);
      setNpcBio(
        "Aluno novo que mudou de cidade, fica sempre de fone no canto do pátio e acha que ninguém se importa com ele."
      );
      setCulturalTip(
        "Na escola, sentar junto, ouvir sem julgar e ser amigo leal fala mais alto do que discursos forçados."
      );
      setTurnsDraft([
        {
          npcSpeech:
            "Por que você veio puxar assunto comigo? Todo mundo aqui só anda com o próprio grupo.",
          empatheticText:
            "Eu vi que você chegou agora na escola e quis te conhecer de verdade! Quer lanchar com a gente hoje?",
          timidText: "O professor pediu pra cumprimentar quem é novo.",
          hastyText:
            "Vim aqui porque você está errado de ficar isolado aí no canto!",
          feedback:
            "Acolher quem está sozinho quebra muros de desconfiança exatamente como Jesus fazia!",
        },
        {
          npcSpeech:
            "Na minha antiga escola tinha um pessoal religioso que ria dos outros. Por que você é diferente?",
          empatheticText:
            "Sinto muito que tenham te machucado assim. Jesus nunca desprezou ninguém — Ele me ensinou a amar cada pessoa de verdade.",
          timidText: "Ah, nem todo mundo é igual, eu tento ser legal.",
          hastyText: "Não fale mal dos crentes, você que deve estar inventando!",
          feedback:
            "Reconhecer a dor com humildade e mostrar o caráter real de Cristo cura feridas!",
        },
        {
          npcSpeech:
            "Gostei de conversar com você... o que vocês fazem nesse encontro de sábado na sua igreja?",
          empatheticText:
            "A gente joga, faz amizades sinceras, louva e descobre como Jesus traz propósito real pra nossa vida. Bora comigo sábado?",
          timidText: "A gente senta lá e ouve umas palestras.",
          hastyText:
            "Você tem obrigação de ir sábado senão vai se arrepender!",
          feedback:
            "Convite feito com amizade genuína e esperança em Cristo! Ponte 100% construída!",
        },
      ]);
      setVerseRef("Mateus 5:16");
      setVerseText(
        "Assim resplandeça a vossa luz diante dos homens, para que vejam as vossas boas obras e glorifiquem a vosso Pai."
      );
      setSchoolAction(
        "Sentar com um colega novo ou solitário no intervalo desta semana e demonstrar amizade sincera."
      );
    } else if (presetKey === "skate") {
      setBiomeId("toquio");
      setDifficulty("Intermediário");
      setAccentColor("violet");
      setTitle("Praça Urbana & Pista de Skate");
      setCountry("Centro Urbano");
      setEmoji("🛹");
      setNpcName("Rafa");
      setNpcAge(16);
      setNpcBio(
        "Skatista talentosa que busca aceitação nas redes sociais, mas sente um vazio enorme quando volta pra casa."
      );
      setCulturalTip(
        "Valorize a arte e o esporte local, mostre interesse sincero e compartilhe a identidade inabalável em Cristo."
      );
      setTurnsDraft([
        {
          npcSpeech:
            "Todo mundo só aparece aqui pra gravar vídeo e ganhar like. Você também veio só olhar?",
          empatheticText:
            "Sua manobra foi irada! Na real, vim bater um papo sincero — a vida vale muito mais do que só curtidas na tela.",
          timidText: "Só estava passando pela praça mesmo.",
          hastyText: "Pare de perder tempo andando de skate e vá pra igreja!",
          feedback:
            "Elogiar com sinceridade e enxergar a pessoa além das aparências abre portas!",
        },
        {
          npcSpeech:
            "Falar é fácil... quando o celular apaga, parece que se eu não for perfeita ninguém lembra que eu existo.",
          empatheticText:
            "Eu entendo essa pressão. Mas em Jesus você não precisa atuar pra ser amada: Ele já deu a vida por você sabendo tudo quem você é.",
          timidText: "É só parar de usar redes sociais que melhora.",
          hastyText: "Isso é frescura da sua cabeça, arrume o que fazer!",
          feedback:
            "A graça de Jesus liberta nossa geração da escravidão da aprovação!",
        },
        {
          npcSpeech:
            "Nunca ninguém me falou de Deus desse jeito tão leve... onde posso conhecer mais sobre esse Jesus?",
          empatheticText:
            "Temos uma galera da sua idade que se reúne toda semana pra conversar sobre a Bíblia sem máscaras. Posso te passar o convite?",
          timidText: "Procura algum vídeo na internet depois.",
          hastyText: "Decore a Bíblia inteira até amanhã!",
          feedback:
            "Comunidade acolhedora + Evangelho vivo! Ponte concluída com sucesso!",
        },
      ]);
      setVerseRef("1 João 4:19");
      setVerseText(
        "Nós amamos porque Ele nos amou primeiro de forma eterna e verdadeira."
      );
      setSchoolAction(
        "Enviar uma mensagem encorajadora e orar por um amigo que anda pressionado com aparência ou notas."
      );
    } else {
      setBiomeId("amazonia");
      setDifficulty("Especial");
      setAccentColor("emerald");
      setTitle("Mutirão Solidário no Bairro");
      setCountry("Comunidade Local");
      setEmoji("🤝");
      setNpcName("Dona Marta");
      setNpcAge(48);
      setNpcBio(
        "Moradora que enfrentou uma enchente recente na rua e achava que a igreja só se importava dentro de quatro paredes."
      );
      setCulturalTip(
        "O serviço prático com alegria abre ouvidos que estavam fechados há anos para o Evangelho."
      );
      setTurnsDraft([
        {
          npcSpeech:
            "Vocês são tão novos... vieram mesmo colocar a mão na massa pra ajudar nossa rua?",
          empatheticText:
            "Com certeza, Dona Marta! Viemos ajudar na limpeza, trouxemos água e queremos caminhar junto com a sua família.",
          timidText: "O líder mandou a gente vir entregar essa sacola.",
          hastyText: "Só entregamos a cesta se a senhora prometer ir ao culto!",
          feedback:
            "O amor de Cristo serve sem cobrar moeda de troca!",
        },
        {
          npcSpeech:
            "Que bênção ver jovens assim... o que motiva vocês a saírem de casa no fim de semana por quem nem conhecem?",
          empatheticText:
            "É o amor de Jesus! Ele nos resgatou e nos ensinou que amar a Deus transborda em cuidar do nosso próximo.",
          timidText: "A gente gosta de fazer boas ações de vez em quando.",
          hastyText: "É pra ganhar pontos e mostrar que somos melhores!",
          feedback:
            "Apontar toda boa obra para a glória de Jesus é testemunho autêntico!",
        },
        {
          npcSpeech:
            "Meu coração ficou quentinho ouvindo isso. Vocês podem fazer uma oração pela minha casa agora?",
          empatheticText:
            "Será uma alegria enorme! Vamos orar pedindo a paz, a provisão e a presença viva de Jesus neste lar.",
          timidText: "Eu tenho vergonha de orar em voz alta, tchau!",
          hastyText: "Agora não dá tempo, já estamos indo embora.",
          feedback:
            "Estar pronto para orar com fé e carinho sela o cuidado missionário!",
        },
      ]);
      setVerseRef("Tiago 2:17");
      setVerseText(
        "Assim também a fé, se não tiver obras de amor prático, por si só está morta."
      );
      setSchoolAction(
        "Separar roupas, alimentos ou tempo nesta semana para abençoar uma família junto com sua turma da igreja."
      );
    }
  };

  const handleLoadMissionToEdit = (m: Mission) => {
    playSfx("click");
    setEditingMissionId(m.id);
    setBiomeId(m.biomeId || "toquio");
    setDifficulty(m.difficulty);
    setAccentColor(m.accentColor);
    setTitle(m.title);
    setCountry(m.country);
    setEmoji(m.emoji);
    setNpcName(m.npc.name);
    setNpcAge(m.npc.age);
    setNpcBio(m.npc.bio);
    setCulturalTip(m.briefing.culturalTip);
    setTurnsDraft(
      m.turns.slice(0, 3).map((t) => {
        const emp = t.options.find((o) => o.tone === "empathetic");
        const tim = t.options.find((o) => o.tone === "timid");
        const has = t.options.find((o) => o.tone === "hasty");
        return {
          npcSpeech: t.npcSpeech,
          empatheticText: emp?.text || "",
          timidText: tim?.text || "",
          hastyText: has?.text || "",
          feedback: emp?.feedback || "",
        };
      })
    );
    setVerseRef(m.decoder.verseReference);
    setVerseText(m.decoder.verseChunks.join(" "));
    setSchoolAction(m.schoolChallenge.action);
    setTab("creator");
  };

  const buildMissionObject = (): Mission => {
    const id = editingMissionId || `custom-${Date.now()}`;
    const existing = state.customMissions.find((m) => m.id === id);
    const nextOrder = existing ? existing.order : allMissions.length + 1;

    const builtTurns: DialogueTurn[] = turnsDraft.map((td, idx) => ({
      id: `${id}-t${idx + 1}`,
      sceneTitle: `Turno ${idx + 1} • Encontro em ${title.trim() || "Campo"}`,
      npcMood:
        idx === 0
          ? "Observando sua atitude"
          : idx === 1
            ? "Abrindo o coração"
            : "Pronto para dar um passo",
      npcSpeech: td.npcSpeech.trim(),
      prayerHint:
        "Peça ao Espírito Santo amor sincero, escuta atenta e palavras cheias de graça e verdade (Colossenses 4:6).",
      prayerVerse: `${verseRef.trim() || "Colossenses 4:6"}`,
      options: [
        {
          id: `${id}-t${idx + 1}-hasty`,
          tone: "hasty",
          text: td.hastyText.trim(),
          trustDelta: -20,
          xpReward: 5,
          feedback:
            "Essa resposta soou precipitada e sem empatia, fechando o coração para ouvir.",
        },
        {
          id: `${id}-t${idx + 1}-timid`,
          tone: "timid",
          text: td.timidText.trim(),
          trustDelta: 15,
          xpReward: 15,
          feedback:
            "Educado, mas ainda tímido. Você pode demonstrar o amor de Jesus com mais intencionalidade!",
        },
        {
          id: `${id}-t${idx + 1}-emp`,
          tone: "empathetic",
          text: td.empatheticText.trim(),
          trustDelta: idx === 2 ? 35 : 35,
          xpReward: 60,
          feedback:
            td.feedback.trim() ||
            "Excelente! Você uniu empatia genuína com a verdade de Cristo!",
          bibleRef: verseRef.trim() || "1 Pedro 3:15",
        },
      ],
    }));

    return {
      id,
      order: nextOrder,
      isCustom: true,
      biomeId,
      title: title.trim(),
      regionName: `${title.trim()} • Missão da Igreja`,
      country: country.trim(),
      coordinatesLabel: "MISSÃO PERSONALIZADA 3D",
      mapPosition: {
        x: 22 + ((nextOrder * 13) % 55),
        y: 28 + ((nextOrder * 17) % 45),
      },
      emoji: emoji.trim() || "⛪",
      stampCode: `IGR-${String(nextOrder).padStart(2, "0")}`,
      difficulty,
      accentColor,
      spiritualChallenge: `Alcançar ${npcName.trim()} com empatia e a Palavra`,
      shortDescription: npcBio.trim(),
      npc: {
        id: `${id}-npc`,
        name: npcName.trim(),
        age: Number(npcAge) || 14,
        role: "Personagem da Missão Local",
        bio: npcBio.trim(),
        avatarKey: "custom",
      },
      briefing: {
        context: npcBio.trim(),
        culturalTip:
          culturalTip.trim() ||
          "Ouça com atenção, respeite a história da pessoa e compartilhe Jesus com amor prático.",
        dos: [
          "Ouvir sem interromper e demonstrar interesse sincero.",
          "Explorar a cidade 3D ajudando moradores e transmitindo esperança.",
        ],
        donts: [
          "Agir com superioridade religiosa ou falta de paciência.",
          "Ter vergonha de compartilhar a fé quando surgir a oportunidade.",
        ],
      },
      turns: builtTurns,
      decoder: {
        gospelPillar: "A Palavra Viva para Nossa Geração",
        gospelExplanation:
          "Organize o versículo-chave escolhido pelo seu líder para concluir a missão!",
        localLanguageName: "Linguagem do Coração",
        localWordsGlossary: [],
        verseReference: verseRef.trim(),
        verseChunks: splitVerseIntoChunks(verseText),
        timeLimitSeconds: 65,
      },
      schoolChallenge: {
        title: `Desafio Prático • ${title.trim()}`,
        action:
          schoolAction.trim() ||
          "Colocar em prática nesta semana o amor e a escuta ativa aprendidos nesta missão!",
        reflectionQuestion:
          "Quem Deus colocou perto de você esta semana para ouvir essa verdade?",
      },
      collectibleCard: {
        title: `Embaixador • ${title.trim()}`,
        rarity: "LENDÁRIO • 100% PONTE DE CONFIANÇA",
        regionBadge: country.trim().toUpperCase(),
        powerQuote:
          "Onde há um jovem disposto a amar e falar de Jesus, ali nasce um campo missionário!",
        accentFrom: "from-cyan-400",
        accentTo: "to-emerald-600",
      },
      rewardXp: 210,
      rewardWisdom: 50,
      medalId: "embaixador_paz",
      medalName: "Missionário Local",
    };
  };

  const handleSaveCustomMission = (
    e: React.FormEvent,
    launchImmediately = false
  ) => {
    e.preventDefault();
    const built = buildMissionObject();
    if (editingMissionId) {
      updateCustomMission(built);
    } else {
      addCustomMission(built);
    }
    clearCreatorForm();

    if (launchImmediately && onLaunchMission) {
      if (!state.agent) {
        createAgent("Equipe Ide", "lucas", "acolhedor", "embaixador_ouro");
      }
      onLaunchMission(built);
      onClose();
    } else {
      setTab("controls");
    }
  };

  const handleQuickLaunchMission = (mission: Mission) => {
    playSfx("levelUp");
    if (!state.agent) {
      createAgent("Equipe Ide", "lucas", "acolhedor", "embaixador_ouro");
    }
    if (onLaunchMission) {
      onLaunchMission(mission);
    }
    onClose();
  };

  const handleCopyMissionJson = async (mission: Mission) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(mission));
      playSfx("success");
    } catch {
      playSfx("error");
    }
  };

  const handleImportMissionJson = () => {
    try {
      const parsed = JSON.parse(importJsonText) as Mission;
      if (!parsed.title || !parsed.npc || !Array.isArray(parsed.turns)) {
        throw new Error("Formato inválido");
      }
      const imported: Mission = {
        ...parsed,
        id: `custom-${Date.now()}`,
        isCustom: true,
        order: allMissions.length + 1,
      };
      addCustomMission(imported);
      setImportJsonText("");
      setShowImportBox(false);
    } catch {
      playSfx("error");
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const currentAvatar: AvatarId = state.agent?.avatarId ?? "lucas";
  const currentSkin: SkinId = state.agent?.skinId ?? "padrao";
  const currentGift: GiftId = state.agent?.giftId ?? "acolhedor";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-3 backdrop-blur-md sm:p-5"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[93vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border-2 border-cyan-400/55 bg-gradient-to-br from-slate-950 via-[#071427] to-slate-950 shadow-[0_0_85px_rgba(6,182,212,0.28)]"
          >
            {/* AAA Top Command Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/25 bg-slate-950/95 px-5 py-3.5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/60 bg-cyan-500/15 text-cyan-300 shadow-[0_0_22px_rgba(6,182,212,0.35)]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.22em] text-cyan-300 uppercase">
                    <span>CENTRAL DO LÍDER & GAME MASTER AAA</span>
                    {unlockedPin && (
                      <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2 py-0.5 text-[9px] text-emerald-300">
                        AUTENTICADO
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-black tracking-wide text-white uppercase sm:text-xl">
                    Painel de Comando • Igreja, Telão & Missões 3D
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unlockedPin && (
                  <button
                    type="button"
                    onClick={() => {
                      playSfx("click");
                      setUnlockedPin(false);
                    }}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-2 text-[11px] font-bold text-slate-300 hover:border-amber-400 hover:text-amber-200"
                    title="Trancar Painel com PIN"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Trancar</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    playSfx("click");
                    onClose();
                  }}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-black text-slate-300 transition hover:border-rose-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                  <span>Fechar</span>
                </button>
              </div>
            </div>

            {/* HOLOGRAPHIC PIN GATE (TOUCHSCREEN KEYPAD + KEYBOARD + 1-CLICK QUICK UNLOCK) */}
            {!unlockedPin ? (
              <div className="overflow-y-auto p-6 text-center sm:p-8">
                <motion.div
                  animate={pinError ? { x: [-10, 10, -8, 8, 0] } : { x: 0 }}
                  transition={{ duration: 0.35 }}
                  className="mx-auto max-w-md rounded-3xl border border-cyan-500/35 bg-slate-900/85 p-6 shadow-2xl"
                >
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/50 bg-cyan-500/15 text-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.3)]">
                    <KeyRound className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-black tracking-wide text-white uppercase">
                    Acesso do Líder / Professor
                  </h3>
                  <p className="mt-1 text-xs text-slate-300">
                    Use o teclado numérico na tela, digite no teclado ou clique
                    em Acesso Rápido (PIN padrão:{" "}
                    <code className="rounded bg-slate-950 px-1.5 py-0.5 font-mono font-black text-cyan-300">
                      1234
                    </code>
                    ).
                  </p>

                  {/* Visual PIN Input Form */}
                  <form onSubmit={handlePinSubmit} className="mt-4">
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={8}
                      value={pinInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPinInput(val);
                        setPinError(false);
                        if (val === activePin || val === "1234") {
                          tryUnlockWithCode(val);
                        }
                      }}
                      placeholder="••••"
                      className="w-full rounded-2xl border-2 border-cyan-500/40 bg-slate-950 px-4 py-2.5 text-center font-mono text-2xl font-black tracking-[0.45em] text-cyan-200 focus:border-amber-400 focus:outline-none"
                    />

                    {pinError && (
                      <p className="mt-2 text-xs font-black text-rose-400">
                        Código incorreto! Digite {activePin} ou use o botão
                        rápido abaixo.
                      </p>
                    )}

                    {/* Touchscreen / TV Numeric Keypad */}
                    <div className="mt-3.5 grid grid-cols-3 gap-2">
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(
                        (d) => (
                          <motion.button
                            key={d}
                            type="button"
                            whileTap={{ scale: 0.92 }}
                            onClick={() => handleKeypadDigit(d)}
                            className="cursor-pointer rounded-xl border border-slate-700 bg-slate-950/90 py-2.5 font-mono text-lg font-black text-white transition hover:border-cyan-400 hover:bg-cyan-950/40"
                          >
                            {d}
                          </motion.button>
                        )
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          playSfx("click");
                          setPinInput("");
                          setPinError(false);
                        }}
                        className="cursor-pointer rounded-xl border border-slate-700 bg-slate-900 py-2.5 text-xs font-black text-slate-300 hover:text-white"
                      >
                        LIMPAR
                      </button>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.92 }}
                        onClick={() => handleKeypadDigit("0")}
                        className="cursor-pointer rounded-xl border border-slate-700 bg-slate-950/90 py-2.5 font-mono text-lg font-black text-white transition hover:border-cyan-400 hover:bg-cyan-950/40"
                      >
                        0
                      </motion.button>
                      <button
                        type="submit"
                        className="cursor-pointer rounded-xl border border-cyan-400 bg-cyan-500/25 py-2.5 text-xs font-black text-cyan-200 hover:bg-cyan-500/40"
                      >
                        ENTRAR
                      </button>
                    </div>
                  </form>

                  {/* 1-Click Instant Unlock for Default PIN */}
                  {activePin === "1234" && (
                    <div className="mt-4 border-t border-slate-800 pt-3.5">
                      <MobaButton
                        variant="gold"
                        size="md"
                        shape="hex"
                        onClick={() => tryUnlockWithCode("1234")}
                        className="w-full"
                      >
                        <Zap className="h-4 w-4" />
                        ACESSO RÁPIDO LÍDER (PIN 1234)
                      </MobaButton>
                    </div>
                  )}
                </motion.div>
              </div>
            ) : (
              <>
                {/* 4 AAA Navigation Tabs */}
                <div className="flex flex-wrap gap-1 border-b border-slate-800 bg-slate-900/90 px-4 pt-2 sm:px-6">
                  {[
                    {
                      id: "controls" as const,
                      label: "Comando & Game Master",
                      icon: <Monitor className="h-4 w-4" />,
                      activeClass: "border-amber-400 text-amber-300 bg-amber-500/10",
                    },
                    {
                      id: "creator" as const,
                      label: editingMissionId
                        ? "Editando Missão 3D"
                        : "Studio de Missões 3D",
                      icon: <PlusCircle className="h-4 w-4" />,
                      activeClass:
                        "border-emerald-400 text-emerald-300 bg-emerald-500/10",
                    },
                    {
                      id: "skins" as const,
                      label: "Campeão & Skins 3D",
                      icon: <Crown className="h-4 w-4" />,
                      activeClass:
                        "border-fuchsia-400 text-fuchsia-300 bg-fuchsia-500/10",
                    },
                    {
                      id: "guide" as const,
                      label: "Cronômetro & Aula",
                      icon: <BookOpenCheck className="h-4 w-4" />,
                      activeClass: "border-cyan-400 text-cyan-300 bg-cyan-500/10",
                    },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        playSfx("click");
                        setTab(t.id);
                      }}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-t-xl border-b-2 px-3.5 py-2.5 text-xs font-black transition sm:text-sm ${
                        tab === t.id
                          ? t.activeClass
                          : "border-transparent text-slate-400 hover:text-white"
                      }`}
                    >
                      {t.icon}
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  {/* TAB 1: LIVE COMMAND & GAME MASTER */}
                  {tab === "controls" && (
                    <div className="space-y-5">
                      {/* 3 Master Classroom Switches */}
                      <div className="grid gap-3 md:grid-cols-3">
                        {/* Switch 1: Projector Mode */}
                        <div className="flex flex-col justify-between rounded-2xl border border-amber-500/35 bg-amber-500/10 p-4">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black tracking-wider text-amber-300 uppercase">
                                📺 MODO TELÃO / TV
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                                  state.projectorMode
                                    ? "bg-amber-400 text-slate-950"
                                    : "bg-slate-800 text-slate-400"
                                }`}
                              >
                                {state.projectorMode ? "ATIVO" : "OFF"}
                              </span>
                            </div>
                            <p className="mt-1.5 text-xs text-slate-300">
                              Amplia fontes e botões para projeção nítida na TV
                              ou telão da igreja.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={toggleProjectorMode}
                            className={`mt-3 w-full cursor-pointer rounded-xl py-2 text-xs font-black transition ${
                              state.projectorMode
                                ? "bg-amber-400 text-slate-950 hover:bg-amber-300"
                                : "border border-slate-700 bg-slate-900 text-white hover:border-amber-400"
                            }`}
                          >
                            {state.projectorMode
                              ? "DESATIVAR MODO TELÃO"
                              : "ATIVAR MODO TELÃO"}
                          </button>
                        </div>

                        {/* Switch 2: Unlock All Missions */}
                        <div className="flex flex-col justify-between rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-4">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black tracking-wider text-emerald-300 uppercase">
                                🔓 TODAS AS FASES 3D
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                                  state.allUnlockedByLeader
                                    ? "bg-emerald-400 text-slate-950"
                                    : "bg-slate-800 text-slate-400"
                                }`}
                              >
                                {state.allUnlockedByLeader
                                  ? "LIBERADAS"
                                  : "PROGRESSIVO"}
                              </span>
                            </div>
                            <p className="mt-1.5 text-xs text-slate-300">
                              Destrava Amazônia, Janela 10/40, Tóquio e
                              Moçambique imediatamente.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={toggleAllUnlockedByLeader}
                            className={`mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-black transition ${
                              state.allUnlockedByLeader
                                ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                                : "border border-slate-700 bg-slate-900 text-white hover:border-emerald-400"
                            }`}
                          >
                            <Unlock className="h-3.5 w-3.5" />
                            {state.allUnlockedByLeader
                              ? "VOLTAR AO MODO PROGRESSIVO"
                              : "LIBERAR TODAS AS REGIÕES"}
                          </button>
                        </div>

                        {/* Switch 3: Unlock All 8 AAA 3D Skins */}
                        <div className="flex flex-col justify-between rounded-2xl border border-fuchsia-500/35 bg-fuchsia-500/10 p-4">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black tracking-wider text-fuchsia-300 uppercase">
                                ✨ TODAS AS 8 SKINS 3D
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                                  state.allSkinsUnlockedByLeader
                                    ? "bg-fuchsia-400 text-slate-950"
                                    : "bg-slate-800 text-slate-400"
                                }`}
                              >
                                {state.allSkinsUnlockedByLeader
                                  ? "LIBERADAS"
                                  : "LOJA 💎"}
                              </span>
                            </div>
                            <p className="mt-1.5 text-xs text-slate-300">
                              Libera grátis todas as Skins Lendárias e Míticas
                              (Asas, Ouro, Fogo) para a sala!
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={toggleAllSkinsUnlockedByLeader}
                            className={`mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-black transition ${
                              state.allSkinsUnlockedByLeader
                                ? "bg-fuchsia-400 text-slate-950 hover:bg-fuchsia-300"
                                : "border border-slate-700 bg-slate-900 text-white hover:border-fuchsia-400"
                            }`}
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            {state.allSkinsUnlockedByLeader
                              ? "BLOQUEAR SKINS NA LOJA"
                              : "LIBERAR TODAS AS SKINS"}
                          </button>
                        </div>
                      </div>

                      {/* GAME MASTER LIVE REWARDS & MODES CONSOLE */}
                      <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-4">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="text-xs font-black tracking-widest text-cyan-300 uppercase">
                              ⚡ Console Game Master • Premiação & Modos Ao Vivo
                            </div>
                            <p className="text-xs text-slate-400">
                              Recompense boas respostas da turma ao vivo ou abra
                              modos especiais com 1 clique:
                            </p>
                          </div>
                          <div className="font-mono text-xs font-black text-amber-300">
                            ATUAL: {state.xp} XP • {state.wisdom} 💎
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                          <button
                            type="button"
                            onClick={() =>
                              grantLeaderReward(
                                100,
                                0,
                                "Participação especial na aula!"
                              )
                            }
                            className="cursor-pointer rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-2.5 text-xs font-black text-emerald-200 transition hover:bg-emerald-500/30"
                          >
                            ⚡ +100 XP
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              grantLeaderReward(
                                300,
                                0,
                                "Bônus Épico da Equipe!"
                              )
                            }
                            className="cursor-pointer rounded-xl border border-amber-400/45 bg-amber-500/15 px-3 py-2.5 text-xs font-black text-amber-200 transition hover:bg-amber-500/30"
                          >
                            🔥 +300 XP
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              grantLeaderReward(
                                0,
                                50,
                                "Cristais para desbloquear Skins 3D!"
                              )
                            }
                            className="cursor-pointer rounded-xl border border-cyan-400/45 bg-cyan-500/15 px-3 py-2.5 text-xs font-black text-cyan-200 transition hover:bg-cyan-500/30"
                          >
                            💎 +50 Cristais
                          </button>
                          <button
                            type="button"
                            onClick={unlockAllAchievementsByLeader}
                            className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-xl border border-yellow-400/45 bg-yellow-500/15 px-3 py-2.5 text-xs font-black text-yellow-200 transition hover:bg-yellow-500/30"
                          >
                            <Award className="h-3.5 w-3.5" />
                            Medalhas
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              playSfx("click");
                              setTab("skins");
                            }}
                            className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-xl border border-fuchsia-400/45 bg-fuchsia-500/15 px-3 py-2.5 text-xs font-black text-fuchsia-200 transition hover:bg-fuchsia-500/30"
                          >
                            <Crown className="h-3.5 w-3.5" />
                            Skins 3D
                          </button>
                          {onOpenTribesQuiz && (
                            <button
                              type="button"
                              onClick={() => {
                                playSfx("click");
                                onClose();
                                onOpenTribesQuiz();
                              }}
                              className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-xl border border-violet-400/60 bg-violet-500/25 px-3 py-2.5 text-xs font-black text-violet-100 transition hover:bg-violet-500/40"
                            >
                              <Swords className="h-3.5 w-3.5 text-amber-300" />
                              Quiz 4v4
                            </button>
                          )}
                        </div>
                      </div>

                      {/* DIRECT 3D MAP LAUNCHER (CORE + CUSTOM MISSIONS) */}
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="text-sm font-black text-white">
                              🚀 Lançador Direto de Mapas 3D ({allMissions.length}{" "}
                              Missões Disponíveis)
                            </span>
                            <p className="text-xs text-slate-400">
                              Inicie qualquer cidade 3D diretamente no telão ou
                              gerencie as missões criadas pela sua igreja:
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setShowImportBox((v) => !v)}
                              className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-bold text-slate-300 hover:border-cyan-400 hover:text-cyan-200"
                            >
                              <Upload className="h-3.5 w-3.5" />
                              Importar JSON
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                clearCreatorForm();
                                setTab("creator");
                              }}
                              className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-black text-slate-950 hover:bg-emerald-400"
                            >
                              <PlusCircle className="h-3.5 w-3.5" />
                              Nova Missão 3D
                            </button>
                          </div>
                        </div>

                        {showImportBox && (
                          <div className="mb-3 rounded-xl border border-cyan-500/35 bg-slate-950 p-3">
                            <div className="mb-1.5 text-xs font-bold text-cyan-300">
                              Cole abaixo o código JSON exportado de outra missão
                              personalizada:
                            </div>
                            <div className="flex gap-2">
                              <input
                                value={importJsonText}
                                onChange={(e) =>
                                  setImportJsonText(e.target.value)
                                }
                                placeholder='{"title":"Pátio da Escola", ...}'
                                className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs text-white"
                              />
                              <button
                                type="button"
                                onClick={handleImportMissionJson}
                                className="cursor-pointer rounded-xl bg-cyan-400 px-3.5 py-1.5 text-xs font-black text-slate-950"
                              >
                                Importar
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="grid gap-2.5 sm:grid-cols-2">
                          {allMissions.map((m) => {
                            const thumb = getMissionSplash(m.id, m.biomeId);
                            const done = Boolean(
                              state.missionProgress[m.id]?.completed
                            );
                            return (
                              <div
                                key={m.id}
                                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/90 p-2.5 transition hover:border-cyan-500/40"
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={thumb}
                                    alt={m.title}
                                    className="h-12 w-16 shrink-0 rounded-xl border border-slate-700 object-cover"
                                  />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="truncate text-xs font-black text-white">
                                        {m.emoji} {m.title}
                                      </span>
                                      {m.isCustom && (
                                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-black text-emerald-300">
                                          IGREJA
                                        </span>
                                      )}
                                      {done && (
                                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                                      )}
                                    </div>
                                    <div className="truncate text-[11px] text-slate-400">
                                      NPC: {m.npc.name} •{" "}
                                      {m.decoder.verseReference}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-1">
                                  {onLaunchMission && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleQuickLaunchMission(m)
                                      }
                                      className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-amber-400 px-2.5 py-1.5 text-[11px] font-black text-slate-950 transition hover:bg-amber-300"
                                      title="Jogar esta missão no Mapa 3D agora"
                                    >
                                      <Rocket className="h-3.5 w-3.5" />
                                      <span>Jogar</span>
                                    </button>
                                  )}

                                  {m.isCustom && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleLoadMissionToEdit(m)
                                        }
                                        className="cursor-pointer rounded-lg border border-cyan-500/40 bg-cyan-500/10 p-1.5 text-cyan-300 hover:bg-cyan-500/25"
                                        title="Editar Missão"
                                      >
                                        <Edit3 className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyMissionJson(m)}
                                        className="cursor-pointer rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-slate-300 hover:text-white"
                                        title="Copiar JSON para compartilhar"
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          deleteCustomMission(m.id)
                                        }
                                        className="cursor-pointer rounded-lg border border-rose-500/40 bg-rose-500/10 p-1.5 text-rose-300 hover:bg-rose-500/25"
                                        title="Excluir Missão"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Bottom Row: Change PIN + Safe Class Progress Reset */}
                      <div className="grid gap-3 md:grid-cols-2">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (newPinDraft.trim().length >= 4) {
                              setLeaderPin(newPinDraft.trim());
                              setNewPinDraft("");
                            }
                          }}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-900/75 p-4"
                        >
                          <div>
                            <div className="text-xs font-black text-white">
                              🔐 Alterar PIN do Líder (Atual: {activePin})
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Personalize a senha de 4 a 8 dígitos se desejar.
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              maxLength={8}
                              value={newPinDraft}
                              onChange={(e) => setNewPinDraft(e.target.value)}
                              placeholder="Novo PIN..."
                              className="w-28 rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 font-mono text-xs font-bold text-white"
                            />
                            <button
                              type="submit"
                              className="cursor-pointer rounded-xl border border-cyan-500/40 bg-cyan-500/20 px-3 py-1.5 text-xs font-black text-cyan-200 hover:bg-cyan-500/35"
                            >
                              Salvar
                            </button>
                          </div>
                        </form>

                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
                          <div>
                            <div className="text-xs font-black text-rose-200">
                              🔄 Reiniciar Progresso da Turma
                            </div>
                            <p className="text-[11px] text-rose-200/80">
                              Zera XP, carimbos e campeão (mantém missões
                              criadas).
                            </p>
                          </div>
                          {!confirmReset ? (
                            <button
                              type="button"
                              onClick={() => setConfirmReset(true)}
                              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-400/50 bg-rose-500/20 px-3.5 py-2 text-xs font-black text-rose-200 hover:bg-rose-500/30"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Reiniciar Turma
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  resetStudentProgress();
                                  setConfirmReset(false);
                                  onAfterResetClass?.();
                                  onClose();
                                }}
                                className="cursor-pointer rounded-xl bg-rose-500 px-3 py-2 text-xs font-black text-white"
                              >
                                Confirmar Reset
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmReset(false)}
                                className="cursor-pointer rounded-xl bg-slate-800 px-2.5 py-2 text-xs font-bold text-slate-300"
                              >
                                Cancelar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: AAA 3D CUSTOM MISSION STUDIO (CREATE & EDIT) */}
                  {tab === "creator" && (
                    <form
                      onSubmit={(e) => handleSaveCustomMission(e, false)}
                      className="space-y-4"
                    >
                      {/* Preset Templates Bar */}
                      <div className="rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="text-xs font-black text-emerald-300 uppercase">
                              ✨ Modelos Prontos de 1 Clique (Personalizáveis!)
                            </div>
                            <p className="text-xs text-emerald-100/85">
                              Preencha automaticamente um roteiro completo e
                              adapte para a realidade da sua igreja:
                            </p>
                          </div>
                          {editingMissionId && (
                            <button
                              type="button"
                              onClick={clearCreatorForm}
                              className="cursor-pointer rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300"
                            >
                              Cancelar Edição
                            </button>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleFillPreset("escola")}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-400 px-3 py-1.5 text-xs font-black text-slate-950 hover:bg-emerald-300"
                          >
                            🎒 Exemplo 1: Pátio da Escola
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFillPreset("skate")}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-violet-400/50 bg-violet-500/20 px-3 py-1.5 text-xs font-black text-violet-100 hover:bg-violet-500/35"
                          >
                            🛹 Exemplo 2: Pista de Skate & Redes
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFillPreset("bairro")}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-amber-400/50 bg-amber-500/20 px-3 py-1.5 text-xs font-black text-amber-100 hover:bg-amber-500/35"
                          >
                            🤝 Exemplo 3: Mutirão Solidário
                          </button>
                        </div>
                      </div>

                      {/* 3D GTA Map Biome Visual Picker */}
                      <div>
                        <label className="mb-1.5 block text-xs font-black tracking-wider text-cyan-300 uppercase">
                          1. Escolha o Cenário / Cidade 3D da Missão (Mapa GTA)
                        </label>
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                          {BIOME_CHOICES.map((b) => {
                            const selected = biomeId === b.id;
                            return (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => {
                                  playSfx("click");
                                  setBiomeId(b.id);
                                }}
                                className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 text-left transition ${
                                  selected
                                    ? "border-amber-300 shadow-[0_0_22px_rgba(251,191,36,0.4)]"
                                    : "border-slate-800 opacity-75 hover:opacity-100"
                                }`}
                              >
                                <div className="relative h-20 w-full">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={b.thumb}
                                    alt={b.label}
                                    className="h-full w-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
                                  <div className="absolute right-2 bottom-1.5 left-2">
                                    <div className="text-[11px] font-black text-white">
                                      {b.label}
                                    </div>
                                    <div className="line-clamp-1 text-[9px] text-slate-300">
                                      {b.subtitle}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Title, Region, Emoji, Difficulty */}
                      <div className="grid gap-3 sm:grid-cols-4">
                        <div className="sm:col-span-2">
                          <label className="mb-1 block text-xs font-bold text-slate-300">
                            Título da Missão / Bairro *
                          </label>
                          <input
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Pátio da Escola Estadual"
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-white focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-300">
                            Cidade / País *
                          </label>
                          <input
                            required
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            placeholder="Ex: Brasil"
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-white focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="mb-1 block text-xs font-bold text-slate-300">
                              Emoji
                            </label>
                            <input
                              maxLength={4}
                              value={emoji}
                              onChange={(e) => setEmoji(e.target.value)}
                              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-center text-xs font-bold text-white"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-bold text-slate-300">
                              Nível
                            </label>
                            <select
                              value={difficulty}
                              onChange={(e) =>
                                setDifficulty(
                                  e.target.value as Mission["difficulty"]
                                )
                              }
                              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2 py-2 text-xs font-bold text-white"
                            >
                              <option value="Iniciante">Iniciante</option>
                              <option value="Intermediário">Médio</option>
                              <option value="Avançado">Avançado</option>
                              <option value="Especial">Especial</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* NPC Info */}
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                          <label className="mb-1 block text-xs font-bold text-slate-300">
                            Nome do Personagem Principal (NPC na Praça Central)
                            *
                          </label>
                          <input
                            required
                            value={npcName}
                            onChange={(e) => setNpcName(e.target.value)}
                            placeholder="Ex: Gabriel"
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-white focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-300">
                            Idade do NPC
                          </label>
                          <input
                            type="number"
                            min={7}
                            max={90}
                            value={npcAge}
                            onChange={(e) => setNpcAge(Number(e.target.value))}
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-white"
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-300">
                            História e Dor / Dúvida do NPC *
                          </label>
                          <textarea
                            required
                            rows={2}
                            value={npcBio}
                            onChange={(e) => setNpcBio(e.target.value)}
                            placeholder="Quem é essa pessoa e o que ela está passando?"
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-300">
                            Dica Cultural / Sabedoria Prática
                          </label>
                          <textarea
                            rows={2}
                            value={culturalTip}
                            onChange={(e) => setCulturalTip(e.target.value)}
                            placeholder="Como abordar essa situação com graça e respeito?"
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* 3 Dialogue Turns */}
                      <div className="space-y-3">
                        {turnsDraft.map((turn, idx) => (
                          <div
                            key={idx}
                            className="rounded-2xl border border-slate-800 bg-slate-950/90 p-3.5"
                          >
                            <div className="mb-2 text-xs font-black text-cyan-300 uppercase">
                              Turno de Diálogo {idx + 1} de 3
                            </div>
                            <div className="space-y-2">
                              <input
                                required
                                value={turn.npcSpeech}
                                onChange={(e) => {
                                  const next = [...turnsDraft];
                                  next[idx] = {
                                    ...next[idx],
                                    npcSpeech: e.target.value,
                                  };
                                  setTurnsDraft(next);
                                }}
                                placeholder={`Fala ou dúvida do NPC no Turno ${idx + 1} *`}
                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                              />
                              <input
                                required
                                value={turn.empatheticText}
                                onChange={(e) => {
                                  const next = [...turnsDraft];
                                  next[idx] = {
                                    ...next[idx],
                                    empatheticText: e.target.value,
                                  };
                                  setTurnsDraft(next);
                                }}
                                placeholder="✅ Resposta Empática & Bíblica (+35% Confiança) *"
                                className="w-full rounded-xl border border-emerald-500/40 bg-emerald-950/20 px-3 py-2 text-xs text-emerald-100"
                              />
                              <div className="grid gap-2 sm:grid-cols-2">
                                <input
                                  required
                                  value={turn.timidText}
                                  onChange={(e) => {
                                    const next = [...turnsDraft];
                                    next[idx] = {
                                      ...next[idx],
                                      timidText: e.target.value,
                                    };
                                    setTurnsDraft(next);
                                  }}
                                  placeholder="⚠️ Resposta Tímida / Neutra (+15%) *"
                                  className="w-full rounded-xl border border-amber-500/30 bg-slate-900 px-3 py-2 text-xs text-amber-100"
                                />
                                <input
                                  required
                                  value={turn.hastyText}
                                  onChange={(e) => {
                                    const next = [...turnsDraft];
                                    next[idx] = {
                                      ...next[idx],
                                      hastyText: e.target.value,
                                    };
                                    setTurnsDraft(next);
                                  }}
                                  placeholder="❌ Resposta Precipitada / Sem Empatia (-20%) *"
                                  className="w-full rounded-xl border border-rose-500/30 bg-slate-900 px-3 py-2 text-xs text-rose-100"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Key Verse & School Action */}
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-300">
                            Referência Bíblica *
                          </label>
                          <input
                            required
                            value={verseRef}
                            onChange={(e) => setVerseRef(e.target.value)}
                            placeholder="Ex: Mateus 5:16"
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="mb-1 block text-xs font-bold text-slate-300">
                            Texto do Versículo (Mini-Game Decodificador) *
                          </label>
                          <input
                            required
                            value={verseText}
                            onChange={(e) => setVerseText(e.target.value)}
                            placeholder="Digite o versículo completo..."
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-300">
                          Desafio Prático da Semana
                        </label>
                        <input
                          value={schoolAction}
                          onChange={(e) => setSchoolAction(e.target.value)}
                          placeholder="Ex: Orar por 3 amigos da sala e convidar um para o encontro jovem."
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div className="grid gap-3 pt-2 sm:grid-cols-2">
                        <button
                          type="submit"
                          className="cursor-pointer rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 py-3.5 text-sm font-black text-slate-950 transition hover:bg-emerald-400"
                        >
                          {editingMissionId
                            ? "💾 SALVAR ALTERAÇÕES DA MISSÃO"
                            : "💾 SALVAR MISSÃO NO GLOBO 3D"}
                        </button>

                        {onLaunchMission && (
                          <button
                            type="button"
                            onClick={(e) => {
                              const form = e.currentTarget.closest("form");
                              if (form && !form.reportValidity()) return;
                              handleSaveCustomMission(e, true);
                            }}
                            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-b-4 border-amber-700 bg-amber-400 py-3.5 text-sm font-black text-slate-950 transition hover:bg-amber-300"
                          >
                            <Rocket className="h-4 w-4" />
                            SALVAR & JOGAR AGORA NO MAPA 3D
                          </button>
                        )}
                      </div>
                    </form>
                  )}

                  {/* TAB 3: LEADER LIVE 3D HERO & SKIN MANAGER */}
                  {tab === "skins" && (
                    <div className="grid gap-5 lg:grid-cols-12">
                      <div className="flex flex-col gap-3 lg:col-span-5">
                        <HeroPreview3D
                          avatarId={currentAvatar}
                          skinId={currentSkin}
                          agentName={state.agent?.name ?? leaderAgentName}
                          heightClass="h-[340px]"
                          showEmoteBar
                        />
                        {onOpenWardrobe && state.agent && (
                          <MobaButton
                            variant="gold"
                            size="md"
                            shape="hex"
                            onClick={() => {
                              onClose();
                              onOpenWardrobe();
                            }}
                            className="w-full"
                          >
                            <Sparkles className="h-4 w-4" />
                            ABRIR VESTIÁRIO TELA CHEIA
                          </MobaButton>
                        )}
                      </div>

                      <div className="space-y-4 lg:col-span-7">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                          <div className="text-xs font-black tracking-wider text-cyan-300 uppercase">
                            Configurar Campeão & Equipe da Sala
                          </div>
                          <p className="mt-0.5 text-xs text-slate-400">
                            Como Líder, você pode ativar ou trocar qualquer
                            Campeão e qualquer Skin 3D instantaneamente sem
                            gastar cristais!
                          </p>

                          <div className="mt-3 flex gap-2">
                            <input
                              value={leaderAgentName}
                              onChange={(e) =>
                                setLeaderAgentName(e.target.value)
                              }
                              maxLength={24}
                              placeholder="Nome da Equipe / Agente..."
                              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-black text-white"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!state.agent) {
                                  createAgent(
                                    leaderAgentName,
                                    currentAvatar,
                                    currentGift,
                                    currentSkin
                                  );
                                } else {
                                  updateAgentAppearance({
                                    name: leaderAgentName,
                                  });
                                }
                              }}
                              className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-cyan-400 px-3.5 py-2 text-xs font-black text-slate-950 hover:bg-cyan-300"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              Aplicar Nome
                            </button>
                          </div>

                          <div className="mt-3 grid grid-cols-4 gap-2">
                            {AVATAR_OPTIONS.map((av) => {
                              const active = av.id === currentAvatar;
                              return (
                                <button
                                  key={av.id}
                                  type="button"
                                  onClick={() => {
                                    if (!state.agent) {
                                      createAgent(
                                        leaderAgentName,
                                        av.id,
                                        currentGift,
                                        currentSkin
                                      );
                                    } else {
                                      updateAgentAppearance({
                                        avatarId: av.id,
                                      });
                                    }
                                  }}
                                  className={`flex cursor-pointer flex-col items-center rounded-xl border p-2 transition ${
                                    active
                                      ? "border-amber-400 bg-amber-500/20"
                                      : "border-slate-800 bg-slate-950/75 hover:border-slate-600"
                                  }`}
                                >
                                  <HeroPortrait
                                    avatarId={av.id}
                                    size={44}
                                    shape="hex"
                                    active={active}
                                  />
                                  <span className="mt-1 text-[11px] font-black text-white">
                                    {av.name}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Instant Free Leader Equip for All 8 AAA Skins */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                          <div className="mb-2.5 flex items-center justify-between">
                            <span className="text-xs font-black tracking-wider text-amber-300 uppercase">
                              Equipar Qualquer Skin 3D (Acesso Livre do Líder)
                            </span>
                            <Gem className="h-4 w-4 text-cyan-300" />
                          </div>

                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {SKIN_OPTIONS.map((sk) => {
                              const active = currentSkin === sk.id;
                              return (
                                <button
                                  key={sk.id}
                                  type="button"
                                  onClick={() => {
                                    if (!state.agent) {
                                      createAgent(
                                        leaderAgentName,
                                        currentAvatar,
                                        currentGift,
                                        sk.id
                                      );
                                    } else {
                                      unlockAndEquipSkin(sk.id, true);
                                    }
                                  }}
                                  className={`cursor-pointer rounded-xl border bg-gradient-to-br p-2.5 text-left transition ${
                                    sk.gradientClass
                                  } ${
                                    active
                                      ? "border-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.4)]"
                                      : "border-slate-800 hover:border-cyan-400"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-lg">
                                      {sk.badgeEmoji}
                                    </span>
                                    {active && (
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                    )}
                                  </div>
                                  <div
                                    className="mt-1 text-[9px] font-black uppercase"
                                    style={{ color: sk.accentHex }}
                                  >
                                    {sk.rarity}
                                  </div>
                                  <div className="truncate text-[11px] font-black text-white">
                                    {sk.name}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Gift Switcher */}
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {GIFT_OPTIONS.map((g) => (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() =>
                                updateAgentAppearance({ giftId: g.id })
                              }
                              className={`cursor-pointer rounded-xl border p-2 text-left text-[11px] font-black transition ${
                                currentGift === g.id
                                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
                                  : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                              }`}
                            >
                              {g.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: INTERACTIVE CLASSROOM TIMER & FACILITATION CHECKLIST */}
                  {tab === "guide" && (
                    <div className="space-y-5">
                      {/* Built-in Classroom Countdown Timer */}
                      <div className="rounded-2xl border border-amber-400/40 bg-gradient-to-r from-slate-900 via-amber-950/25 to-slate-900 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-black tracking-widest text-amber-300 uppercase">
                              <Timer className="h-4 w-4" />
                              CRONÔMETRO DE DINÂMICA EM SALA
                            </div>
                            <p className="mt-0.5 text-xs text-slate-300">
                              Controle o tempo de cada bloco da aula com aviso
                              sonoro automático ao finalizar!
                            </p>

                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {[
                                { label: "3 min Oração", secs: 180 },
                                { label: "5 min Quebra-Gelo", secs: 300 },
                                { label: "10 min Quiz Tribos", secs: 600 },
                                { label: "15 min Missão 3D", secs: 900 },
                              ].map((preset) => (
                                <button
                                  key={preset.secs}
                                  type="button"
                                  onClick={() => {
                                    playSfx("click");
                                    setTimerRunning(false);
                                    setTimerInitial(preset.secs);
                                    setTimerSeconds(preset.secs);
                                  }}
                                  className="cursor-pointer rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:border-amber-400 hover:text-amber-200"
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="rounded-2xl border border-amber-400/50 bg-slate-950 px-5 py-3 font-mono text-3xl font-black tracking-wider text-amber-300 shadow-inner">
                              {formatTimer(timerSeconds)}
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  playSfx("click");
                                  setTimerRunning((r) => !r);
                                }}
                                className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-black text-slate-950 hover:bg-amber-300"
                              >
                                {timerRunning ? (
                                  <>
                                    <Pause className="h-3.5 w-3.5" /> Pausar
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-3.5 w-3.5" /> Iniciar
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  playSfx("click");
                                  setTimerRunning(false);
                                  setTimerSeconds(timerInitial);
                                }}
                                className="cursor-pointer rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-1.5 text-[11px] font-bold text-slate-300 hover:text-white"
                              >
                                Resetar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Step-by-Step Checklist */}
                      <div className="space-y-3">
                        {[
                          {
                            step: 1,
                            title:
                              "1. Abertura & Escolha da Skin da Turma (5 min)",
                            desc: "Ative o Modo Telão, deixe a turma votar no Campeão (Lucas, Sofia, Davi ou Ester) e escolha uma Skin 3D irada para representar a classe!",
                            border: "border-cyan-500/35 bg-cyan-500/10",
                          },
                          {
                            step: 2,
                            title:
                              "2. Exploração GTA 3D & Votação nos Diálogos (15 min)",
                            desc: "Explore as avenidas, pilote o Esportivo GT ou Moto na Corrida de Checkpoints, ative as 3 Torres de Rádio e façam votação levantando a mão nas opções A, B ou C com o NPC!",
                            border: "border-emerald-500/35 bg-emerald-500/10",
                          },
                          {
                            step: 3,
                            title:
                              "3. Arena de Tribos 4v4 & Desafio na Escola (10 min)",
                            desc: "Divida a sala em até 4 equipes no Quiz Arena de Tribos, premie a equipe com +100 XP no Console Game Master e lancem o Desafio Prático da Semana!",
                            border: "border-amber-500/35 bg-amber-500/10",
                          },
                        ].map((item) => {
                          const done = checkedGuideSteps.includes(item.step);
                          return (
                            <button
                              key={item.step}
                              type="button"
                              onClick={() => {
                                playSfx("click");
                                setCheckedGuideSteps((prev) =>
                                  prev.includes(item.step)
                                    ? prev.filter((s) => s !== item.step)
                                    : [...prev, item.step]
                                );
                              }}
                              className={`flex w-full cursor-pointer items-start gap-3 rounded-2xl border p-4 text-left transition ${item.border} ${
                                done ? "opacity-65" : ""
                              }`}
                            >
                              <CheckCircle2
                                className={`mt-0.5 h-5 w-5 shrink-0 ${
                                  done ? "text-emerald-400" : "text-slate-500"
                                }`}
                              />
                              <div>
                                <h4 className="text-sm font-black text-white uppercase">
                                  {item.title}
                                </h4>
                                <p className="mt-1 text-xs leading-relaxed text-slate-200">
                                  {item.desc}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
