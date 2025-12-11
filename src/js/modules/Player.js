import Gameboard from './Gameboard';

export default class Player {
  constructor(isComputer = false) {
    this.isComputer = isComputer;
    this.gameboard = new Gameboard();
  }

  attack(coordinates, enemyGameboard) {
    // Forward attack to enemy's gameboard
    return enemyGameboard.receiveAttack(coordinates);
  }
}
