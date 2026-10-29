export type SoundEffect =
  | "click"
  | "success"
  | "neutral"
  | "error"
  | "prayer"
  | "word"
  | "stamp"
  | "levelUp"
  | "slash"
  | "hit"
  | "pickup"
  | "dash"
  | "ult"
  | "vehicle";

class ArcadeSoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    startTime: number,
    duration: number,
    type: OscillatorType = "square",
    volume = 0.08,
    endFreq?: number
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (endFreq) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, endFreq),
        startTime + duration
      );
    }

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0008, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  public play(effect: SoundEffect) {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (effect) {
      case "click": {
        this.playTone(660, now, 0.055, "triangle", 0.07, 880);
        break;
      }
      case "word": {
        this.playTone(520, now, 0.05, "square", 0.055, 740);
        break;
      }
      case "slash": {
        this.playTone(480, now, 0.07, "sawtooth", 0.055, 190);
        this.playTone(760, now + 0.02, 0.05, "triangle", 0.045, 320);
        break;
      }
      case "hit": {
        this.playTone(190, now, 0.08, "square", 0.08, 70);
        this.playTone(580, now + 0.03, 0.06, "triangle", 0.05, 880);
        break;
      }
      case "pickup": {
        this.playTone(784, now, 0.06, "sine", 0.08, 987);
        this.playTone(1174.66, now + 0.055, 0.11, "sine", 0.09, 1318.5);
        break;
      }
      case "dash": {
        this.playTone(320, now, 0.12, "sine", 0.08, 960);
        break;
      }
      case "vehicle": {
        this.playTone(110, now, 0.12, "sawtooth", 0.07, 220);
        this.playTone(220, now + 0.1, 0.16, "triangle", 0.07, 340);
        break;
      }
      case "ult": {
        const notes = [261.63, 329.63, 392.0, 523.25, 783.99, 1046.5];
        notes.forEach((n, i) => {
          this.playTone(n, now + i * 0.045, 0.28, "sawtooth", 0.065);
        });
        break;
      }
      case "neutral": {
        this.playTone(440, now, 0.09, "triangle", 0.08);
        this.playTone(523.25, now + 0.08, 0.12, "triangle", 0.08);
        break;
      }
      case "success": {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((n, idx) => {
          this.playTone(n, now + idx * 0.065, 0.14, "square", 0.065);
        });
        break;
      }
      case "error": {
        this.playTone(310, now, 0.12, "sawtooth", 0.06, 240);
        this.playTone(230, now + 0.11, 0.18, "sawtooth", 0.06, 165);
        break;
      }
      case "prayer": {
        const chord = [440, 554.37, 659.25, 880];
        chord.forEach((n, idx) => {
          this.playTone(n, now + idx * 0.07, 0.35, "sine", 0.08);
        });
        break;
      }
      case "stamp": {
        this.playTone(150, now, 0.11, "triangle", 0.15, 55);
        this.playTone(783.99, now + 0.12, 0.1, "square", 0.065);
        this.playTone(1046.5, now + 0.2, 0.22, "square", 0.075);
        break;
      }
      case "levelUp": {
        const melody = [
          { f: 523.25, t: 0, d: 0.1 },
          { f: 659.25, t: 0.1, d: 0.1 },
          { f: 783.99, t: 0.2, d: 0.1 },
          { f: 1046.5, t: 0.3, d: 0.22 },
          { f: 783.99, t: 0.54, d: 0.1 },
          { f: 1046.5, t: 0.65, d: 0.38 },
        ];
        melody.forEach((m) => {
          this.playTone(m.f, now + m.t, m.d, "square", 0.07);
        });
        break;
      }
    }
  }
}

export const soundEngine = new ArcadeSoundEngine();
