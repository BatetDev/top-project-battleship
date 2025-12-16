import Ship from '../js/modules/Ship';

describe('Ship', () => {
  let ship;

  beforeEach(() => {
    ship = new Ship(3);
  });

  test('creates a ship with given length', () => {
    expect(ship.length).toBe(3);
  });

  test('new ship has 0 hits', () => {
    expect(ship.hits).toBe(0);
  });

  test('hit() method increases hits by 1', () => {
    ship.hit();
    expect(ship.hits).toBe(1);
  });

  test('multiple hits increase hit count', () => {
    ship.hit();
    ship.hit();
    ship.hit();
    expect(ship.hits).toBe(3);
  });

  test('isSunk() returns false when hits < length', () => {
    ship.hit(); // 1 hit, length 3
    expect(ship.isSunk()).toBe(false);
  });

  test('isSunk() returns true when hits === length', () => {
    const ship2 = new Ship(2);
    ship2.hit();
    ship2.hit(); // 2 hits, length 2
    expect(ship2.isSunk()).toBe(true);
  });

  test('cannot hit a sunken ship', () => {
    const ship2 = new Ship(2);
    ship2.hit();
    ship2.hit(); // Ship is now sunk
    ship2.hit(); // Try to hit again
    expect(ship2.hits).toBe(2); // Should still be 2, not 3
  });

  test('hit() does nothing when ship is already sunk', () => {
    const ship = new Ship(2);
    ship.hit();
    ship.hit(); // Ship is sunk
    ship.hit(); // This should not increase hits
    expect(ship.hits).toBe(2);
    expect(ship.isSunk()).toBe(true);
  });
});
