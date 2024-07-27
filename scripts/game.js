import { ClassicMode } from './ClassicMode.js';
import { RegularMode } from './RegularMode.js';
import { ShakeDetector } from './shakeDetector.js';
import { AccelerometerChart } from './accelerometerChart.js';

export class Game {
    constructor() {
        this.elements = {
            gameArea: document.getElementById('gameArea'),
            circle: document.getElementById('circle'),
            timeWindow: document.getElementById('timeWindow'),
            feedback: document.getElementById('feedback'),
            scoreDisplay: document.getElementById('scoreDisplay'),
            feverModeDisplay: document.getElementById('feverMode'),
            feverCountdown: document.getElementById('feverCountdown'),
            mole: document.getElementById('mole'),
            backButton: document.getElementById('backButton'),
            modeButtons: document.getElementById('modeButtons'),
            classicModeButton: document.getElementById('classicModeButton'),
            regularModeButton: document.getElementById('regularModeButton')
        };

        console.log(this.elements); // 添加這行來檢查元素是否正確獲取

        this.shakeDetector = new ShakeDetector(25, () => this.handleShake());
        this.accelerometerChart = new AccelerometerChart('accelerationChart', 'accelerationDisplay', 25);
        this.moleShakeCount = 0;

        this.modes = {
            classic: new ClassicMode(this),
            regular: new RegularMode(this)
        };
        this.currentMode = null;
        this.setupShakeTestButton();
        this.animationFrameId = null;

        // 初始化 mole 的位置
        this.initializeMolePosition();

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.elements.classicModeButton.addEventListener('click', () => this.startGame('classic'));
        this.elements.regularModeButton.addEventListener('click', () => this.startGame('regular'));
        this.elements.backButton.addEventListener('click', () => {
            console.log('Back button clicked'); // 添加日志
            this.backToMainMenu();
        });
    }

    startGame(mode) {
        this.setMode(mode);
        this.hideMainMenuButtons();
        this.showBackButton();
        console.log('Game started, back button should be visible'); // 添加日志
    }

    backToMainMenu() {
        console.log('Back to main menu triggered'); // 添加日志
        if (this.currentMode) {
            this.currentMode.end();
        }
        this.resetGame();
        this.showMainMenuButtons();
        this.hideBackButton();
        this.resetGameElements(); // 新增這行
    }
    
    resetGameElements() {
        // 重置圈圈大小和位置
        this.updateCircleSize(280); // 初始圈圈大小
        this.elements.circle.style.transform = 'translate(-50%, -50%)'; // 确保重置transform
        this.elements.circle.style.left = '50%'; // 设置初始水平位置
        this.elements.circle.style.top = '50%'; // 设置初始垂直位置
        
        // 重置其他游戏元素到初始状态，如分数、时间窗口等
        this.updateScoreDisplay('Score: 0');
        this.elements.timeWindow.style.backgroundColor = 'rgba(76, 175, 80, 0.4)';
        this.elements.circle.style.display = 'block';
        this.elements.timeWindow.style.display = 'block';
        
        // 重置 mole 的位置
        this.initializeMolePosition();
    }
    

    resetGame() {
        // Reset game state, score, etc.
        this.updateScoreDisplay('Score: 0');
        // ... 其他重置邏輯 ...
    }

    hideMainMenuButtons() {
        this.elements.modeButtons.style.display = 'none';
    }

    showMainMenuButtons() {
        this.elements.modeButtons.style.display = 'flex';
    }

    showBackButton() {
        console.log('Showing back button'); // 添加日誌
        this.elements.backButton.style.display = 'block';
        this.elements.backButton.style.opacity = '1';
        this.elements.backButton.style.visibility = 'visible';
        this.elements.backButton.style.zIndex = '1000'; // 確保按鈕在最上層
    }

    hideBackButton() {
        console.log('Hiding back button'); // 添加日誌
        this.elements.backButton.style.display = 'none';
        this.elements.backButton.style.opacity = '0';
        this.elements.backButton.style.visibility = 'hidden';
    }
    
    initializeMolePosition() {
        this.elements.mole.style.transform = 'translateY(75%) scaleX(0.5)';
        this.elements.mole.style.transition = 'none'; // 禁用過渡效果
    }
    initializeMolePosition() {
        // 直接設置 mole 的初始樣式
        this.elements.mole.style.transform = 'translateY(75%) scaleX(0.5)';
        this.elements.mole.style.transition = 'none'; // 禁用過渡效果
    }

    setupShakeTestButton() {
        const shakeTestButton = document.getElementById('shakeTestButton');
        if (shakeTestButton) {
            // 只在非移動設備上顯示測試按鈕
            if (!/Mobi|Android/i.test(navigator.userAgent)) {
                shakeTestButton.style.display = 'block';
                shakeTestButton.addEventListener('click', () => {
                    this.handleShake();
                });
            } else {
                shakeTestButton.style.display = 'none';
            }
        }
    }

    handleShake() {
        console.log('handleShake called'); // 添加這行來檢查方法是否被調用
        if (this.currentMode) {
            this.currentMode.handleShake();
        } else {
            console.error('No game mode is currently active');
        }
    }

    init() {
        // Initial setup
    }

    setMode(modeName) {
        if (this.currentMode) {
            this.currentMode.end(); // 只结束当前模式的运行
        }
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.currentMode = this.modes[modeName];
        this.currentMode.init();
        this.start();
    }
    

    start() {
        if (this.currentMode) {
            this.currentMode.start();
            this.requestMotionPermission();
            this.animate();
        } else {
            console.error('No game mode selected');
        }
    }

    animate(timestamp) {
        if (this.currentMode) {
            this.currentMode.update(timestamp);
        } else {
            console.error('No game mode in animate');
        }
        this.animationFrameId = requestAnimationFrame((timestamp) => this.animate(timestamp));
    }

    handleShake() {
        if (this.currentMode) {
            this.currentMode.handleShake();
        }
    }

    handleMotion(event) {
        if (!this.currentMode) return;
        let acceleration = event.accelerationIncludingGravity;
        let acc = Math.sqrt(acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2);
        
        this.accelerometerChart.update(acc);
        this.shakeDetector.update(acc);
    }

    requestMotionPermission() {
        if (typeof DeviceMotionEvent?.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('devicemotion', (event) => this.handleMotion(event));
                    }
                })
                .catch(console.error);
        } else {
            window.addEventListener('devicemotion', (event) => this.handleMotion(event));
        }
    }

    updateCircleSize(size) {
        const safeSize = Math.max(0, size);
        this.elements.circle.style.width = `${safeSize}px`;
        this.elements.circle.style.height = `${safeSize}px`;
        // 為了調試，暫時將時間窗口大小設置為固定值
        this.elements.timeWindow.style.width = '150px';
        this.elements.timeWindow.style.height = '150px';

        if (size <= 150) {
            this.elements.timeWindow.style.backgroundColor = 'rgba(76, 175, 80, 0.6)';
        } else {
            this.elements.timeWindow.style.backgroundColor = 'rgba(76, 175, 80, 0.4)';
        }
    }

    showFeedback(color) {
        this.elements.feedback.style.backgroundColor = color;
        this.elements.feedback.style.opacity = 0.7;
        setTimeout(() => {
            this.elements.feedback.style.opacity = 0;
        }, 100);
    }

    updateScoreDisplay(text) {
        this.elements.scoreDisplay.textContent = text;
    }

    updateMoleHeight(score) {
        const maxScore = 10;
        const visiblePercentage = Math.min(score / maxScore, 1);
        const translateY = 75 - (visiblePercentage * 75);
        const scaleX = 0.5 + (visiblePercentage * 0.8);
        
        // 在更新之前重新啟用過渡效果
        this.elements.mole.style.transition = 'transform 0.3s ease-out';
        this.elements.mole.style.transform = `translateY(${translateY}%) scaleX(${scaleX})`;
    }

    hideActionButton() {
        this.elements.actionButton.style.opacity = '0';
        this.elements.actionButton.style.visibility = 'hidden';
        this.elements.actionButton.style.pointerEvents = 'none';
    }

    showActionButton(text) {
        this.elements.actionButton.textContent = text;
        this.elements.actionButton.style.opacity = '1';
        this.elements.actionButton.style.visibility = 'visible';
        this.elements.actionButton.style.pointerEvents = 'auto';
    }

    hideCircleAndTimeWindow() {
        this.elements.circle.style.display = 'none';
        this.elements.timeWindow.style.display = 'none';
    }

    showCircleAndTimeWindow() {
        this.elements.circle.style.display = 'block';
        this.elements.timeWindow.style.display = 'block';
    }

    startFeverMode() {
        this.elements.feverModeDisplay.style.opacity = 1;
        this.elements.circle.style.display = 'none';
        this.elements.timeWindow.style.display = 'none';
        
        let countdownTime = 10;
        this.elements.feverCountdown.textContent = countdownTime;
        this.elements.feverCountdown.style.display = 'block';
        
        this.feverCountdownInterval = setInterval(() => {
            countdownTime--;
            this.elements.feverCountdown.textContent = countdownTime;
            if (countdownTime <= 0) {
                clearInterval(this.feverCountdownInterval);
            }
        }, 1000);
    }

    endFeverMode() {
        this.elements.feverModeDisplay.style.opacity = 0;
        this.elements.feverCountdown.style.display = 'none';
        clearInterval(this.feverCountdownInterval);
    }

    startMoleAnimation() {
        this.moleShakeCount = 0; // 在開始抖動前初始化計數器
        this.shakeMole();
    }

    endGame(score) {
        console.log('End game triggered'); // 添加日志
        if (this.currentMode) {
            this.currentMode.isRunning = false;
        }
        this.updateScoreDisplay(`${score} $DEEK`);
        this.showCircleAndTimeWindow();
    
        setTimeout(() => {
            this.startMoleAnimation();
            setTimeout(() => {
                this.showMainMenuButtons();
                this.hideBackButton();
            }, 3000); // 假设动画持续 3 秒
        }, 1000);
    }
    
    

    shakeMole() {
        const baseTransform = this.elements.mole.style.transform || `translateY(75%) scaleX(0.5)`;
        const rotateOrigin = 'bottom center';
    
        const translateY = baseTransform.match(/translateY\((.*?)\)/)?.[1] || '75%';
        const scaleX = baseTransform.match(/scaleX\((.*?)\)/)?.[1] || '0.5';
    
        const shakeAnimation = [
            { transform: `translateY(${translateY}) scaleX(${scaleX}) rotate(-3deg)`, transformOrigin: rotateOrigin },
            { transform: `translateY(${translateY}) scaleX(${scaleX}) rotate(0deg)`, transformOrigin: rotateOrigin },
            { transform: `translateY(${translateY}) scaleX(${scaleX}) rotate(3deg)`, transformOrigin: rotateOrigin },
            { transform: `translateY(${translateY}) scaleX(${scaleX}) rotate(0deg)`, transformOrigin: rotateOrigin }
        ];
    
        const shakeOptions = {
            duration: 500,
            iterations: 1,
            easing: 'ease-in-out'
        };
    
        const animation = this.elements.mole.animate(shakeAnimation, shakeOptions);
        
        animation.onfinish = () => {
            this.moleShakeCount++;
            if (this.moleShakeCount < 3) {
                setTimeout(() => this.shakeMole(), 500);
            } else {
                setTimeout(() => this.startMoleShrinking(), 500);
            }
        };
    }

    startMoleShrinking() {
        const initialScale = 0.5 + (Math.min(this.currentMode.score / 10, 1) * 1);
        const initialTranslateY = 75 - (Math.min(this.currentMode.score / 10, 1) * 75);
        const targetScale = 0.5;
        const targetTranslateY = 75;
        const duration = 2500;
        let startTime;
    
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
    
            const easeProgress = this.easeOutCubic(progress);
    
            const currentScale = initialScale + (targetScale - initialScale) * easeProgress;
            const currentTranslateY = initialTranslateY + (targetTranslateY - initialTranslateY) * easeProgress;
    
            this.elements.mole.style.transform = `translateY(${currentTranslateY}%) scaleX(${currentScale})`;
    
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
    
        requestAnimationFrame(animate);
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    vibrateDevice() {
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
        } else if (navigator.vibrate) {
            navigator.vibrate(200);
        }
    }
}
