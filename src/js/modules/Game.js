/**
 * Main Game controller for Battleship
 * Manages game flow, turn order, and win conditions
 */

import Player from './Player';
import Ship from './Ship';

export default class Game {
  constructor() {
    // Create players (human vs computer)
    this.human = new Player(false); // false = human player
    this.computer = new Player(true); // true = computer player

    // Set initial game state
    this.currentPlayer = this.human; // Human goes first
    this.gameOver = false;
  }

  /**
   * Creates the standard Battleship fleet
   * @returns {Array<Ship>} Array of 5 ships with lengths [5, 4, 3, 3, 2]
   */
  static createStandardFleet() {
    return [new Ship(5), new Ship(4), new Ship(3), new Ship(3), new Ship(2)];
  }

  // Private helper method for random ship placement
  _placeShipsRandomly(gameboard) {
    // Get the standard fleet of 5 ships
    const fleet = Game.createStandardFleet();

    fleet.forEach((ship) => {
      let placed = false; // Start with 'not placed'

      // Keep trying random positions until we find one that works
      while (!placed) {
        // Randomly choose orientation (50% horizontal, 50% vertical)
        const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';

        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);

        // Try to place the ship using GameBoard.placeShip method
        // Returns true if successful, false if invalid (out of bounds or overlap)
        placed = gameboard.placeShip(ship, [row, col], orientation);
      }
    });
  }

  // Computer ship placement (random)
  placeComputerShips() {
    this._placeShipsRandomly(this.computer.gameboard);
  }

  // Human ship placement (random)
  placeHumanShips() {
    this._placeShipsRandomly(this.human.gameboard);
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

    // Use the human player's attack method on the computer's gameboard
    const result = this.human.attack([row, col], this.computer.gameboard);

    // Check for invalid attacks (out of bounds or already attacked)
    if (result === 'invalid' || result === 'already attacked') {
      return {
        success: false,
        message: `Invalid attack: ${result}`,
      };
    }

    // Check for win
    if (this.computer.gameboard.allShipsSunk()) {
      this.gameOver = true;
      return {
        success: true,
        result,
        gameOver: true,
        winner: 'human',
      };
    }

    // Switch turn
    this.currentPlayer = this.computer;

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

    // Check for win
    if (this.human.gameboard.allShipsSunk()) {
      this.gameOver = true;
      return { success: true, result, gameOver: true, winner: 'computer' };
    }

    // Switch turn
    this.currentPlayer = this.human;

    return { success: true, result, gameOver: false };
  }
}
