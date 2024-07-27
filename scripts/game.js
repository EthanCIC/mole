// Game.js
import { ClassicMode } from './ClassicMode.js';
import { RegularMode } from './RegularMode.js';

export class Game {
    constructor() {
        this.elements = {
            gameArea: document.getElementById('gameArea'),
            circle: document.getElementById('circle'),
            timeWindow: document.getElementById('timeWindow'),
            feedback: document.getElementById('feedback'),
            actionButton: document.getElementById('actionButton'),
            scoreDisplay: document.getElementById('scoreDisplay'),
            feverModeDisplay: document.getElementById('feverMode'),
            feverCountdown: document.getElementById('feverCountdown'),
            mole: document.getElementById('mole')
        };

        this.shakeDetector = new ShakeDetector(25, () => this.handleShake());
        this.accelerometerChart = new AccelerometerChart('accelerationChart', 'accelerationDisplay', 25);

        this.modes = {
            classic: new ClassicMode(this),
            regular: new RegularMode(this)
        };
        this.currentMode = null;
    }

    init() {
        // Initial setup
    }

    setMode(modeName) {
        if (this.currentMode) {
            this.currentMode.end();
        }
        this.currentMode = this.modes[modeName];
        this.currentMode.init();
    }

    start() {
        if (this.currentMode) {
            this.currentMode.start();
            this.requestMotionPermission();
            this.animate();
        }
    }

    animate(timestamp) {
        if (this.currentMode) {
            this.currentMode.update(timestamp);
        }
        requestAnimationFrame((timestamp) => this.animate(timestamp));
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
        this.elements.circle.style.setProperty('--size', `${Math.max(0, size)}px`);
        this.elements.timeWindow.style.width = `${150}px`;
        this.elements.timeWindow.style.height = `${150}px`;

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
        this.shakeMole();
    }

    // ... (前面的代碼保持不變)

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
