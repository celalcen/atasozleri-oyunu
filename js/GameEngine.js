/**
 * GameEngine - Core game logic and state management
 */
import { GAME_CONFIG, calculateScore, getWeightedRandomProverb } from './GameConfig.js';

export class GameEngine {
    constructor() {
        this.state = {
            deyimler: [],
            atasozleri: [],
            currentProverb: null,
            currentMode: null,
            score: 0,
            totalScore: parseInt(localStorage.getItem(GAME_CONFIG.STORAGE.TOTAL_SCORE)) || 0,
            level: parseInt(localStorage.getItem(GAME_CONFIG.STORAGE.LEVEL)) || 1,
            streak: 0,
            maxStreak: 0, // Track highest streak in current game
            correctAnswers: 0,
            wrongAnswers: 0,
            totalQuestions: 0,
            playerName: localStorage.getItem(GAME_CONFIG.STORAGE.PLAYER_NAME) || '',
            currentDifficulty: 1,
            askedProverbs: [],
            usedDistractors: [] // Track used distractor words
        };
    }

    async loadData() {
        try {
            const [deyimlerResponse, atasozleriResponse] = await Promise.all([
                fetch('deyimler.json'),
                fetch('atasozleri.json')
            ]);
            
            // Check if responses are valid
            if (!deyimlerResponse.ok || !atasozleriResponse.ok) {
                throw new Error('Failed to fetch data files');
            }
            
            const deyimlerData = await deyimlerResponse.json();
            const atasozleriData = await atasozleriResponse.json();
            
            this.state.deyimler = deyimlerData.deyimler;
            this.state.atasozleri = atasozleriData.atasozleri;
            
            console.log(`Loaded ${this.state.deyimler.length} deyimler, ${this.state.atasozleri.length} atasözleri`);
            
            // Mark as loaded successfully
            this.dataLoaded = true;
        } catch (error) {
            console.error('Data loading error:', error);
            
            // Try to load from localStorage backup
            const backupData = this.loadFromBackup();
            
            if (backupData) {
                console.log('Loaded data from localStorage backup');
                this.state.deyimler = backupData.deyimler;
                this.state.atasozleri = backupData.atasozleri;
                this.dataLoaded = true;
            } else {
                this.dataLoaded = false;
                throw new Error('No data available - please check your internet connection');
            }
        }
    }

    loadFromBackup() {
        try {
            const deyimlerBackup = localStorage.getItem('deyimler_backup');
            const atasozleriBackup = localStorage.getItem('atasozleri_backup');
            
            if (deyimlerBackup && atasozleriBackup) {
                return {
                    deyimler: JSON.parse(deyimlerBackup),
                    atasozleri: JSON.parse(atasozleriBackup)
                };
            }
        } catch (error) {
            console.error('Failed to load backup data:', error);
        }
        return null;
    }

    saveToBackup() {
        try {
            if (this.state.deyimler.length > 0) {
                localStorage.setItem('deyimler_backup', JSON.stringify(this.state.deyimler));
            }
            if (this.state.atasozleri.length > 0) {
                localStorage.setItem('atasozleri_backup', JSON.stringify(this.state.atasozleri));
            }
            console.log('Data backed up to localStorage');
        } catch (error) {
            console.error('Failed to backup data:', error);
        }
    }

    startGame(mode, playerName) {
        this.state.currentMode = mode;
        this.state.playerName = playerName;
        this.state.score = 0;
        this.state.streak = 0;
        this.state.maxStreak = 0;
        this.state.correctAnswers = 0;
        this.state.wrongAnswers = 0;
        this.state.totalQuestions = 0;
        this.state.currentDifficulty = 1;
        this.state.askedProverbs = [];
        this.state.usedDistractors = [];
        
        localStorage.setItem(GAME_CONFIG.STORAGE.PLAYER_NAME, playerName);
    }

    getNextQuestion() {
        // Increase difficulty every N questions
        if (this.state.totalQuestions > 0 && 
            this.state.totalQuestions % GAME_CONFIG.RULES.DIFFICULTY_INCREASE_INTERVAL === 0) {
            this.state.currentDifficulty = Math.min(
                GAME_CONFIG.SCORING.MAX_DIFFICULTY, 
                this.state.currentDifficulty + 1
            );
        }

        const proverb = this.getRandomProverb();
        if (!proverb) return null;
        
        this.state.currentProverb = proverb;
        return proverb;
    }

    getRandomProverb() {
        const dataSource = this.state.currentMode === GAME_CONFIG.MODES.MULTIPLE_CHOICE 
            ? this.state.atasozleri 
            : this.state.deyimler;
        
        if (dataSource.length === 0) return null;
        
        // Reset asked proverbs if all have been used
        if (this.state.askedProverbs.length >= dataSource.length) {
            this.state.askedProverbs = [];
        }
        
        // Use weighted random selection based on difficulty
        const selectedProverb = getWeightedRandomProverb(
            dataSource, 
            this.state.currentDifficulty, 
            this.state.askedProverbs
        );
        
        if (selectedProverb) {
            this.state.askedProverbs.push(selectedProverb.id);
        }
        
        return selectedProverb;
    }

    checkAnswer(selected, correct) {
        this.state.totalQuestions++;
        
        const isCorrect = selected === correct;
        
        if (isCorrect) {
            this.state.correctAnswers++;
            this.state.streak++;
            
            // Update max streak if current streak is higher
            if (this.state.streak > this.state.maxStreak) {
                this.state.maxStreak = this.state.streak;
            }
            
            const points = calculateScore(this.state.streak, this.state.currentDifficulty);
            
            this.state.score += points;
            this.state.totalScore += points;
            
            localStorage.setItem(GAME_CONFIG.STORAGE.TOTAL_SCORE, this.state.totalScore);
        } else {
            this.state.streak = 0;
            this.state.wrongAnswers++;
        }
        
        return {
            isCorrect,
            score: this.state.score,
            streak: this.state.streak,
            wrongAnswers: this.state.wrongAnswers
        };
    }

    isGameOver() {
        return this.state.wrongAnswers >= GAME_CONFIG.RULES.MAX_WRONG_ANSWERS;
    }

    getGameStats() {
        return {
            score: this.state.score,
            correctAnswers: this.state.correctAnswers,
            wrongAnswers: this.state.wrongAnswers,
            maxStreak: this.state.maxStreak, // Return max streak instead of current streak
            totalQuestions: this.state.totalQuestions,
            playerName: this.state.playerName,
            mode: this.state.currentMode
        };
    }

    getState() {
        return this.state;
    }
}
