import Gameboard from '../js/modules/Gameboard';
import Ship from '../js/modules/Ship';

describe('Gameboard', () => {
  let gameboard;

  beforeEach(() => {
    gameboard = new Gameboard();
  });

  // Group 1: Board Creation
  describe('board creation', () => {
    test('creates a 10x10 gameboard', () => {
      expect(gameboard.board).toBeDefined();
      expect(gameboard.board.length).toBe(10);
      gameboard.board.forEach((row) => {
        expect(row.length).toBe(10);
      });
    });
  });

  // Group 2: Ship Placement
  describe('ship placement', () => {
    describe('horizontal placement', () => {
      test('places a ship horizontally at coordinates', () => {
        const ship = new Ship(3);
        const placed = gameboard.placeShip(ship, [0, 0], 'horizontal');
        expect(placed).toBe(true);
        expect(gameboard.board[0][0]).toBe(ship);
        expect(gameboard.board[0][1]).toBe(ship);
        expect(gameboard.board[0][2]).toBe(ship);
        expect(gameboard.board[0][3]).toBe(null);
      });

      test('places ship exactly at right boundary', () => {
        const ship = new Ship(3);
        const placed = gameboard.placeShip(ship, [0, 7], 'horizontal');
        expect(placed).toBe(true);
      });
    });

    describe('vertical placement', () => {
      test('places a ship vertically at coordinates', () => {
        const ship = new Ship(3);
        const placed = gameboard.placeShip(ship, [0, 0], 'vertical');
        expect(placed).toBe(true);
        expect(gameboard.board[0][0]).toBe(ship);
        expect(gameboard.board[1][0]).toBe(ship);
        expect(gameboard.board[2][0]).toBe(ship);
        expect(gameboard.board[3][0]).toBe(null);
      });
    });

    describe('boundary validation', () => {
      test('does not place ship horizontally out of bounds', () => {
        const ship = new Ship(3);
        const placed = gameboard.placeShip(ship, [0, 8], 'horizontal');
        expect(placed).toBe(false);
      });

      test('does not place ship with negative column', () => {
        const ship = new Ship(3);
        const placed = gameboard.placeShip(ship, [0, -1], 'horizontal');
        expect(placed).toBe(false);
      });

      test('does not place ship with row out of bound', () => {
        const ship = new Ship(3);
        const placed = gameboard.placeShip(ship, [10, 0], 'horizontal');
        expect(placed).toBe(false);
      });

      test('does not place ship with negative row', () => {
        const ship = new Ship(3);
        const placed = gameboard.placeShip(ship, [-1, 0], 'horizontal');
        expect(placed).toBe(false);
      });
    });

    describe('overlap prevention', () => {
      test('prevents placing ships that overlap', () => {
        const ship1 = new Ship(3);
        const ship2 = new Ship(3);
        gameboard.placeShip(ship1, [0, 0], 'horizontal');
        const placed = gameboard.placeShip(ship2, [0, 0], 'vertical');
        expect(placed).toBe(false);
        expect(gameboard.board[0][0]).toBe(ship1);
        expect(gameboard.board[0][1]).toBe(ship1);
        expect(gameboard.board[0][2]).toBe(ship1);
      });
    });
  });

  // Group 3: Attack System - Better Structure
  describe('attack system', () => {
    describe('when a ship is present', () => {
      let ship;

      beforeEach(() => {
        ship = new Ship(3);
        gameboard.placeShip(ship, [0, 0], 'horizontal');
      });

      test('hits a ship at given coordinates', () => {
        const result = gameboard.receiveAttack([0, 0]);
        expect(result).toBe('hit');
        expect(ship.hits).toBe(1);
      });

      test('returns "sunk" when ship is completely hit', () => {
        //  Hit all but one part of ship
        gameboard.receiveAttack([0, 0]);
        gameboard.receiveAttack([0, 1]);

        // Final hit should return 'sunk'
        const result = gameboard.receiveAttack([0, 2]);
        expect(result).toBe('sunk');
        expect(ship.isSunk()).toBe(true);
      });

      test('prevents attacking same spot twice', () => {
        gameboard.receiveAttack([0, 0]);
        const secondResult = gameboard.receiveAttack([0, 0]);
        expect(secondResult).toBe('already attacked');
      });
    });

    describe('when no ship is present', () => {
      test('returns miss when no ship at coordinates', () => {
        const result = gameboard.receiveAttack([5, 5]);
        expect(result).toBe('miss');
      });

      test('records missed attacks in missedAttacks array', () => {
        const result = gameboard.receiveAttack([0, 0]);
        expect(result).toBe('miss');
        expect(gameboard.missedAttacks).toContainEqual([0, 0]);
      });

      test('prevents attacking same empty spot twice', () => {
        gameboard.receiveAttack([0, 0]);
        const secondResult = gameboard.receiveAttack([0, 0]);
        expect(secondResult).toBe('already attacked');
      });
    });

    describe('attack validation', () => {
      test('returns "invalid" for out-of-bounds coordinates', () => {
        const result = gameboard.receiveAttack([10, 0]);
        expect(result).toBe('invalid');
      });
    });

    describe('isLegalAttack', () => {
      test('returns true for a legal attack on empty cell', () => {
        expect(gameboard.isLegalAttack([0, 0])).toBe(true);
      });

      test('returns false for out of bounds attack', () => {
        expect(gameboard.isLegalAttack([10, 0])).toBe(false);
      });

      test('returns false for already attacked cell', () => {
        gameboard.receiveAttack([0, 0]); // Attack first
        expect(gameboard.isLegalAttack([0, 0])).toBe(false);
      });
    });
  });

  // Group 4: Game State
  describe('game state', () => {
    describe('allShipsSunk', () => {
      test('returns false when ships are not all sunk', () => {
        const ship1 = new Ship(2);
        const ship2 = new Ship(3);
        gameboard.placeShip(ship1, [0, 0], 'horizontal');
        gameboard.placeShip(ship2, [1, 0], 'vertical');
        gameboard.receiveAttack([0, 0]);
        gameboard.receiveAttack([0, 1]);
        expect(gameboard.allShipsSunk()).toBe(false);
      });

      test('returns true when all ships are sunk', () => {
        const ship1 = new Ship(2);
        const ship2 = new Ship(3);
        gameboard.placeShip(ship1, [0, 0], 'horizontal');
        gameboard.placeShip(ship2, [1, 0], 'vertical');
        gameboard.receiveAttack([0, 0]);
        gameboard.receiveAttack([0, 1]);
        gameboard.receiveAttack([1, 0]);
        gameboard.receiveAttack([2, 0]);
        gameboard.receiveAttack([3, 0]);
        expect(gameboard.allShipsSunk()).toBe(true);
      });
    });
  });
});
