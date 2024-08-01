import { Game } from './Game.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded');

    const backButton = document.getElementById('backButton');
    if (!backButton) {
        console.error('backButton element not found in DOM');
    } else {
        console.log('backButton element found', backButton);
    }

    const devModeToggle = document.getElementById('devModeToggle');
    if (devModeToggle) {
        devModeToggle.style.display = 'block';
    }

    const game = new Game();
    game.init();

    const classicButton = document.getElementById('classicModeButton');
    const regularButton = document.getElementById('regularModeButton');

    classicButton.addEventListener('click', () => {
        console.log('Classic mode button clicked');
        game.startGame('classic');
    });

    regularButton.addEventListener('click', () => {
        console.log('Regular mode button clicked');
        game.startGame('regular');
    });

    // Dev mode toggle
    window.toggleDevMode = () => {
        const accelerationMonitor = document.getElementById('accelerationMonitor');
        const devModeToggle = document.getElementById('devModeToggle');
        if (accelerationMonitor.style.display === 'none') {
            accelerationMonitor.style.display = 'block';
            devModeToggle.textContent = 'Hide Dev Mode';
        } else {
            accelerationMonitor.style.display = 'none';
            devModeToggle.textContent = 'Show Dev Mode';
        }
    };
});