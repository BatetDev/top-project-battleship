module.exports = {
  content: [
    './src/**/*.{html,js}',
    './src/styles/**/*.css', // Add this
  ],
  theme: {
    extend: {
      fontFamily: {
        exo: ['Exo 2', 'sans-serif'],
        sans: ['Exo 2', 'sans-serif'],
      },
      gridTemplateColumns: {
        10: 'repeat(10, minmax(0, 1fr))',
      },
      colors: {
        'terminal-green': '#00FF00',
        'terminal-green-dim': '#00AA00',
        'terminal-green-very-dim': '#006600',
        'terminal-red': '#FF5555',
        'terminal-red-dim': '#FF2222',
      },
    },
  },
  plugins: [],
};
