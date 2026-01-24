import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Dynamic color classes for ResearchTabs component
    // Green (CBD)
    'border-green-600', 'text-green-700', 'bg-green-50', 'text-green-600',
    'bg-green-600', 'hover:bg-green-700', 'bg-green-100', 'text-green-800',
    'text-green-700',

    // Blue (Cannabis)
    'border-blue-600', 'text-blue-700', 'bg-blue-50', 'text-blue-600',
    'bg-blue-600', 'hover:bg-blue-700', 'bg-blue-100', 'text-blue-800',

    // Purple (Medical Cannabis)
    'border-purple-600', 'text-purple-700', 'bg-purple-50', 'text-purple-600',
    'bg-purple-600', 'hover:bg-purple-700', 'bg-purple-100', 'text-purple-800',

    // Common hover and active states
    'border-transparent', 'hover:text-gray-700', 'hover:border-gray-300',
    'text-gray-400', 'text-gray-500',

    // Cannabinoid type gradients (dynamically constructed from data)
    'from-green-500', 'to-emerald-600',   // major
    'from-blue-500', 'to-indigo-600',     // minor
    'from-orange-500', 'to-amber-600',    // acidic
    'from-purple-500', 'to-violet-600',   // synthetic
    'from-slate-500', 'to-gray-600',      // rare
    'bg-gradient-to-r', 'bg-gradient-to-br',

    // Evidence strength meter (condition pages)
    'text-emerald-400', 'text-green-400', 'text-lime-400', 'text-amber-400', 'text-gray-400',
    'from-emerald-400', 'to-emerald-500', 'from-green-400', 'to-green-500',
    'from-lime-400', 'to-lime-500', 'from-amber-400', 'to-amber-500',
    'from-gray-400', 'to-gray-500',
  ],
  theme: {
    extend: {
      colors: {
        // CBD/wellness-inspired colour palette
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-display)', 'Georgia', 'serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'shimmer': 'shimmer 2s infinite linear',
        'gradient-shift': 'gradientShift 8s ease-in-out infinite',
        'count-up': 'countUp 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '75ch',
            color: 'inherit',
            a: {
              color: '#16a34a',
              textDecoration: 'underline',
              '&:hover': {
                color: '#15803d',
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
