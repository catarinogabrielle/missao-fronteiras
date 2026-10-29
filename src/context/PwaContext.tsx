"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Download, Share, WifiOff, X } from "lucide-react";
import { soundEngine } from "@/lib/sound";
import { MobaButton } from "@/components/MobaButton";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface PwaContextValue {
  isOnline: boolean;
  offlineReady: boolean;
  isStandalone: boolean;
  canNativePrompt: boolean;
  triggerInstall: () => void;
}

const PwaContext = createContext<PwaContextValue>({
  isOnline: true,
  offlineReady: false,
  isStandalone: false,
  canNativePrompt: false,
  triggerInstall: () => {},
});

function subscribeNetwork(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getNetworkSnapshot() {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

function subscribeStandalone(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(display-mode: standalone)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getStandaloneSnapshot() {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean(nav.standalone)
  );
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const isOnline = useSyncExternalStore(
    subscribeNetwork,
    getNetworkSnapshot,
    () => true
  );
  const isStandalone = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    () => false
  );

  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [offlineReady, setOfflineReady] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  // Register Service Worker & warm runtime chunks for Visit #1 full offline play
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const onSwMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === "OFFLINE_READY") {
        setOfflineReady(true);
      }
    };
    navigator.serviceWorker.addEventListener("message", onSwMessage);

    const warmLoadedResources = async (reg: ServiceWorkerRegistration) => {
      const urls = new Set<string>(["/", "/manifest.webmanifest"]);

      document
        .querySelectorAll<HTMLScriptElement>("script[src]")
        .forEach((el) => {
          if (el.src && el.src.startsWith(window.location.origin)) {
            urls.add(el.src);
          }
        });

      document
        .querySelectorAll<HTMLLinkElement>(
          'link[rel="stylesheet"], link[as="font"], link[rel="icon"]'
        )
        .forEach((el) => {
          if (el.href && el.href.startsWith(window.location.origin)) {
            urls.add(el.href);
          }
        });

      if (typeof performance !== "undefined" && performance.getEntriesByType) {
        performance.getEntriesByType("resource").forEach((entry) => {
          if (
            entry.name.startsWith(window.location.origin) &&
            !entry.name.includes("webpack-hmr") &&
            !entry.name.includes("turbopack-hmr")
          ) {
            urls.add(entry.name);
          }
        });
      }

      const worker = reg.active || reg.waiting || reg.installing;
      if (worker) {
        worker.postMessage({
          type: "CACHE_RUNTIME_URLS",
          urls: Array.from(urls),
        });
      }
    };

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then(async (registration) => {
        const readyReg = await navigator.serviceWorker.ready;
        await warmLoadedResources(readyReg || registration);
        setOfflineReady(true);
      })
      .catch(() => {
        // Ignore SW errors in unsupported environments
      });

    return () => {
      navigator.serviceWorker.removeEventListener("message", onSwMessage);
    };
  }, []);

  // Capture browser native PWA install event
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallGuide(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const triggerInstall = useCallback(async () => {
    soundEngine.play("click");
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        soundEngine.play("levelUp");
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallGuide(true);
    }
  }, [deferredPrompt]);

  return (
    <PwaContext.Provider
      value={{
        isOnline,
        offlineReady,
        isStandalone,
        canNativePrompt: Boolean(deferredPrompt),
        triggerInstall,
      }}
    >
      {/* Floating Offline Status Pill when Internet is Disconnected */}
      {!isOnline && (
        <div className="pointer-events-none fixed top-2 left-1/2 z-[95] -translate-x-1/2">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/70 bg-slate-950/95 px-3.5 py-1 text-[11px] font-black tracking-wider text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)] backdrop-blur">
            <WifiOff className="h-3.5 w-3.5 text-amber-400" />
            MODO OFFLINE ATIVO • JOGO SALVO NO DISPOSITIVO
          </div>
        </div>
      )}

      {children}

      {/* Manual / iOS / Desktop PWA Install Helper Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/88 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="moba-panel-gold moba-clip-panel w-full max-w-md p-6"
          >
            <div className="flex items-start justify-between gap-3 border-b border-amber-500/30 pb-4">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/icon-192.png"
                  alt="Missão Fronteiras"
                  className="h-14 w-14 rounded-2xl border border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
                />
                <div>
                  <div className="text-[10px] font-black tracking-widest text-amber-300 uppercase">
                    INSTALAÇÃO PWA • JOGUE OFFLINE
                  </div>
                  <h3 className="text-lg font-black text-white">
                    Instalar Missão Fronteiras
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowInstallGuide(false)}
                className="rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-slate-300 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs text-slate-200 sm:text-sm">
              <div className="rounded-xl border border-cyan-500/30 bg-slate-950/85 p-3.5">
                <div className="flex items-center gap-1.5 font-black text-cyan-300 uppercase">
                  <Download className="h-4 w-4" />
                  No PC / Android (Chrome ou Edge)
                </div>
                <p className="mt-1 text-xs text-slate-300">
                  Clique no ícone de <strong>Instalar Aplicativo</strong> no
                  canto direito da barra de endereço do navegador (ou no menu{" "}
                  <strong>⋮ → Instalar aplicativo</strong>).
                </p>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-slate-950/85 p-3.5">
                <div className="flex items-center gap-1.5 font-black text-amber-300 uppercase">
                  <Share className="h-4 w-4" />
                  No iPhone / iPad (Safari)
                </div>
                <p className="mt-1 text-xs text-slate-300">
                  Toque no botão <strong>Compartilhar</strong> na barra do
                  Safari e selecione{" "}
                  <strong>&ldquo;Adicionar à Tela de Início&rdquo;</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {offlineReady
                  ? "Todos os mapas 3D, retratos e áudios já estão salvos para jogar sem internet!"
                  : "Sincronizando arquivos para uso offline..."}
              </div>
            </div>

            <MobaButton
              variant="gold"
              size="md"
              shape="hex"
              onClick={() => setShowInstallGuide(false)}
              className="w-full"
            >
              ENTENDIDO
            </MobaButton>
          </motion.div>
        </div>
      )}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  return useContext(PwaContext);
}
