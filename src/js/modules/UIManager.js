// @ts-nocheck
import { createIcons, icons } from 'lucide';
import { ICONS } from './icons.js';
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
    // Reset game state
    this.game = new window.Game();
    this.isGameActive = true;
    this.gameOver = false;

    // Always switch to human tab FIRST
    if (window.innerWidth < 1024) {
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
      if (window.innerWidth < 1024) {
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
              cell.innerHTML = ICONS.SUNK;
            } else {
              cell.className = 'cell cell-hit';
              cell.innerHTML = ICONS.HIT;
            }
          } else if (attacked && !cellContent) {
            // Miss (attacked empty cell)
            cell.className = 'cell cell-miss';
            cell.innerHTML = ICONS.MISS;
          } else if (!attacked && cellContent && showShips) {
            // Healthy ship (only shown on player's own board)
            cell.className = 'cell cell-ship';
            cell.innerHTML = ICONS.SHIP;
          } else {
            // Empty or hidden ship
            cell.className = 'cell cell-empty';
            cell.innerHTML = ICONS.EMPTY;
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
  }

  // Update game message display
  updateGameMessage(message) {
    if (this.gameMessage) {
      this.gameMessage.textContent = message;
    }
  }

  _showGameOverEffect(type) {
    const gameStatus = document.getElementById('game-status');
    if (!gameStatus) return;

    // Add icon to message
    const icon = type === 'victory' ? VICTORY_ICON : DEFEAT_ICON;
    gameStatus.innerHTML = `${icon} <span>${type === 'victory' ? 'VICTORY!' : 'DEFEAT!'}</span>`;

    // Add game-over styling
    gameStatus.classList.add('game-over', `game-over-${type}`);

    // Disable all clickable cells
    document.querySelectorAll('.cell').forEach((cell) => {
      cell.classList.add('cell-disabled');
    });
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
      this.updateGameMessage('VICTORY!');
      this._showGameOverEffect('victory');
      this.isGameActive = false;
      return;
    }

    // Step 8: Handle post-attack flow with proper sequencing
    if (!result.gameOver) {
      if (window.innerWidth < 1024) {
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
      return;
    }
    // Step 2: Check if it's actually computer's turn
    if (this.game.currentPlayer !== this.game.computer) {
      return;
    }
    // Step 3: Execute computer turn
    const result = this.game.computerTurn();
    // Step 4: Check if computer turn was successful
    if (!result.success) {
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
      this.updateGameMessage('DEFEAT!');
      this._showGameOverEffect('defeat');
      this.isGameActive = false;
      return;
    }

    // Keep player on their board for 1 second to see computer's attack
    setTimeout(() => {
      // Switch to enemy tab on mobile for player's turn
      if (window.innerWidth < 1024) {
        this.switchToBoard('computer');
      }
      this.updateGameMessage('Your turn! Attack enemy cells');
    }, 1000);
  }
}

const VICTORY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trophy-icon lucide-trophy"><path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/><path d="M18 9h1.5a1 1 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6 9H4.5a1 1 0 0 1 0-5H6"/></svg>`;

const DEFEAT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-skull-icon lucide-skull"><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="12" r="1"/></svg>`;
