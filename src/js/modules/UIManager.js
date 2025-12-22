// @ts-nocheck
import { createIcons, icons } from 'lucide';
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
        '<i data-lucide="refresh-cw" class="inline-block w-5 h-5 sm:w-4 sm:h-4 mr-1"></i> RESTART';
      createIcons({ icons }); // Re-initialize icons
    }

    // Keep user on their fleet for 2 seconds to view deployment
    setTimeout(() => {
      // Switch to enemy tab on mobile for player's turn
      if (window.innerWidth < 768) {
        this.switchToBoard('computer');
      }
      this.updateGameMessage('Battle started! Your turn.');
    }, 2000);
  }

  renderEmptyBoards() {
    // Create a temporary game instance to get empty boards
    const tempGame = new window.Game();

    // Render both boards (they'll be empty by default)
    this.renderBoard('human', tempGame.human.gameboard, true);
    this.renderBoard('computer', tempGame.computer.gameboard, false);

    // Set initial UI state
    this.updateGameMessage('Click START to deploy your fleet');

    // Set button to initial state
    if (this.newGameBtn) {
      this.newGameBtn.innerHTML =
        '<i data-lucide="play" class="inline-block w-5 h-5 sm:w-4 sm:h-4 mr-1"></i> START';
      createIcons({ icons }); // Re-initialize icons
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
              const flameSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flame">
  <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/>
</svg>`;

              cell.innerHTML = flameSVG;
            } else {
              cell.className = 'cell cell-hit';
              const xSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x">
  <path d="M18 6 6 18"/>
  <path d="m6 6 12 12"/>
</svg>`;

              cell.innerHTML = xSVG;
            }
          } else if (attacked && !cellContent) {
            // Miss (attacked empty cell)
            cell.className = 'cell cell-miss';
            const dropletSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-droplet">
  <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
</svg>`;

            cell.innerHTML = dropletSVG;
          } else if (!attacked && cellContent && showShips) {
            // Healthy ship (only shown on player's own board)
            cell.className = 'cell cell-ship';
            const anchorSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-anchor">
  <path d="M12 6v16"/>
  <path d="m19 13 2-1a9 9 0 0 1-18 0l2 1"/>
  <path d="M9 11h6"/>
  <circle cx="12" cy="4" r="2"/>
</svg>`;

            cell.innerHTML = anchorSVG;
          } else {
            // Empty or hidden ship
            cell.className = 'cell cell-empty';
            const wavesSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-waves">
    <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
    <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
    <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
  </svg>`;

            cell.innerHTML = wavesSVG;
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
      this.updateGameMessage('Game inactive or over!');
      return;
    }
    // Step 2: Check if it's actually human's turn
    if (this.game.currentPlayer !== this.game.human) {
      this.updateGameMessage('Not your turn!');
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
    this.updateGameMessage(`Your attack: ${resultText}!`);
    // Step 7: Check if human won
    if (result.gameOver && result.winner === 'human') {
      console.log('Human won the game!');
      this.updateGameMessage('VICTORY!');
      this.isGameActive = false;
      return;
    }

    // Step 8: Handle post-attack flow with proper sequencing
    if (!result.gameOver) {
      if (window.innerWidth < 768) {
        // MOBILE: Show result → Switch tab → Wait → Computer attacks
        this.updateGameMessage(`Your attack: ${resultText}`);

        // First delay: let player see their attack result
        setTimeout(() => {
          this.switchToBoard('human');

          // Second delay: let player settle on their board before computer attacks
          setTimeout(() => {
            this.processComputerTurn();
          }, 600); // Adjust this value (300-800ms)
        }, 1000);
      } else {
        // DESKTOP: Simple delay since both boards are visible
        setTimeout(() => {
          this.processComputerTurn();
        }, 1000);
      }
    }
  }

  processComputerTurn() {
    // Step 1: Basic validation
    if (!this.isGameActive || this.game.gameOver) {
      console.log('Computer turn: Game inactive or over');
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
    this.updateGameMessage(`Enemy's attack: ${resultText}`);
    // Step 7: Check if computer won
    if (result.gameOver && result.winner === 'computer') {
      console.log('Computer won the game!');
      this.updateGameMessage('DEFEAT!');
      this.isGameActive = false;
      return;
    }

    // Keep player on their board for 1 second to see computer's attack
    setTimeout(() => {
      // Switch to enemy tab on mobile for player's turn
      if (window.innerWidth < 768) {
        this.switchToBoard('computer');
      }
      this.updateGameMessage('Your turn! Attack enemy cells');
    }, 1000);
  }
}
