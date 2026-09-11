/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef5ff',
          100: '#d9eaff',
          200: '#bcd9ff',
          300: '#8ebeff',
          400: '#5999ff',
          500: '#2f78ff',
          600: '#0064f0',
          700: '#0050c4',
          800: '#0043a0',
          900: '#003a84',
          950: '#002452',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#ffffff',
          raised: '#ffffff',
          border: '#e8eef7',
        },
        ink: {
          DEFAULT: '#0f172a',
          soft: '#334155',
          muted: '#64748b',
          faint: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0, 100, 240, 0.04), 0 4px 16px rgba(15, 23, 42, 0.04)',
        soft: '0 8px 30px rgba(0, 100, 240, 0.08)',
        float: '0 12px 40px rgba(0, 100, 240, 0.28)',
      },
      borderRadius: {
        card: '16px',
        btn: '14px',
      },
      spacing: {
        'safe-t': 'env(safe-area-inset-top)',
        'safe-b': 'env(safe-area-inset-bottom)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out',
        shimmer: 'shimmer 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
