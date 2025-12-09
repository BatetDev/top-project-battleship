export default class Gameboard {
  constructor() {
    this.board = Array(10) // Create array with 10 empty slots
      .fill(null) // Fill all 10 slots with null
      .map(() => Array(10).fill(null)); // Replace each null with NEW array of 10 nulls
  }
}
