export default class UIManager {
  constructor(game) {
    this.game = game;
    this.isGameActive = false;
    this.setupBoardReferences();
    this.setupEventListeners();
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

  setupEventListeners() {
    // Add click listener to the New Game button
    if (this.newGameBtn) {
      this.newGameBtn.addEventListener('click', () => {
        console.log('DEPLOY FLEET button clicked!');
        this.startGame();
      });
    } else {
      console.log('New game button not found!');
    }
  }

  // Start the UI game
  startGame() {
    console.log('UIManager: Starting new game');

    // Reset game state
    this.game = new window.Game(); // Create a fresh game instance
    this.isGameActive = true;

    // Place ships for both players
    this.game.placeHumanShips();
    this.game.placeComputerShips();

    // Render boards with ships (human) and without (computer)
    this.renderBoard(this.humanBoard, this.game.human.gameboard, true);
    this.renderBoard(this.computerBoard, this.game.computer.gameboard, false);

    // Update game message
    this.updateGameMessage('Fleets deployed! Your turn: Attack enemy cells.');

    // Log for debugging
    console.log('Human ships placed (randomly)');
    console.log('Computer ships placed (randomly)');
  }

  // Render empty boards with grid cells
  renderInitialBoards() {
    this.renderBoard(this.humanBoard, this.game.human.gameboard, true); // Human board shows ships
    this.renderBoard(this.computerBoard, this.game.computer.gameboard, false); // Computer board hides ships

    this.updateGameMessage('Click "Start New Game" to deploy fleets!');
  }

  // Render a single 10×10 board
  renderBoard(container, gameboard, showShips) {
    container.innerHTML = ''; // Clear existing content

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const cell = document.createElement('div');
        cell.className = 'cell cell-empty';
        cell.dataset.row = row.toString();
        cell.dataset.col = col.toString();

        // Get the cell content from gameboard
        const cellContent = gameboard.board[row][col];
        const attacked = gameboard.attackedCells.some(
          ([r, c]) => r === row && c === col
        );

        // Determine the cell state based on gameboard data
        if (attacked && cellContent) {
          // Hit a ship
          cell.className = 'cell cell-hit';
          cell.textContent = '✖';
        } else if (attacked && !cellContent) {
          // Miss
          cell.className = 'cell cell-miss';
          cell.textContent = '○';
        } else if (!attacked && cellContent && showShips) {
          // Ship (only show if showShips is true)
          cell.className = 'cell cell-ship';
          cell.textContent = '■';
        } else {
          // Empty cell or hidden ship
          cell.className = 'cell cell-empty';
          cell.textContent = '.';
        }

        container.appendChild(cell);
      }

      console.log('Rendered ${container.id} with gameboard data');
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
