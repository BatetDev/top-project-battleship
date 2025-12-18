import Gameboard from './Gameboard';

export default class Player {
  constructor(isComputer = false) {
    this.isComputer = isComputer;
    this.gameboard = new Gameboard();

    // AI state
    if (this.isComputer) {
      this.aiMode = 'HUNT'; // 'HUNT'(random) or 'TARGET'(adjacent cells)
      this.targetQueue = []; // BFS queue of [row, col] to attack next
      this.lastHit = null; // [row, col] of last successful hit
      this.hitsInCurrentTarget = []; // Array of hits for current targeted ship
    }
  }

  // Helper to get valid adjacent cells (N, S, E, W)
  _getAdjacentCells(row, col, gameboard) {
    const adjacent = [];
    const directions = [
      [-1, 0], // Up
      [1, 0], // Down
      [0, -1], // Left
      [0, 1], // Right
    ];

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;

      // Check legality (bounds and if already attacked)
      if (gameboard.isLegalAttack([newRow, newCol])) {
        adjacent.push([newRow, newCol]);
      }
    }

    return adjacent;
  }

  // Helper to add unique cells to queue (no duplicates)
  _addToQueue(cells) {
    for (const cell of cells) {
      // Check if already in queue
      const alreadyInQueue = this.targetQueue.some(
        ([r, c]) => r === cell[0] && c === cell[1]
      );

      if (!alreadyInQueue) {
        this.targetQueue.push(cell);
      }
    }
  }

  // Forwards attack to enemy's gameboard and returns result
  attack(coordinates, enemyGameboard) {
    return enemyGameboard.receiveAttack(coordinates);
  }

  // Returns a random legal attack on the enemy gameboard
  makeRandomAttack(enemyGameboard) {
    if (!this.isComputer) {
      throw new Error('Only computer players can make random attacks');
    }

    let row, col;

    do {
      row = Math.floor(Math.random() * 10);
      col = Math.floor(Math.random() * 10);
    } while (!enemyGameboard.isLegalAttack([row, col]));

    return enemyGameboard.receiveAttack([row, col]);
  }
}
