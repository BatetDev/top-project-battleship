import Gameboard from '../js/modules/Gameboard';
import Ship from '../js/modules/Ship';

describe('Gameboard', () => {
  let gameboard;

  beforeEach(() => {
    gameboard = new Gameboard();
  });

  test('creates a 10x10 gameboard', () => {
    expect(gameboard.board).toBeDefined();
    expect(gameboard.board.length).toBe(10);
    // Check each row has 10 columns
    gameboard.board.forEach((row) => {
      expect(row.length).toBe(10);
    });
  });

  test('places a ship horizontally at coordinates', () => {
    const ship = new Ship(3);
    const placed = gameboard.placeShip(ship, [0, 0], 'horizontal');

    expect(placed).toBe(true);
    // Check ship placed in correct cells
    expect(gameboard.board[0][0]).toBe(ship);
    expect(gameboard.board[0][1]).toBe(ship);
    expect(gameboard.board[0][2]).toBe(ship);
    // Check cells beyond ship are still empty
    expect(gameboard.board[0][3]).toBe(null);
  });

  test('does not place ship horizontally out of bounds', () => {
    const ship = new Ship(3);
    // Try to place at column 8 - would need columns 8,9,10 (10 is out of bounds)
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

  test('places ship exactly at right boundary', () => {
    const ship = new Ship(3);
    // Columns 7,8,9 are valid for length 3
    const placed = gameboard.placeShip(ship, [0, 7], 'horizontal');
    expect(placed).toBe(true);
  });
});
