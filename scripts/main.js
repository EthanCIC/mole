// main.js
import { Game } from './Game.js';

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();

    const classicButton = document.getElementById('classicModeButton');
    const regularButton = document.getElementById('regularModeButton');

    classicButton.addEventListener('click', () => {
        game.setMode('classic');
        game.start();
    });

    regularButton.addEventListener('click', () => {
        game.setMode('regular');
        game.start();
    });

    // Dev mode toggle (你可以在HTML中添加一個按鈕來切換這個模式)
    window.toggleDevMode = () => {
        const accelerationMonitor = document.getElementById('accelerationMonitor');
        accelerationMonitor.style.display = accelerationMonitor.style.display === 'none' ? 'block' : 'none';
    };
});