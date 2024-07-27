import { GameMode } from './GameMode.js';

export class ClassicMode extends GameMode {
    constructor(game) {
        super(game);
        this.isRunning = false;
        this.score = 0;
        this.circleSize = 280;
        this.baseShrinkSpeed = 4;
        this.shrinkSpeed = this.baseShrinkSpeed;
        this.TIME_WINDOW_SIZE = 150;
        this.isInTimeWindow = false;
        this.isFeverMode = false;
        this.currentCycleScoreChanged = false;
        this.lastTimestamp = 0;
        this.FRAME_DURATION = 1000 / 60;
    }

    init() {
        this.game.updateCircleSize(this.circleSize);
        this.game.updateMoleHeight(this.score);
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.score = 0;
        this.updateScore(0);
        this.startShrinking();
    }

    end() {
        this.isRunning = false;
        this.isFeverMode = false;
        // 不再调用 this.game.endGame
    }

    endGame() {
        this.game.endGame(this.score);
    }
    

    endFeverMode() {
        this.isFeverMode = false;
        this.game.endFeverMode();
        this.endGame(); // 在 fever 模式结束时调用 endGame
    }

    update(timestamp) {
        if (!this.isRunning) {
            return;
        }
        
        if (!this.lastTimestamp) this.lastTimestamp = timestamp;
        const elapsed = timestamp - this.lastTimestamp;

        if (elapsed >= this.FRAME_DURATION) {
            if (!this.isFeverMode) {
                this.circleSize -= this.shrinkSpeed;
                if (this.circleSize <= 0) {
                    if (!this.currentCycleScoreChanged) {
                        this.updateScore(-1);
                        this.game.showFeedback('rgba(244, 67, 54, 0.6)');
                        this.game.vibrateDevice();
                    }
                    this.resetCircle();
                } else {
                    this.game.updateCircleSize(this.circleSize);
                    this.checkCircleInTimeWindow();
                }
            }
            this.lastTimestamp = timestamp;
        }
    }

    handleShake() {
        if (!this.isRunning) return;
        if (this.isFeverMode) {
            this.updateScore(1);
            this.game.vibrateDevice();
        } else {
            this.checkShakeTiming();
        }
    }

    updateScore(change) {
        this.score = Math.max(0, this.score + change);
        this.game.updateScoreDisplay(`Score: ${this.score}`);
        if (!this.isFeverMode) {
            this.updateShrinkSpeed();
        }

        this.game.updateMoleHeight(this.score);

        if (this.score >= 10 && !this.isFeverMode) {
            this.startFeverMode();
        }
    }

    startShrinking() {
        this.circleSize = 280;
        this.game.updateCircleSize(this.circleSize);
        this.currentCycleScoreChanged = false;
        this.isInTimeWindow = false;
    }

    resetCircle() {
        this.circleSize = 280;
        this.game.updateCircleSize(this.circleSize);
        this.currentCycleScoreChanged = false;
        this.isInTimeWindow = false;
        this.updateShrinkSpeed();
    }

    checkCircleInTimeWindow() {
        if (this.circleSize <= this.TIME_WINDOW_SIZE + 5 && !this.isInTimeWindow) {
            this.isInTimeWindow = true;
            this.game.vibrateDevice();
        } else if (this.circleSize > this.TIME_WINDOW_SIZE + 5) {
            this.isInTimeWindow = false;
        }
    }

    checkShakeTiming() {
        if (this.isInTimeWindow && !this.currentCycleScoreChanged) {
            this.updateScore(1);
            this.game.showFeedback('rgba(76, 175, 80, 0.6)');
            this.currentCycleScoreChanged = true;
            this.resetCircle();
        } else if (!this.isInTimeWindow && !this.currentCycleScoreChanged) {
            this.updateScore(-1);
            this.game.showFeedback('rgba(244, 67, 54, 0.6)');
            this.currentCycleScoreChanged = true;
            this.resetCircle();
        }
    }

    updateShrinkSpeed() {
        this.shrinkSpeed = this.baseShrinkSpeed + (this.score * 0.4);
    }

    startFeverMode() {
        this.isFeverMode = true;
        this.game.startFeverMode();
        
        setTimeout(() => {
            this.endFeverMode();
        }, 10000);
    }
}
