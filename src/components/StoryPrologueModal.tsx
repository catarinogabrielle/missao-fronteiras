"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Flame,
  Globe,
  Heart,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Shield,
  SkipForward,
  Sparkles,
  Swords,
  Users,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import { HERO_PORTRAITS, MAP_SPLASHES } from "@/lib/assets";
import { AvatarId } from "@/types/game";
import { useGame } from "@/context/GameContext";

interface StoryPrologueModalProps {
  open: boolean;
  onClose: () => void;
}

interface HeroBio {
  id: AvatarId;
  name: string;
  title: string;
  role: string;
  verseRef: string;
  verseText: string;
  accent: string;
  gradient: string;
  specialty: string;
  gear: string;
}

const HEROES_DATA: HeroBio[] = [
  {
    id: "lucas",
    name: "Lucas",
    title: "O Explorador de Fronteiras",
    role: "Vanguarda, Resgate & Exploração Prática",
    verseRef: "Isaías 41:10",
    verseText: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus.",
    accent: "#34d399",
    gradient: "from-emerald-500 via-teal-500 to-emerald-600",
    specialty: "Velocidade em trilhas fluviais, resgate rápido em selvas e coragem diante do perigo.",
    gear: "Mochila de sobrevivência, bússola de navegação e bota anfíbia.",
  },
  {
    id: "sofia",
    name: "Sofia",
    title: "A Artista da Comunicação",
    role: "Conexão Criativa, Música & Empatia Transcultural",
    verseRef: "Romanos 12:15",
    verseText: "Alegrem-se com os que se alegram; chorem com os que choram.",
    accent: "#22d3ee",
    gradient: "from-cyan-500 via-sky-500 to-blue-600",
    specialty: "Criação de pontes culturais através de murais visuais, música e escuta atenta aos povos isolados.",
    gear: "Fones de estúdio, tablet holográfico e spray de pigmentos naturais.",
  },
  {
    id: "davi",
    name: "Davi",
    title: "O Estrategista Tecnológico",
    role: "Sistemas Digitais, Satélites & Decodificação",
    verseRef: "Daniel 12:3",
    verseText: "Os sábios resplandecerão como o fulgor do firmamento... como as estrelas sempre e eternamente.",
    accent: "#fbbf24",
    gradient: "from-amber-400 via-yellow-500 to-amber-600",
    specialty: "Tradução simultânea de dialetos arcaicos e conexão de satélites para transmissão das Escrituras.",
    gear: "Óculos cibernéticos, decodificador portátil de línguas e link via rádio.",
  },
  {
    id: "ester",
    name: "Ester",
    title: "A Embaixadora da Fé",
    role: "Liderança de Paz, Sabedoria & Intercessão",
    verseRef: "Ester 4:14",
    verseText: "Quem sabe se não foi para um momento como este que você chegou?",
    accent: "#c084fc",
    gradient: "from-purple-500 via-fuchsia-500 to-rose-600",
    specialty: "Diplomacia e oração destemida perante líderes locais, abrindo portas onde tudo parecia bloqueado.",
    gear: "Diadema dourado da coragem, véu de seda de oração e pergaminho da aliança.",
  },
];

export function StoryPrologueModal({ open, onClose }: StoryPrologueModalProps) {
  const { playSfx } = useGame();
  const [currentChapter, setCurrentChapter] = useState(0);
  const [selectedHeroTab, setSelectedHeroTab] = useState<AvatarId>("lucas");
  const [autoPlay, setAutoPlay] = useState(true);
  const [autoPlayProgress, setAutoPlayProgress] = useState(0);

  // Chapter 5 Combat Simulator state
  const [simCharges, setSimCharges] = useState(6);
  const [simDodgeActive, setSimDodgeActive] = useState(false);
  const [simDodgeSuccess, setSimDodgeSuccess] = useState(false);

  const CHAPTER_COUNT = 5;
  const AUTO_PLAY_SECONDS = 9;

  // Auto-play timer loop
  useEffect(() => {
    if (!open || !autoPlay) return;

    const intervalMs = 100;
    const increment = (intervalMs / (AUTO_PLAY_SECONDS * 1000)) * 100;

    const timer = setInterval(() => {
      setAutoPlayProgress((prev) => {
        if (prev >= 100) {
          setCurrentChapter((ch) => {
            if (ch >= CHAPTER_COUNT - 1) {
              setAutoPlay(false);
              return ch;
            }
            playSfx("levelUp");
            return ch + 1;
          });
          return 0;
        }
        return prev + increment;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [open, autoPlay, currentChapter, playSfx]);

  // Recharge simulator attack charges in Chapter 5
  useEffect(() => {
    if (currentChapter !== 4) return;
    if (simCharges >= 6) return;

    const timer = setTimeout(() => {
      setSimCharges((prev) => Math.min(6, prev + 1));
    }, 1200);

    return () => clearTimeout(timer);
  }, [simCharges, currentChapter]);

  // Simulate enemy attack telegraph in Chapter 5
  useEffect(() => {
    if (currentChapter !== 4) return;

    let hitTimer: ReturnType<typeof setTimeout> | null = null;
    const interval = setInterval(() => {
      setSimDodgeActive(true);
      setSimDodgeSuccess(false);

      if (hitTimer) clearTimeout(hitTimer);
      hitTimer = setTimeout(() => {
        setSimDodgeActive(false);
      }, 2600);
    }, 4500);

    return () => {
      clearInterval(interval);
      if (hitTimer) clearTimeout(hitTimer);
    };
  }, [currentChapter]);

  if (!open) return null;

  const handleSimAttack = () => {
    if (simCharges <= 0) {
      playSfx("error");
      return;
    }
    playSfx("slash");
    setSimCharges((prev) => Math.max(0, prev - 1));
  };

  const handleSimDodge = () => {
    if (simDodgeActive) {
      playSfx("dash");
      setSimDodgeSuccess(true);
      setSimDodgeActive(false);
    } else {
      playSfx("dash");
    }
  };

  const handleNext = () => {
    playSfx("click");
    setAutoPlayProgress(0);
    if (currentChapter >= CHAPTER_COUNT - 1) {
      onClose();
    } else {
      setCurrentChapter((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    playSfx("click");
    setAutoPlayProgress(0);
    if (currentChapter > 0) {
      setCurrentChapter((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    playSfx("levelUp");
    onClose();
  };

  const currentHeroData =
    HEROES_DATA.find((h) => h.id === selectedHeroTab) || HEROES_DATA[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-2xl select-none overflow-hidden touch-manipulation">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative flex flex-col w-full max-w-4xl max-h-[94vh] rounded-3xl border-2 border-amber-400/50 bg-slate-950 shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden"
      >
        {/* TOP STORY CUTSCENE PROGRESS BAR (INSTAGRAM/CUTSCENE STYLE) */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center gap-1.5 px-4 pt-2.5">
          {[0, 1, 2, 3, 4].map((stepIdx) => {
            const isPast = stepIdx < currentChapter;
            const isCurrent = stepIdx === currentChapter;
            return (
              <div
                key={stepIdx}
                className="relative h-1.5 flex-1 rounded-full bg-slate-800/80 overflow-hidden"
              >
                {isPast && (
                  <div className="h-full w-full bg-gradient-to-r from-amber-400 to-amber-500" />
                )}
                {isCurrent && (
                  <div
                    style={{ width: `${autoPlay ? autoPlayProgress : 100}%` }}
                    className="h-full bg-gradient-to-r from-cyan-400 via-amber-300 to-amber-500 transition-all duration-100"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* TOP CINEMATIC HEADER BAR */}
        <div className="relative z-20 shrink-0 flex items-center justify-between px-4 pt-5 pb-3 sm:px-6 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 font-mono text-xs font-black">
              {currentChapter + 1}
            </span>
            <div>
              <div className="font-mono text-[9px] sm:text-[10px] font-black tracking-widest text-amber-300 uppercase">
                MISSÃO FRONTEIRAS • O PRÓLOGO
              </div>
              <h2 className="text-xs sm:text-base font-black text-white uppercase tracking-wide">
                {currentChapter === 0 && "1. O Despertar da Base Ide"}
                {currentChapter === 1 && "2. A Chegada dos Quatro Campeões"}
                {currentChapter === 2 && "3. A Ameaça das Sombras & O Titã"}
                {currentChapter === 3 && "4. A Garagem & O Arsenal Sagrado"}
                {currentChapter === 4 && "5. Manual de Combate & Sobrevivência"}
              </h2>
            </div>
          </div>

          {/* Header Controls: Auto-Play Toggle & Skip Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                setAutoPlay((prev) => !prev);
              }}
              className={`flex items-center gap-1 rounded-xl border px-2.5 py-1 text-[10px] font-black uppercase transition cursor-pointer ${
                autoPlay
                  ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-300"
                  : "border-slate-700 bg-slate-900 text-slate-400"
              }`}
              title={autoPlay ? "Pausar reprodução automática" : "Ativar reprodução automática"}
            >
              {autoPlay ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              <span className="hidden sm:inline">{autoPlay ? "Pausar" : "Auto"}</span>
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="flex items-center gap-1.5 rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 px-3 py-1 text-xs font-black text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)] hover:brightness-110 active:scale-95 transition cursor-pointer"
            >
              <span>Pular História</span>
              <SkipForward className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                playSfx("click");
                onClose();
              }}
              className="flex h-7 w-7 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/90 text-slate-400 hover:text-white hover:border-slate-500 transition cursor-pointer"
              title="Fechar história"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* MAIN ANIMATED CHAPTER STAGE */}
        <div className="relative flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 no-scrollbar">
          <AnimatePresence mode="wait">
            {/* =========================================================
                CENA 1: A FUNDAÇÃO DA BASE IDE NAS FRONTEIRAS
               ========================================================= */}
            {currentChapter === 0 && (
              <motion.div
                key="cap-0"
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.35 }}
                className="space-y-4"
              >
                {/* Cinematic Background Canvas with Ken Burns Pan */}
                <div className="relative h-44 sm:h-56 w-full rounded-2xl overflow-hidden border border-amber-400/40 shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <motion.img
                    src={MAP_SPLASHES.amazonia}
                    alt="Fronteiras Globais"
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.08 }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                    className="h-full w-full object-cover filter brightness-50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Overlaid Animated Typography & Scripture Badge */}
                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/60 bg-amber-500/25 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-mono font-black text-amber-200 backdrop-blur-md">
                      <span>📖 ATOS 1:8 & MARCOS 16:15</span>
                    </div>
                    <h3 className="mt-1 text-base sm:text-xl font-black text-white drop-shadow-md">
                      &ldquo;Até aos confins da Terra... Ide e anunciai a Esperança!&rdquo;
                    </h3>
                  </div>
                </div>

                {/* Narrative Lore */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-slate-300">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 sm:p-4 space-y-1">
                    <div className="text-amber-300 font-black text-xs uppercase flex items-center gap-1.5">
                      <Globe className="h-4 w-4" />
                      <span>Territórios Esquecidos</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                      Entre rios bravios na Amazônia, desertos da Janela 10/40 e vielas em Tóquio, milhões nunca ouviram as Boas Novas do Evangelho.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 sm:p-4 space-y-1">
                    <div className="text-cyan-300 font-black text-xs uppercase flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" />
                      <span>O Farol da Base Ide</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                      Erguida como refúgio e centro logístico, a Base Ide prepara missionários com tecnologia, suprimentos humanitários e vigor espiritual.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 sm:p-4 space-y-1">
                    <div className="text-emerald-300 font-black text-xs uppercase flex items-center gap-1.5">
                      <Heart className="h-4 w-4" />
                      <span>A Ponte da Fé</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                      A missão nunca foi forçar ideias, mas construir Pontes de Amizade através de serviço real, escuta sincera e demonstração do amor de Cristo.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* =========================================================
                CENA 2: APRESENTAÇÃO DOS 4 MISSIONÁRIOS
               ========================================================= */}
            {currentChapter === 1 && (
              <motion.div
                key="cap-1"
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.35 }}
                className="space-y-4"
              >
                {/* 4 Interactive Hero Selection Tabs */}
                <div className="grid grid-cols-4 gap-2">
                  {HEROES_DATA.map((hero) => {
                    const active = selectedHeroTab === hero.id;
                    return (
                      <button
                        key={hero.id}
                        type="button"
                        onClick={() => {
                          playSfx("click");
                          setSelectedHeroTab(hero.id);
                        }}
                        className={`flex flex-col items-center p-2 rounded-2xl border-2 transition cursor-pointer ${
                          active
                            ? "border-amber-300 bg-amber-500/20 shadow-[0_0_18px_rgba(245,158,11,0.4)]"
                            : "border-slate-800 bg-slate-900/70 hover:border-slate-700"
                        }`}
                      >
                        <div className="relative h-11 w-11 sm:h-14 sm:w-14 rounded-xl overflow-hidden border border-current">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={HERO_PORTRAITS[hero.id]}
                            alt={hero.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="mt-1 font-black text-xs text-white uppercase">
                          {hero.name}
                        </span>
                        <span
                          style={{ color: hero.accent }}
                          className="text-[8px] sm:text-[9px] font-mono font-bold truncate max-w-[70px]"
                        >
                          {hero.id.toUpperCase()}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Highlighted Champion Spotlight Card */}
                <div className="relative rounded-2xl border-2 border-slate-700 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-4 sm:p-5 overflow-hidden shadow-xl">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    {/* Champion Portrait with Glow Ring */}
                    <div className="relative shrink-0 h-28 w-28 sm:h-36 sm:w-36 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.4)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={HERO_PORTRAITS[currentHeroData.id]}
                        alt={currentHeroData.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 to-transparent p-1.5 text-center">
                        <span className="text-[9px] font-black text-amber-300 uppercase tracking-wider">
                          AGENTE IDE
                        </span>
                      </div>
                    </div>

                    {/* Bio & Verse */}
                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <div>
                        <span
                          style={{ color: currentHeroData.accent }}
                          className="font-mono text-[9px] sm:text-[10px] font-black tracking-widest uppercase"
                        >
                          {currentHeroData.role}
                        </span>
                        <h4 className="text-base sm:text-xl font-black text-white uppercase">
                          {currentHeroData.name} — {currentHeroData.title}
                        </h4>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {currentHeroData.specialty}
                      </p>

                      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-[11px] sm:text-xs">
                        <span className="font-bold text-amber-300">Equipamento de Campo: </span>
                        <span className="text-slate-300">{currentHeroData.gear}</span>
                      </div>

                      <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-2 font-mono text-[10px] sm:text-xs italic text-cyan-200">
                        📖 <span className="font-bold">{currentHeroData.verseRef}:</span> &ldquo;{currentHeroData.verseText}&rdquo;
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* =========================================================
                CENA 3: A INVASÃO DAS SOMBRAS E O TITÃ DO ABISMO
               ========================================================= */}
            {currentChapter === 2 && (
              <motion.div
                key="cap-2"
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.35 }}
                className="space-y-4"
              >
                {/* Menacing Dark Arena Artwork */}
                <div className="relative h-44 sm:h-52 w-full rounded-2xl overflow-hidden border-2 border-fuchsia-500/50 shadow-[0_0_35px_rgba(217,70,239,0.3)] bg-gradient-to-r from-fuchsia-950 via-slate-950 to-purple-950 flex items-center justify-center">
                  <div className="absolute inset-0 bg-radial from-fuchsia-900/30 via-slate-950/80 to-slate-950" />
                  
                  {/* Boss Silhouette Illustration */}
                  <div className="relative text-center p-4 space-y-1 z-10">
                    <span className="text-4xl sm:text-5xl animate-bounce">👑</span>
                    <h3 className="text-lg sm:text-2xl font-black text-fuchsia-200 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(217,70,239,0.8)]">
                      O TITÃ DO ABISMO & AS SOMBRAS
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-snug">
                      Criaturas sombrias armadas com foices e magia escura tentam roubar a fé, espalhar o pânico e aprisionar os moradores no silêncio.
                    </p>
                  </div>
                </div>

                {/* Threat Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-2xl border border-fuchsia-500/30 bg-slate-900/90 p-3 sm:p-4 space-y-1.5">
                    <div className="text-rose-400 font-black flex items-center gap-1.5 text-xs uppercase">
                      <Flame className="h-4 w-4" />
                      <span>Círculos Vermelhos de Perigo</span>
                    </div>
                    <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">
                      Antes de qualquer golpe melee, o chão se acende em vermelho (telégrafo). Saia da área imediatamente com o Dash (`Shift` / botão de esquiva)!
                    </p>
                  </div>

                  <div className="rounded-2xl border border-purple-500/30 bg-slate-900/90 p-3 sm:p-4 space-y-1.5">
                    <div className="text-purple-300 font-black flex items-center gap-1.5 text-xs uppercase">
                      <Sparkles className="h-4 w-4" />
                      <span>Projéteis Arcanos</span>
                    </div>
                    <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">
                      Sombras feiticeiras lançam orbes roxos teleguiados à distância. Fique em movimento constante para não sofrer dano contínuo.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-500/30 bg-slate-900/90 p-3 sm:p-4 space-y-1.5">
                    <div className="text-amber-300 font-black flex items-center gap-1.5 text-xs uppercase">
                      <Swords className="h-4 w-4" />
                      <span>O Espadão do Titã</span>
                    </div>
                    <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">
                      O chefe do distrito possui 2.35x o tamanho de um soldado e desfere ondas de choque. Golpeie em ritmo certo e use seu escudo!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* =========================================================
                CENA 4: A GARAGEM TÁTICA E ARSENAL DE CAMPO
               ========================================================= */}
            {currentChapter === 3 && (
              <motion.div
                key="cap-3"
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.35 }}
                className="space-y-4"
              >
                {/* Vehicles Comparison Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Carro SUV 4x4 */}
                  <div className="rounded-2xl border-2 border-sky-400/50 bg-gradient-to-b from-sky-950/60 via-slate-900 to-slate-950 p-4 space-y-2 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">🚙</span>
                      <span className="rounded-full bg-sky-500/20 border border-sky-400/40 px-2 py-0.5 text-[9px] font-mono font-black text-sky-300">
                        2 UNIDADES POR MISSÃO
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-black text-white uppercase">
                      SUV Tático 4x4 • Autonomia 45s
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Veículo blindado e estável. Possui 45 segundos de autonomia de combustível por unidade. Ideal para cruzar o mapa e transportar suprimentos.
                    </p>
                    <div className="rounded-xl border border-sky-500/30 bg-slate-950/70 p-2 text-[10px] sm:text-[11px] font-mono text-sky-200">
                      ⚡ Turbo Nitro no Shift • Retorno automático quando o tanque esvazia.
                    </div>
                  </div>

                  {/* Moto Ágil */}
                  <div className="rounded-2xl border-2 border-amber-400/50 bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-950 p-4 space-y-2 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">🏍️</span>
                      <span className="rounded-full bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 text-[9px] font-mono font-black text-amber-300">
                        3 UNIDADES POR MISSÃO
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-black text-white uppercase">
                      Moto Tática • Autonomia 30s
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Ultra-veloz e compacta. Possui 30 segundos de combustível por unidade. Perfeita para passar entre vielas estreitas e desviar dos projéteis das sombras.
                    </p>
                    <div className="rounded-xl border border-amber-500/30 bg-slate-950/70 p-2 text-[10px] sm:text-[11px] font-mono text-amber-200">
                      🔄 Botão no HUD: Alterne entre Carro e Moto a qualquer momento a pé!
                    </div>
                  </div>
                </div>

                {/* Pocket Bible Card */}
                <div className="rounded-2xl border border-emerald-400/40 bg-slate-900/90 p-4 flex flex-col sm:flex-row items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 shrink-0">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="text-center sm:text-left space-y-0.5">
                    <h5 className="text-xs sm:text-sm font-black text-white uppercase">
                      A Bíblia de Bolso & Guia Transcultural
                    </h5>
                    <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                      Abra o manual a qualquer momento para consultar o Evangelho em 4 Passos, aprender expressões culturais e responder às dúvidas dos moradores.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* =========================================================
                CENA 5: TUTORIAL INTERATIVO DE COMBATE E SOBREVIVÊNCIA
               ========================================================= */}
            {currentChapter === 4 && (
              <motion.div
                key="cap-4"
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.35 }}
                className="space-y-4"
              >
                {/* Interactive Simulator: Click Attack & Dodge */}
                <div className="rounded-2xl border-2 border-amber-300/60 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-4 sm:p-5 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎮</span>
                      <h4 className="text-xs sm:text-sm font-black text-amber-300 uppercase">
                        Simulador de Mecânicas de Combate (Teste Agora!)
                      </h4>
                    </div>
                    <span className="font-mono text-[10px] font-black text-cyan-300">
                      INTERATIVO
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    {/* Test 1: Attack Charges Simulator */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-center space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-300">Cargas de Energia de Ataque:</span>
                        <span className="font-mono font-black text-amber-300">
                          ⚡ {simCharges}/6
                        </span>
                      </div>

                      {/* 6 Pips */}
                      <div className="flex justify-center gap-1.5 my-1">
                        {[0, 1, 2, 3, 4, 5].map((idx) => (
                          <div
                            key={idx}
                            className={`h-2.5 w-6 rounded-full transition-all ${
                              idx < simCharges
                                ? "bg-amber-400 shadow-[0_0_8px_#f59e0b]"
                                : "bg-slate-800"
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleSimAttack}
                        className={`w-full py-2 px-3 rounded-xl border-2 font-mono text-xs font-black transition cursor-pointer ${
                          simCharges > 0
                            ? "border-rose-400 bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)] active:scale-95"
                            : "border-slate-800 bg-slate-900 text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        {simCharges > 0 ? "⚔️ Desferir Golpe (Clique para Testar)" : "⏳ Recarregando Energia..."}
                      </button>
                      <p className="text-[10px] text-slate-400">
                        Cada golpe consome 1 carga. A energia retorna a cada 1.2s!
                      </p>
                    </div>

                    {/* Test 2: Dodge Warning Circle Simulator */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-center space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-300">Esquiva do Círculo de Perigo:</span>
                        <span
                          className={`font-mono text-[10px] font-black ${
                            simDodgeSuccess
                              ? "text-emerald-400"
                              : simDodgeActive
                                ? "text-rose-400 animate-pulse"
                                : "text-slate-400"
                          }`}
                        >
                          {simDodgeSuccess ? "✓ ESQUIVOU!" : simDodgeActive ? "⚠️ PERIGO!" : "PRONTO"}
                        </span>
                      </div>

                      <div className="relative h-12 flex items-center justify-center">
                        {simDodgeActive && (
                          <motion.div
                            initial={{ scale: 0.3, opacity: 0.9 }}
                            animate={{ scale: 1.2, opacity: 0.3 }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                            className="absolute h-10 w-28 rounded-full border-2 border-rose-500 bg-rose-500/20"
                          />
                        )}
                        <span className="text-xs font-black text-white z-10">
                          {simDodgeActive ? "💥 Inimigo vai atacar!" : "Área segura"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleSimDodge}
                        className="w-full py-2 px-3 rounded-xl border-2 border-emerald-400 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-mono text-xs font-black shadow-[0_0_15px_rgba(52,211,153,0.4)] active:scale-95 transition cursor-pointer"
                      >
                        🏃 Esquivar com Dash (Shift / Botão)
                      </button>
                      <p className="text-[10px] text-slate-400">
                        Saia do círculo vermelho antes do golpe do Boss cair!
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4 Steps to Victory */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-2.5 space-y-1">
                    <span className="text-lg">🧭</span>
                    <div className="font-black text-amber-300 text-[11px] uppercase">1. Explore</div>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      Siga o GPS e explore o mapa aberto de 220m.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-2.5 space-y-1">
                    <span className="text-lg">🤝</span>
                    <div className="font-black text-cyan-300 text-[11px] uppercase">2. Dialogue</div>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      Converse com 6 moradores para subir a barra de Fé.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-2.5 space-y-1">
                    <span className="text-lg">📡</span>
                    <div className="font-black text-emerald-300 text-[11px] uppercase">3. Torres</div>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      Ative as 3 antenas de rádio para irradiar a Palavra.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-2.5 space-y-1">
                    <span className="text-lg">👑</span>
                    <div className="font-black text-fuchsia-300 text-[11px] uppercase">4. Derrote</div>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      Vença o Titã do Abismo e liberte o Nexus Sagrado!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM NAVIGATION FOOTER */}
        <div className="relative z-20 shrink-0 flex items-center justify-between px-4 py-3 sm:px-6 border-t border-slate-800 bg-slate-950/95">
          {/* Chapter Selector Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {[0, 1, 2, 3, 4].map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  playSfx("click");
                  setAutoPlayProgress(0);
                  setCurrentChapter(idx);
                }}
                className={`flex items-center justify-center rounded-xl transition cursor-pointer text-xs font-black ${
                  idx === currentChapter
                    ? "h-8 px-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                    : "h-8 w-8 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {idx === currentChapter ? `Cap. ${idx + 1}` : idx + 1}
              </button>
            ))}
          </div>

          {/* Prev & Next Controls */}
          <div className="flex items-center gap-2">
            {currentChapter > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-black text-slate-300 hover:text-white hover:border-slate-600 transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Anterior</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-4 py-1.5 text-xs font-black text-slate-950 shadow-[0_0_18px_rgba(245,158,11,0.6)] hover:brightness-105 active:scale-95 transition cursor-pointer uppercase tracking-tight"
            >
              <span>{currentChapter === CHAPTER_COUNT - 1 ? "⚔️ Iniciar Aventura!" : "Próximo"}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
