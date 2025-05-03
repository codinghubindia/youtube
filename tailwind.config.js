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
        // Learning feature colors
        'learning-primary': '#4F46E5', // Indigo-600
        'learning-secondary': '#8B5CF6', // Violet-500
        'learning-accent': '#3B82F6', // Blue-500
        'learning-success': '#10B981', // Emerald-500
        'learning-highlight': '#6366F1', // Indigo-500
        'learning-surface': '#F3F4F6', // Gray-100
        'learning-surface-dark': '#1F2937', // Gray-800
      },
      backgroundImage: {
        'learning-gradient': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'learning-gradient-dark': 'linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-in-out forwards',
        'progressBar': 'progressBar 2.5s ease-in-out infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slideInRight': 'slideInRight 0.3s ease-out forwards',
        'slideInLeft': 'slideInLeft 0.3s ease-out forwards',
        'slideOutRight': 'slideOutRight 0.3s ease-in forwards',
        'slideOutLeft': 'slideOutLeft 0.3s ease-in forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        progressBar: {
          '0%': { width: '0%' },
          '50%': { width: '70%' },
          '100%': { width: '100%' }
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 }
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 }
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 }
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)', opacity: 1 },
          '100%': { transform: 'translateX(100%)', opacity: 0 }
        },
        slideOutLeft: {
          '0%': { transform: 'translateX(0)', opacity: 1 },
          '100%': { transform: 'translateX(-100%)', opacity: 0 }
        }
      }
    },
  },
  plugins: [],
};