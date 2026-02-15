/**
 * LeaderboardService - Manages leaderboard data and display
 */
import { GAME_CONFIG } from './GameConfig.js';

export class LeaderboardService {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }

    async saveScore(playerName, score, mode, correct, total) {
        const scoreData = {
            name: playerName,
            score: score,
            mode: mode,
            correct: correct,
            total: total,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };
        
        // Check if this is a personal best
        const isPersonalBest = this.checkPersonalBest(playerName, score, mode);
        scoreData.isPersonalBest = isPersonalBest;
        
        // Always save to localStorage first (guaranteed to work)
        this.saveToLocalStorage(scoreData);
        
        // Try to save to Firebase if available (graceful failure)
        if (this.firebaseService) {
            try {
                await this.firebaseService.saveScore(playerName, score, mode, correct, total);
                console.log('Score saved to Firebase');
            } catch (error) {
                console.warn('Failed to save to Firebase, using localStorage only:', error);
                // Continue - localStorage save already succeeded
            }
        }
        
        return { isPersonalBest };
    }

    checkPersonalBest(playerName, newScore, mode) {
        const scores = JSON.parse(localStorage.getItem(GAME_CONFIG.STORAGE.LEADERBOARD)) || [];
        const playerScores = scores.filter(s => s.name === playerName && s.mode === mode);
        
        if (playerScores.length === 0) {
            return true; // First score is always personal best
        }
        
        const bestScore = Math.max(...playerScores.map(s => s.score));
        return newScore > bestScore;
    }

    saveToLocalStorage(scoreData) {
        const scores = JSON.parse(localStorage.getItem(GAME_CONFIG.STORAGE.LEADERBOARD)) || [];
        scores.push(scoreData);
        scores.sort((a, b) => b.score - a.score);
        if (scores.length > GAME_CONFIG.RULES.MAX_LEADERBOARD_ENTRIES) {
            scores.length = GAME_CONFIG.RULES.MAX_LEADERBOARD_ENTRIES;
        }
        localStorage.setItem(GAME_CONFIG.STORAGE.LEADERBOARD, JSON.stringify(scores));
    }

    async getScores(timeFilter = 'all') {
        let scores = [];
        
        // Try Firebase first if available
        if (this.firebaseService) {
            try {
                scores = await this.firebaseService.getScores(timeFilter);
                console.log('Scores loaded from Firebase');
            } catch (error) {
                console.warn('Failed to load from Firebase, using localStorage:', error);
                // Fall through to localStorage
            }
        }
        
        // Fallback to localStorage (always works offline)
        if (scores.length === 0) {
            scores = this.getFromLocalStorage(timeFilter);
            console.log('Scores loaded from localStorage');
        }
        
        return scores;
    }

    getFromLocalStorage(timeFilter) {
        let scores = JSON.parse(localStorage.getItem(GAME_CONFIG.STORAGE.LEADERBOARD)) || [];
        
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;
        
        if (timeFilter === 'today') {
            scores = scores.filter(s => (now - s.timestamp) < oneDay);
        } else if (timeFilter === 'week') {
            scores = scores.filter(s => (now - s.timestamp) < oneWeek);
        }
        
        return scores;
    }

    displayLeaderboard(scores, containerId = 'leaderboardList', currentPlayerName = null) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (scores.length === 0) {
            container.innerHTML = `
                <div class="empty-leaderboard">
                    <div class="empty-leaderboard-icon">🏆</div>
                    <p>Henüz kayıtlı skor yok!</p>
                    <p style="font-size: 0.9em; margin-top: 10px;">İlk skoru sen oluştur!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        const topScores = scores.slice(0, GAME_CONFIG.RULES.TOP_LEADERBOARD_DISPLAY);
        
        topScores.forEach((score, index) => {
            const isCurrentPlayer = currentPlayerName && score.name === currentPlayerName;
            const item = this.createLeaderboardItem(score, index, isCurrentPlayer);
            container.appendChild(item);
        });
        
        if (scores.length > GAME_CONFIG.RULES.TOP_LEADERBOARD_DISPLAY) {
            const moreInfo = document.createElement('div');
            moreInfo.style.cssText = 'text-align:center;padding:15px;color:#9094A6;font-size:0.9em';
            moreInfo.textContent = `En iyi ${GAME_CONFIG.RULES.TOP_LEADERBOARD_DISPLAY} oyuncu gösteriliyor (Toplam: ${scores.length})`;
            container.appendChild(moreInfo);
        }
    }

    createLeaderboardItem(score, index, isCurrentPlayer = false) {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        if (isCurrentPlayer) {
            item.classList.add('personal-best');
        }
        
        let rankClass = '';
        let rankIcon = `#${index + 1}`;
        
        if (index === 0) {
            rankClass = 'gold';
            rankIcon = '🥇';
        } else if (index === 1) {
            rankClass = 'silver';
            rankIcon = '🥈';
        } else if (index === 2) {
            rankClass = 'bronze';
            rankIcon = '🥉';
        }
        
        const date = new Date(score.date);
        const dateStr = date.toLocaleDateString('tr-TR', { 
            day: 'numeric', 
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const personalBestBadge = isCurrentPlayer ? '<span class="personal-best-badge">👤 Sen</span>' : '';
        
        item.innerHTML = `
            <div class="leaderboard-rank ${rankClass}">${rankIcon}</div>
            <div class="leaderboard-info">
                <div class="leaderboard-name">${score.name} ${personalBestBadge}</div>
                <div class="leaderboard-details">
                    ${GAME_CONFIG.MODE_NAMES[score.mode] || score.mode} • ${score.correct}/${score.total} doğru • ${dateStr}
                </div>
            </div>
            <div class="leaderboard-score">${score.score}</div>
        `;
        
        return item;
    }
}
