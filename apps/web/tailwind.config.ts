/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B0D0C',
        surface: {
          DEFAULT: '#111513',
          2: '#171B19',
          3: '#1E2421',
        },
        border: {
          DEFAULT: '#29302C',
          subtle: '#1F2421',
          strong: '#3A443F',
        },
        mineral: {
          primary: '#A8D5BA',
          strong: '#6FB58A',
          dark: '#284D39',
          muted: '#3D5A47',
        },
        amber: {
          accent: '#D8B878',
          dark: '#4A3B1C',
        },
        content: {
          primary: '#F1F3F1',
          secondary: '#B0B8B2',
          muted: '#8D9690',
          faint: '#4E5752',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
};
