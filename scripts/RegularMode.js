// RegularMode.js
import { GameMode } from './GameMode.js';

export class RegularMode extends GameMode {
    constructor(game) {
        super(game);
        this.isRunning = false;
        this.score = 0;
        this.energy = 1000;
        this.maxEnergy = 1000;
        this.energyRegenInterval = null;
    }

    init() {
        this.createEnergyBar();
        this.game.hideCircleAndTimeWindow();
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.score = 0;
        this.energy = this.maxEnergy;
        this.updateScore(0);
        this.updateEnergyBar();
        this.game.hideActionButton();
        this.startEnergyRegeneration();
    }

    update() {
        // No specific update logic for RegularMode
    }

    handleShake() {
        if (!this.isRunning) return;
        if (this.energy > 0) {
            this.energy--;
            this.updateScore(1);
            this.updateEnergyBar();
            this.game.vibrateDevice();
            this.game.showFeedback('rgba(76, 175, 80, 0.6)');
        }
    }

    end() {
        this.isRunning = false;
        this.stopEnergyRegeneration();
        this.game.showActionButton('Play Again');
        this.game.updateScoreDisplay(`${this.score} $DEEK`);

        setTimeout(() => this.game.startMoleAnimation(), 1000);
    }

    updateScore(change) {
        this.score = Math.max(0, this.score + change);
        this.game.updateScoreDisplay(`Score: ${this.score}`);
        this.game.updateMoleHeight(this.score);
    }

    createEnergyBar() {
        const energyBar = document.createElement('div');
        energyBar.id = 'energyBar';
        energyBar.style.width = '100%';
        energyBar.style.height = '20px';
        energyBar.style.backgroundColor = '#ddd';
        energyBar.style.position = 'absolute';
        energyBar.style.bottom = '10px';
        energyBar.style.left = '0';

        const energyFill = document.createElement('div');
        energyFill.id = 'energyFill';
        energyFill.style.width = '100%';
        energyFill.style.height = '100%';
        energyFill.style.backgroundColor = '#4CAF50';
        energyFill.style.transition = 'width 0.3s';

        energyBar.appendChild(energyFill);
        this.game.elements.gameArea.appendChild(energyBar);
    }

    updateEnergyBar() {
        const energyFill = document.getElementById('energyFill');
        const percentage = (this.energy / this.maxEnergy) * 100;
        energyFill.style.width = `${percentage}%`;
    }

    startEnergyRegeneration() {
        this.energyRegenInterval = setInterval(() => {
            if (this.energy < this.maxEnergy) {
                this.energy = Math.min(this.maxEnergy, this.energy + 1);
                this.updateEnergyBar();
            }
        }, 1000);
    }

    stopEnergyRegeneration() {
        clearInterval(this.energyRegenInterval);
    }
}