export default class Gameboard {
  constructor() {
    this.board = Array(10) // Create array with 10 empty slots
      .fill(null) // Fill all 10 slots with null
      .map(() => Array(10).fill(null)); // Replace each null with NEW array of 10 nulls
  }

  placeShip(ship, [row, col], orientation) {
    if (orientation === 'horizontal') {
      // Check if ship fits within board bound (cols 0-9)
      if (row < 0 || row > 9 || col < 0 || col > 9) {
        return false; // Starting coordinate out of bounds
      }

      if (orientation === 'horizontal') {
        if (col + ship.length > 10) {
          return false; // Would extend beyond right edge;
        }

        // Place ship horizontally
        for (let i = 0; i < ship.length; i++) {
          this.board[row][col + i] = ship;
        }
      }
      return true;
    }
    // TODO: handle vertical
    return false;
  }
}
