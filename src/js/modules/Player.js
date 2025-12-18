import Gameboard from './Gameboard';

export default class Player {
  constructor(isComputer = false) {
    this.isComputer = isComputer;
    this.gameboard = new Gameboard();
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
