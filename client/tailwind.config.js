/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        'surface-2': 'var(--bg-surface-2)',
        'text-primary': 'var(--text-primary)',
        'text-muted': 'var(--text-muted)',
        accent: 'var(--accent-primary)',
        'accent-secondary': 'var(--accent-secondary)',
        border: 'var(--border-default)',
        error: 'var(--state-error)',
        success: 'var(--state-success)',
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
