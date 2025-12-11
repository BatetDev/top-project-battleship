import Player from '../js/modules/Player';
import Gameboard from '../js/modules/Gameboard';

describe('Player', () => {
  test('creates a human player by default', () => {
    const player = new Player();
    expect(player.isComputer).toBe(false);
    expect(player.gameboard).toBeInstanceOf(Gameboard);
  });

  test('player attack method forwards attack to enemy gameboard', () => {
    const player = new Player();
    const enemyGameboard = new Gameboard();

    // Attack empty cell - should return 'miss'
    const result = player.attack([5, 5], enemyGameboard);

    expect(result).toBe('miss');
  });

  test('creates a computer player when isComputer is true', () => {
    const computerPlayer = new Player(true);
    expect(computerPlayer.isComputer).toBe(true);
  });
});
