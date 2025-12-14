export default class UIManager {
  constructor(game) {
    this.game = game;
    this.setupBoardReferences();
    console.log('UIManager: Ready to render boards');
  }

  // Get references to DOM elements
  setupBoardReferences() {
    this.humanBoard = document.getElementById('human-board');
    this.computerBoard = document.getElementById('computer-board');
    this.gameMessage = document.getElementById('game-message');
    this.newGameBtn = document.getElementById('new-game-btn');

    if (!this.humanBoard || !this.computerBoard) {
      console.error('Could not find board containers! Check HTML ids.');
    }
  }

  // Start the UI game
  startGame() {
    console.log('UIManager: Starting new game');
    this.renderInitialBoards();
  }

  // Render empty boards with grid cells
  renderInitialBoards() {
    this.renderBoard(this.humanBoard, true); // Human board shows ships
    this.renderBoard(this.computerBoard, false); // Computer board hides ships

    this.updateGameMessage('Click "Start New Game" to deploy fleets!');
  }

  // Render a single 10×10 board
  renderBoard(container, showShips) {
    container.innerHTML = ''; // Clear existing content

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const cell = document.createElement('div');
        cell.className = 'cell cell-empty';
        cell.dataset.row = row;
        cell.dataset.col = col;

        // Add a dot to indicate empty cell
        cell.textContent = '·';

        container.appendChild(cell);
      }
    }

    console.log(`Rendered ${container.id} with 100 cells`);
  }

  // Update game message display
  updateGameMessage(message) {
    if (this.gameMessage) {
      this.gameMessage.textContent = message;
    }
  }
}
