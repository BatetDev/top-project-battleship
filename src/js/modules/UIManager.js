export default class UIManager {
  constructor(game) {
    this.game = game; // Will be ConsoleGame instance
    console.log('UIManager initialized');
  }

  // Method to start the UI game
  startGame() {
    console.log('Starting UI game...');
  }

  // Method to render a board
  renderBoard(containerId, showShips) {
    console.log(`Rendering board: ${containerId}, showShips: ${showShips}`);
  }
}
