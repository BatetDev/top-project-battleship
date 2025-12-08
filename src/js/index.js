import '../styles/output.css';
import { createIcons, icons } from 'lucide';

import { greet } from './modules/utils.js';
console.log(greet('Starter!'));

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
