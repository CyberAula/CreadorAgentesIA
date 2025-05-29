/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors:{
        primary: {
          light: "#2BC5AE", // Azul modo claro
          dark: "#3CD4BE", // Azul modo oscuro
        },
        text: {
          light: "#F5F5F5",
          dark: "#0A0A0A",
        },
        background:{
          light: "#DFE2E1",
          dark: "#1D201F",
        }



        // 'myBg':'#F5F5F5',
        // 'myPrimary':'#7899C5',
        // 'mySecondary':'#A7C7E7',

      },
    },
  },
  plugins: [],
}
