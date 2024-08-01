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
    const accelerationMonitor = document.getElementById('accelerationMonitor');
    
    if (!devModeToggle) {
        console.error('devModeToggle element not found in DOM');
    } else {
        console.log('devModeToggle element found', devModeToggle);
        // 确保加速度计初始时是隐藏的
        if (accelerationMonitor) {
            accelerationMonitor.style.display = 'none';
        }
        devModeToggle.textContent = 'Show Dev Mode';

        devModeToggle.addEventListener('click', () => {
            console.log('Dev mode toggle clicked');
            toggleDevMode();
        });
    }

    const game = new Game();
    game.init();

    const classicButton = document.getElementById('classicModeButton');
    const regularButton = document.getElementById('regularModeButton');

    if (classicButton) {
        classicButton.addEventListener('click', () => {
            console.log('Classic mode button clicked');
            game.startGame('classic');
        });
    }

    if (regularButton) {
        regularButton.addEventListener('click', () => {
            console.log('Regular mode button clicked');
            game.startGame('regular');
        });
    }

    // Dev mode toggle function
    function toggleDevMode() {
        if (accelerationMonitor) {
            if (accelerationMonitor.style.display === 'none') {
                accelerationMonitor.style.display = 'block';
                devModeToggle.textContent = 'Hide Dev Mode';
            } else {
                accelerationMonitor.style.display = 'none';
                devModeToggle.textContent = 'Show Dev Mode';
            }
        } else {
            console.error('accelerationMonitor element not found in DOM');
        }
    }
});