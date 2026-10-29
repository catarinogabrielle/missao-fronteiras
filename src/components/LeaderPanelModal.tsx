"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpenCheck,
  Lock,
  Monitor,
  PlusCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Unlock,
  X,
} from "lucide-react";
import { DialogueTurn, Mission } from "@/types/game";
import { useGame } from "@/context/GameContext";

interface LeaderPanelModalProps {
  open: boolean;
  onClose: () => void;
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

function splitVerseIntoChunks(verseText: string): string[] {
  const words = verseText
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length <= 5) return words;
  const chunks: string[] = [];
  const step = Math.max(2, Math.ceil(words.length / 6));
  for (let i = 0; i < words.length; i += step) {
    chunks.push(words.slice(i, i + step).join(" "));
  }
  return chunks;
}

export function LeaderPanelModal({ open, onClose }: LeaderPanelModalProps) {
  const {
    state,
    allMissions,
    toggleProjectorMode,
    toggleAllUnlockedByLeader,
    addCustomMission,
    deleteCustomMission,
    resetStudentProgress,
    playSfx,
  } = useGame();

  const [unlockedPin, setUnlockedPin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [tab, setTab] = useState<"controls" | "creator" | "guide">("controls");
  const [confirmReset, setConfirmReset] = useState(false);

  // Custom Mission Form State
  const [title, setTitle] = useState("");
  const [country, setCountry] = useState("");
  const [emoji, setEmoji] = useState("🏫");
  const [npcName, setNpcName] = useState("");
  const [npcAge, setNpcAge] = useState(13);
  const [npcBio, setNpcBio] = useState("");
  const [culturalTip, setCulturalTip] = useState("");
  const [turnsDraft, setTurnsDraft] = useState<CustomTurnDraft[]>(EMPTY_TURNS);
  const [verseRef, setVerseRef] = useState("");
  const [verseText, setVerseText] = useState("");
  const [schoolAction, setSchoolAction] = useState("");

  if (!open) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === "1234") {
      playSfx("success");
      setUnlockedPin(true);
      setPinError(false);
    } else {
      playSfx("error");
      setPinError(true);
    }
  };

  const handleFillPresetExample = () => {
    playSfx("click");
    setTitle("Pátio da Escola Local");
    setCountry("Nossa Cidade");
    setEmoji("🎒");
    setNpcName("Lucas");
    setNpcAge(13);
    setNpcBio(
      "Um aluno novo que acabou de mudar de cidade, fica sempre de fone no canto do recreio e acha que crente é tudo falso."
    );
    setCulturalTip(
      "Na escola, aproximar-se sem julgar, convidar para sentar junto e ser amigo leal fala mais alto do que qualquer discussão."
    );
    setTurnsDraft([
      {
        npcSpeech:
          "Por que você veio puxar assunto comigo? Todo mundo aqui só anda com a própria panelinha.",
        empatheticText:
          "Eu vi que você chegou agora na escola e quis te conhecer de verdade! Quer sentar com a gente no intervalo hoje?",
        timidText: "Ah, o professor pediu pra gente cumprimentar os alunos novos.",
        hastyText:
          "É porque eu sou melhor que os outros e vim te converter agora!",
        feedback:
          "Acolher quem está isolado quebra muros de desconfiança como Jesus fazia!",
      },
      {
        npcSpeech:
          "Na minha antiga escola tinha um pessoal religioso que ria dos outros. Por que você é diferente?",
        empatheticText:
          "Sinto muito que tenham feito isso com você. Jesus nunca tratou ninguém com desprezo — Ele me ensinou a amar cada pessoa como Ele me amou.",
        timidText: "Nem todo mundo é igual, eu tento não rir de ninguém.",
        hastyText:
          "Não critique as pessoas da igreja, você que deve estar exagerando!",
        feedback:
          "Pedir perdão pelas feridas e apontar para o verdadeiro caráter de Jesus cura corações!",
      },
      {
        npcSpeech:
          "Legal conversar com você... o que vocês fazem nesse encontro de adolescentes de sábado?",
        empatheticText:
          "A gente joga, faz amizades sinceras, canta e aprende como Jesus dá sentido e esperança real pra nossa vida. Vamos comigo sábado?",
        timidText: "A gente fica lá na igreja ouvindo umas palestras.",
        hastyText:
          "Você é obrigado a ir sábado senão nunca mais falo com você!",
        feedback:
          "Convite feito com amizade verdadeira e foco em Jesus! Ponte 100% construída!",
      },
    ]);
    setVerseRef("Mateus 5:16");
    setVerseText(
      "Assim resplandeça a vossa luz diante dos homens, para que vejam as vossas boas obras e glorifiquem a vosso Pai."
    );
    setSchoolAction(
      "Convidar um colega novo ou solitário para lanchar ou fazer trabalho em grupo com você nesta semana."
    );
  };

  const handleCreateCustomMission = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `custom-${Date.now()}`;
    const nextOrder = allMissions.length + 1;

    const builtTurns: DialogueTurn[] = turnsDraft.map((td, idx) => ({
      id: `${id}-t${idx + 1}`,
      sceneTitle: `Turno ${idx + 1} • Diálogo na Missão`,
      npcMood: idx === 0 ? "Observando sua atitude" : idx === 1 ? "Abrindo o coração" : "Pronto para dar um passo",
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
          trustDelta: idx === 2 ? 30 : 35,
          xpReward: 55,
          feedback:
            td.feedback.trim() ||
            "Excelente! Você uniu empatia genuína com a verdade de Cristo!",
          bibleRef: verseRef.trim() || "1 Pedro 3:15",
        },
      ],
    }));

    const newMission: Mission = {
      id,
      order: nextOrder,
      isCustom: true,
      title: title.trim(),
      regionName: `${title.trim()} • Missão Local`,
      country: country.trim(),
      coordinatesLabel: "CAMPO PERSONALIZADO",
      mapPosition: {
        x: 22 + ((nextOrder * 13) % 55),
        y: 28 + ((nextOrder * 17) % 45),
      },
      emoji: emoji.trim() || "⛪",
      stampCode: `IGR-${String(nextOrder).padStart(2, "0")}`,
      difficulty: "Especial",
      accentColor: "cyan",
      spiritualChallenge: `Alcançar ${npcName.trim()} com empatia e a Palavra`,
      shortDescription: npcBio.trim(),
      npc: {
        id: `${id}-npc`,
        name: npcName.trim(),
        age: Number(npcAge) || 13,
        role: "Morador / Colega Local",
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
          "Conectar a necessidade real da pessoa com a esperança em Jesus.",
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
        localLanguageName: "Linguagem do Dia a Dia",
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
      rewardXp: 190,
      rewardWisdom: 45,
      medalId: "embaixador_paz",
      medalName: "Missionário Local",
    };

    addCustomMission(newMission);
    setTitle("");
    setCountry("");
    setNpcName("");
    setNpcBio("");
    setCulturalTip("");
    setTurnsDraft(EMPTY_TURNS);
    setVerseRef("");
    setVerseText("");
    setSchoolAction("");
    setTab("controls");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border-2 border-cyan-500/40 bg-slate-900 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            <div>
              <div className="text-[10px] font-extrabold tracking-widest text-cyan-400 uppercase">
                ÁREA RESTRITA • MINISTÉRIO DE JUNIORES & ADOLESCENTES
              </div>
              <h2 className="text-lg font-black text-white sm:text-xl">
                Painel do Professor / Líder da Igreja
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playSfx("click");
              onClose();
            }}
            className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* PIN GATE (`1234`) */}
        {!unlockedPin ? (
          <form onSubmit={handlePinSubmit} className="p-6 text-center sm:p-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-300">
              <Lock className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-white">
              Digite o PIN do Líder
            </h3>
            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
              Acesso exclusivo para professores e líderes configurarem missões e
              o Modo Telão (PIN padrão:{" "}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-cyan-300">
                1234
              </code>
              ).
            </p>

            <div className="mx-auto mt-5 max-w-xs">
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                autoFocus
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="••••"
                className="w-full rounded-2xl border-2 border-slate-700 bg-slate-950 px-4 py-3 text-center font-mono text-2xl font-black tracking-[0.4em] text-white focus:border-cyan-400 focus:outline-none"
              />
              {pinError && (
                <p className="mt-2 text-xs font-bold text-rose-400">
                  PIN incorreto. Use 1234 para acessar.
                </p>
              )}

              <button
                type="submit"
                className="mt-4 w-full rounded-2xl border-b-4 border-cyan-700 bg-cyan-400 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300"
              >
                DESBLOQUEAR PAINEL
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Leader Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-900 px-5 pt-2 sm:px-6">
              <button
                type="button"
                onClick={() => {
                  playSfx("click");
                  setTab("controls");
                }}
                className={`inline-flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-xs font-black sm:text-sm ${
                  tab === "controls"
                    ? "border-amber-400 text-amber-300"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <Monitor className="h-4 w-4" />
                Telão & Sala
              </button>

              <button
                type="button"
                onClick={() => {
                  playSfx("click");
                  setTab("creator");
                }}
                className={`inline-flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-xs font-black sm:text-sm ${
                  tab === "creator"
                    ? "border-emerald-400 text-emerald-300"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <PlusCircle className="h-4 w-4" />
                Criar Missão
              </button>

              <button
                type="button"
                onClick={() => {
                  playSfx("click");
                  setTab("guide");
                }}
                className={`inline-flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-xs font-black sm:text-sm ${
                  tab === "guide"
                    ? "border-cyan-400 text-cyan-300"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <BookOpenCheck className="h-4 w-4" />
                Dinâmica de Aula
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {/* TAB 1: CONTROLS & PROJECTOR MODE */}
              {tab === "controls" && (
                <div className="space-y-4">
                  {/* Modo Telão */}
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-500/35 bg-amber-500/10 p-4">
                    <div>
                      <div className="text-base font-black text-white">
                        📺 Modo Telão (Projetor / TV da Sala)
                      </div>
                      <p className="text-xs text-slate-300">
                        Aumenta automaticamente todas as fontes e espaçamentos
                        para leitura fácil na parede da igreja.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={toggleProjectorMode}
                      className={`rounded-xl px-4 py-2.5 text-xs font-black transition ${
                        state.projectorMode
                          ? "bg-amber-400 text-slate-950"
                          : "border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                      }`}
                    >
                      {state.projectorMode
                        ? "ATIVO (DESATIVAR)"
                        : "ATIVAR MODO TELÃO"}
                    </button>
                  </div>

                  {/* Unlock all 4 regions */}
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                    <div>
                      <div className="text-base font-black text-white">
                        🔓 Liberar Todas as Regiões para Aula Temática
                      </div>
                      <p className="text-xs text-slate-400">
                        Permite que a turma escolha começar por qualquer país
                        (ex: Tóquio ou Moçambique) logo nos primeiros minutos.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={toggleAllUnlockedByLeader}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black transition ${
                        state.allUnlockedByLeader
                          ? "bg-emerald-400 text-slate-950"
                          : "border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                      }`}
                    >
                      <Unlock className="h-3.5 w-3.5" />
                      {state.allUnlockedByLeader
                        ? "TODAS LIBERADAS"
                        : "LIBERAR TODAS"}
                    </button>
                  </div>

                  {/* Custom Missions List */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-black text-white">
                        🗺️ Missões Personalizadas da Igreja (
                        {state.customMissions.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setTab("creator")}
                        className="text-xs font-bold text-emerald-400 underline"
                      >
                        + Nova Missão
                      </button>
                    </div>

                    {state.customMissions.length === 0 ? (
                      <p className="text-xs text-slate-400">
                        Nenhuma missão personalizada criada ainda. Use a aba
                        &ldquo;Criar Missão&rdquo; para adicionar um bairro, escola ou país
                        que sua igreja apoia!
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {state.customMissions.map((cm) => (
                          <div
                            key={cm.id}
                            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5"
                          >
                            <div>
                              <div className="text-xs font-black text-white sm:text-sm">
                                {cm.emoji} {cm.title} ({cm.country})
                              </div>
                              <div className="text-[11px] text-slate-400">
                                NPC: {cm.npc.name} • {cm.decoder.verseReference}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteCustomMission(cm.id)}
                              className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-2 text-rose-300 hover:bg-rose-500/20"
                              title="Excluir missão"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reset Class Progress */}
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-black text-rose-200">
                          🔄 Reiniciar Progresso do Aluno / Turma
                        </div>
                        <p className="text-xs text-rose-200/80">
                          Zera XP, carimbos e avatar para começar com uma nova
                          turma (mantém suas missões personalizadas salvas).
                        </p>
                      </div>
                      {!confirmReset ? (
                        <button
                          type="button"
                          onClick={() => setConfirmReset(true)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-400/50 bg-rose-500/20 px-3.5 py-2 text-xs font-black text-rose-200 hover:bg-rose-500/30"
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
                              onClose();
                            }}
                            className="rounded-xl bg-rose-500 px-3.5 py-2 text-xs font-black text-white"
                          >
                            Confirmar Reset
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmReset(false)}
                            className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CUSTOM MISSION CREATOR */}
              {tab === "creator" && (
                <form onSubmit={handleCreateCustomMission} className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
                    <p className="text-xs text-emerald-100">
                      Crie uma missão sobre o bairro da igreja, a escola dos
                      adolescentes ou um missionário que sua igreja sustenta!
                    </p>
                    <button
                      type="button"
                      onClick={handleFillPresetExample}
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-black text-slate-950 hover:bg-emerald-400"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Preencher Exemplo Rápido
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-1">
                      <label className="mb-1 block text-xs font-bold text-slate-300">
                        Nome do País / Bairro *
                      </label>
                      <input
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: Sertão do Piauí"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-300">
                        Região / País *
                      </label>
                      <input
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Ex: Brasil"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-300">
                        Emoji do Mapa
                      </label>
                      <input
                        maxLength={4}
                        value={emoji}
                        onChange={(e) => setEmoji(e.target.value)}
                        placeholder="🌵"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-bold text-slate-300">
                        Nome do Personagem Local (NPC) *
                      </label>
                      <input
                        required
                        value={npcName}
                        onChange={(e) => setNpcName(e.target.value)}
                        placeholder="Ex: Mateus"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-300">
                        Idade do NPC
                      </label>
                      <input
                        type="number"
                        min={7}
                        max={80}
                        value={npcAge}
                        onChange={(e) => setNpcAge(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-300">
                      História e Dor/Dúvida do NPC *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={npcBio}
                      onChange={(e) => setNpcBio(e.target.value)}
                      placeholder="Conte quem é esse personagem e qual desafio ele enfrenta..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-300">
                      Dica Cultural do Briefing
                    </label>
                    <input
                      value={culturalTip}
                      onChange={(e) => setCulturalTip(e.target.value)}
                      placeholder="O que os alunos devem respeitar e praticar nesse contexto?"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                    />
                  </div>

                  {/* 3 Dialogue Turns */}
                  <div className="space-y-3">
                    {turnsDraft.map((turn, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-slate-800 bg-slate-950/90 p-3.5"
                      >
                        <div className="mb-2 text-xs font-black text-cyan-300 uppercase">
                          Pergunta / Turno de Diálogo {idx + 1}
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
                            placeholder={`O que o NPC pergunta ou diz no Turno ${idx + 1}? *`}
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
                            placeholder="✅ Resposta Empática & Bíblica (Correta) *"
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
                              placeholder="⚠️ Resposta Tímida / Neutra *"
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
                              placeholder="❌ Resposta Precipitada / Sem Empatia *"
                              className="w-full rounded-xl border border-rose-500/30 bg-slate-900 px-3 py-2 text-xs text-rose-100"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Key Verse for Decoder */}
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-300">
                        Referência do Versículo Chave *
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
                        Texto do Versículo (será embaralhado no Mini-Game!) *
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
                      Desafio Prático da Semana (Missão na Escola)
                    </label>
                    <input
                      value={schoolAction}
                      onChange={(e) => setSchoolAction(e.target.value)}
                      placeholder="Ex: Orar por 3 amigos da sala e convidar um para o culto jovem."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 py-3.5 text-sm font-black text-slate-950 hover:bg-emerald-400"
                  >
                    SALVAR MISSÃO NO MAPA GLOBAL (LOCALSTORAGE)
                  </button>
                </form>
              )}

              {/* TAB 3: CLASSROOM FACILITATION GUIDE (PARTE 5) */}
              {tab === "guide" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-cyan-500/35 bg-cyan-500/10 p-4">
                    <h4 className="text-sm font-black text-cyan-300 uppercase">
                      1. Primeiros 10 Minutos • Debate Rápido no Telão
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-slate-200 sm:text-sm">
                      Ative o <strong>Modo Telão</strong>, projete a Base
                      Missionária Ide na TV/parede e deixe a turma votar em qual
                      país visitar primeiro. Leia o Briefing Cultural em voz alta
                      e pergunte: <em>&ldquo;Como nós nos sentiríamos morando ali?&rdquo;</em>
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-4">
                    <h4 className="text-sm font-black text-emerald-300 uppercase">
                      2. Durante a Missão • Votação em Grupo (A, B ou C)
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-slate-200 sm:text-sm">
                      Em cada turno de diálogo com Cauã, Tariq, Hina ou Samora,
                      peça para os juniores/adolescentes levantarem a mão
                      votando na opção <strong>A, B ou C</strong> e explicarem{" "}
                      <em>por que</em> acham que aquela atitude demonstra melhor
                      a graça e a verdade de Jesus!
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 p-4">
                    <h4 className="text-sm font-black text-amber-300 uppercase">
                      3. Encerramento • Desafio de Tribos & Missão na Escola
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-slate-200 sm:text-sm">
                      Feche a aula dividindo a sala em equipes no{" "}
                      <strong>Desafio de Tribos</strong> e desafie cada aluno a
                      cumprir o card de <strong>Missão na Escola</strong>{" "}
                      durante a semana, compartilhando testemunhos no domingo
                      seguinte!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
