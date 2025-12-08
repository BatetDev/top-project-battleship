import Ship from '../js/modules/Ship';

describe('Ship', () => {
  test('creates a ship with given length', () => {
    const ship = new Ship(4);
    expect(ship.length).toBe(4);
  });

  test('new ship has 0 hits', () => {
    const ship = new Ship(3);
    expect(ship.hits).toBe(0);
  });
});
