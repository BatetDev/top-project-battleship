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
    this.setupMobileTabs();

    // Render empty boards using a temporary game instance
    this.renderEmptyBoards();

    console.log('UIManager: Initialized with empty boards');
  }

  // Store DOM element references for easy access
  setupBoardReferences() {
    // Board containers
    this.humanBoardDesktop = document.getElementById('human-board-desktop');
    this.computerBoardDesktop = document.getElementById(
      'computer-board-desktop'
    );
    this.humanBoardMobile = document.getElementById('human-board-mobile-grid');
    this.computerBoardMobile = document.getElementById(
      'computer-board-mobile-grid'
    );

    // UI elements
    this.gameMessage = document.getElementById('game-status');
    this.newGameBtn = document.getElementById('new-game-btn');

    // Tab elements
    this.tabYourFleet = document.getElementById('tab-your-fleet');
    this.tabEnemyFleet = document.getElementById('tab-enemy-fleet');

    // Critical elements for game function
    if (!this.humanBoardDesktop || !this.computerBoardDesktop) {
      console.error('Missing desktop board containers. Check HTML IDs.');
    }
  }

  setupEventListeners() {
    if (this.newGameBtn) {
      this.newGameBtn.addEventListener('click', () => this.startNewGame());
    }
  }

  setupMobileTabs() {
    // Setup mobile tab switching
    if (this.tabYourFleet && this.tabEnemyFleet) {
      this.tabYourFleet.addEventListener('click', () => {
        this.switchToBoard('human');
      });

      this.tabEnemyFleet.addEventListener('click', () => {
        this.switchToBoard('computer');
      });
    }
  }

  switchToBoard(boardType) {
    const humanBoard = document.getElementById('human-board-mobile');
    const computerBoard = document.getElementById('computer-board-mobile');

    if (boardType === 'human') {
      humanBoard.classList.remove('hidden');
      humanBoard.classList.add('active');
      computerBoard.classList.add('hidden');
      computerBoard.classList.remove('active');

      this.tabYourFleet.classList.add('active');
      this.tabEnemyFleet.classList.remove('active');
    } else {
      humanBoard.classList.add('hidden');
      humanBoard.classList.remove('active');
      computerBoard.classList.remove('hidden');
      computerBoard.classList.add('active');

      this.tabYourFleet.classList.remove('active');
      this.tabEnemyFleet.classList.add('active');
    }
  }

  startNewGame() {
    console.log('Starting new game...');

    // Reset game state
    this.game = new window.Game();
    this.isGameActive = true;
    this.gameOver = false;

    // Always switch to human tab FIRST
    if (window.innerWidth < 768) {
      this.switchToBoard('human');
    }

    // Deploy both fleets
    this.game.placeHumanShips();
    this.game.placeComputerShips();

    // Render boards with ships
    this.renderAllBoards();

    // Update UI state
    this.updateGameMessage('Fleet deployed! Get ready...');

    // Update button text
    if (this.newGameBtn) {
      this.newGameBtn.innerHTML =
        '<i data-lucide="refresh-cw" class="inline-block w-3 h-3 sm:w-4 sm:h-4 mr-1"></i> RESTART';
    }

    // Keep user on their fleet for 2.5 seconds to view deployment
    setTimeout(() => {
      // Switch to enemy tab on mobile for player's turn
      if (window.innerWidth < 768) {
        this.switchToBoard('computer');
      }
      this.updateGameMessage('Battle started! Your turn.');
    }, 2500);
  }

  renderEmptyBoards() {
    // Create a temporary game instance to get empty boards
    const tempGame = new window.Game();

    // Render both boards (they'll be empty by default)
    this.renderBoard('human', tempGame.human.gameboard, true);
    this.renderBoard('computer', tempGame.computer.gameboard, false);

    // Set initial UI state
    this.updateGameMessage('Ready for battle! Click START to deploy fleet.');

    // Set button to initial state
    if (this.newGameBtn) {
      this.newGameBtn.innerHTML =
        '<i data-lucide="play" class="inline-block w-3 h-3 sm:w-4 sm:h-4 mr-1"></i> START';
    }

    // Set initial tab to human board
    this.switchToBoard('human');
  }

  renderAllBoards() {
    // Render human board to both desktop and mobile
    this.renderBoard('human', this.game.human.gameboard, true);

    // Render computer board to both desktop and mobile
    this.renderBoard('computer', this.game.computer.gameboard, false);
  }

  renderBoard(boardType, gameboard, showShips) {
    // Determine which containers to update
    const desktopContainer =
      boardType === 'human'
        ? this.humanBoardDesktop
        : this.computerBoardDesktop;

    const mobileContainer =
      boardType === 'human' ? this.humanBoardMobile : this.computerBoardMobile;

    // Array of containers to render to
    const containers = [];
    if (desktopContainer) containers.push(desktopContainer);
    if (mobileContainer) containers.push(mobileContainer);

    // Precompute attacked cells for O(1) lookup
    const attackedSet = new Set(
      gameboard.attackedCells.map(([r, c]) => `${r},${c}`)
    );

    // Render to each container
    containers.forEach((container) => {
      // Clear the container
      container.innerHTML = '';

      // Create 10×10 grid
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          // Create cell element
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

          // Add click handler for computer board cells
          if (boardType === 'computer' && !attacked) {
            cell.addEventListener('click', (e) => {
              e.stopPropagation();
              if (
                this.isGameActive &&
                !this.game.gameOver &&
                this.game.currentPlayer === this.game.human
              ) {
                this.processHumanAttack(row, col);
              }
            });
          }

          // Add cell to the board
          container.appendChild(cell);
        }
      }
    });

    console.log(
      `Rendered ${boardType} board to ${containers.length} container(s)`
    );
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
    // Step 4: Check if attack was successful
    if (!result.success) {
      console.log('Attack failed:', result.message);
      this.updateGameMessage(`Invalid: ${result.message}`);
      return;
    }
    // Step 5: Update all computer boards to show the attack
    this.renderBoard('computer', this.game.computer.gameboard, false);
    // Step 6: Update game message
    const resultText = result.result ? result.result.toUpperCase() : 'UNKNOWN';
    this.updateGameMessage(`Attack [${row},${col}]: ${resultText}`);
    // Step 7: Check if human won
    if (result.gameOver && result.winner === 'human') {
      console.log('Human won the game!');
      this.updateGameMessage('🎉 VICTORY! All enemy ships sunk!');
      this.isGameActive = false;
      return;
    }

    // Switch to human board BEFORE computer's turn
    if (window.innerWidth < 768) {
      this.switchToBoard('human');
      this.updateGameMessage(
        `Attack [${row},${col}]: ${resultText}. Computer is targeting your fleet...`
      );
    }

    // Step 8: If game continues, trigger computer turn after a short delay
    if (!result.gameOver) {
      // Wait 1.5 seconds, then trigger computer turn
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
    // Step 4: Check if computer turn was successful
    if (!result.success) {
      console.log('Computer turn failed:', result.message);
      this.updateGameMessage(`Computer error: ${result.message}`);
      return;
    }
    // Step 5: Update all human boards to show computer's attack
    this.renderBoard('human', this.game.human.gameboard, true);
    // Step 6: Update game message
    const resultText = result.result ? result.result.toUpperCase() : 'UNKNOWN';
    this.updateGameMessage(`Computer attacked: ${resultText}`);
    // Step 7: Check if computer won
    if (result.gameOver && result.winner === 'computer') {
      console.log('Computer won the game!');
      this.updateGameMessage('💀 DEFEAT! All your ships are sunk!');
      this.isGameActive = false;
      return;
    }

    // Keep player on their board for 1 second to see computer's attack
    setTimeout(() => {
      // Switch to enemy tab on mobile for player's turn
      if (window.innerWidth < 768) {
        this.switchToBoard('computer');
      }
      this.updateGameMessage('Your turn! Attack enemy cells.');
    }, 1000);
  }
}
