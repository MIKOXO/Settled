/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--bg-base-rgb) / <alpha-value>)',
        surface: 'rgb(var(--bg-surface-rgb) / <alpha-value>)',
        'surface-2': 'rgb(var(--bg-surface-2-rgb) / <alpha-value>)',
        'text-primary': 'rgb(var(--text-primary-rgb) / <alpha-value>)',
        'text-muted': 'rgb(var(--text-muted-rgb) / <alpha-value>)',
        accent: 'rgb(var(--accent-primary-rgb) / <alpha-value>)',
        'accent-secondary': 'rgb(var(--accent-secondary-rgb) / <alpha-value>)',
        border: 'var(--border-default)',
        error: 'rgb(var(--state-error-rgb) / <alpha-value>)',
        success: 'rgb(var(--state-success-rgb) / <alpha-value>)',
      },
      fontFamily: {
        heading: ['Sora', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        btn: '8px',
        card: '16px',
        modal: '22px',
      },
    },
  },
  plugins: [],
};
