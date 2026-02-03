// Oyun Durumu
let gameState = {
    proverbs: [],
    currentProverb: null,
    currentMode: null,
    score: 0,
    totalScore: parseInt(localStorage.getItem('totalScore')) || 0,
    level: parseInt(localStorage.getItem('level')) || 1,
    streak: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    totalQuestions: 0,
    timer: null,
    timeLeft: 180,
    timerInterval: null,
    playerName: localStorage.getItem('playerName') || '',
    currentDifficulty: 1,
    askedProverbs: []
};

// Sayfa yüklendiğinde atasözlerini yükle
window.onload = async function () {
    await loadProverbs();
    updateStats();
};

// Atasözlerini dış JSON dosyasından yükle
async function loadProverbs() {
    try {
        const response = await fetch('proverbs.json');
        const data = await response.json();
        gameState.proverbs = data.proverbs;
        console.log(gameState.proverbs.length + ' atasözü yüklendi!');
    } catch (error) {
        console.error('Hata:', error);
        alert('Atasözleri yüklenemedi!');
    }
}

// Oyunu başlat
function startGame(mode) {
    // Her oyunda isim sor
    const name = prompt('Lütfen adınızı girin:');
    if (!name || name.trim() === '') {
        alert('Oyuna başlamak için isim girmelisiniz!');
        return;
    }
    gameState.playerName = name.trim();
    
    gameState.currentMode = mode;
    gameState.score = 0;
    gameState.streak = 0;
    gameState.correctAnswers = 0;
    gameState.wrongAnswers = 0;
    gameState.totalQuestions = 0;
    gameState.currentDifficulty = 1;
    gameState.askedProverbs = [];
    
    // Oyun moduna göre başlangıç süresi
    if (mode === 'fillBlank') {
        gameState.timeLeft = 180; // Deyimler Eksik Kelimeler: 180 saniye
    } else {
        gameState.timeLeft = 240; // Çoktan Seçmeli ve Eşleştirme: 240 saniye
    }
    
    showScreen('gameScreen');
    updateScoreDisplay();
    nextQuestion();
}

// Ekranlar arası geçiş
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Genel istatistikleri güncelle
function updateStats() {
    document.getElementById('totalScore').textContent = gameState.totalScore;
    document.getElementById('level').textContent = gameState.level;
}

// Skor ekranını güncelle
function updateScoreDisplay() {
    document.getElementById('currentScore').textContent = gameState.score;
    document.getElementById('streak').textContent = gameState.streak;
    document.getElementById('wrongCount').textContent = gameState.wrongAnswers;
}

// Ana menüye dön
function backToMenu() {
    stopTimer(); // Zamanlayıcıyı durdur
    showScreen('mainMenu');
    updateStats();
}

// Zamanlayıcı fonksiyonları
function startTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    // İlk soruda süre zaten startGame'de ayarlandı, sadece zamanlayıcıyı başlat
    updateTimerDisplay();
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            timeUp();
        }
        
        // Son 10 saniye uyarısı
        if (gameState.timeLeft <= 10) {
            document.getElementById('timerDisplay').style.color = '#f44336';
            if (gameState.timeLeft <= 3 && typeof soundEffects !== 'undefined') {
                soundEffects.playClick();
            }
        }
    }, 1000);
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timerDisplay');
    if (!timerDisplay) return;
    
    timerDisplay.textContent = gameState.timeLeft;
    
    // Renk değiştir
    if (gameState.timeLeft > 30) {
        timerDisplay.style.color = '#667eea';
    } else if (gameState.timeLeft > 10) {
        timerDisplay.style.color = '#ff9800';
    } else {
        timerDisplay.style.color = '#f44336';
    }
    
    // Animasyon
    timerDisplay.style.transform = 'scale(1.2)';
    setTimeout(() => {
        timerDisplay.style.transform = 'scale(1)';
    }, 100);
}

function timeUp() {
    stopTimer();
    
    // Süre doldu, oyun bitti
    showResults();
}

// Ses aç/kapat
function toggleSound() {
    if (typeof soundEffects !== 'undefined' && typeof soundEffects.toggle === 'function') {
        const isEnabled = soundEffects.toggle();
        document.getElementById('soundBtn').textContent = isEnabled ? '🔊 Ses Açık' : '🔇 Ses Kapalı';
    } else {
        console.warn("Ses sistemi tanımlı değil.");
    }
}

// ✅ Yeni: Bir sonraki atasözünü getir
function nextQuestion() {
    // Süre kontrolü
    if (gameState.timeLeft <= 0) {
        showResults();
        return;
    }

    // Zorluk seviyesini artır (her 5 soruda bir)
    if (gameState.totalQuestions > 0 && gameState.totalQuestions % 5 === 0) {
        gameState.currentDifficulty = Math.min(3, gameState.currentDifficulty + 1);
    }

    const proverb = getRandomProverb();
    if (!proverb) {
        alert('Atasözü bulunamadı!');
        return;
    }
    gameState.currentProverb = proverb;
    
    // Zamanlayıcıyı başlat (ilk soru veya devam eden sorular için)
    if (gameState.totalQuestions === 0) {
        startTimer();
    } else {
        // Durdurulmuş zamanlayıcıyı tekrar başlat
        startTimer();
    }
    
    // Oyun moduna göre soru göster
    switch(gameState.currentMode) {
        case 'fillBlank':
            showFillBlankQuestion();
            break;
        case 'multipleChoice':
            showMultipleChoiceQuestion();
            break;
        case 'matching':
            showMatchingQuestion();
            break;
    }
}

// Eksik Kelime Oyunu
function showFillBlankQuestion() {
    const proverb = gameState.currentProverb;
    const words = proverb.text.split(' ');
    
    const randomIndex = Math.floor(Math.random() * (words.length - 2)) + 1;
    const missingWord = words[randomIndex];
    words[randomIndex] = '____';
    
    const questionText = words.join(' ');
    document.getElementById('questionText').textContent = questionText;
    
    const options = [missingWord];
    const wrongWords = ['gider', 'gelir', 'olur', 'yapar', 'eder', 'tutar', 'bilir', 'söyler'];
    
    while (options.length < 4) {
        const randomWord = wrongWords[Math.floor(Math.random() * wrongWords.length)];
        if (!options.includes(randomWord)) {
            options.push(randomWord);
        }
    }
    
    options.sort(() => Math.random() - 0.5);
    showOptions(options, missingWord);
}

// Çoktan Seçmeli Oyunu
function showMultipleChoiceQuestion() {
    const proverb = gameState.currentProverb;
    
    document.getElementById('questionText').innerHTML = `
        <div style="margin-bottom: 20px;">Bu anlam hangi atasözüne aittir?</div>
        <div style="color: #667eea; font-size: 1.1em; font-style: italic; line-height: 1.6;">
            "${proverb.meaning}"
        </div>
    `;
    
    const options = [proverb.text, ...proverb.wrongAnswers];
    options.sort(() => Math.random() - 0.5);
    
    showOptions(options, proverb.text);
}

// Eşleştirme Oyunu
function showMatchingQuestion() {
    const proverb = gameState.currentProverb;
    
    document.getElementById('questionText').innerHTML = `
        <div style="color: #667eea; font-size: 1.3em; font-weight: bold; margin-bottom: 20px;">
            "${proverb.text}"
        </div>
        <div>Bu sözün anlamı nedir?</div>
    `;
    
    const options = [proverb.meaning];
    
    const otherProverbs = gameState.proverbs.filter(p => p.id !== proverb.id);
    for (let i = 0; i < 3 && i < otherProverbs.length; i++) {
        const randomProverb = otherProverbs[Math.floor(Math.random() * otherProverbs.length)];
        if (!options.includes(randomProverb.meaning)) {
            options.push(randomProverb.meaning);
        }
    }
    
    options.sort(() => Math.random() - 0.5);
    showOptions(options, proverb.meaning);
}

// Seçenekleri göster
function showOptions(options, correctAnswer) {
    const container = document.getElementById('optionsContainer');
    container.innerHTML = '';
    
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = () => {
            if (typeof soundEffects !== 'undefined') soundEffects.playClick();
            checkAnswer(option, correctAnswer, btn);
        };
        container.appendChild(btn);
    });
}

// Cevabı kontrol et
function checkAnswer(selected, correct, button) {
    // Zamanlayıcıyı durdur
    stopTimer();
    
    gameState.totalQuestions++;
    
    const allButtons = document.querySelectorAll('.option-btn');
    allButtons.forEach(btn => btn.disabled = true);
    
    if (selected === correct) {
        button.classList.add('correct');
        gameState.correctAnswers++;
        gameState.streak++;
        
        if (typeof soundEffects !== 'undefined') soundEffects.playCorrect();
        
        // Doğru cevap için +1 saniye bonus
        gameState.timeLeft += 1;
        
        let points = 10;
        if (gameState.streak >= 3) {
            points += gameState.streak * 5;
        }
        
        // Zorluk bonusu
        points += (gameState.currentDifficulty - 1) * 5;
        
        gameState.score += points;
        gameState.totalScore += points;
        
        updateScoreDisplay();
        localStorage.setItem('totalScore', gameState.totalScore);
        
        // Doğru cevap - 1 saniye sonra sıradaki soruya geç
        setTimeout(() => {
            nextQuestion();
        }, 1000);
        
    } else {
        button.classList.add('wrong');
        gameState.streak = 0;
        gameState.wrongAnswers++;
        
        if (typeof soundEffects !== 'undefined') soundEffects.playWrong();
        
        // Yanlış cevap için -15 saniye ceza
        gameState.timeLeft -= 15;
        
        // Süre negatif olmasın
        if (gameState.timeLeft < 0) {
            gameState.timeLeft = 0;
        }
        
        // Doğru cevabı göster
        allButtons.forEach(btn => {
            if (btn.textContent === correct) {
                btn.classList.add('correct');
            }
        });
        
        updateScoreDisplay();
        localStorage.setItem('totalScore', gameState.totalScore);
        
        // 5 yanlış yapınca oyun biter
        if (gameState.wrongAnswers >= 5) {
            setTimeout(() => {
                showGameOver();
            }, 3000);
            return;
        }
        
        // Yanlış cevap - 3 saniye sonra sıradaki soruya geç (doğru cevabı görmek için)
        setTimeout(() => {
            nextQuestion();
        }, 3000);
    }
}

// Oyun bitti
function showGameOver() {
    saveScore(gameState.score, gameState.currentMode, gameState.correctAnswers, gameState.totalQuestions);
    
    if (gameState.wrongAnswers >= 5) {
        alert(`Oyun Bitti! 5 yanlış yaptınız.\nPuanınız: ${gameState.score}\nDoğru: ${gameState.correctAnswers}/${gameState.totalQuestions}`);
    } else {
        alert(`Oyun Bitti! Süre doldu.\nPuanınız: ${gameState.score}\nDoğru: ${gameState.correctAnswers}/${gameState.totalQuestions}`);
    }
    
    backToMenu();
}

// Sonuçları göster
function showResults() {
    saveScore(gameState.score, gameState.currentMode, gameState.correctAnswers, gameState.totalQuestions);
    alert(`Tebrikler! Süre doldu!\nPuanınız: ${gameState.score}\nDoğru: ${gameState.correctAnswers}/${gameState.totalQuestions}`);
    backToMenu();
}

// Skor Tablosu Fonksiyonları
async function saveScore(score, mode, correctAnswers, totalQuestions) {
    const newScore = {
        name: gameState.playerName,
        score: score,
        mode: mode,
        correct: correctAnswers,
        total: totalQuestions,
        date: new Date().toISOString(),
        timestamp: Date.now()
    };
    
    // Yerel kayıt (yedek)
    const scores = JSON.parse(localStorage.getItem('leaderboard')) || [];
    scores.push(newScore);
    scores.sort((a, b) => b.score - a.score);
    if (scores.length > 100) scores.length = 100;
    localStorage.setItem('leaderboard', JSON.stringify(scores));
    
    // Firebase'e kaydet
    if (typeof saveScoreToFirebase !== 'undefined') {
        await saveScoreToFirebase(gameState.playerName, score, mode, correctAnswers, totalQuestions);
    }
}

async function showLeaderboard() {
    showScreen('leaderboardScreen');
    await showLeaderboardTab('all');
}

async function showLeaderboardTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    let scores = [];
    
    // Firebase'den al
    if (typeof getScoresFromFirebase !== 'undefined') {
        scores = await getScoresFromFirebase(tab);
    }
    
    // Firebase yoksa yerel skorları kullan
    if (scores.length === 0) {
        scores = JSON.parse(localStorage.getItem('leaderboard')) || [];
        
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;
        
        if (tab === 'today') {
            scores = scores.filter(s => (now - s.timestamp) < oneDay);
        } else if (tab === 'week') {
            scores = scores.filter(s => (now - s.timestamp) < oneWeek);
        }
    }
    
    displayLeaderboard(scores);
}

function displayLeaderboard(scores) {
    const container = document.getElementById('leaderboardList');
    
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
    
    scores.forEach((score, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
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
        
        const modeNames = {
            'fillBlank': '📝 Deyimler Eksik Kelimeler',
            'multipleChoice': '✅ Çoktan Seçmeli',
            'matching': '🔗 Eşleştirme'
        };
        
        item.innerHTML = `
            <div class="leaderboard-rank ${rankClass}">${rankIcon}</div>
            <div class="leaderboard-info">
                <div class="leaderboard-name">${score.name}</div>
                <div class="leaderboard-details">
                    ${modeNames[score.mode] || score.mode} • ${score.correct}/${score.total} doğru • ${dateStr}
                </div>
            </div>
            <div class="leaderboard-score">${score.score}</div>
        `;
        
        container.appendChild(item);
    });
}

// ✅ Yardımcı: Rastgele atasözü getir (zorluk seviyesine göre)
function getRandomProverb() {
    if (gameState.proverbs.length === 0) return null;
    
    // Mevcut zorluk seviyesine uygun atasözlerini filtrele
    let filteredProverbs = gameState.proverbs.filter(p => p.difficulty === gameState.currentDifficulty);
    
    // Eğer o zorlukta soru yoksa, tüm sorulardan seç
    if (filteredProverbs.length === 0) {
        filteredProverbs = gameState.proverbs;
    }
    
    // Daha önce sorulmamış soruları filtrele
    let availableProverbs = filteredProverbs.filter(p => !gameState.askedProverbs.includes(p.id));
    
    // Eğer tüm sorular sorulduysa, listeyi sıfırla
    if (availableProverbs.length === 0) {
        gameState.askedProverbs = [];
        availableProverbs = filteredProverbs;
    }
    
    const index = Math.floor(Math.random() * availableProverbs.length);
    const selectedProverb = availableProverbs[index];
    
    // Sorulan soruları kaydet
    gameState.askedProverbs.push(selectedProverb.id);
    
    return selectedProverb;
}


// Maskot animasyonları
document.addEventListener('DOMContentLoaded', function() {
    const mascot = document.querySelector('.mascot-image');
    
    if (mascot) {
        // Tıklandığında zıplama animasyonu
        mascot.addEventListener('click', function() {
            this.classList.remove('celebrate');
            void this.offsetWidth; // Reflow trick
            this.classList.add('celebrate');
            
            if (typeof soundEffects !== 'undefined') {
                soundEffects.playClick();
            }
            
            setTimeout(() => {
                this.classList.remove('celebrate');
            }, 2400);
        });
        
        // Rastgele sallanma animasyonu (her 8-15 saniyede bir)
        function randomShake() {
            if (document.getElementById('mainMenu').classList.contains('active')) {
                mascot.classList.add('shake');
                setTimeout(() => {
                    mascot.classList.remove('shake');
                }, 500);
            }
            
            const nextShake = Math.random() * 7000 + 8000; // 8-15 saniye
            setTimeout(randomShake, nextShake);
        }
        
        setTimeout(randomShake, 5000); // İlk sallanma 5 saniye sonra
    }
});
