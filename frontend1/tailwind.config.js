/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0F0D11",
          panel: "#17131B",
          plum: "#1C1421",
          rail: "#241A2C",
        },
        brass: {
          DEFAULT: "#C9A667",
          light: "#E4C98B",
          dim: "#8C7345",
        },
        lilac: "#C9B6E4",
        blush: "#F3C9D7",
        mint: "#B7E0D0",
        parchment: "#EFE7DA",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.35)",
        glow: "0 0 0 1px rgba(201,166,103,0.25), 0 8px 24px rgba(201,166,103,0.08)",
      },
    },
  },
  plugins: [],
};
