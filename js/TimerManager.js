/**
 * TimerManager - Handles game timer logic
 */
export class TimerManager {
    constructor(onTick, onTimeUp) {
        this.timeLeft = 0;
        this.interval = null;
        this.onTick = onTick;
        this.onTimeUp = onTimeUp;
    }

    start(initialTime) {
        this.timeLeft = initialTime;
        
        if (this.interval) {
            return; // Already running
        }
        
        this.updateDisplay();
        
        this.interval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.stop();
                if (this.onTimeUp) {
                    this.onTimeUp();
                }
            }
        }, 1000);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    pause() {
        this.stop();
    }

    resume() {
        if (!this.interval && this.timeLeft > 0) {
            this.start(this.timeLeft);
        }
    }

    addTime(seconds) {
        this.timeLeft += seconds;
        this.updateDisplay();
    }

    subtractTime(seconds) {
        this.timeLeft = Math.max(0, this.timeLeft - seconds);
        this.updateDisplay();
    }

    updateDisplay() {
        if (this.onTick) {
            this.onTick(this.timeLeft);
        }
    }

    getTimeLeft() {
        return this.timeLeft;
    }

    isRunning() {
        return this.interval !== null;
    }
}
