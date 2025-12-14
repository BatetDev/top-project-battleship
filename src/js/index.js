import '../styles/output.css';
import { createIcons, icons } from 'lucide';

import Game from './modules/Game';
import UIManager from './modules/UIManager';

// Initialize game and UI
window.Game = Game;
window.game = new Game();
window.ui = new UIManager(window.game);

console.log('Battleship UI loaded!');
console.log('Type "ui.startGame()" to begin a UI game.');
console.log('Then use the UI to make moves.');

// Initialize Lucide icons
const iconSpan = document.getElementById('icon');
if (iconSpan) {
  iconSpan.innerHTML =
    '<i data-lucide="anchor" width="40" height="40" class="inline"></i>';
}

createIcons({ icons });

// Auto-start the UI game
window.ui.startGame();
