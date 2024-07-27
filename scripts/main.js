import { Game } from './Game.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded');

    const backButton = document.getElementById('backButton');
    if (!backButton) {
        console.error('backButton element not found in DOM');
    } else {
        console.log('backButton element found', backButton);
    }

    const game = new Game();
    game.init();

    const classicButton = document.getElementById('classicModeButton');
    const regularButton = document.getElementById('regularModeButton');

    classicButton.addEventListener('click', () => {
        console.log('Classic mode button clicked');
        game.startGame('classic'); // 调用 startGame 方法
    });

    regularButton.addEventListener('click', () => {
        console.log('Regular mode button clicked');
        game.startGame('regular'); // 调用 startGame 方法
    });

    // Dev mode toggle (你可以在HTML中添加一个按钮来切换这个模式)
    window.toggleDevMode = () => {
        const accelerationMonitor = document.getElementById('accelerationMonitor');
        accelerationMonitor.style.display = accelerationMonitor.style.display === 'none' ? 'block' : 'none';
    };
});
