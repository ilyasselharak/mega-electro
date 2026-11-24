import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mega Electro — Électroménager au Maroc",
    short_name: "Mega Electro",
    start_url: "/",
    display: "standalone",
    background_color: "#f2f4f8",
    theme_color: "#0b1a3a",
    lang: "fr-MA",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
