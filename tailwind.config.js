module.exports = {
  content: [
    './src/**/*.{html,js}',
    './src/styles/**/*.css', // Add this
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        display: ['"Press Start 2P"', 'monospace'],
        serif: ['"Press Start 2P"', 'monospace'],
      },
      gridTemplateColumns: {
        10: 'repeat(10, minmax(0, 1fr))',
      },
      colors: {
        'terminal-green': '#00FF00',
        'terminal-green-dim': '#00AA00',
        'terminal-amber': '#FF9900',
        'grid-color': '#333333',
        'ship-color': '#00AAFF',
        'hit-color': '#FF0000',
        'miss-color': '#666666',
      },
      animation: {
        scanline: 'scanline 10s linear infinite',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
