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

        'white': '#F5F5F5',
        'black': '#2C2C2C',

        'primary': '3CD4BE',
        'primary100': '#DFF8F4',
        'primary200': '#7DE2D4',
        'primary400': '#26AC99',
        'primary500': '#1B7A6C',
        
        'primarygamma': '3CD4BE1A',


        'textcolor': 'var(--color-text)',
        
        'myBg':'var(--color-bg)',
        
        
        'myPrimary':'#7899C5',
        'mySecondary':'#A7C7E7',

        // Prueba de variable modo dark
        background: 'var(--color-bg)',
        
      },
    },
  },
  plugins: [],
}

