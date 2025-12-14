import '../styles/output.css';
import { createIcons, icons } from 'lucide';

import Game from './modules/Game';
import UIManager from './modules/UIManager';

// Initialize game and UI
window.Game = Game;
window.game = new Game();
window.ui = new UIManager(window.game);

console.log('Battleship UI loaded');
console.log('Type "ui.startGame()" in console to test UI');

console.log('Battleship loaded!');
console.log('Type "game.startConsoleGame()" to begin a console game.');
console.log('Then use "game.humanTurn(row, col)" to make moves.');
console.log('Example: game.humanTurn(5, 5)');

const iconSpan = document.getElementById('icon');
if (iconSpan) {
  iconSpan.innerHTML =
    '<i data-lucide="ship-wheel" width="40" height="40" class="inline"></i>';
  createIcons({ icons });
} else {
  console.warn('No element with id="icon" found.');
}

createIcons({ icons });
