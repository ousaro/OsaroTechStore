/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary1: "#15161d",
        primary1light: "#15161d4d",
        primary2: "#d10024",
        primary2dark: "#b20020",
        primary3: "#d31737",
        primary4: "#ffdce5",
        primary5: "#1e1f29",
        primary6: "#e5e6ef",
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
      keyframes: {
        'expand-height': {
          '0%': { height: '0%' },
          '100%': { height: '17rem' }, // Adjust to your desired full height
        },
      },
      animation: {
        'expand-height': 'expand-height 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}
