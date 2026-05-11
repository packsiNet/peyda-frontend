/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          /* Background layers */
          base:     '#060E1C',
          page:     '#0A1628',
          card:     '#122040',
          elevated: '#1E3A5F',
          /* Text */
          ink:      '#E8F0FE',
          'ink-soft':  '#7BA3D4',
          'ink-mute':  'rgba(123,163,212,0.75)',
          'ink-dim':   'rgba(74,126,188,0.55)',
          /* Accent & status */
          primary: '#1565C0',
          link:    '#4A9EFF',
          success: '#22C55E',
          warning: '#F59E0B',
        },
      },
    },
  },
  plugins: [],
};