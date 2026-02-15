/**
 * App - Main application controller
 * Coordinates all modules and manages application flow
 */
import { GameEngine } from './GameEngine.js';
import { UIController } from './UIController.js';
import { TimerManager } from './TimerManager.js';
import { PandaController } from './PandaController.js';
import { LeaderboardService } from './LeaderboardService.js';
import { AudioManager } from './AudioManager.js';
import { GAME_CONFIG, getTimerDuration, getWrongAnswerPenalty, findSimilarWords, isMeaningfulWord, calculateScore } from './GameConfig.js';

class App {
    constructor() {
        this.gameEngine = new GameEngine();
        this.uiController = new UIController();
        this.pandaController = new PandaController();
        this.audioManager = new AudioManager();
        this.leaderboardService = new LeaderboardService(null); // Firebase will be injected later
        
        this.timerManager = new TimerManager(
            (timeLeft) => this.uiController.updateTimerDisplay(timeLeft),
            () => this.handleTimeUp()
        );
        
        this.currentQuestion = null;
    }

    async init() {
        try {
            await this.gameEngine.loadData();
            
            // Save backup for offline use
            this.gameEngine.saveToBackup();
            
            this.setupEventListeners();
            this.setupAudioContextResume();
            this.setupBackgroundStateHandling();
            this.setupOnlineStatusMonitoring();
            this.pandaController.startMainMenuTimer();
            this.pandaController.setupClickAnimation();
            
            // Handle URL parameters for shortcuts
            this.handleURLParameters();
            
            // Initialize AdSense
            await this.initializeAdSense();
            
            console.log('App initialized successfully');
        } catch (error) {
            console.error('App initialization failed:', error);
            this.showOfflineError();
        }
    }

    setupOnlineStatusMonitoring() {
        // Monitor online/offline status
        window.addEventListener('online', () => {
            console.log('App is online');
            this.updateOnlineStatus(true);
        });
        
        window.addEventListener('offline', () => {
            console.log('App is offline');
            this.updateOnlineStatus(false);
        });
        
        // Set initial status
        this.updateOnlineStatus(navigator.onLine);
    }

    updateOnlineStatus(isOnline) {
        // Create or update status indicator
        let indicator = document.getElementById('onlineStatus');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'onlineStatus';
            indicator.className = 'online-status';
            document.body.appendChild(indicator);
        }
        
        if (isOnline) {
            indicator.textContent = '🌐 Çevrimiçi';
            indicator.className = 'online-status online';
        } else {
            indicator.textContent = '📡 Çevrimdışı';
            indicator.className = 'online-status offline';
        }
        
        // Auto-hide after 3 seconds if online
        if (isOnline) {
            setTimeout(() => {
                indicator.classList.add('hidden');
            }, 3000);
        } else {
            indicator.classList.remove('hidden');
        }
    }

    showOfflineError() {
        const errorMessage = `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 3em; margin-bottom: 20px;">📡</div>
                <h2 style="margin-bottom: 10px;">Bağlantı Hatası</h2>
                <p style="margin-bottom: 20px;">
                    Oyun verilerini yükleyemedik. Lütfen internet bağlantınızı kontrol edin ve sayfayı yenileyin.
                </p>
                <button onclick="location.reload()" style="
                    padding: 15px 30px;
                    background: #5a2bd6;
                    color: white;
                    border: none;
                    border-radius: 25px;
                    font-size: 1em;
                    font-weight: bold;
                    cursor: pointer;
                ">
                    🔄 Yeniden Dene
                </button>
            </div>
        `;
        
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = errorMessage;
        }
    }

    setupBackgroundStateHandling() {
        // Handle page visibility changes (iOS background/foreground)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handleAppBackground();
            } else {
                this.handleAppForeground();
            }
        });
        
        // Handle iOS-specific events
        window.addEventListener('pagehide', () => {
            this.handleAppBackground();
        });
        
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                this.handleAppForeground();
            }
        });
        
        // Handle focus/blur for additional coverage
        window.addEventListener('blur', () => {
            this.handleAppBackground();
        });
        
        window.addEventListener('focus', () => {
            this.handleAppForeground();
        });
    }

    handleAppBackground() {
        console.log('App going to background');
        
        // Pause timer if game is active
        if (this.uiController.getCurrentScreen() === 'gameScreen') {
            if (this.timerManager.isRunning()) {
                this.timerManager.pause();
                this.gameWasPaused = true;
            }
        }
        
        // Pause panda timer
        this.pandaController.stopMainMenuTimer();
    }

    handleAppForeground() {
        console.log('App returning to foreground');
        
        // Resume timer if it was paused
        if (this.gameWasPaused && this.uiController.getCurrentScreen() === 'gameScreen') {
            this.timerManager.resume();
            this.gameWasPaused = false;
        }
        
        // Resume panda timer if on main menu
        if (this.uiController.getCurrentScreen() === 'mainMenu') {
            this.pandaController.startMainMenuTimer();
        }
        
        // Resume audio context if needed
        if (this.audioManager.isEnabled()) {
            this.audioManager.resumeAudioContext();
        }
    }

    handleURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        
        if (mode && ['fillBlank', 'multipleChoice', 'matching'].includes(mode)) {
            // Delay to allow UI to fully load
            setTimeout(() => {
                this.startGame(mode);
            }, 500);
        }
    }

    setupAudioContextResume() {
        // Resume audio context on first user interaction (iOS requirement)
        const resumeAudio = async () => {
            await this.audioManager.resumeAudioContext();
            // Remove listeners after first interaction
            document.removeEventListener('touchstart', resumeAudio);
            document.removeEventListener('touchend', resumeAudio);
            document.removeEventListener('click', resumeAudio);
            document.removeEventListener('keydown', resumeAudio);
        };
        
        // Listen for various interaction types
        document.addEventListener('touchstart', resumeAudio, { once: true, passive: true });
        document.addEventListener('touchend', resumeAudio, { once: true, passive: true });
        document.addEventListener('click', resumeAudio, { once: true });
        document.addEventListener('keydown', resumeAudio, { once: true });
    }

    setupEventListeners() {
        // Make methods available globally for onclick handlers
        window.app = this;
        window.startGame = (mode) => this.startGame(mode);
        window.showLeaderboard = () => this.showLeaderboard();
        window.showLeaderboardTab = (evt, tab) => this.showLeaderboardTab(evt, tab);
        window.showInfo = () => this.showInfo();
        window.closeInfo = () => this.closeInfo();
        window.showLogin = () => this.showLogin();
        window.closeLoginModal = () => this.closeLoginModal();
        window.showUserMenu = () => this.showUserMenu();
        window.closeUserMenu = () => this.closeUserMenu();
        window.handleSignOut = () => this.handleSignOut();
        window.backToMenu = () => this.backToMenu();
        window.restartGame = () => this.restartGame();
        window.closeGameOver = () => this.closeGameOver();
        window.showHelp = () => this.showHelp();
        window.toggleSwitch = () => this.toggleSwitch();
        
        // Footer modal functions
        window.showAbout = () => this.uiController.showModal('aboutModal');
        window.closeAbout = () => this.uiController.hideModal('aboutModal');
        window.showHowToPlay = () => this.uiController.showModal('howToPlayModal');
        window.closeHowToPlay = () => this.uiController.hideModal('howToPlayModal');
        window.showPrivacy = () => this.uiController.showModal('privacyModal');
        window.closePrivacy = () => this.uiController.hideModal('privacyModal');
        window.showContact = () => this.uiController.showModal('contactModal');
        window.closeContact = () => this.uiController.hideModal('contactModal');
        
        // Debug function for audio testing
        window.testAudio = () => this.audioManager.testAudio();
        
        // Setup sound panel
        this.setupSoundPanel();
    }

    setupSoundPanel() {
        const soundBtn = document.getElementById('soundBtn');
        const panel = document.getElementById('soundPanel');
        const backdrop = document.getElementById('soundPanelBackdrop');
        const closeBtn = document.getElementById('soundPanelClose');
        const toggleBtn = document.getElementById('soundPanelToggle');
        const stateText = document.getElementById('soundPanelStateText');
        const volumeRange = document.getElementById('volumeRange');
        const volumeValue = document.getElementById('volumeValue');
        const testBtn = document.getElementById('soundTestBtn');
        
        if (!soundBtn || !panel || !backdrop) return;
        
        const syncUI = () => {
            const enabled = this.audioManager.isEnabled();
            const vol = Math.round(this.audioManager.getVolume() * 100);
            
            soundBtn.textContent = enabled ? '🔊 Ses Açık' : '🔇 Ses Kapalı';
            stateText.textContent = enabled ? 'Açık' : 'Kapalı';
            toggleBtn.textContent = enabled ? '🔊' : '🔇';
            volumeRange.value = String(vol);
            volumeValue.textContent = String(vol);
        };
        
        const openPanel = async () => {
            // iOS fix: resume audio on first interaction
            await this.audioManager.resumeAudioContext();
            backdrop.classList.add('is-open');
            panel.classList.add('is-open');
            backdrop.setAttribute('aria-hidden', 'false');
            syncUI();
        };
        
        const closePanel = () => {
            backdrop.classList.remove('is-open');
            panel.classList.remove('is-open');
            backdrop.setAttribute('aria-hidden', 'true');
        };
        
        // Sound button toggles panel
        soundBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (panel.classList.contains('is-open')) {
                closePanel();
            } else {
                openPanel();
            }
        });
        
        // Close button
        closeBtn?.addEventListener('click', closePanel);
        
        // Backdrop click closes panel
        backdrop.addEventListener('click', closePanel);
        
        // Escape key closes panel
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && panel.classList.contains('is-open')) {
                closePanel();
            }
        });
        
        // Toggle button
        toggleBtn?.addEventListener('click', async () => {
            await this.audioManager.resumeAudioContext();
            this.audioManager.toggle();
            syncUI();
        });
        
        // Volume slider
        volumeRange?.addEventListener('input', async () => {
            await this.audioManager.resumeAudioContext();
            const v = parseInt(volumeRange.value, 10);
            volumeValue.textContent = String(v);
            this.audioManager.setVolume(v / 100);
            
            // Optional: auto-mute at 0
            if (v === 0 && this.audioManager.isEnabled()) {
                this.audioManager.toggle();
                syncUI();
            } else if (v > 0 && !this.audioManager.isEnabled()) {
                this.audioManager.toggle();
                syncUI();
            }
        });
        
        // Test button
        testBtn?.addEventListener('click', async () => {
            await this.audioManager.resumeAudioContext();
            this.audioManager.playClick();
        });
        
        // Initial UI sync
        syncUI();
    }

    startGame(mode) {
        this.pandaController.stopMainMenuTimer();
        this.pandaController.changePanda('normal');
        
        // Store selected mode temporarily
        this.selectedMode = mode;
        
        // Check if user is logged in via Firebase
        const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
        
        if (currentUser) {
            // User is logged in, start game directly
            let playerName;
            if (currentUser.isAnonymous) {
                playerName = 'Misafir';
            } else {
                playerName = currentUser.displayName || currentUser.email || 'Oyuncu';
            }
            
            this.startGameWithName(mode, playerName);
        } else {
            // User not logged in, show login modal
            this.uiController.showModal('loginModal');
        }
    }

    startGameWithName(mode, playerName) {
        this.gameEngine.startGame(mode, playerName);
        
        const state = this.gameEngine.getState();
        const initialTime = getTimerDuration(mode, state.currentDifficulty);
        this.timerManager.start(initialTime);
        
        this.uiController.showScreen('gameScreen');
        this.updateScoreDisplay();
        this.nextQuestion();
    }

    nextQuestion() {
        if (this.timerManager.getTimeLeft() <= 0) {
            this.handleTimeUp();
            return;
        }
        
        const proverb = this.gameEngine.getNextQuestion();
        if (!proverb) {
            alert('Soru bulunamadı!');
            return;
        }
        
        this.currentQuestion = proverb;
        this.showQuestionByMode();
    }

    showQuestionByMode() {
        const state = this.gameEngine.getState();
        const mode = state.currentMode;
        
        switch (mode) {
            case 'fillBlank':
                this.showFillBlankQuestion();
                break;
            case 'multipleChoice':
                this.showMultipleChoiceQuestion();
                break;
            case 'matching':
                this.showMatchingQuestion();
                break;
        }
    }

    showFillBlankQuestion() {
        const proverb = this.currentQuestion;
        const state = this.gameEngine.getState();
        const difficulty = state.currentDifficulty;
        
        const words = proverb.text.split(' ');
        
        // Filter eligible words (meaningful, not too short, not first word)
        const eligibleIndices = words
            .map((word, idx) => ({ word, idx }))
            .filter(item => item.idx > 0 && isMeaningfulWord(item.word))
            .map(item => item.idx);
        
        if (eligibleIndices.length === 0) {
            // Fallback: use any word except first
            const randomIndex = Math.floor(Math.random() * (words.length - 1)) + 1;
            eligibleIndices.push(randomIndex);
        }
        
        const randomIndex = eligibleIndices[Math.floor(Math.random() * eligibleIndices.length)];
        const missingWord = words[randomIndex].replace(/[.,!?;:]/g, ''); // Clean punctuation
        words[randomIndex] = '____';
        
        const questionText = words.join(' ');
        const options = [missingWord];
        
        // Get all meaningful words from the dataset (excluding current proverb)
        let allWords = state.deyimler
            .filter(p => p.id !== proverb.id)
            .flatMap(p => p.text.split(' '))
            .map(w => w.replace(/[.,!?;:]/g, '')) // Clean punctuation
            .filter(w => isMeaningfulWord(w))
            .filter(w => w !== missingWord); // Exclude the correct answer
        
        // Remove duplicates
        const uniqueWords = [...new Set(allWords)];
        
        // Prioritize words not recently used as distractors
        const freshWords = uniqueWords.filter(w => !state.usedDistractors.includes(w));
        const wordsToUse = freshWords.length >= GAME_CONFIG.QUESTIONS.MIN_OPTIONS - 1 
            ? freshWords 
            : uniqueWords;
        
        if (difficulty >= 2 && wordsToUse.length > 0) {
            // Hard mode: Use similar words
            const similarWords = findSimilarWords(missingWord, wordsToUse, GAME_CONFIG.QUESTIONS.SIMILARITY_POOL_SIZE);
            
            // Add similar words first
            similarWords.forEach(word => {
                if (options.length < GAME_CONFIG.QUESTIONS.MIN_OPTIONS && !options.includes(word)) {
                    options.push(word);
                    state.usedDistractors.push(word);
                }
            });
        }
        
        // Fill remaining slots with random words from dataset
        if (wordsToUse.length > 0) {
            const shuffledWords = wordsToUse.sort(() => Math.random() - 0.5);
            
            for (const word of shuffledWords) {
                if (options.length >= GAME_CONFIG.QUESTIONS.MIN_OPTIONS) break;
                if (!options.includes(word)) {
                    options.push(word);
                    state.usedDistractors.push(word);
                }
            }
        }
        
        // Fallback: If still not enough options (shouldn't happen with real dataset)
        if (options.length < GAME_CONFIG.QUESTIONS.MIN_OPTIONS) {
            const fallbackWords = GAME_CONFIG.QUESTIONS.WRONG_WORDS_POOL;
            for (const word of fallbackWords) {
                if (options.length >= GAME_CONFIG.QUESTIONS.MIN_OPTIONS) break;
                if (!options.includes(word)) {
                    options.push(word);
                }
            }
        }
        
        // Keep distractor history manageable (last 20 words)
        if (state.usedDistractors.length > 20) {
            state.usedDistractors = state.usedDistractors.slice(-20);
        }
        
        // Shuffle options to randomize position of correct answer
        options.sort(() => Math.random() - 0.5);
        
        this.showQuestion(questionText, options, missingWord);
    }

    showMultipleChoiceQuestion() {
        const proverb = this.currentQuestion;
        const state = this.gameEngine.getState();
        const difficulty = state.currentDifficulty;
        
        const questionText = `
            <div style="margin-bottom: 20px;">Bu anlam hangi atasözüne aittir?</div>
            <div style="color: #2D3142; font-size: 1.1em; font-style: italic; line-height: 1.6;">
                "${proverb.meaning}"
            </div>
        `;
        
        const wrongOptions = [];
        let otherProverbs = state.atasozleri.filter(p => p.id !== proverb.id);
        
        // At higher difficulties, select similar-length proverbs as distractors
        if (difficulty >= 2) {
            const targetLength = proverb.text.length;
            otherProverbs.sort((a, b) => {
                const diffA = Math.abs(a.text.length - targetLength);
                const diffB = Math.abs(b.text.length - targetLength);
                return diffA - diffB;
            });
        }
        
        while (wrongOptions.length < 3 && otherProverbs.length > 0) {
            const randomIndex = difficulty >= 2 
                ? Math.floor(Math.random() * Math.min(10, otherProverbs.length)) // Pick from top 10 similar
                : Math.floor(Math.random() * otherProverbs.length);
            wrongOptions.push(otherProverbs[randomIndex].text);
            otherProverbs.splice(randomIndex, 1);
        }
        
        const options = [proverb.text, ...wrongOptions];
        options.sort(() => Math.random() - 0.5);
        
        this.showQuestion(questionText, options, proverb.text);
    }

    showMatchingQuestion() {
        const proverb = this.currentQuestion;
        const state = this.gameEngine.getState();
        const difficulty = state.currentDifficulty;
        
        const questionText = `
            <div style="color: #2D3142; font-size: 1.3em; font-weight: bold; margin-bottom: 20px;">
                "${proverb.text}"
            </div>
            <div>Bu deyimin anlamı nedir?</div>
        `;
        
        const wrongOptions = [];
        let otherProverbs = state.deyimler.filter(p => p.id !== proverb.id);
        
        // At higher difficulties, select meanings with similar word count
        if (difficulty >= 2) {
            const targetWordCount = proverb.meaning.split(' ').length;
            otherProverbs.sort((a, b) => {
                const diffA = Math.abs(a.meaning.split(' ').length - targetWordCount);
                const diffB = Math.abs(b.meaning.split(' ').length - targetWordCount);
                return diffA - diffB;
            });
        }
        
        while (wrongOptions.length < 3 && otherProverbs.length > 0) {
            const randomIndex = difficulty >= 2
                ? Math.floor(Math.random() * Math.min(10, otherProverbs.length)) // Pick from top 10 similar
                : Math.floor(Math.random() * otherProverbs.length);
            const meaning = otherProverbs[randomIndex].meaning;
            if (meaning !== proverb.meaning) {
                wrongOptions.push(meaning);
            }
            otherProverbs.splice(randomIndex, 1);
        }
        
        const options = [proverb.meaning, ...wrongOptions];
        options.sort(() => Math.random() - 0.5);
        
        this.showQuestion(questionText, options, proverb.meaning);
    }

    showQuestion(questionText, optionsArray, correctAnswer) {
        const state = this.gameEngine.getState();
        const options = optionsArray.map(text => ({
            text,
            isCorrect: text === correctAnswer,
            questionNum: state.totalQuestions + 1
        }));
        
        this.uiController.showQuestion(
            questionText,
            options,
            (selected, _isCorrect, button) => this.handleAnswer(selected, correctAnswer, button)
        );
    }

    handleAnswer(selected, correct, button) {
        const result = this.gameEngine.checkAnswer(selected, correct);
        const state = this.gameEngine.getState();
        
        this.audioManager[result.isCorrect ? 'playCorrect' : 'playWrong']();
        this.pandaController.showGamePanda(result.isCorrect);
        this.uiController.showAnswerFeedback(button, result.isCorrect, correct);
        
        if (result.isCorrect) {
            this.timerManager.addTime(GAME_CONFIG.TIMER.CORRECT_ANSWER_BONUS);
            
            // Show floating score animation
            const buttonRect = button.getBoundingClientRect();
            const points = calculateScore(state.streak, state.currentDifficulty);
            this.uiController.showFloatingScore(
                points,
                buttonRect.left + buttonRect.width / 2,
                buttonRect.top
            );
        } else {
            // Use difficulty-scaled penalty
            const penalty = getWrongAnswerPenalty(state.currentDifficulty);
            this.timerManager.subtractTime(penalty);
        }
        
        this.updateScoreDisplay();
        
        if (this.gameEngine.isGameOver()) {
            setTimeout(() => this.handleGameOver(), GAME_CONFIG.UI.WRONG_ANSWER_DELAY);
        } else {
            const delay = result.isCorrect ? GAME_CONFIG.UI.CORRECT_ANSWER_DELAY : GAME_CONFIG.UI.WRONG_ANSWER_DELAY;
            setTimeout(() => this.nextQuestion(), delay);
        }
    }

    handleTimeUp() {
        this.handleGameOver(true);
    }

    async handleGameOver(isTimeUp = false) {
        this.timerManager.stop();
        const stats = this.gameEngine.getGameStats();
        
        const result = await this.leaderboardService.saveScore(
            stats.playerName,
            stats.score,
            stats.mode,
            stats.correctAnswers,
            stats.totalQuestions
        );
        
        const isWin = isTimeUp && stats.wrongAnswers < GAME_CONFIG.RULES.MAX_WRONG_ANSWERS;
        this.pandaController.changePanda(isWin ? 'happy' : 'sad', 'resultMascot');
        this.uiController.showGameOverModal(isWin, stats, result.isPersonalBest);
    }

    updateScoreDisplay() {
        const state = this.gameEngine.getState();
        this.uiController.updateScoreDisplay(
            state.score, 
            state.streak, 
            state.wrongAnswers, 
            state.currentDifficulty
        );
    }

    backToMenu() {
        this.timerManager.stop();
        this.uiController.showScreen('mainMenu');
        this.pandaController.startMainMenuTimer();
    }

    restartGame() {
        this.uiController.hideModal('gameOverModal');
        const mode = this.gameEngine.getState().currentMode;
        const playerName = this.gameEngine.getState().playerName;
        this.startGameWithName(mode, playerName);
    }

    closeGameOver() {
        this.uiController.hideModal('gameOverModal');
        this.backToMenu();
    }

    async showLeaderboard() {
        this.uiController.showScreen('leaderboardScreen');
        const firstTab = document.querySelector('.tab-btn');
        if (firstTab) {
            await this.showLeaderboardTab(null, 'all', firstTab);
        }
        
        // Observe leaderboard ad for lazy loading
        if (window.adManager) {
            window.adManager.observeAd('ad-leaderboard');
        }
    }

    async showLeaderboardTab(evt, tab, targetButton = null) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        
        let activeButton = targetButton;
        if (!activeButton && evt) {
            activeButton = evt.currentTarget || evt.target;
        }
        
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        const scores = await this.leaderboardService.getScores(tab);
        const currentPlayerName = this.gameEngine.getState().playerName;
        this.leaderboardService.displayLeaderboard(scores, 'leaderboardList', currentPlayerName);
    }

    showInfo() {
        this.uiController.showModal('infoModal');
    }

    closeInfo() {
        this.uiController.hideModal('infoModal');
    }

    showLogin() {
        this.uiController.showModal('loginModal');
    }

    closeLoginModal() {
        this.uiController.hideModal('loginModal');
    }

    showUserMenu() {
        const user = window.getCurrentUser ? window.getCurrentUser() : null;
        if (!user) return;
        
        const title = document.getElementById('userMenuTitle');
        const email = document.getElementById('userMenuEmail');
        
        if (user.isAnonymous) {
            title.textContent = 'Misafir Kullanıcı';
            email.textContent = 'Skorlarınız cihazınızda saklanır';
        } else {
            title.textContent = user.displayName || 'Kullanıcı';
            email.textContent = user.email || '';
        }
        
        this.uiController.showModal('userMenuModal');
    }

    closeUserMenu() {
        this.uiController.hideModal('userMenuModal');
    }

    async handleSignOut() {
        if (window.signOutUser) {
            await window.signOutUser();
        }
        this.closeUserMenu();
    }

    showHelp() {
        alert('💡 İpucu: Atasözlerini dikkatle oku ve en uygun kelimeyi seç!');
    }

    toggleSwitch() {
        const toggle = document.getElementById('mainToggle');
        if (toggle) {
            toggle.classList.toggle('active');
        }
    }

    // Inject Firebase service after it's loaded
    setFirebaseService(firebaseService) {
        this.leaderboardService.firebaseService = firebaseService;
    }
    
    /**
     * Initialize AdSense and observe main menu ad
     */
    async initializeAdSense() {
        try {
            // Check if AdSense functions are available
            if (typeof window.initializeAdSense !== 'function') {
                console.warn('AdSense not available - scripts may not be loaded');
                return;
            }
            
            // Initialize AdSense
            await window.initializeAdSense();
            
            // Observe main menu ad for lazy loading
            if (window.adManager) {
                window.adManager.observeAd('ad-main-menu');
                console.log('AdSense initialized and main menu ad observed');
            }
        } catch (error) {
            console.error('AdSense initialization failed:', error);
            // Don't throw - app should work without ads
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new App();
    await app.init();
});

export { App };
