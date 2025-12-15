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

    if (this.computerBoard) {
      this.computerBoard.addEventListener('click', (e) => {
        if (!this.isGameActive || this.game.gameOver) return;
        const cell = e.target;
        if (!cell.classList.contains('cell')) return;
        if (
          cell.classList.contains('cell-hit') ||
          cell.classList.contains('cell-miss')
        )
          return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        this.processHumanAttack(row, col);
      });
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
          const ship = cellContent;
          if (ship.isSunk()) {
            cell.className = 'cell cell-sunk';
            cell.textContent = '💥';
          } else {
            cell.className = 'cell cell-hit';
            cell.textContent = '✖';
          }
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

      console.log(`Rendered ${container.id} with gameboard data`);
    }

    console.log(`Rendered ${container.id} with 100 cells`);
  }

  // Update game message display
  updateGameMessage(message) {
    if (this.gameMessage) {
      this.gameMessage.textContent = message;
    }
  }

  processHumanAttack(row, col) {
    // Step 1: Basic validation
    if (!this.isGameActive || this.game.gameOver) {
      this.updateGameMessage('Game is not active or has ended!');
      return;
    }

    // Step 2: Check if it's actually human's turn
    if (this.game.currentPlayer !== this.game.human) {
      this.updateGameMessage("Not your turn! Wait for computer's move.");
      return;
    }

    // Step 3: Execute human turn
    const result = this.game.humanTurn(row, col);

    // Step 4: Check if attack was succesful
    if (!result.success) {
      console.log('Attack failed:', result.message);
      this.updateGameMessage(`Invalid: ${result.message}`);
      return;
    }

    // Step 5: Update computer board to show the attack
    this.renderBoard(this.computerBoard, this.game.computer.gameboard, false);

    // Step 6: Update game message
    const resultText = result.result ? result.result.toUpperCase() : 'UNKNOWN';
    this.updateGameMessage(`Your attack [${row},${col}]: ${resultText}`);

    // Step 7: Check if human won
    if (result.gameOver && result.winner === 'human') {
      this.updateGameMessage(`🎉 VICTORY! All enemy ships sunk!`);
      this.isGameActive = false;
      // Reveal all computer ships at game end
      this.renderBoard(this.computerBoard, this.game.computer.gameboard, true);
      return;
    }

    // Step 8: If game continues, trigger computer turn after a short delay
    if (!result.gameOver) {
      // Update message to indicate computer is about to play
      this.updateGameMessage(
        `Your attack [${row},${col}]: ${resultText}. Computer's turn...`
      );

      // Wait 1 second, then trigger computer turn (for better UX)
      setTimeout(() => {
        this.processComputerTurn();
      }, 1000); // 1 sec delay
    }
  }

  processComputerTurn() {
    // Step 1: Basic validation
    if (!this.isGameActive || this.game.gameOver) {
      console.log('Computer turn: Game is not active or has ended');
      return;
    }

    // Step 2: Check if it's actually computer's turn
    if (this.game.currentPlayer !== this.game.computer) {
      console.log("Computer turn: Not computer's turn");
      return;
    }

    // Step 3: Execute computer turn
    const result = this.game.computerTurn();

    console.log('Computer turn result:', result);

    // Step 4: Check if computer turn was succesful
    if (!result.success) {
      console.log('Computer turn failed:', result.message);
      this.updateGameMessage(`Computer error: ${result.message}`);
      return;
    }

    // Step 5: Update human board to show computer's attack
    this.renderBoard(this.humanBoard, this.game.human.gameboard, true);

    // Step 6: Update game message
    const resultText = result.result ? result.result.toUpperCase() : 'UNKNOWN';
    this.updateGameMessage(`Computer attacked: ${resultText}`);

    // Step 7: Check if computer won
    if (result.gameOver && result.winner === 'computer') {
      this.updateGameMessage('💀 DEFEAT! All your ships are sunk!');
      this.isGameActive = false;
      return;
    }

    // Step 8: If game continues, it's now human's turn again
    // The game.computerTurn() method already switched currentPlayer back to human
    this.updateGameMessage('Your turn! Click an enemy cell.');
  }
}
