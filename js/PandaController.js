/**
 * PandaController - Manages panda animations and states
 */
import { GAME_CONFIG } from './GameConfig.js';

export class PandaController {
    constructor() {
        this.mainMenuTimer = null;
        this.currentState = 'normal';
        this.pandaImages = {
            normal: 'panda-normal.png',
            happy: 'panda-mutlu.png',
            sad: 'panda-uzgun.png'
        };
    }

    changePanda(state, elementId = 'pandaAvatar') {
        this.currentState = state;
        const panda = document.getElementById(elementId);
        
        if (panda && this.pandaImages[state]) {
            panda.src = this.pandaImages[state];
        }
    }

    startMainMenuTimer() {
        this.stopMainMenuTimer();
        
        // Start with happy panda
        this.changePanda('happy');
        
        // After configured time, switch to normal
        setTimeout(() => {
            if (this.isOnMainMenu()) {
                this.changePanda('normal');
            }
        }, GAME_CONFIG.PANDA.HAPPY_DURATION);
        
        // After configured time, switch to sad
        this.mainMenuTimer = setTimeout(() => {
            if (this.isOnMainMenu()) {
                this.changePanda('sad');
            }
        }, GAME_CONFIG.PANDA.NORMAL_DURATION);
    }

    stopMainMenuTimer() {
        if (this.mainMenuTimer) {
            clearTimeout(this.mainMenuTimer);
            this.mainMenuTimer = null;
        }
    }

    isOnMainMenu() {
        const mainMenu = document.getElementById('mainMenu');
        return mainMenu && mainMenu.classList.contains('active');
    }

    showGamePanda(isCorrect) {
        const state = isCorrect ? 'happy' : 'sad';
        this.changePanda(state, 'gamePanda');
        
        // Return to normal after configured duration
        setTimeout(() => {
            this.changePanda('normal', 'gamePanda');
        }, GAME_CONFIG.PANDA.FEEDBACK_DURATION);
    }

    setupClickAnimation() {
        const panda = document.getElementById('pandaAvatar');
        if (!panda) return;
        
        panda.addEventListener('click', () => {
            panda.style.animation = 'none';
            void panda.offsetWidth; // Force reflow
            panda.style.animation = 'float 3s ease-in-out infinite';
        });
    }

    getCurrentState() {
        return this.currentState;
    }
}
