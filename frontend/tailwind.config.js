/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink:        "#0d0e14",
        "ink-muted":"#5a5c6e",
        "ink-faint":"#9a9cb0",
        surface:    "#ffffff",
        "surface-2":"#f4f5f9",
        "surface-3":"#ecedf3",
        border:     "#e0e1ea",
        accent:     "#d10024",
        "accent-dk":"#a80019",
        "accent-lt":"#ffeaee",
        gold:       "#e6a817",
        success:    "#1a7a4a",
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Mono", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
        lg: "16px",
      },
    },
  },
  plugins: [],
};
