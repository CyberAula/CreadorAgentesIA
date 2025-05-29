/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkmode: 'class', // Enable dark mode support
  theme: {
    extend: {
      colors:{
        'myBg':'var(--color-bg)',
        'myPrimary':'#7899C5',
        'mySecondary':'#A7C7E7',
        
        // Prueba de variable modo dark
        // background: 'var(--color-bg)',
        // primary: 'var(--primary-color)',
        // text: 'var(--text-color)',
        // inputs: 'var(--input-bg)',
      },
    },
  },
  plugins: [],
}

