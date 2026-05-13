/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        "ink-muted": "var(--ink-muted)",
        "ink-faint": "var(--ink-faint)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        border: "var(--border)",
        accent: "var(--accent)",
        "accent-dk": "var(--accent-dk)",
        "accent-lt": "var(--accent-lt)",
        cyan: "var(--cyan)",
        gold: "var(--gold)",
        success: "var(--success)",
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        display: ["Sora", "Manrope", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Mono", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        lg: "12px",
      },
      boxShadow: {
        soft: "var(--shadow-sm)",
        lift: "var(--shadow)",
        glow: "0 20px 60px rgba(255, 77, 94, .18)",
      },
    },
  },
  plugins: [],
};
