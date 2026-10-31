"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Flame,
  Globe,
  Radio,
  Shield,
  Sparkles,
  Swords,
  Truck,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useGame } from "@/context/GameContext";

interface StoryPrologueModalProps {
  open: boolean;
  onClose: () => void;
}

interface StoryChapter {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  verseRef: string;
  verseText: string;
  accentGradient: string;
  borderClass: string;
  icon: React.ReactNode;
  paragraphs: string[];
  bulletPoints: { title: string; desc: string; icon: string }[];
}

const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: "chamado",
    badge: "CAPÍTULO I • O DESPERTAR",
    title: "A Base Missionária Ide",
    subtitle: "Uma luz acesa nas fronteiras mais remotas do mundo",
    verseRef: "Marcos 16:15 & Atos 1:8",
    verseText: "Ide por todo o mundo e pregai o evangelho a toda criatura... sereis minhas testemunhas até aos confins da terra.",
    accentGradient: "from-amber-500 via-orange-500 to-amber-600",
    borderClass: "border-amber-400/50 shadow-[0_0_35px_rgba(245,158,11,0.35)]",
    icon: <Globe className="h-8 w-8 text-amber-300" />,
    paragraphs: [
      "Nas fronteiras mais esquecidas da Terra — entre aldeias isoladas na floresta amazônica, vilarejos nas montanhas e vielas em megalópoles futuristas — muitas comunidades nunca ouviram as Boas Novas da Graça.",
      "Para atender ao chamado do Mestre, foi erguida a Base Missionária Ide: um centro avançado de treinamento, comunhão e logística que envia socorro humanitário e a mensagem da Cruz.",
    ],
    bulletPoints: [
      {
        icon: "🧭",
        title: "12 Fronteiras Globais",
        desc: "Do Brasil a Moçambique, da Janela 10/40 a Tóquio, nenhum povo fica para trás.",
      },
      {
        icon: "🤝",
        title: "Ponte da Fé",
        desc: "Construa confiança genuína com os moradores através de respeito, serviço e diálogo sincero.",
      },
      {
        icon: "📡",
        title: "Torres de Rádio",
        desc: "Ative as antenas de transmissão para irradiar esperança e as Escrituras Sagradas.",
      },
    ],
  },
  {
    id: "campeoes",
    badge: "CAPÍTULO II • OS ENVIADOS",
    title: "Os Quatro Missionários",
    subtitle: "Dons diferentes, um só coração e um mesmo propósito",
    verseRef: "1 Coríntios 12:4",
    verseText: "Há diversidade de dons, mas o Espírito é o mesmo. A manifestação do Espírito é dada a cada um para o que for útil.",
    accentGradient: "from-cyan-500 via-teal-500 to-emerald-600",
    borderClass: "border-cyan-400/50 shadow-[0_0_35px_rgba(34,211,238,0.35)]",
    icon: <Users className="h-8 w-8 text-cyan-300" />,
    paragraphs: [
      "Quatro jovens voluntários disseram 'Eis-me aqui' para desbravar o desconhecido. Cada um carrega uma vocação única e dons espirituais indispensáveis para a sobrevivência e o resgate nas fronteiras.",
    ],
    bulletPoints: [
      {
        icon: "🎒",
        title: "Lucas • Vanguarda & Resgate",
        desc: "Pioneiro de campo e trilhas fluviais. Sempre com mochila pronta, é especialista em exploração prática.",
      },
      {
        icon: "🎨",
        title: "Sofia • Conexão Criativa & Arte",
        desc: "Comunicadora sensível. Conecta corações de diferentes culturas através da música, arte e empatia profunda.",
      },
      {
        icon: "💻",
        title: "Davi • Tech & Decodificação",
        desc: "Prodígio digital. Opera decodificadores de dialetos e links satelitais para quebrar barreiras linguísticas.",
      },
      {
        icon: "👑",
        title: "Ester • Intercessão & Diplomacia",
        desc: "Mulher de oração inabalável. Abre portas com líderes locais e estende um manto de refúgio celestial.",
      },
    ],
  },
  {
    id: "sombras",
    badge: "CAPÍTULO III • O COMBATE",
    title: "A Invasão das Sombras",
    subtitle: "Criaturas do medo e da desesperança tentam apagar a verdade",
    verseRef: "Efésios 6:12",
    verseText: "Porque não temos que lutar contra a carne e o sangue, mas contra os dominadores deste mundo tenebroso.",
    accentGradient: "from-fuchsia-600 via-purple-600 to-rose-700",
    borderClass: "border-fuchsia-400/50 shadow-[0_0_35px_rgba(217,70,239,0.35)]",
    icon: <Swords className="h-8 w-8 text-fuchsia-300" />,
    paragraphs: [
      "Uma escuridão silenciosa começou a se espalhar pelos territórios: as Sombras do Desânimo. Elas roubam a alegria das pessoas, semeiam discórdia e tentam impedir os mensageiros da paz.",
      "Lideradas pelo temível Titã do Abismo, as sombras atacam ativamente em combate! Os lacaios menores empunham foices sombrias e lançam projéteis arcanos, enquanto o Boss golpeia com uma espada colossal.",
    ],
    bulletPoints: [
      {
        icon: "⚠️",
        title: "Círculos Vermelhos de Perigo",
        desc: "Antes de golpear, o inimigo projeta um círculo de telégrafo no chão. Esquive-se imediatamente!",
      },
      {
        icon: "🔮",
        title: "Projéteis Mágicos",
        desc: "Inimigos feiticeiros disparam orbes roxos à distância. Mantenha-se em movimento contínuo.",
      },
      {
        icon: "🛡️",
        title: "Luz Dissipadora",
        desc: "Suas habilidades de luz e a Palavra quebram o poder das trevas e libertam os vilarejos.",
      },
    ],
  },
  {
    id: "garagem",
    badge: "CAPÍTULO IV • LOGÍSTICA TÁTICA",
    title: "A Garagem & Arsenal de Campo",
    subtitle: "Veículos táticos com combustível estratégico e bíblia de bolso",
    verseRef: "Salmos 119:105",
    verseText: "Lâmpada para os meus pés é a tua palavra e luz para o meu caminho.",
    accentGradient: "from-emerald-500 via-teal-500 to-cyan-600",
    borderClass: "border-emerald-400/50 shadow-[0_0_35px_rgba(52,211,153,0.35)]",
    icon: <Truck className="h-8 w-8 text-emerald-300" />,
    paragraphs: [
      "Para cruzar o vasto mundo aberto de 220 metros, você conta com um arsenal tático da Base Ide e uma frota de resgate com recursos limitados que exigem planejamento.",
    ],
    bulletPoints: [
      {
        icon: "🚙",
        title: "Carro SUV Tático (2 unidades)",
        desc: "45 segundos de autonomia por tanque. Robusto, seguro e ideal para longas distâncias.",
      },
      {
        icon: "🏍️",
        title: "Moto Ágil (3 unidades)",
        desc: "30 segundos de autonomia por tanque. Ultra-rápida, perfeita para passar por becos e desvios.",
      },
      {
        icon: "🔄",
        title: "Troca Rápida de Veículo",
        desc: "Você pode alternar entre Carro e Moto direto no HUD de combate quando estiver a pé.",
      },
      {
        icon: "📖",
        title: "Bíblia de Bolso & Tradutor",
        desc: "Acesse o Manual de Campo com o Evangelho em 4 Passos e responda às dúvidas dos moradores.",
      },
    ],
  },
  {
    id: "controles",
    badge: "CAPÍTULO V • MANUAL DE OPERAÇÃO",
    title: "Como Jogar & Sobreviver",
    subtitle: "Cargas de ataque, movimentação inteligente e vitória",
    verseRef: "2 Timóteo 4:7",
    verseText: "Combati o bom combate, acabei a carreira, guardei a fé.",
    accentGradient: "from-amber-400 via-yellow-500 to-orange-600",
    borderClass: "border-amber-300/60 shadow-[0_0_40px_rgba(251,191,36,0.4)]",
    icon: <Zap className="h-8 w-8 text-amber-200" />,
    paragraphs: [
      "Domine os controles no teclado ou toque para cumprir sua missão com excelência e salvar o distrito:",
    ],
    bulletPoints: [
      {
        icon: "⚡",
        title: "6 Cargas de Ataque (Energia)",
        desc: "Cada golpe consome 1 carga. A energia se regenera a cada 1.2s. Não gaste tudo de uma vez!",
      },
      {
        icon: "🎮",
        title: "Controles no Teclado / Toque",
        desc: "Mover: WASD ou Joystick Virtual. Atacar: Espaço / Botão de Ataque. Dash: Shift. Câmera: C.",
      },
      {
        icon: "🤝",
        title: "Resgate de Moradores",
        desc: "Aproxime-se dos cidadãos com o ícone de diálogo (F / Toque) para confortá-los e subir o medidor de Ponte.",
      },
      {
        icon: "🏆",
        title: "Derrote o Titã do Abismo",
        desc: "Reduza a vida do Boss desviando de seus golpes devastadores e liberte o Nexus para concluir a missão!",
      },
    ],
  },
];

export function StoryPrologueModal({ open, onClose }: StoryPrologueModalProps) {
  const { playSfx } = useGame();
  const [chapterIdx, setChapterIdx] = useState(0);

  if (!open) return null;

  const currentChapter = STORY_CHAPTERS[chapterIdx];
  const isFirst = chapterIdx === 0;
  const isLast = chapterIdx === STORY_CHAPTERS.length - 1;

  const handleNext = () => {
    playSfx("click");
    if (isLast) {
      onClose();
    } else {
      setChapterIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    playSfx("click");
    if (!isFirst) {
      setChapterIdx((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    playSfx("levelUp");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-xl select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        className={`relative flex flex-col w-full max-w-2xl max-h-[92vh] rounded-3xl border-2 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 overflow-hidden ${currentChapter.borderClass}`}
      >
        {/* TOP CINEMATIC HEADER */}
        <div className="relative shrink-0 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${currentChapter.accentGradient} text-slate-950 shadow-md`}>
              {currentChapter.icon}
            </div>
            <div>
              <div className="font-mono text-[9px] sm:text-[10px] font-black tracking-widest text-amber-300 uppercase">
                {currentChapter.badge} ({chapterIdx + 1}/{STORY_CHAPTERS.length})
              </div>
              <h2 className="text-sm sm:text-lg font-black text-white uppercase tracking-tight">
                {currentChapter.title}
              </h2>
            </div>
          </div>

          {/* Quick Skip Story Button */}
          <button
            type="button"
            onClick={handleSkip}
            className="flex items-center gap-1.5 rounded-xl border border-amber-400/50 bg-amber-500/15 px-2.5 py-1 text-[10px] sm:text-xs font-black text-amber-300 hover:bg-amber-500/25 transition cursor-pointer shadow-sm"
            title="Pular história e entrar direto no jogo"
          >
            <span>Pular História</span>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* SCROLLABLE CHAPTER CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentChapter.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
              className="space-y-3.5 sm:space-y-4"
            >
              {/* Subtitle & Scripture Quote */}
              <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900/60 to-transparent p-3 sm:p-4">
                <div className="text-xs sm:text-sm font-bold text-amber-200">
                  {currentChapter.subtitle}
                </div>
                <div className="mt-2 flex items-start gap-2 border-t border-amber-400/20 pt-2 font-mono text-[10px] sm:text-xs italic text-slate-300">
                  <span className="font-black text-amber-400 shrink-0">📖 {currentChapter.verseRef}:</span>
                  <span>&ldquo;{currentChapter.verseText}&rdquo;</span>
                </div>
              </div>

              {/* Story Narrative Paragraphs */}
              <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentChapter.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {/* Interactive Feature Bullet Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-1">
                {currentChapter.bulletPoints.map((b, bIdx) => (
                  <div
                    key={bIdx}
                    className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-900/80 p-2.5 sm:p-3 shadow-sm hover:border-slate-700 transition"
                  >
                    <span className="text-xl shrink-0 mt-0.5">{b.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] sm:text-xs font-black text-white uppercase tracking-tight">
                        {b.title}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-slate-400 leading-snug mt-0.5">
                        {b.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* BOTTOM NAVIGATION FOOTER */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5 border-t border-slate-800 bg-slate-950/90">
          {/* Step Dots */}
          <div className="flex items-center gap-1.5">
            {STORY_CHAPTERS.map((ch, idx) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => {
                  playSfx("click");
                  setChapterIdx(idx);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === chapterIdx
                    ? "w-6 bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]"
                    : "w-2 bg-slate-700 hover:bg-slate-500"
                }`}
                title={`Ir para ${ch.badge}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-black text-slate-300 hover:text-white hover:border-slate-600 transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Anterior</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-4 py-1.5 text-xs font-black text-slate-950 shadow-[0_0_16px_rgba(245,158,11,0.5)] hover:brightness-105 active:scale-95 transition cursor-pointer"
            >
              <span>{isLast ? "⚔️ Iniciar Aventura!" : "Próximo"}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
