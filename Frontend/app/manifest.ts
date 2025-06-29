import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cyber Incident Feed - Indian Cyberspace",
    short_name: "CyberFeed",
    description: "Real-time cyber incident monitoring for Indian cyberspace",
    start_url: "/",
    display: "standalone",
    background_color: "#1e293b",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "View the dashboard",
        url: "/dashboard",
        icons: [{ src: "/icons/dashboard.png", sizes: "192x192" }],
      },
      {
        name: "Incidents",
        short_name: "Incidents",
        description: "View all incidents",
        url: "/incidents",
        icons: [{ src: "/icons/incidents.png", sizes: "192x192" }],
      },
    ],
    orientation: "any",
    categories: ["security", "utilities", "productivity"],
    screenshots: [
      {
        src: "/screenshots/dashboard.png",
        sizes: "1280x720",
        type: "image/png",
        label: "Dashboard",
      },
      {
        src: "/screenshots/incidents.png",
        sizes: "1280x720",
        type: "image/png",
        label: "Incidents",
      },
    ],
  }
}

