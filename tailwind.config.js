module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: 'var(--brand-ink)',
          slate: 'var(--brand-slate)',
          sand: 'var(--brand-sand)',
          cloud: 'var(--brand-cloud)',
          ember: 'var(--brand-ember)',
          emberDeep: 'var(--brand-ember-deep)',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Manrope', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      boxShadow: {
        halo: '0 18px 36px -16px rgba(15, 23, 42, 0.28)',
      },
    },
  },
  plugins: [],
}
