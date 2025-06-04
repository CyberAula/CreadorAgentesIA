const { text } = require('@fortawesome/fontawesome-svg-core');

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
        //primary original:
      // primary:{
      //     0: ‘#2bc5ae2c’,
      //     10: ‘#2bc5ae80’,
      //     50: ‘#F0FFFD’,
      //     100: ‘#DFF8F4’,
      //     200: ‘#7DE2D4’,
      //     DEFAULT: ‘var(--primary-color)‘,
      //     400: ‘#26AC99’,
      //     500: ‘#1B7A6C’,
      //     600: ‘#0C5046’ ,
      //   },


          primary:{
          0: '#1C7D6F20',
          10: '#2bc5ae80',
          50: '#CDF4EE',
          100: '#9FEADE',
          200: '#3BD3BC',
          DEFAULT: 'var(--primary-color)',
          400: '#156055',
          500: '#0F433B',
          600: '#0B322C' ,
        },
        

      
        white: '#F5F5F5',
        black: '#2C2C2C',
        background: '#DFE2E1',
        backgrounddark: '#1D201F',
        neutral:{
          0: '#2c2c2c2a',
          200: '#DFDFDF',
          300: '#C8C8C8',
          400: '#B2B2B2',
          500: '#9C9C9C',
          600: '#858585',
          700: '#6F6F6F',
          800: '#595959',
          900: '#424242',
        },
        error:{
          0: '#E04E4E2c',
          100: '#E04E4E',
          200: '#B31F1F',
          300: '#A21919',
        },


        header: 'var(--header-color)',
        'myBg':'var(--bg-color)',
        text: {
          DEFAULT:'var(--text-color)',
          inverse: 'var(--text-inverse-color)',
        },
        chatbot: 'var(--chat-bot)',
        modal: 'var(--modal-color)',
        tertiary: 'var(--tertiary-color)',
        luna: 'var(--luna-color)',
      },
    },
  },
  plugins: [],
}

