import type { Config } from "tailwindcss";

/**
 * DondeSalem — identidad gótica / gamer / TCG
 * Morado neón (#8B3DFF), verde neón (#00FFB2), base #0B0B0F
 */
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ds: {
          page: "#0B0B0F",
          "page-warm": "#0e0e14",
          surface: "#14141A",
          elevated: "#1a1a24",
          "elevated-2": "#22222e",
          border: "rgba(139, 61, 255, 0.11)",
          "border-strong": "rgba(139, 61, 255, 0.2)",
          /** Morado principal — CTAs, links activos, foco */
          accent: "#8B3DFF",
          "accent-hover": "#B026FF",
          "accent-muted": "rgba(139, 61, 255, 0.16)",
          "accent-dark": "#5A189A",
          /** Verde neón — precios, stock, highlights (usar con moderación) */
          mint: "#00FFB2",
          "mint-muted": "rgba(0, 255, 178, 0.12)",
          "mint-dim": "#2AF598",
          gold: "#c9a24a",
          "gold-soft": "rgba(201, 162, 74, 0.08)",
          ink: "#EAEAEA",
          muted: "#9CA3AF",
          subtle: "#6b7280",
          /** Rare / holo — alineado al mint TCG */
          holo: "#00FFB2",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-sm": ["2.25rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        display: ["2.75rem", { lineHeight: "1.08", letterSpacing: "-0.025em" }],
        "display-lg": ["3.25rem", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
      },
      boxShadow: {
        "ds-card":
          "0 4px 24px -6px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
        "ds-card-hover":
          "0 16px 48px -12px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(139, 61, 255, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
        "ds-glow": "0 0 80px -24px rgba(139, 61, 255, 0.45)",
        "ds-inner": "inset 0 1px 0 rgba(255, 255, 255, 0.06)",
      },
      backgroundImage: {
        "ds-radial-hero":
          "radial-gradient(ellipse 90% 70% at 50% -30%, rgba(139, 61, 255, 0.2), transparent 55%), radial-gradient(ellipse 60% 50% at 100% 0%, rgba(0, 255, 178, 0.07), transparent 45%)",
        "ds-mesh":
          "linear-gradient(135deg, rgba(26, 26, 36, 0.95) 0%, rgba(11, 11, 15, 0.98) 50%, rgba(20, 20, 26, 0.96) 100%)",
        "ds-gradient-cta": "linear-gradient(135deg, #8B3DFF 0%, #00FFB2 100%)",
      },
      spacing: {
        section: "clamp(3.5rem, 8vw, 6rem)",
      },
      transitionTimingFunction: {
        "ds-out": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
