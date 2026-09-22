/** @type {import('tailwindcss').Config} */
export default {
  content: ['./entrypoints/**/*.{html,ts,tsx}', './src/**/*.{html,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090a0f',
        card: '#12141c',
        'card-border': '#1e2230',
        energy: '#f59e0b', // Amber/Yellow
        water: '#06b6d4',  // Cyan/Water blue
        carbon: '#10b981', // Emerald
        confidence: '#8b5cf6', // Violet
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
