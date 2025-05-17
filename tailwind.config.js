/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B6B', // Vibrant Indian red
        secondary: '#4ECDC4', // Turquoise for balance
        accent: '#FFD166', // Golden yellow
        background: '#F7F7F7',
        text: {
          primary: '#2D3436',
          secondary: '#636E72',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        display: ['var(--font-poppins)'],
      },
    },
  },
  plugins: [],
} 