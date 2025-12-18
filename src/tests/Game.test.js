import Game from '../js/modules/Game';

describe('Game', () => {
  let game;

  beforeEach(() => {
    game = new Game();
    // Place one ship for testing
    const fleet = Game.createStandardFleet();
    game.computer.gameboard.placeShip(fleet[0], [5, 5], 'horizontal');
  });

  describe('initialization', () => {
    test('creates game with two players', () => {
      expect(game.human).toBeDefined();
      expect(game.computer).toBeDefined();
    });

    test('human goes first', () => {
      expect(game.currentPlayer).toBe(game.human);
    });

    test('game starts not over', () => {
      expect(game.gameOver).toBe(false);
    });
  });

  describe('createStandardFleet', () => {
    test('returns correct fleet sizes', () => {
      const fleet = Game.createStandardFleet();
      expect(fleet).toHaveLength(5);
      expect(fleet.map((ship) => ship.length)).toEqual([5, 4, 3, 3, 2]);
    });
  });

  describe('humanTurn', () => {
    test('returns success on valid attack', () => {
      const result = game.humanTurn(5, 5);
      expect(result.success).toBe(true);
      expect(result.result).toBe('hit');
    });

    test('switches turn after valid attack', () => {
      game.humanTurn(5, 5);
      expect(game.currentPlayer).toBe(game.computer);
    });

    test('prevents attack when not human turn', () => {
      game.currentPlayer = game.computer;
      const result = game.humanTurn(5, 5);
      expect(result.success).toBe(false);
    });

    test('prevents attack when game over', () => {
      game.gameOver = true;
      const result = game.humanTurn(5, 5);
      expect(result.success).toBe(false);
    });
  });
});
