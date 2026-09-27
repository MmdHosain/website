import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ariwatch: {
          red: '#c8102e',
          black: '#1a1a1a',
          gray: '#6b7280',
          light: '#fdfcfb',
          cream: '#f9f8f6',
          luxury: '#F3F2ED',
        }
      },
      letterSpacing: {
        widest: '.25em',
      },
      fontFamily: {
        inter: ['var(--font-inter)', 'InterLocal', 'system-ui', 'sans-serif'],
        vazir: ['var(--font-vazir)', 'VazirmatnLocal', 'Tahoma', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      keyframes: {
        progress: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(5deg)' }
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(10px) rotate(-5deg)' }
        },
        'cinematic-enter': {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(15px)', filter: 'blur(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)', filter: 'blur(0)' }
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-in-scale': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      },
      animation: {
        progress: 'progress 6s linear forwards',
        float: 'float 6s ease-in-out infinite',
        'float-reverse': 'float-reverse 7s ease-in-out infinite',
        'cinematic-enter': 'cinematic-enter 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'spin-slow': 'spin-slow 20s linear infinite',
        'fade-in-up': 'fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-scale': 'fade-in-scale 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
};
export default config;
