/**
 * GameConfig - Centralized game configuration
 * All magic numbers and game rules in one place
 */
export const GAME_CONFIG = {
    // Timer settings
    TIMER: {
        FILL_BLANK_DURATION: 180,      // 3 minutes for fill blank mode
        MULTIPLE_CHOICE_DURATION: 240, // 4 minutes for multiple choice
        MATCHING_DURATION: 240,         // 4 minutes for matching
        CORRECT_ANSWER_BONUS: 1,        // +1 second for correct answer
        WRONG_ANSWER_PENALTY: 15,       // -15 seconds for wrong answer (base)
        WARNING_THRESHOLD: 30,          // Show warning when < 30 seconds
        CRITICAL_THRESHOLD: 10,         // Show critical warning when < 10 seconds
        SOUND_ALERT_THRESHOLD: 3,       // Play sound when <= 3 seconds
        DIFFICULTY_TIME_REDUCTION: 10   // Reduce timer by 10s per difficulty level
    },

    // Scoring system
    SCORING: {
        BASE_POINTS: 10,                // Base points for correct answer
        STREAK_THRESHOLD: 3,            // Minimum streak for bonus
        STREAK_MULTIPLIER: 5,           // Points per streak count
        DIFFICULTY_MULTIPLIER: 5,       // Bonus per difficulty level
        MAX_DIFFICULTY: 3               // Maximum difficulty level
    },

    // Game rules
    RULES: {
        MAX_WRONG_ANSWERS: 5,           // Game over after 5 wrong answers
        DIFFICULTY_INCREASE_INTERVAL: 5, // Increase difficulty every 5 questions
        MAX_LEADERBOARD_ENTRIES: 100,   // Maximum scores to keep
        TOP_LEADERBOARD_DISPLAY: 20     // Show top 20 in leaderboard
    },

    // Difficulty scaling
    DIFFICULTY: {
        PENALTY_INCREASE_PER_LEVEL: 5,  // +5 seconds penalty per level
        MIN_SIMILAR_WORDS: 2,            // Minimum similar words for hard distractors
        SIMILARITY_THRESHOLD: 0.3,       // Word similarity threshold
        WEIGHTED_POOL_SIZE: 10,          // Size of weighted random pool
        STOP_WORDS: [                    // Turkish stop words to avoid in fill blank
            've', 'veya', 'ile', 'bir', 'bu', 'şu', 'o',
            'da', 'de', 'ki', 'mi', 'mı', 'mu', 'mü',
            'ne', 'ya', 'ama', 'fakat', 'çünkü', 'için'
        ]
    },

    // Panda timer (main menu)
    PANDA: {
        HAPPY_DURATION: 20000,          // 20 seconds happy
        NORMAL_DURATION: 60000,         // 60 seconds total before sad
        FEEDBACK_DURATION: 2000         // 2 seconds feedback animation
    },

    // UI timing
    UI: {
        CORRECT_ANSWER_DELAY: 800,      // 0.8 seconds before next question (reduced from 1s)
        WRONG_ANSWER_DELAY: 1200,       // 1.2 seconds to show correct answer (reduced from 3s)
        MODAL_FOCUS_DELAY: 400,         // Delay before focusing input
        ANIMATION_DURATION: 100,        // Timer scale animation
        CONFETTI_COUNT: 30,             // Number of confetti pieces (reduced for performance)
        CONFETTI_MIN_DURATION: 2,       // Min confetti animation duration
        CONFETTI_MAX_DURATION: 4,       // Max confetti animation duration
        FLOATING_SCORE_DURATION: 1500,  // Floating score animation duration
        STREAK_GLOW_THRESHOLD: 3        // Minimum streak for glow effect
    },

    // Question generation
    QUESTIONS: {
        MIN_OPTIONS: 4,                 // Number of options per question
        MIN_WORD_LENGTH: 3,             // Minimum word length for fill blank
        MIN_WORD_INDEX: 1,              // Minimum word index for fill blank (deprecated)
        SIMILARITY_POOL_SIZE: 10,       // Number of similar words to consider
        WRONG_WORDS_POOL: [             // Fallback pool (rarely used now)
            'gider', 'gelir', 'olur', 'yapar', 
            'eder', 'tutar', 'bilir', 'söyler'
        ]
    },

    // Audio settings
    AUDIO: {
        CORRECT_FREQUENCY: 800,
        CORRECT_DURATION: 0.3,
        WRONG_FREQUENCY: 400,
        WRONG_DURATION: 0.5,           // Longer for smoother sound
        WRONG_FREQUENCY_END: 200,      // Descending tone for wrong answer
        CLICK_FREQUENCY: 600,
        CLICK_DURATION: 0.1,
        DEFAULT_VOLUME: 0.5,           // Increased default volume
        MIN_VOLUME: 0,
        MAX_VOLUME: 1,
        MIN_TIME_BETWEEN_SOUNDS: 50,   // Prevent spam (milliseconds)
        ATTACK_TIME: 0.02,             // Smooth attack
        RELEASE_TIME: 0.1              // Smooth release
    },

    // Storage keys
    STORAGE: {
        TOTAL_SCORE: 'totalScore',
        LEVEL: 'level',
        PLAYER_NAME: 'playerName',
        LEADERBOARD: 'leaderboard',
        SOUND_ENABLED: 'soundEnabled',
        SOUND_VOLUME: 'soundVolume'    // Store volume preference
    },

    // Game modes
    MODES: {
        FILL_BLANK: 'fillBlank',
        MULTIPLE_CHOICE: 'multipleChoice',
        MATCHING: 'matching'
    },

    // Mode display names
    MODE_NAMES: {
        fillBlank: '📝 Deyimler Eksik Kelimeler',
        multipleChoice: '✅ Çoktan Seçmeli',
        matching: '🔗 Eşleştirme'
    },

    // Timer colors
    TIMER_COLORS: {
        NORMAL: '#667eea',
        WARNING: '#ff9800',
        CRITICAL: '#f44336'
    }
};

// Helper function to get timer duration by mode with difficulty scaling
export function getTimerDuration(mode, difficulty = 1) {
    let baseDuration;
    switch (mode) {
        case GAME_CONFIG.MODES.FILL_BLANK:
            baseDuration = GAME_CONFIG.TIMER.FILL_BLANK_DURATION;
            break;
        case GAME_CONFIG.MODES.MULTIPLE_CHOICE:
            baseDuration = GAME_CONFIG.TIMER.MULTIPLE_CHOICE_DURATION;
            break;
        case GAME_CONFIG.MODES.MATCHING:
            baseDuration = GAME_CONFIG.TIMER.MATCHING_DURATION;
            break;
        default:
            baseDuration = GAME_CONFIG.TIMER.MULTIPLE_CHOICE_DURATION;
    }
    
    // Reduce time for higher difficulties
    const reduction = (difficulty - 1) * GAME_CONFIG.TIMER.DIFFICULTY_TIME_REDUCTION;
    return Math.max(60, baseDuration - reduction); // Minimum 60 seconds
}

// Helper function to calculate score
export function calculateScore(streak, difficulty) {
    let points = GAME_CONFIG.SCORING.BASE_POINTS;
    
    if (streak >= GAME_CONFIG.SCORING.STREAK_THRESHOLD) {
        points += streak * GAME_CONFIG.SCORING.STREAK_MULTIPLIER;
    }
    
    points += (difficulty - 1) * GAME_CONFIG.SCORING.DIFFICULTY_MULTIPLIER;
    
    return points;
}

// Helper function to get wrong answer penalty based on difficulty
export function getWrongAnswerPenalty(difficulty) {
    const basePenalty = GAME_CONFIG.TIMER.WRONG_ANSWER_PENALTY;
    const increase = (difficulty - 1) * GAME_CONFIG.DIFFICULTY.PENALTY_INCREASE_PER_LEVEL;
    return basePenalty + increase;
}

// Helper function to check if word is meaningful (not a stop word)
export function isMeaningfulWord(word) {
    const cleaned = word.toLowerCase().replace(/[.,!?;:]/g, '');
    return cleaned.length >= GAME_CONFIG.QUESTIONS.MIN_WORD_LENGTH && 
           !GAME_CONFIG.DIFFICULTY.STOP_WORDS.includes(cleaned);
}

// Helper function to calculate word similarity (Levenshtein-based)
export function calculateSimilarity(word1, word2) {
    const w1 = word1.toLowerCase();
    const w2 = word2.toLowerCase();
    
    // Exact match
    if (w1 === w2) return 1.0;
    
    const len1 = w1.length;
    const len2 = w2.length;
    
    // Very different lengths = not similar
    if (Math.abs(len1 - len2) > 3) return 0;
    
    // Check for common prefix/suffix
    let prefixMatch = 0;
    let suffixMatch = 0;
    const minLen = Math.min(len1, len2);
    
    for (let i = 0; i < minLen; i++) {
        if (w1[i] === w2[i]) prefixMatch++;
        else break;
    }
    
    for (let i = 0; i < minLen; i++) {
        if (w1[len1 - 1 - i] === w2[len2 - 1 - i]) suffixMatch++;
        else break;
    }
    
    // Calculate similarity score
    const maxLen = Math.max(len1, len2);
    const matchScore = (prefixMatch + suffixMatch) / maxLen;
    
    // Bonus for same starting letter
    const startBonus = w1[0] === w2[0] ? 0.1 : 0;
    
    return Math.min(1.0, matchScore + startBonus);
}

// Helper function to find similar words for harder distractors
export function findSimilarWords(targetWord, wordPool, count = 3) {
    if (wordPool.length === 0) return [];
    
    const similarities = wordPool.map(word => ({
        word,
        similarity: calculateSimilarity(targetWord, word)
    }));
    
    // Filter out exact matches and very dissimilar words
    const filtered = similarities.filter(item => 
        item.similarity > 0.2 && item.similarity < 1.0
    );
    
    // Sort by similarity (most similar first)
    filtered.sort((a, b) => b.similarity - a.similarity);
    
    // Return top similar words
    return filtered.slice(0, count).map(item => item.word);
}

// Weighted random selection - harder questions appear more at higher difficulty
export function getWeightedRandomProverb(proverbs, difficulty, usedIds = []) {
    const available = proverbs.filter(p => !usedIds.includes(p.id));
    if (available.length === 0) return null;
    
    // At difficulty 1, pure random
    if (difficulty === 1) {
        return available[Math.floor(Math.random() * available.length)];
    }
    
    // At higher difficulties, prefer longer/more complex proverbs
    const poolSize = Math.min(GAME_CONFIG.DIFFICULTY.WEIGHTED_POOL_SIZE, available.length);
    
    // Sort by complexity (word count + character length)
    const sorted = available.sort((a, b) => {
        const complexityA = a.text.split(' ').length + a.text.length;
        const complexityB = b.text.split(' ').length + b.text.length;
        return complexityB - complexityA;
    });
    
    // Weight towards more complex questions at higher difficulty
    const weightedIndex = Math.floor(Math.pow(Math.random(), 2 / difficulty) * poolSize);
    return sorted[weightedIndex];
}
