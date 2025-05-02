/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'youtube-red': '#FF0000',
        'youtube-black': '#282828',
        'youtube-light-black': '#303030',
        'youtube-gray': '#AAAAAA',
        'youtube-light-gray': '#F9F9F9',
        'dark': '#0f0f0f',
        'border': 'hsl(var(--border))',
        'background': 'hsl(var(--background))',
        'foreground': 'hsl(var(--foreground))',
      },
    },
  },
  plugins: [],
};