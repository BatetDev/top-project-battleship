import '../styles/output.css';
import { createIcons, icons } from 'lucide';

import ConsoleGame from './modules/ConsoleGame';

window.ConsoleGame = ConsoleGame;
window.game = new ConsoleGame();

console.log('Battleship loaded!');
console.log('Type "game.startConsoleGame()" to begin a console game.');
console.log('Then use "game.humanTurn(row, col)" to make moves.');
console.log('Example: game.humanTurn(5, 5)');

const greetBabel = (name) => {
  console.log(`Hello, ${name}!`);
};

greetBabel('World');

const iconSpan = document.getElementById('icon');
if (iconSpan) {
  iconSpan.innerHTML =
    '<i data-lucide="landmark" width="40" height="40" class="inline"></i>';
  createIcons({ icons });
} else {
  console.warn('No element with id="icon" found.');
}

createIcons({ icons });
