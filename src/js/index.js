import '../styles/input.css';
import { createIcons, Anchor, Github } from 'lucide';
const icons = { Anchor, Github };

import Game from './modules/Game';
import UIManager from './modules/UIManager';

// Initialize game and UI
window.Game = Game; // Make Game class globally available for console debugging
window.game = new Game(); // Create instance
window.ui = new UIManager(window.game);

// Initialize Lucide icons
const iconSpan = document.getElementById('icon');
if (iconSpan) {
  iconSpan.innerHTML =
    '<i data-lucide="anchor" width="40" height="40" class="inline"></i>';
}

createIcons({ icons });
