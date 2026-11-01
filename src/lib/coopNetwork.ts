"use client";

import type { Peer as PeerType, DataConnection } from "peerjs";

export type CoopRole = "driver" | "guardian";

export interface CoopPlayerInfo {
  name: string;
  role: CoopRole;
  avatarId: string;
}

export type CoopNetworkMessage =
  | {
      type: "HANDSHAKE";
      player: CoopPlayerInfo;
    }
  | {
      type: "HANDSHAKE_ACK";
      player: CoopPlayerInfo;
    }
  | {
      type: "START_MISSION";
      missionId: string;
    }
  | {
      type: "SYNC_POSITION";
      x: number;
      z: number;
      angle: number;
      inVehicle: boolean;
      speed: number;
    }
  | {
      type: "SYNC_CARGO";
      cargoHealth: number;
      suppliesHeld: number;
    }
  | {
      type: "COMBAT_TRIGGER";
      action: string;
    }
  | {
      type: "PING";
      timestamp: number;
    }
  | {
      type: "PONG";
      timestamp: number;
    };

export interface CoopNetworkCallbacks {
  onStatusChange?: (status: "idle" | "connecting" | "waiting" | "connected" | "error", message?: string) => void;
  onPartnerJoined?: (partner: CoopPlayerInfo) => void;
  onPartnerLeft?: () => void;
  onMessage?: (msg: CoopNetworkMessage) => void;
  onPingUpdate?: (pingMs: number) => void;
}

export class CoopNetworkManager {
  private peer: PeerType | null = null;
  private conn: DataConnection | null = null;
  private localChannel: BroadcastChannel | null = null;
  private isHost: boolean = false;
  private roomCode: string = "";
  private myPlayer: CoopPlayerInfo | null = null;
  private partnerPlayer: CoopPlayerInfo | null = null;
  private callbacks: CoopNetworkCallbacks = {};
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(callbacks: CoopNetworkCallbacks = {}) {
    this.callbacks = callbacks;
  }

  public setCallbacks(callbacks: CoopNetworkCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public sanitizeCode(code: string): string {
    return code
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  }

  private getPeerRoomId(code: string): string {
    const clean = this.sanitizeCode(code);
    return `mf3d-room-${clean.toLowerCase()}`;
  }

  /**
   * Host creates a room with the given code (e.g. "IDE-UYJY")
   */
  public async createRoom(
    code: string,
    player: CoopPlayerInfo
  ): Promise<string> {
    this.cleanup();
    this.isHost = true;
    this.roomCode = code;
    this.myPlayer = player;

    const roomId = this.getPeerRoomId(code);
    this.callbacks.onStatusChange?.("connecting", "Registrando sala na nuvem...");

    // Also listen locally for instant 2-tab testing
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.localChannel = new BroadcastChannel(`mf3d_coop_${this.sanitizeCode(code)}`);
      this.localChannel.onmessage = (e) => this.handleIncomingMessage(e.data);
    }

    try {
      const { default: Peer } = await import("peerjs");
      this.peer = new Peer(roomId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
          ],
        },
      });

      return new Promise((resolve, reject) => {
        if (!this.peer) return reject("Falha ao instanciar Peer");

        this.peer.on("open", (id) => {
          this.callbacks.onStatusChange?.(
            "waiting",
            `Sala aberta! Aguardando parceiro no código ${code}...`
          );
          resolve(id);
        });

        this.peer.on("connection", (connection) => {
          this.setupDataConnection(connection);
        });

        this.peer.on("error", (err) => {
          // If ID is already taken or connection error
          if (err.type === "unavailable-id") {
            this.callbacks.onStatusChange?.(
              "error",
              "Este código de sala já está em uso na nuvem. Gere um novo código!"
            );
          } else {
            this.callbacks.onStatusChange?.("error", `Erro de rede: ${err.message}`);
          }
        });
      });
    } catch (e: any) {
      this.callbacks.onStatusChange?.("error", "Não foi possível carregar a biblioteca de rede.");
      throw e;
    }
  }

  /**
   * Guest joins an existing room with the code
   */
  public async joinRoom(
    code: string,
    player: CoopPlayerInfo
  ): Promise<void> {
    this.cleanup();
    this.isHost = false;
    this.roomCode = code;
    this.myPlayer = player;

    const targetRoomId = this.getPeerRoomId(code);
    this.callbacks.onStatusChange?.("connecting", `Buscando sala ${code} na nuvem...`);

    // Listen locally as fallback
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.localChannel = new BroadcastChannel(`mf3d_coop_${this.sanitizeCode(code)}`);
      this.localChannel.onmessage = (e) => this.handleIncomingMessage(e.data);
      // Announce via local channel as fallback
      this.localChannel.postMessage({
        type: "HANDSHAKE",
        player: this.myPlayer,
      });
    }

    try {
      const { default: Peer } = await import("peerjs");
      // Guest gets a random client ID
      this.peer = new Peer({
        debug: 1,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
          ],
        },
      });

      this.peer.on("open", () => {
        if (!this.peer) return;
        const connection = this.peer.connect(targetRoomId, {
          reliable: true,
        });
        this.setupDataConnection(connection);
      });

      this.peer.on("error", (err) => {
        if (err.type === "peer-unavailable") {
          this.callbacks.onStatusChange?.(
            "error",
            `Sala ${code} não encontrada. Verifique se o Host já clicou em "Abrir Sala".`
          );
        } else {
          this.callbacks.onStatusChange?.("error", `Erro de rede: ${err.message}`);
        }
      });
    } catch (e: any) {
      this.callbacks.onStatusChange?.("error", "Erro ao inicializar conexão cliente.");
      throw e;
    }
  }

  private setupDataConnection(connection: DataConnection) {
    this.conn = connection;

    connection.on("open", () => {
      this.callbacks.onStatusChange?.("connected", "Conexão P2P estabelecida!");

      // Send handshake to partner
      if (this.myPlayer) {
        this.sendMessage({
          type: this.isHost ? "HANDSHAKE_ACK" : "HANDSHAKE",
          player: this.myPlayer,
        });
      }

      this.startHeartbeat();
    });

    connection.on("data", (data) => {
      this.handleIncomingMessage(data as CoopNetworkMessage);
    });

    connection.on("close", () => {
      this.callbacks.onPartnerLeft?.();
      this.callbacks.onStatusChange?.("waiting", "Parceiro desconectou da sala.");
      this.stopHeartbeat();
    });

    connection.on("error", (err) => {
      this.callbacks.onStatusChange?.("error", `Erro no túnel P2P: ${err.message}`);
    });
  }

  private handleIncomingMessage(msg: CoopNetworkMessage) {
    if (!msg || typeof msg !== "object") return;

    if (msg.type === "HANDSHAKE" || msg.type === "HANDSHAKE_ACK") {
      this.partnerPlayer = msg.player;
      this.callbacks.onPartnerJoined?.(msg.player);
      this.callbacks.onStatusChange?.("connected", `Conectado com ${msg.player.name}!`);

      // If we received HANDSHAKE as host, reply with HANDSHAKE_ACK
      if (msg.type === "HANDSHAKE" && this.isHost && this.myPlayer) {
        this.sendMessage({
          type: "HANDSHAKE_ACK",
          player: this.myPlayer,
        });
      }
    }

    if (msg.type === "PING") {
      this.sendMessage({
        type: "PONG",
        timestamp: msg.timestamp,
      });
    }

    if (msg.type === "PONG") {
      const ping = Date.now() - msg.timestamp;
      this.callbacks.onPingUpdate?.(ping);
    }

    this.callbacks.onMessage?.(msg);
  }

  public sendMessage(msg: CoopNetworkMessage) {
    // 1. Send via WebRTC DataConnection
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(msg);
      } catch {
        // fallback
      }
    }

    // 2. Also broadcast locally for same-device multi-tab testing
    if (this.localChannel) {
      try {
        this.localChannel.postMessage(msg);
      } catch {
        // ignore
      }
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.sendMessage({
          type: "PING",
          timestamp: Date.now(),
        });
      }
    }, 3000);
  }

  private stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  public isConnected(): boolean {
    return Boolean(this.conn && this.conn.open);
  }

  public getPartner(): CoopPlayerInfo | null {
    return this.partnerPlayer;
  }

  public cleanup() {
    this.stopHeartbeat();
    if (this.conn) {
      try {
        this.conn.close();
      } catch {}
      this.conn = null;
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {}
      this.peer = null;
    }
    if (this.localChannel) {
      try {
        this.localChannel.close();
      } catch {}
      this.localChannel = null;
    }
    this.partnerPlayer = null;
  }
}

// Global active instance for passing between Hub and In-Game Engine
let globalCoopNetwork: CoopNetworkManager | null = null;

export function getGlobalCoopNetwork(): CoopNetworkManager {
  if (!globalCoopNetwork) {
    globalCoopNetwork = new CoopNetworkManager();
  }
  return globalCoopNetwork;
}
