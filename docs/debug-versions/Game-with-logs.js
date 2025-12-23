/**
 * Main Game controller for Battleship
 * Manages game flow, turn order, and win conditions
 */

import Player from './Player';
import Ship from './Ship';

export default class Game {
  constructor() {
    // Create players (human vs computer)
    this.human = new Player(false); // Human player
    this.computer = new Player(true); // Computer player

    // Set initial game state
    this.currentPlayer = this.human; // Human goes first
    this.gameOver = false;
  }

  // Helper to create standard fleet
  static createStandardFleet() {
    return [new Ship(5), new Ship(4), new Ship(3), new Ship(3), new Ship(2)];
  }

  // Private helper method for random ship placement
  _placeShipsRandomly(gameboard) {
    // Get the standard fleet of 5 ships
    const fleet = Game.createStandardFleet();

    // For each ship in the fleet...
    fleet.forEach((ship) => {
      let placed = false; // Start with 'not placed'

      // Keep trying random positions until we find one that works
      while (!placed) {
        // Randomly choose orientation (50% horizontal, 50% vertical)
        const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';

        // Random coordinates
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);

        // Try to place the ship using GameBoard.placeShip method
        // Returns true if successful. false if invalid (out of bounds or overlap)
        placed = gameboard.placeShip(ship, [row, col], orientation);
      }
      // When the while loop ends, the ship has been placed
    });
  }

  // Computer ship placement (random)
  placeComputerShips() {
    this._placeShipsRandomly(this.computer.gameboard);
    console.log('Computer ships placed');
  }

  // Human ship placement (random)
  placeHumanShips() {
    this._placeShipsRandomly(this.human.gameboard);
    console.log('Human ships placed');
  }

  // Human turn
  humanTurn(row, col) {
    // Check if it's actually the human's turn and game isn't over
    if (this.gameOver || this.currentPlayer !== this.human) {
      return {
        success: false,
        message: 'Not your turn or game over',
      };
    }

    // Show BOTH boards before the attack (strategic view)
    console.log('\n=== YOUR TURN ===');
    console.log('YOUR BOARD (defense):');
    this.displayBoard(this.human.gameboard, true);
    console.log('\nENEMY BOARD (attack here):');
    this.displayBoard(this.computer.gameboard, false);

    // Use the human player's attack method on the computer's gameboard
    const result = this.human.attack([row, col], this.computer.gameboard);

    // Check for invalid attacks (out of bounds or already attacked)
    if (result === 'invalid' || result === 'already attacked') {
      return {
        success: false,
        message: `Invalid attack: ${result}`,
      };
    }

    // Log for console version
    console.log('\n=== YOUR ATTACK RESULT ===');
    console.log('ENEMY BOARD (updated):');
    this.displayBoard(this.computer.gameboard, false);

    if (result === 'sunk') {
      console.log(`🎯 Attack at [${row}, ${col}]: SUNK! You sank a ship!`);
    } else {
      console.log(`Attack at [${row}, ${col}]: ${result.toUpperCase()}`);
    }

    // Check for win
    if (this.computer.gameboard.allShipsSunk()) {
      this.gameOver = true;
      console.log('\n🎉 === GAME OVER! You win! All enemy ships sunk! ===');
      console.log('FINAL BOARDS:');
      console.log('\nYOUR BOARD:');
      this.displayBoard(this.human.gameboard, true);
      console.log('\nENEMY BOARD (revealed):');
      this.displayBoard(this.computer.gameboard, true); // Show ships at end
      return {
        success: true,
        result,
        gameOver: true,
        winner: 'human',
      };
    }

    // Switch turn
    this.currentPlayer = this.computer;
    console.log("\n=== Computer's turn next ===");
    console.log('Call: game.computerTurn()');

    return {
      success: true,
      result,
      gameOver: false,
    };
  }

  // Computer turn - automated
  computerTurn() {
    // Validation
    if (this.gameOver || this.currentPlayer !== this.computer) {
      return { success: false, message: "Not computer's turn or game over" };
    }

    // Execute attack
    const result = this.computer.makeComputerAttack(this.human.gameboard);

    // Log for console version
    console.log("\n=== COMPUTER'S ATTACK ===");
    console.log('YOUR BOARD (updated):');
    this.displayBoard(this.human.gameboard, true);

    if (result === 'sunk') {
      console.log(`💥 Computer SUNK your ship!`);
    } else {
      console.log(`Computer: ${result.toUpperCase()}`);
    }

    // Check for win
    if (this.human.gameboard.allShipsSunk()) {
      this.gameOver = true;
      console.log('\n💀 === GAME OVER! Computer wins! ===');
      console.log('All your ships are sunk!');
      return { success: true, result, gameOver: true, winner: 'computer' };
    }

    // Switch turn
    this.currentPlayer = this.human;
    console.log('\n=== Your turn! ===');
    console.log('Attack with: game.humanTurn(row, col)');

    return { success: true, result, gameOver: false };
  }

  // Console visualization for debugging
  displayBoard(board, showShips = false) {
    console.log('  0 1 2 3 4 5 6 7 8 9'); // Column headers (0-9)

    for (let row = 0; row < 10; row++) {
      let rowStr = `${row}|`; // Row number

      for (let col = 0; col < 10; col++) {
        const cell = board.board[row][col];
        const attacked = board.attackedCells.some(
          ([r, c]) => r === row && c === col
        );

        // Determine cell symbol
        if (cell instanceof Ship && attacked) {
          rowStr += 'X '; // Hit
        } else if (cell instanceof Ship && showShips) {
          rowStr += 'S '; // Visible ship
        } else if (!cell && attacked) {
          rowStr += 'O '; // Miss
        } else {
          rowStr += '. '; // Unknown/Empty
        }
      }

      console.log(rowStr);
    }
  }

  // Starts a console-based Battleship game for debugging
  startConsoleGame() {
    // Title
    console.log('=== BATTLESHIP CONSOLE GAME ===');

    // Setup
    this.placeHumanShips();
    this.placeComputerShips();

    // Initial board display
    console.log('\n=== YOUR BOARD (shows your ships) ===');
    this.displayBoard(this.human.gameboard, true);

    console.log('\n=== ENEMY BOARD (attack here) ===');
    this.displayBoard(this.computer.gameboard, false);

    // Instructions
    console.log('\n=== GAME STARTED! ===');
    console.log('Human goes first. Use game.humanTurn(row, col) to attack.');
    console.log('Example: game.humanTurn(0, 0)');
    console.log('After your turn, the computer will attack automatically.');
    console.log('Call game.computerTurn() to let the computer play its turn.');
  }
}
