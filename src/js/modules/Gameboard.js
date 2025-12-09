export default class Gameboard {
  constructor() {
    this.board = Array(10) // Create array with 10 empty slots
      .fill(null) // Fill all 10 slots with null
      .map(() => Array(10).fill(null)); // Replace each null with NEW array of 10 nulls
  }

  // Helper method to check if coordinates are within bounds
  _isWithinBounds(row, col) {
    return row >= 0 && row < 10 && col >= 0 && col < 10;
  }

  placeShip(ship, [row, col], orientation) {
    if (!this._isWithinBounds(row, col)) {
      return false;
    }

    if (orientation === 'horizontal') {
      if (col + ship.length > 10) return false;

      for (let i = 0; i < ship.length; i++) {
        this.board[row][col + i] = ship;
      }
      return true;
    }

    if (orientation === 'vertical') {
      if (row + ship.length > 10) return false;

      for (let i = 0; i < ship.length; i++) {
        this.board[row + i][col] = ship;
      }
      return true;
    }

    return false;
  }
}
