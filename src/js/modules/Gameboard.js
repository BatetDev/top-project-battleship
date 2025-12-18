// @ts-nocheck

import Ship from './Ship';

export default class Gameboard {
  static BOARD_SIZE = 10;
  static ATTACK_RESULT = {
    HIT: 'hit',
    MISS: 'miss',
    SUNK: 'sunk',
    INVALID: 'invalid',
    ALREADY_ATTACKED: 'already attacked',
  };

  constructor() {
    this.board = Array(Gameboard.BOARD_SIZE) // [empty × 10]
      .fill(null) // [null, null, null, ...] (10 times)
      .map(() => Array(Gameboard.BOARD_SIZE).fill(null)); // each null becomes [null x 10]
    this.missedAttacks = [];
    this.attackedCells = [];
    this.ships = [];
  }

  // Returns true if (row, col) is a valid board coordinate
  _isWithinBounds(row, col) {
    const size = this.constructor.BOARD_SIZE;
    return row >= 0 && row < size && col >= 0 && col < size;
  }

  // Returns all coordinates a ship of given length and orientation would occupy
  _getShipCoordinates(row, col, orientation, length) {
    if (orientation !== 'horizontal' && orientation !== 'vertical') {
      throw new Error(`Invalid orientation: ${orientation}`);
    }

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

  // // Returns true if a ship can be placed at (row, col) without collisions
  _canPlaceShip(row, col, orientation, length) {
    const coordinates = this._getShipCoordinates(row, col, orientation, length);

    // Check each coordinate
    for (const [r, c] of coordinates) {
      if (!this._isWithinBounds(r, c)) return false;

      // Check if cell is occupied
      if (this.board[r][c] !== null) return false;
    }

    return true;
  }

  // Places a ship on the board if position is valid, returns success
  placeShip(ship, [row, col], orientation) {
    if (!this._canPlaceShip(row, col, orientation, ship.length)) {
      return false;
    }

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

  // Processes attack at (row, col) and returns a Gameboard.ATTACK_RESULT constant
  receiveAttack([row, col]) {
    // Legality check
    if (!this.isLegalAttack([row, col])) {
      return this._isWithinBounds(row, col)
        ? Gameboard.ATTACK_RESULT.ALREADY_ATTACKED
        : Gameboard.ATTACK_RESULT.INVALID;
    }

    // Record this attack
    this.attackedCells.push([row, col]);

    // Check if there's a ship at the coordinates
    const target = this.board[row][col];

    if (target instanceof Ship) {
      target.hit();
      // Return different attack result if ship was sunk or just hit
      return target.isSunk()
        ? Gameboard.ATTACK_RESULT.SUNK
        : Gameboard.ATTACK_RESULT.HIT;
    }

    // Record missed attack
    this.missedAttacks.push([row, col]);
    return Gameboard.ATTACK_RESULT.MISS;
  }

  // Returns true if all ships on this board have been sunk
  allShipsSunk() {
    return this.ships.length > 0 && this.ships.every((ship) => ship.isSunk());
  }

  // Returns true if (row, col) is a valid target for attack (in bounds and not attacked)
  isLegalAttack([row, col]) {
    return (
      this._isWithinBounds(row, col) &&
      !this.attackedCells.some(([r, c]) => r === row && c === col)
    );
  }
}
