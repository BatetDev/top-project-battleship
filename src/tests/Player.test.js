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
    const result = computer.makeComputerAttack(enemyGameboard);

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

    const outcome = computer.makeComputerAttack(enemyBoard);

    // Verify computer attacked [6,6] (legal), not [5,5] (illegal)
    expect(enemyBoard.attackedCells).toContainEqual([6, 6]);
    expect([
      Gameboard.ATTACK_RESULT.HIT,
      Gameboard.ATTACK_RESULT.MISS,
    ]).toContain(outcome);
    expect(randomSpy).toHaveBeenCalledTimes(4); // Proves retry

    randomSpy.mockRestore();
  });

  describe('AI behavior (HUNT/TARGET modes)', () => {
    let computer;
    let enemyGameboard;

    beforeEach(() => {
      computer = new Player(true);
      enemyGameboard = new Gameboard();
    });

    describe('HUNT mode', () => {
      test('starts in HUNT mode (random attacks)', () => {
        const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.3);

        computer.makeComputerAttack(enemyGameboard);

        expect(enemyGameboard.attackedCells).toContainEqual([3, 3]);
        randomSpy.mockRestore();
      });

      test('stays in HUNT mode after misses', () => {
        const randomSpy = jest
          .spyOn(Math, 'random')
          .mockReturnValueOnce(0.2) // First attack: row
          .mockReturnValueOnce(0.2) // First attack: col
          .mockReturnValueOnce(0.4) // Second attack: row
          .mockReturnValueOnce(0.4); // Second attack: col

        computer.makeComputerAttack(enemyGameboard); // Should be [2,2]
        computer.makeComputerAttack(enemyGameboard); // Should be [4,4]

        expect(enemyGameboard.attackedCells).toContainEqual([2, 2]);
        expect(enemyGameboard.attackedCells).toContainEqual([4, 4]);
        randomSpy.mockRestore();
      });
    });

    describe('HUNT to TARGET transition', () => {
      test('switches to TARGET mode after hitting a ship', () => {
        const ship = new Ship(3);
        enemyGameboard.placeShip(ship, [5, 5], 'horizontal');

        const randomSpy = jest
          .spyOn(Math, 'random')
          .mockReturnValueOnce(0.5) // Hits [5,5] - row
          .mockReturnValueOnce(0.5) // Hits [5,5] - col
          .mockReturnValue(0.1); // Won't be used (queue takes over)

        // First attack - hit
        const result = computer.makeComputerAttack(enemyGameboard);
        expect(result).toBe(Gameboard.ATTACK_RESULT.HIT);

        // Second attack - should be from adjacent queue
        computer.makeComputerAttack(enemyGameboard);

        // Should be one of: [4,5], [6,5], [5,4], [5,6]
        const lastAttack = enemyGameboard.attackedCells[1];
        const possibleAdjacent = [
          [4, 5],
          [6, 5],
          [5, 4],
          [5, 6],
        ];
        expect(possibleAdjacent).toContainEqual(lastAttack);

        randomSpy.mockRestore();
      });

      test('queues all four adjacent cells after a hit', () => {
        const ship = new Ship(3);
        enemyGameboard.placeShip(ship, [5, 5], 'horizontal');

        const randomSpy = jest
          .spyOn(Math, 'random')
          .mockReturnValueOnce(0.5) // First hit row
          .mockReturnValueOnce(0.5); // First hit col
        // Note: Queue attacks won't use random, so we don't need more mocks

        computer.makeComputerAttack(enemyGameboard); // Hit at [5,5]

        // Attack 4 more times (should clear queue)
        for (let i = 0; i < 4; i++) {
          computer.makeComputerAttack(enemyGameboard);
        }

        // Should have 5 attacks total
        expect(enemyGameboard.attackedCells).toHaveLength(5);

        // All should be unique
        const uniqueAttacks = new Set(
          enemyGameboard.attackedCells.map((cell) => `${cell[0]},${cell[1]}`)
        );
        expect(uniqueAttacks.size).toBe(5);

        randomSpy.mockRestore();
      });
    });

    describe('TARGET mode behavior', () => {
      test('processes adjacent cells in correct order (up, down, left, right)', () => {
        const ship = new Ship(3);
        enemyGameboard.placeShip(ship, [5, 5], 'horizontal');

        const randomSpy = jest
          .spyOn(Math, 'random')
          .mockReturnValueOnce(0.5) // Hit row
          .mockReturnValueOnce(0.5); // Hit col

        // First hit to enter TARGET mode
        computer.makeComputerAttack(enemyGameboard);

        // Spy on enemyGameboard.receiveAttack to see order
        const attackOrder = [];
        const originalReceiveAttack = enemyGameboard.receiveAttack;
        enemyGameboard.receiveAttack = jest.fn((coords) => {
          attackOrder.push(coords);
          return originalReceiveAttack.call(enemyGameboard, coords);
        });

        // Process 4 attacks from queue
        for (let i = 0; i < 4; i++) {
          computer.makeComputerAttack(enemyGameboard);
        }

        // Should follow BFS order: up, down, left, right
        expect(attackOrder[0]).toEqual([4, 5]); // Up
        expect(attackOrder[1]).toEqual([6, 5]); // Down
        expect(attackOrder[2]).toEqual([5, 4]); // Left
        expect(attackOrder[3]).toEqual([5, 6]); // Right

        randomSpy.mockRestore();
        enemyGameboard.receiveAttack = originalReceiveAttack;
      });

      test('does not add already attacked cells to queue', () => {
        const ship = new Ship(3);
        enemyGameboard.placeShip(ship, [5, 5], 'horizontal');

        // Pre-attack adjacent cell BEFORE first hit
        enemyGameboard.receiveAttack([4, 5]);

        const randomSpy = jest
          .spyOn(Math, 'random')
          .mockReturnValueOnce(0.5) // Hit at [5,5]
          .mockReturnValueOnce(0.5);

        // First hit - should NOT add [4,5] to queue (already attacked)
        computer.makeComputerAttack(enemyGameboard);

        // Queue should have 3 cells, not 4 (skip [4,5])
        expect(computer.targetQueue).toHaveLength(3);
        expect(computer.targetQueue).not.toContainEqual([4, 5]);

        randomSpy.mockRestore();
      });
    });

    describe('ship sinking and reset', () => {
      test('resets to HUNT mode after sinking a ship', () => {
        const ship = new Ship(1); // Single-cell ship!
        enemyGameboard.placeShip(ship, [5, 5], 'horizontal'); // Just one cell

        const randomSpy = jest
          .spyOn(Math, 'random')
          .mockReturnValueOnce(0.5) // Hit row at [5,5]
          .mockReturnValueOnce(0.5); // Hit col at [5,5]

        // First attack - hit and sink immediately (size 1 ship)
        const result1 = computer.makeComputerAttack(enemyGameboard);
        expect(result1).toBe(Gameboard.ATTACK_RESULT.SUNK);

        // Second attack - should be back to HUNT (random)
        randomSpy.mockRestore();
        const newRandomSpy = jest
          .spyOn(Math, 'random')
          .mockReturnValueOnce(0.3) // Row for random attack
          .mockReturnValueOnce(0.3); // Col for random attack

        computer.makeComputerAttack(enemyGameboard);

        // Should be random coordinate
        expect(enemyGameboard.attackedCells).toContainEqual([3, 3]);

        newRandomSpy.mockRestore();
      });
    });

    describe('edge cases', () => {
      test('handles empty queue by switching back to HUNT', () => {
        const ship = new Ship(3);
        enemyGameboard.placeShip(ship, [5, 5], 'horizontal');

        const randomSpy = jest
          .spyOn(Math, 'random')
          .mockReturnValueOnce(0.5) // Hit row
          .mockReturnValueOnce(0.5); // Hit col

        // Hit to enter TARGET (queues 4 adjacent cells)
        computer.makeComputerAttack(enemyGameboard);

        // Manually clear the queue (simulating all adjacent cells being processed)
        computer.targetQueue = [];

        // Next attack should switch to HUNT
        randomSpy.mockRestore();
        const newRandomSpy = jest
          .spyOn(Math, 'random')
          .mockReturnValueOnce(0.2) // Random row
          .mockReturnValueOnce(0.2); // Random col

        computer.makeComputerAttack(enemyGameboard);

        expect(enemyGameboard.attackedCells).toContainEqual([2, 2]);

        newRandomSpy.mockRestore();
      });
    });
  });
});
