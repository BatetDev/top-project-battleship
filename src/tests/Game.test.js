import Game from '../js/modules/Game';

describe('Game - UI Attack Integration', () => {
  let game;
  beforeEach(() => {
    game = new Game();
    const fleet = Game.createStandardFleet();
    game.computer.gameboard.placeShip(fleet[0], [5, 5], 'horizontal');
  });

  test('humanTurn returns valid result', () => {
    const result = game.humanTurn(5, 5);
    expect(result.success).toBe(true);
  });
});
