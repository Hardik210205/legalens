/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        sidebar: '#0F1629',
        card: '#111827',
        border: '#1F2937',
        text: {
          primary: '#F9FAFB',
          secondary: '#9CA3AF'
        },
        accent: {
          DEFAULT: '#6366F1',
          soft: 'rgba(99,102,241,0.12)'
        },
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          500: '#6366F1',
          600: '#4F46E5'
        },
        status: {
          open: '#3B82F6',
          closed: '#6B7280',
          pending: '#FACC15'
        }
      }
    }
  },
  plugins: []
};

