import Gameboard from '../js/modules/Gameboard';

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
});
