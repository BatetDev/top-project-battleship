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

describe('computer player', () => {
  test('can make a random legal attack', () => {
    // 1. Create a computer player (true = isComputer)
    const computer = new Player(true);

    // 2. Create an empty enemy gameboard
    const enemyGameboard = new Gameboard();

    // 3. Mock Math.random to always return 0.5
    //    jest.spyOn() creates a spy that watches global.Math.random
    //    mockReturnValue(0.5) makes it always returns 0.5 instead of random
    const randomSpy = jest.spyOn(global.Math, 'random').mockReturnValue(0.5);

    // 4. Call the method we're testing
    const result = computer.makeRandomAttack(enemyGameboard);

    // 5. Check that [5, 5] was attacked (explained below)
    expect(enemyGameboard.attackedCells).toContainEqual([5, 5]);

    // 6. Check result is either 'hit' or 'miss'
    expect(['hit', 'miss']).toContain(result);

    // 7. Restore original Math.random for other tests
    randomSpy.mockRestore();
  });

  test('computer retries when the first random coordinate is already attacked', () => {
    const computer = new Player(true);
    const enemyBoard = new Gameboard();

    // Pre-attack [5,5] to make it illegal
    enemyBoard.receiveAttack([5, 5]);

    // Mock Math.random to return sequence: 0.55, 0.55, 0.66, 0.66
    const randomReturns = [0.55, 0.55, 0.66, 0.66];
    const randomSpy = jest
      .spyOn(Math, 'random')
      .mockImplementation(() => randomReturns.shift());

    const outcome = computer.makeRandomAttack(enemyBoard);

    // Verify computer attacked [6,6] (legal), not [5,5] (illegal)
    expect(enemyBoard.attackedCells).toContainEqual([6, 6]);
    expect(outcome).toMatch(/hit|miss/);
    expect(randomSpy).toHaveBeenCalledTimes(4); // Proves retry

    randomSpy.mockRestore();
  });
});
