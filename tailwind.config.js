module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        serif: ['Cinzel', 'serif'],
      },
      gridTemplateColumns: {
        10: 'repeat(10, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
};
