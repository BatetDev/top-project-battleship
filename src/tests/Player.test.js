import Player from '../js/modules/Player';
import Ship from '../js/modules/Ship';
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
    const result = player.attack([5, 5], enemyGameboard);
    expect(result).toBe(Gameboard.ATTACK_RESULT.MISS);
  });

  test('player attack returns hit when ship is present', () => {
    const player = new Player();
    const enemyGameboard = new Gameboard();
    const ship = new Ship(3);

    enemyGameboard.placeShip(ship, [0, 0], 'horizontal');
    const result = player.attack([0, 0], enemyGameboard);

    expect(result).toBe(Gameboard.ATTACK_RESULT.HIT);
    expect(ship.hits).toBe(1);
  });

  test('creates a computer player when isComputer is true', () => {
    const computerPlayer = new Player(true);
    expect(computerPlayer.isComputer).toBe(true);
    expect(computerPlayer.gameboard).toBeInstanceOf(Gameboard);
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

    // 5. Check that [5, 5] was attacked
    expect(enemyGameboard.attackedCells).toContainEqual([5, 5]);

    // 6. Check result is either 'hit' or 'miss'
    expect([
      Gameboard.ATTACK_RESULT.HIT,
      Gameboard.ATTACK_RESULT.MISS,
    ]).toContain(result);

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
    expect([
      Gameboard.ATTACK_RESULT.HIT,
      Gameboard.ATTACK_RESULT.MISS,
    ]).toContain(outcome);
    expect(randomSpy).toHaveBeenCalledTimes(4); // Proves retry

    randomSpy.mockRestore();
  });
});
