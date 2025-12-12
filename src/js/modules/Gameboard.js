import Ship from './Ship';

export default class Gameboard {
  constructor() {
    this.board = Array(10) // Create array with 10 empty slots
      .fill(null) // Fill all 10 slots with null
      .map(() => Array(10).fill(null)); // Replace each null with NEW array of 10 nulls
    this.missedAttacks = [];
    this.attackedCells = [];
    this.ships = [];
  }

  // Helper method to check if coordinates are within bounds
  _isWithinBounds(row, col) {
    return row >= 0 && row < 10 && col >= 0 && col < 10;
  }

  // Helper that returns all coordinates a ship would occupy
  _getShipCoordinates(row, col, orientation, length) {
    const coordinates = [];

    if (orientation === 'horizontal') {
      for (let i = 0; i < length; i++) {
        coordinates.push([row, col + i]);
      }
    } else if (orientation === 'vertical') {
      for (let i = 0; i < length; i++) {
        coordinates.push([row + i, col]);
      }
    }

    return coordinates;
  }

  // Helper method to check if ship can be placed (bounds + overlap
  _canPlaceShip(row, col, orientation, length) {
    const coordinates = this._getShipCoordinates(row, col, orientation, length);

    // Check each coordinate
    for (const [r, c] of coordinates) {
      // Check if within bounds
      if (!this._isWithinBounds(r, c)) return false;

      // Check if cell is occuppied
      if (this.board[r][c] !== null) return false;
    }

    return true;
  }

  placeShip(ship, [row, col], orientation) {
    // Check if we can place the ship
    if (!this._canPlaceShip(row, col, orientation, ship.length)) {
      return false;
    }

    // Get coordinates and place the ship
    const coordinates = this._getShipCoordinates(
      row,
      col,
      orientation,
      ship.length
    );
    for (const [r, c] of coordinates) {
      this.board[r][c] = ship;
    }

    this.ships.push(ship);
    return true;
  }

  receiveAttack([row, col]) {
    // Check if attack coordinates are within bounds
    if (!this._isWithinBounds(row, col)) return 'invalid';

    // Check if already attacked
    const alreadyAttacked = this.attackedCells.some(
      ([r, c]) => r === row && c === col
    );

    if (alreadyAttacked) return 'already attacked';

    // Record this attack
    this.attackedCells.push([row, col]);

    // Check if there's a ship at the coordinates
    const target = this.board[row][col];

    if (target instanceof Ship) {
      target.hit();

      // Check if this hit sank the ship
      if (target.isSunk()) {
        return 'sunk';
      }

      return 'hit';
    }

    // Record missed attack
    this.missedAttacks.push([row, col]);
    return 'miss';
  }

  allShipsSunk() {
    // If no ships are placed, they can't be sunk
    if (this.ships.length === 0) return false;

    // Check if every ship is sunk
    return this.ships.every((ship) => ship.isSunk());
  }

  isLegalAttack([row, col]) {
    // Check if within bounds and not already attacked
    return (
      this._isWithinBounds(row, col) &&
      !this.attackedCells.some(([r, c]) => r === row && c === col)
    );
  }
}
