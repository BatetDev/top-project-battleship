import type Game from '../js/modules/Game';
import type UIManager from '../js/modules/UIManager';

declare global {
  interface Window {
    Game: typeof Game;
    game: Game;
    ui: UIManager;
  }
}

export {};
