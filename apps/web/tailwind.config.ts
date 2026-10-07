import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#060911',
        foreground: '#f8fafc',
        navy: {
          950: '#030508',
          900: '#060911',
          850: '#0a0f1d',
          800: '#0f172a',
          700: '#1e293b',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          glow: '#00f0ff',
        },
        electric: {
          blue: '#3b82f6',
          indigo: '#6366f1',
          violet: '#8b5cf6',
          magenta: '#d946ef',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.25)',
        'glow-blue': '0 0 25px -4px rgba(59, 130, 246, 0.3)',
        'glow-violet': '0 0 25px -4px rgba(139, 92, 246, 0.25)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
    },
  },
  plugins: [],
};

export default config;
