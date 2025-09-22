/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Pretendard', 'ui-sans-serif', 'system-ui'],
        body: ['Pretendard', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        ink: '#1b1d21',
        accent: '#2563eb',
        muted: '#64748b'
      }
    }
  },
  plugins: []
};
