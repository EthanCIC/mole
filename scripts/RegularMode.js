import { GameMode } from './GameMode.js';

export class RegularMode extends GameMode {
    constructor(game) {
        super(game);
        this.isRunning = false;
        this.totalScore = 0;
        this.energy = 1000;
        this.maxEnergy = 1000;
        this.energyRegenInterval = null;
        this.shakeCount = 0;
        this.cm = 1;
        this.cmDisplay = null;
        this.cmText = null;
        this.animationFrameId = null;
        this.lastUpdateTime = 0;
        this.targetCm = 1;
        this.moleInitialTop = 0;
        this.moleHeight = 0;
        this.plusOneContainer = null;
    }

    init() {
        this.createEnergyDisplay();
        this.createCmDisplay();
        this.createPlusOneContainer();
        this.game.hideCircleAndTimeWindow();
        this.game.showBackButton();
        this.updateMoleMetrics();
    }

    createPlusOneContainer() {
        this.plusOneContainer = document.createElement('div');
        this.plusOneContainer.style.position = 'absolute';
        this.plusOneContainer.style.top = '0';
        this.plusOneContainer.style.left = '0';
        this.plusOneContainer.style.width = '100%';
        this.plusOneContainer.style.height = '100%';
        this.plusOneContainer.style.pointerEvents = 'none';
        this.plusOneContainer.style.zIndex = '1000';
        document.getElementById('gameArea').appendChild(this.plusOneContainer);
    }

    updateMoleMetrics() {
        const moleRect = this.game.elements.mole.getBoundingClientRect();
        this.moleInitialTop = moleRect.top;
        this.moleHeight = moleRect.height;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.totalScore = 0;
        this.cm = 1;
        this.targetCm = 1;
        this.energy = this.maxEnergy;
        this.updateScore(0);
        this.updateMoleMetrics();
        this.updateMoleHeight(this.cm);
        this.updateCmDisplay();
        this.updateEnergyDisplay();
        this.startEnergyRegeneration();
        this.startAnimationLoop();
        this.game.showBackButton();
        this.game.hideMainMenuButtons();
    }

    end() {
        this.isRunning = false;
        this.stopEnergyRegeneration();
        this.stopAnimationLoop();
        this.removeEnergyDisplay();
        this.removeCmDisplay();
        this.game.showMainMenuButtons();
        if (this.plusOneContainer) {
            this.plusOneContainer.remove();
            this.plusOneContainer = null;
        }
    }

    handleShake() {
        if (!this.isRunning) return;
        this.shakeCount++;
        const scoreIncrease = Math.round(this.cm);
        this.totalScore += scoreIncrease;
        this.updateScore(this.totalScore);
        this.createPlusOneEffect();
        if (this.energy > 0) {
            this.energy--;
            this.updateEnergyDisplay();
            this.game.vibrateDevice();
            this.game.showFeedback('rgba(76, 175, 80, 0.6)');
        }
    }

    createPlusOneEffect() {
        const cmValue = Math.round(this.cm);
        const plusOne = document.createElement('div');
        plusOne.textContent = `+${cmValue}`;
        plusOne.style.position = 'absolute';
        plusOne.style.fontSize = '48px';
        plusOne.style.fontWeight = 'bold';
        plusOne.style.color = 'gold';
        plusOne.style.opacity = '1';
        plusOne.style.transition = 'all 0.5s ease-out';
        plusOne.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        plusOne.style.left = '50%';
        plusOne.style.top = '50%';
        plusOne.style.transform = 'translate(-50%, -50%)';

        this.plusOneContainer.appendChild(plusOne);

        setTimeout(() => {
            plusOne.style.transform = 'translate(-50%, -150%)';
            plusOne.style.opacity = '0';
        }, 50);

        setTimeout(() => {
            plusOne.remove();
        }, 550);
    }

    updateScore(newScore) {
        this.totalScore = newScore;
        this.game.updateScoreDisplay(`${this.totalScore} $DEEK`);
    }

    startAnimationLoop() {
        this.lastUpdateTime = performance.now();
        this.animateLoop();
    }

    stopAnimationLoop() {
        cancelAnimationFrame(this.animationFrameId);
    }

    animateLoop(currentTime) {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastUpdateTime;

        if (deltaTime >= 1000) {
            const shakesPerSecond = this.shakeCount;
            if (shakesPerSecond > 3) {
                this.targetCm = Math.min(10, this.targetCm + 1);
            } else {
                this.targetCm = Math.max(1, this.targetCm - 1);
            }
            this.shakeCount = 0;
            this.lastUpdateTime = currentTime;
        }

        this.cm += (this.targetCm - this.cm) * 0.1;
        this.cm = Math.max(1, Math.min(10, this.cm));
        this.updateCmDisplay();
        this.updateMoleHeight(this.cm);

        this.animationFrameId = requestAnimationFrame(this.animateLoop.bind(this));
    }

    createCmDisplay() {
        this.cmDisplay = document.createElement('div');
        this.cmDisplay.id = 'cmDisplay';
        this.cmDisplay.style.position = 'fixed';
        this.cmDisplay.style.color = 'white';
        this.cmDisplay.style.fontSize = '24px';
        this.cmDisplay.style.display = 'flex';
        this.cmDisplay.style.alignItems = 'center';
        this.cmDisplay.style.whiteSpace = 'nowrap';
        this.cmDisplay.style.zIndex = '1000';

        const cmTextContainer = document.createElement('div');
        cmTextContainer.style.display = 'flex';
        cmTextContainer.style.flexGrow = '1';
        cmTextContainer.style.justifyContent = 'center';

        this.cmText = document.createElement('span');
        this.cmText.id = 'cmText';
        this.cmText.style.textAlign = 'center';
        this.cmText.style.width = '100%';

        cmTextContainer.appendChild(this.cmText);
        this.cmDisplay.appendChild(cmTextContainer);
        document.body.appendChild(this.cmDisplay);
    }

    updateCmDisplay() {
        this.cmText.textContent = `${Math.round(this.cm)} cm`;
        this.syncCmDisplayPosition(this.calculateTranslateY(this.cm));
    }

    calculateTranslateY(cm) {
        return 75 - ((cm - 1) / 9) * 75;
    }

    removeCmDisplay() {
        if (this.cmDisplay) {
            this.cmDisplay.remove();
        }
    }

    createEnergyDisplay() {
        const energyDisplay = document.createElement('div');
        energyDisplay.id = 'energyDisplay';
        energyDisplay.style.position = 'fixed';
        energyDisplay.style.bottom = '50px';
        energyDisplay.style.left = '10px';
        energyDisplay.style.color = 'white';
        energyDisplay.style.fontSize = '16px';
        energyDisplay.style.display = 'flex';
        energyDisplay.style.alignItems = 'center';
        energyDisplay.style.whiteSpace = 'nowrap';

        const energyIcon = document.createElement('span');
        energyIcon.textContent = '⚡️';
        energyIcon.style.marginRight = '5px';
        energyIcon.style.flexShrink = '0';

        const energyTextContainer = document.createElement('div');
        energyTextContainer.style.display = 'flex';
        energyTextContainer.style.flexGrow = '1';
        energyTextContainer.style.justifyContent = 'flex-end';
        energyTextContainer.style.width = '80px';

        const energyText = document.createElement('span');
        energyText.id = 'energyText';
        energyText.style.textAlign = 'right';
        energyText.style.width = '100%';

        energyTextContainer.appendChild(energyText);
        energyDisplay.appendChild(energyIcon);
        energyDisplay.appendChild(energyTextContainer);
        document.body.appendChild(energyDisplay);
    }

    updateEnergyDisplay() {
        const energyText = document.getElementById('energyText');
        energyText.textContent = `${this.energy} / ${this.maxEnergy}`;
    }

    startEnergyRegeneration() {
        this.energyRegenInterval = setInterval(() => {
            if (this.energy < this.maxEnergy) {
                this.energy = Math.min(this.maxEnergy, this.energy + 1);
                this.updateEnergyDisplay();
            }
        }, 1000);
    }

    stopEnergyRegeneration() {
        clearInterval(this.energyRegenInterval);
    }

    removeEnergyDisplay() {
        const energyDisplay = document.getElementById('energyDisplay');
        if (energyDisplay) {
            energyDisplay.remove();
        }
    }

    updateMoleHeight(cm) {
        const translateY = this.calculateTranslateY(cm);
        const scaleX = 0.5 + ((cm - 1) / 9) * 0.8;

        this.game.elements.mole.style.transform = `translateY(${translateY}%) scaleX(${scaleX})`;
        this.syncCmDisplayPosition(translateY);
    }

    syncCmDisplayPosition(translateY) {
        if (!this.cmDisplay) return;
        const moleRect = this.game.elements.mole.getBoundingClientRect();
        
        const currentTop = moleRect.top + 10;
        
        this.cmDisplay.style.left = `${moleRect.right + 10}px`;
        this.cmDisplay.style.top = `${currentTop}px`;
    }
}