/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#06060F',
        surface: '#0E0E1A',
        'surface-2': '#141428',
        brand: {
          purple: '#8B5CF6',
          'purple-bright': '#A78BFA',
          green: '#10B981',
          cyan: '#06B6D4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float-slow': 'floatSlow 8s ease-in-out infinite',
        'float-slower': 'floatSlow 12s ease-in-out infinite reverse',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'slide-up': 'slideUp 0.4s ease forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'shimmer': 'shimmer 2.5s linear infinite',
        'orbit': 'orbit 4s linear infinite',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-24px) scale(1.03)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.08)' },
        },
        slideUp: {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(18px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(18px) rotate(-360deg)' },
        },
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(139,92,246,0.45), 0 0 60px rgba(139,92,246,0.15)',
        'neon-purple-lg': '0 0 40px rgba(139,92,246,0.55), 0 0 100px rgba(139,92,246,0.2)',
        'neon-cyan': '0 0 20px rgba(6,182,212,0.4), 0 0 60px rgba(6,182,212,0.12)',
        'neon-green': '0 0 20px rgba(16,185,129,0.4), 0 0 60px rgba(16,185,129,0.12)',
        'neon-amber': '0 0 20px rgba(245,158,11,0.4), 0 0 60px rgba(245,158,11,0.12)',
        'glass': '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
        'card': '0 4px 24px rgba(0,0,0,0.3)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.45), 0 0 20px rgba(139,92,246,0.08)',
      },
      backgroundSize: {
        '200%': '200%',
      },
    },
  },
  plugins: [],
}
