import Gameboard from './Gameboard';

/**
 * Represents a player in Battleship (human or computer)
 * @param {boolean} isComputer - Whether this is a computer player
 */
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

  // Forwards attack to enemy's gameboard and returns result
  attack(coordinates, enemyGameboard) {
    return enemyGameboard.receiveAttack(coordinates);
  }

  // Helper to get valid adjacent cells (Up, Down, Left, Right)
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

  // Reset AI to initial HUNT mode
  _resetAI() {
    this.aiMode = 'HUNT';
    this.targetQueue = [];
    this.lastHit = null;
    this.hitsInCurrentTarget = [];
  }

  // Update AI state after each attack
  _updateAIState(row, col, result, enemyGameboard) {
    if (result === 'hit') {
      // Switch to TARGET mode if we were in HUNT mode
      if (this.aiMode === 'HUNT') {
        this.aiMode = 'TARGET';
      }

      // Add adjacent cells to queue
      const adjacents = this._getAdjacentCells(row, col, enemyGameboard);
      this._addToQueue(adjacents);

      // Track this hit
      this.hitsInCurrentTarget.push([row, col]);
      this.lastHit = [row, col];
    } else if (result === 'sunk') {
      // Ship sunk - reset AI state, return to HUNT mode
      this._resetAI();
    }
    // Note: Miss case requires no state change
    // - TARGET mode: stay in TARGET, continue with queue
    // - HUNT mode: stay in HUNT (already random)
  }

  // Get next attack coordinates based on current AI mode
  _getNextAttackCoordinates(enemyGameboard) {
    if (this.aiMode === 'HUNT') {
      // Random attack logic
      let row, col;
      let attempts = 0;
      const maxAttempts = 100; // Prevent infinite loop

      do {
        row = Math.floor(Math.random() * 10);
        col = Math.floor(Math.random() * 10);
        attempts++;

        if (attempts > maxAttempts) {
          // Fallback: find any legal attack by brute force
          for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
              if (enemyGameboard.isLegalAttack([r, c])) {
                return [r, c];
              }
            }
          }
          throw new Error('No legal attacks available!');
        }
      } while (!enemyGameboard.isLegalAttack([row, col]));

      return [row, col];
    } else {
      // TARGET mode: attack from queue
      if (this.targetQueue.length === 0) {
        // Queue exhausted - switch back to HUNT mode
        this.aiMode = 'HUNT';
        return this._getNextAttackCoordinates(enemyGameboard);
      }

      const next = this.targetQueue.shift();
      return next;
    }
  }

  /**
   * Executes a computer player's attack using Hunt/Target AI
   * @param {Gameboard} enemyGameboard - The enemy's gameboard to attack
   * @returns {string} Attack result ('hit', 'miss', 'sunk', etc.)
   * @throws {Error} If called on a human player
   */
  makeComputerAttack(enemyGameboard) {
    if (!this.isComputer) {
      throw new Error('Only computer players can make computer attacks');
    }

    // 1. Get next attack coordinates based on AI mode
    const [row, col] = this._getNextAttackCoordinates(enemyGameboard);

    // 2. Execute the attack
    const result = enemyGameboard.receiveAttack([row, col]);

    // 3. Update AI state based on attack result
    this._updateAIState(row, col, result, enemyGameboard);

    // 4. Return the attack result
    return result;
  }
}
