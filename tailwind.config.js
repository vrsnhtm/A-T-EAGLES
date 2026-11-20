/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand palette: deep navy + gold accent.
        navy: {
          DEFAULT: "#0B2545",
          light: "#13315C",
          soft: "#1B3B6F",
        },
        gold: {
          DEFAULT: "#C9A227",
          light: "#E3C55C",
          dark: "#A8861B",
        },
        mist: "#F5F7FA",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11, 37, 69, 0.04), 0 12px 32px -12px rgba(11, 37, 69, 0.18)",
        "card-hover": "0 2px 4px rgba(11, 37, 69, 0.06), 0 24px 48px -20px rgba(11, 37, 69, 0.28)",
        banner: "0 24px 60px -24px rgba(11, 37, 69, 0.45)",
      },
      maxWidth: {
        content: "1180px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};
