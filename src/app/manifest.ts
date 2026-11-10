import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Missão Fronteiras: O Chamado",
    short_name: "Missão Fronteiras",
    description:
      "Jogo 3D estilo MOBA de Missões, Evangelismo Transcultural e Palavra de Deus para Juniores e Adolescentes.",
    id: "br.org.missoes.fronteiras",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "landscape",
    background_color: "#030712",
    theme_color: "#030712",
    // PWA Launch Handling & Link Capturing (Abre no PWA instalado sem abrir nova aba)
    // @ts-expect-error Extended PWA link capturing property
    handle_links: "preferred",
    launch_handler: {
      client_mode: ["navigate-existing", "auto"],
    },
    protocol_handlers: [
      {
        protocol: "web+missaofronteiras",
        url: "/?target=%s",
      },
    ],
    categories: ["games", "education"],
    lang: "pt-BR",
    icons: [
      {
        src: "/icons/favicon-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
