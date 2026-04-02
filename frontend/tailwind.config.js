export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        mist: '#f8fafc',
        blush: '#fff7ed',
        coral: '#f97316',
        aqua: '#06b6d4',
        pine: '#0f766e'
      },
      boxShadow: {
        glow: '0 22px 60px rgba(15, 23, 42, 0.12)',
        soft: '0 14px 35px rgba(148, 163, 184, 0.18)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Space Grotesk', 'ui-sans-serif', 'system-ui']
      },
      backgroundImage: {
        hero: 'radial-gradient(circle at top left, rgba(249, 115, 22, 0.22), transparent 28%), radial-gradient(circle at right, rgba(6, 182, 212, 0.18), transparent 24%), linear-gradient(135deg, #f8fafc 0%, #fff7ed 100%)'
      }
    }
  },
  plugins: []
}
