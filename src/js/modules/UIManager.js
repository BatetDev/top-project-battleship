// @ts-nocheck
/**
 * Manages all UI interactions for the Battleship game
 * @param {Game} game - The game instance to control
 */
export default class UIManager {
  constructor(game) {
    this.game = game; // Game logic instance
    this.isGameActive = false; // Controls UI interactivity

    // Initialize UI components
    this.setupBoardReferences();
    this.setupEventListeners();

    console.log('UIManager: Ready to render boards');
  }

  // Store DOM element references for easy access
  setupBoardReferences() {
    this.humanBoard = document.getElementById('human-board');
    this.computerBoard = document.getElementById('computer-board');
    this.gameMessage = document.getElementById('game-message');
    this.newGameBtn = document.getElementById('new-game-btn');
    this.gameOverModal = document.getElementById('game-over-modal');
    this.gameOverTitle = document.getElementById('game-over-title');
    this.gameOverMessage = document.getElementById('game-over-message');
    this.playAgainBtn = document.getElementById('play-again-btn');

    // Critical elements for game function
    if (!this.humanBoard || !this.computerBoard) {
      console.error('Missing board containers. Check HTML IDs.');
    }
  }

  setupEventListeners() {
    // Setup New Game button
    if (this.newGameBtn) {
      this.newGameBtn.addEventListener('click', () => {
        console.log('DEPLOY FLEET button clicked!');
        this.startGame();
        this.hideGameOverModal();
      });
    } else {
      console.warn('New Game button not found');
    }

    // Setup Play Again button (same functionality)
    if (this.playAgainBtn) {
      this.playAgainBtn.addEventListener('click', () => {
        console.log('PLAY AGAIN button clicked!');
        this.startGame();
        this.hideGameOverModal();
      });
    }

    // Setup computer board for attack clicks
    if (this.computerBoard) {
      this.computerBoard.addEventListener('click', (e) => {
        // Prevent clicks when game inactive or over
        if (!this.isGameActive || this.game.gameOver) return;

        // Get clicked cell
        const cell = e.target;

        // Only handle clicks on unattacked cells
        if (!cell.classList.contains('cell')) return;
        if (
          cell.classList.contains('cell-hit') ||
          cell.classList.contains('cell-miss')
        ) {
          return;
        }

        // Extract coordinates from data attributes
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        // Process the attack
        this.processHumanAttack(row, col);
      });
    }
  }

  // Start the UI game
  startGame() {
    console.log('UIManager: Starting new game');

    // Create fresh game instance using globally available Game class
    this.game = new window.Game();
    this.isGameActive = true;

    // Place ships randomly for both players
    this.game.placeHumanShips();
    this.game.placeComputerShips();

    // Render boards:
    // - Human board: show ships (true)
    // - Computer board: hide ships (false)
    this.renderBoard(this.humanBoard, this.game.human.gameboard, true);
    this.renderBoard(this.computerBoard, this.game.computer.gameboard, false);

    // Update UI message
    this.updateGameMessage('Fleets deployed! Your turn: Attack enemy cells.');

    // Debug logging
    console.log('Human ships placed (randomly)');
    console.log('Computer ships placed (randomly)');
  }

  renderBoard(container, gameboard, showShips) {
    // Clear the board container
    container.innerHTML = '';

    // Precompute attacked cells for O(1) lookup
    const attackedSet = new Set(
      gameboard.attackedCells.map(([r, c]) => `${r},${c}`)
    );

    // Create 10×10 grid (standard Battleship size)
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        // Create cell element with base styling
        const cell = document.createElement('div');
        cell.className = 'cell cell-empty';
        cell.dataset.row = row;
        cell.dataset.col = col;

        // Check cell state from gameboard
        const cellContent = gameboard.board[row][col];
        const attacked = attackedSet.has(`${row},${col}`);

        // Apply visual state based on game data
        if (attacked && cellContent) {
          // Hit on a ship
          const ship = cellContent;
          if (ship.isSunk()) {
            cell.className = 'cell cell-sunk';
            cell.textContent = '💥';
          } else {
            cell.className = 'cell cell-hit';
            cell.textContent = '✖';
          }
        } else if (attacked && !cellContent) {
          // Miss (attacked empty cell)
          cell.className = 'cell cell-miss';
          cell.textContent = '○';
        } else if (!attacked && cellContent && showShips) {
          // Healthy ship (only shown on player's own board)
          cell.className = 'cell cell-ship';
          cell.textContent = '■';
        } else {
          // Empty or hidden ship
          cell.className = 'cell cell-empty';
          cell.textContent = '.';
        }

        // Add cell to the board
        container.appendChild(cell);
      }
    }

    // Debug logging
    console.log(`Rendered ${container.id}`);
  }

  // Update game message display
  updateGameMessage(message) {
    if (this.gameMessage) {
      this.gameMessage.textContent = message;
    }
  }

  // Show/hide game over modal
  showGameOverModal(title, message) {
    if (this.gameOverModal && this.gameOverTitle && this.gameOverMessage) {
      this.gameOverTitle.textContent = title;
      this.gameOverMessage.textContent = message;
      this.gameOverModal.classList.remove('hidden');
    }
  }

  hideGameOverModal() {
    if (this.gameOverModal) {
      this.gameOverModal.classList.add('hidden');
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
      console.log('Human won the game!');
      this.updateGameMessage('🎉 VICTORY! All enemy ships sunk!');
      this.isGameActive = false;
      // Reveal all computer ships at game end
      this.renderBoard(this.computerBoard, this.game.computer.gameboard, true);

      // Show game over modal
      this.showGameOverModal(
        'VICTORY! 🎉',
        'Congratulations! You sank all enemy ships and conquered the skies!'
      );
      return;
    }

    // Step 8: If game continues, trigger computer turn after a short delay
    if (!result.gameOver) {
      // Update message to indicate computer is about to play
      this.updateGameMessage(
        `Your attack [${row},${col}]: ${resultText}. Computer's turn...`
      );

      // Wait 1.5 seconds, then trigger computer turn (for better UX)
      setTimeout(() => {
        this.processComputerTurn();
      }, 1500);
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
      console.log('Computer won the game!');
      this.updateGameMessage('💀 DEFEAT! All your ships are sunk!');
      this.isGameActive = false;

      // Show game over modal
      this.showGameOverModal(
        'DEFEAT! 💀',
        'The enemy fleet has overwhelmed your defenses. All your ships have been sunk!'
      );
      return;
    }

    // Step 8: If game continues, it's now human's turn again
    // The game.computerTurn() method already switched currentPlayer back to human
    this.updateGameMessage('Your turn! Click an enemy cell.');
  }
}
