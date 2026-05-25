import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PastryPro — Gestión para Reposteras",
    short_name: "PastryPro",
    description: "Calcula el precio real de tus postres, gestiona tu inventario y registra ventas.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#FDF5EC",
    theme_color: "#C43B2A",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
