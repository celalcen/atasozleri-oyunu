/**
 * UIController - Manages all UI interactions and updates
 */
import { GAME_CONFIG } from './GameConfig.js';

export class UIController {
    constructor() {
        this.currentScreen = 'mainMenu';
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenId;
        }
    }

    updateScoreDisplay(score, streak, wrongCount, difficulty = 1) {
        this.updateElement('currentScore', score);
        this.updateElement('streak', streak);
        this.updateElement('wrongCount', wrongCount);
        this.updateElement('difficultyLevel', difficulty);
        
        // Update difficulty pill with CSS classes
        const difficultyEl = document.getElementById('difficultyLevel');
        if (difficultyEl) {
            const difficultyPill = difficultyEl.closest('.pill');
            if (difficultyPill) {
                // Remove all difficulty classes
                difficultyPill.classList.remove('difficulty-1', 'difficulty-2', 'difficulty-3');
                // Add current difficulty class
                difficultyPill.classList.add(`difficulty-${difficulty}`);
            }
        }
        
        // Add streak glow effect
        this.updateStreakGlow(streak);
    }

    updateStreakGlow(streak) {
        const streakEl = document.getElementById('streak');
        const streakPill = streakEl ? streakEl.closest('.pill-streak') : null;
        
        if (streakPill) {
            if (streak >= GAME_CONFIG.UI.STREAK_GLOW_THRESHOLD) {
                streakPill.classList.add('streak-glow');
            } else {
                streakPill.classList.remove('streak-glow');
            }
        }
    }

    showFloatingScore(points, x, y) {
        const floatingScore = document.createElement('div');
        floatingScore.className = 'floating-score';
        floatingScore.textContent = `+${points}`;
        floatingScore.style.left = `${x}px`;
        floatingScore.style.top = `${y}px`;
        
        document.body.appendChild(floatingScore);
        
        // Remove after animation
        setTimeout(() => {
            floatingScore.remove();
        }, GAME_CONFIG.UI.FLOATING_SCORE_DURATION);
    }

    updateTimerDisplay(timeLeft) {
        const timerDisplay = document.getElementById('timerDisplay');
        if (!timerDisplay) return;
        
        timerDisplay.textContent = timeLeft;
        
        // Update color with CSS classes
        timerDisplay.classList.remove('timer-normal', 'timer-warning', 'timer-critical');
        
        if (timeLeft > GAME_CONFIG.TIMER.WARNING_THRESHOLD) {
            timerDisplay.classList.add('timer-normal');
        } else if (timeLeft > GAME_CONFIG.TIMER.CRITICAL_THRESHOLD) {
            timerDisplay.classList.add('timer-warning');
        } else {
            timerDisplay.classList.add('timer-critical');
        }
        
        // Scale animation with CSS class
        timerDisplay.classList.add('timer-pulse');
        setTimeout(() => {
            timerDisplay.classList.remove('timer-pulse');
        }, GAME_CONFIG.UI.ANIMATION_DURATION);
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }

    showQuestion(questionText, options, onAnswer) {
        const questionEl = document.getElementById('questionText');
        const optionsContainer = document.getElementById('optionsContainer');
        const questionNumber = document.getElementById('questionNumber');
        
        if (questionEl) {
            questionEl.innerHTML = questionText;
        }
        
        if (optionsContainer) {
            optionsContainer.innerHTML = '';
            
            options.forEach(option => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.textContent = option.text;
                btn.onclick = () => onAnswer(option.text, option.isCorrect, btn);
                optionsContainer.appendChild(btn);
            });
        }
        
        if (questionNumber) {
            questionNumber.textContent = options.questionNum || 1;
        }
    }

    showAnswerFeedback(button, isCorrect, correctAnswer) {
        const allButtons = document.querySelectorAll('.option-btn');
        
        // Disable all buttons with CSS class
        allButtons.forEach(btn => {
            btn.disabled = true;
            btn.classList.add('disabled');
        });
        
        const gameCard = document.getElementById('gameCard');
        
        if (isCorrect) {
            button.classList.add('correct');
            
            // Quick jump animation
            gameCard.classList.add('jump');
            setTimeout(() => gameCard.classList.remove('jump'), 120);
        } else {
            button.classList.add('wrong');
            
            // Shake animation (shorter duration)
            gameCard.classList.add('shake');
            setTimeout(() => gameCard.classList.remove('shake'), 500);
            
            // Show correct answer immediately
            allButtons.forEach(btn => {
                if (btn.textContent === correctAnswer) {
                    btn.classList.add('correct');
                }
            });
        }
    }

    showQuestion(questionText, options, onAnswer) {
        const questionEl = document.getElementById('questionText');
        const optionsContainer = document.getElementById('optionsContainer');
        const questionNumber = document.getElementById('questionNumber');
        
        if (questionEl) {
            questionEl.innerHTML = questionText;
        }
        
        if (optionsContainer) {
            optionsContainer.innerHTML = '';
            
            options.forEach(option => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.textContent = option.text;
                btn.onclick = () => onAnswer(option.text, option.isCorrect, btn);
                optionsContainer.appendChild(btn);
            });
        }
        
        if (questionNumber) {
            questionNumber.textContent = options.questionNum || 1;
        }
    }

    showGameOverModal(isWin, stats, isPersonalBest = false) {
        const modal = document.getElementById('gameOverModal');
        const title = document.getElementById('resultTitle');
        const message = document.getElementById('resultMessage');
        
        if (isWin) {
            title.textContent = 'Tebrikler!';
            message.textContent = `Harika bir performans ${stats.playerName}!`;
            this.createConfetti();
        } else if (stats.wrongAnswers >= GAME_CONFIG.RULES.MAX_WRONG_ANSWERS) {
            title.textContent = 'Oyun Bitti';
            message.textContent = `${GAME_CONFIG.RULES.MAX_WRONG_ANSWERS} yanlış yaptın. Tekrar dene!`;
        } else {
            title.textContent = 'Süre Doldu';
            message.textContent = 'Zamanın bitti! Tekrar dene!';
        }
        
        // Add "New Record!" badge if personal best
        if (isPersonalBest) {
            const badge = document.createElement('div');
            badge.className = 'new-record-badge';
            badge.innerHTML = '🏆 Yeni Rekor!';
            
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                // Remove existing badge if any
                const existingBadge = modalContent.querySelector('.new-record-badge');
                if (existingBadge) existingBadge.remove();
                
                modalContent.insertBefore(badge, modalContent.firstChild);
            }
        }
        
        this.updateElement('finalScore', stats.score);
        this.updateElement('finalCorrect', stats.correctAnswers);
        this.updateElement('finalWrong', stats.wrongAnswers);
        this.updateElement('finalStreak', stats.maxStreak);
        
        modal.classList.add('show');
        
        // Load AdSense ad after modal is shown (500ms delay for animation)
        if (window.adManager) {
            setTimeout(() => {
                window.adManager.loadAd('ad-game-over');
            }, 500);
        }
    }

    createConfetti() {
        const confettiContainer = document.getElementById('confetti');
        if (!confettiContainer) return;
        
        confettiContainer.innerHTML = '';
        
        for (let i = 0; i < GAME_CONFIG.UI.CONFETTI_COUNT; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            const duration = Math.random() * 
                (GAME_CONFIG.UI.CONFETTI_MAX_DURATION - GAME_CONFIG.UI.CONFETTI_MIN_DURATION) + 
                GAME_CONFIG.UI.CONFETTI_MIN_DURATION;
            confetti.style.animationDuration = duration + 's';
            confettiContainer.appendChild(confetti);
        }
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    getCurrentScreen() {
        return this.currentScreen;
    }
}
