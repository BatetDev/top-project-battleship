import Player from './Player';
import Ship from './Ship';

export default class ConsoleGame {
  constructor() {
    // Create two players: one human, one computer
    this.human = new Player(false); // false = not a computer
    this.computer = new Player(true); // true = is a computer

    // Human goes first in Battleship
    this.currentPlayer = this.human;

    // Game starts as not over
    this.gameOver = false;
  }

  // Helper to create standard fleet
  static createStandardFleet() {
    return [
      new Ship(5), // Royal Dreadnaught
      new Ship(4), // Ironclad Zeppelin
      new Ship(3), // Patrol Cruiser
      new Ship(3), // Scout Corvette
      new Ship(2), // Interceptor Gyro
    ];
  }

  // Random ship placement for computer
  placeComputerShips() {
    // Get the standard fleet of 5 ships
    const fleet = ConsoleGame.createStandardFleet();

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
        // Returns true if successful. false if invalid (out of bound or overlap)
        placed = this.computer.gameboard.placeShip(
          ship,
          [row, col],
          orientation
        );
      }
      // When the while loop ends, the ship has been placed
    });

    console.log('Computer ships placed');
  }

  // Ship placement for human (random too for now)
  placeHumanShips() {
    // get the standard fleet of 5 ships
    const fleet = ConsoleGame.createStandardFleet();

    // For each ship in the fleet
    fleet.forEach((ship) => {
      let placed = false; // Start with 'not placed'

      // Keep trying random positions until we find one that works
      while (!placed) {
        // Randomly choose orientation
        const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';

        // Random coordinates
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);

        //  Try to place the ship on the HUMAN's gameboard
        placed = this.human.gameboard.placeShip(ship, [row, col], orientation);
      }
      // Ship placed successfully
    });

    console.log('Human ships placed"');
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

    // Display updated enemy board to show where the attack landed
    console.log('\n=== YOUR ATTACK RESULT ===');
    console.log('ENEMY BOARD (updated):');
    this.displayBoard(this.computer.gameboard, false);

    // Display result message with special handling for 'sunk'
    if (result === 'sunk') {
      console.log(`🎯 Attack at [${row}, ${col}]: SUNK! You sank a ship!`);
    } else {
      console.log(`Attack at [${row}, ${col}]: ${result.toUpperCase()}`);
    }

    // Check if the computer has lost (all ships sunk)
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

    // If game continues, switch turn to computer
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
    if (this.gameOver || this.currentPlayer !== this.computer) {
      return { success: false, message: "Not computer's turn or game over" };
    }

    // Computer makes a random legal attack
    const result = this.computer.makeRandomAttack(this.human.gameboard);

    // Display only the human's board (the one that was attacked)
    console.log("\n=== COMPUTER'S ATTACK ===");
    console.log('YOUR BOARD (updated):');
    this.displayBoard(this.human.gameboard, true);

    // Display result message
    if (result === 'sunk') {
      console.log(`💥 Computer SUNK your ship!`);
    } else {
      console.log(`Computer: ${result.toUpperCase()}`);
    }

    // Check if human lost
    if (this.human.gameboard.allShipsSunk()) {
      this.gameOver = true;
      console.log('\n💀 === GAME OVER! Computer wins! ===');
      console.log('All your ships are sunk!');
      return { success: true, result, gameOver: true, winner: 'computer' };
    }

    // Switch back to human turn
    this.currentPlayer = this.human;
    console.log('\n=== Your turn! ===');
    console.log('Attack with: game.humanTurn(row, col)');
    return { success: true, result, gameOver: false };
  }

  // Simple console display (for debugging)
  displayBoard(board, showShips = false) {
    console.log('  0 1 2 3 4 5 6 7 8 9');

    for (let row = 0; row < 10; row++) {
      let rowStr = `${row}|`;

      for (let col = 0; col < 10; col++) {
        const cell = board.board[row][col];
        const attacked = board.attackedCells.some(
          ([r, c]) => r === row && c === col
        );

        if (cell instanceof Ship && attacked) {
          rowStr += 'X ';
        } else if (cell instanceof Ship && showShips) {
          rowStr += 'S ';
        } else if (!cell && attacked) {
          rowStr += 'O ';
        } else {
          rowStr += '. ';
        }
      }

      console.log(rowStr);
    }
  }

  // Start a console-based game
  startConsoleGame() {
    console.log('=== BATTLESHIP CONSOLE GAME ===');

    // Place ships for both players
    this.placeHumanShips();
    this.placeComputerShips();

    // Display initial boards
    console.log('\n=== YOUR BOARD (shows your ships) ===');
    this.displayBoard(this.human.gameboard, true);

    console.log('\n=== ENEMY BOARD (attack here) ===');
    this.displayBoard(this.computer.gameboard, false);

    // Game instructions
    console.log('\n=== GAME STARTED! ===');
    console.log('Human goes first. Use game.humanTurn(row, col) to attack.');
    console.log('Example: game.humanTurn(0, 0)');
    console.log('After your turn, the computer will attack automatically.');
    console.log('Call game.computerTurn() to let the computer play its turn.');
  }
}
