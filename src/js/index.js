import '../styles/output.css';
import { createIcons, icons } from 'lucide';

import Game from './modules/Game';
import UIManager from './modules/UIManager';

// Initialize game and UI
window.Game = Game; // Make Game class globally available for console debugging
window.game = new Game(); // Create instance
window.ui = new UIManager(window.game);

console.log('Battleship loaded! Commands:');
console.log('- ui.startGame()   : Start UI game');
console.log('- game.startConsoleGame() : Start console game');
console.log('- game.humanTurn(row, col) : Console game attack');

// Initialize Lucide icons
const iconSpan = document.getElementById('icon');
if (iconSpan) {
  iconSpan.innerHTML =
    '<i data-lucide="anchor" width="40" height="40" class="inline"></i>';
}

createIcons({ icons });

// Auto-start the UI game
window.ui.startGame();
