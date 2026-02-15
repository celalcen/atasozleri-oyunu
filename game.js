// Oyun Durumu
let gameState = {
    deyimler: [],
    atasozleri: [],
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

// Sayfa yüklendiğinde her iki dosyayı da yükle
window.onload = async function () {
    await loadAllData();
    updateStats();
};

// Tüm verileri yükle
async function loadAllData() {
    try {
        // Deyimleri yükle
        const deyimlerResponse = await fetch('deyimler.json');
        const deyimlerData = await deyimlerResponse.json();
        gameState.deyimler = deyimlerData.deyimler;
        console.log(gameState.deyimler.length + ' deyim yüklendi!');
        
        // Atasözlerini yükle
        const atasozleriResponse = await fetch('atasozleri.json');
        const atasozleriData = await atasozleriResponse.json();
        gameState.atasozleri = atasozleriData.atasozleri;
        console.log(gameState.atasozleri.length + ' atasözü yüklendi!');
    } catch (error) {
        console.error('Hata:', error);
        alert('Veriler yüklenemedi!');
    }
}

// Oyunu başlat
function startGame(mode) {
    gameState.currentMode = mode;
    
    // Panda zamanlayıcısını durdur ve normal panda'ya geç
    stopMainMenuPandaTimer();
    changePanda('normal');
    
    // Firebase ile giriş yapmış kullanıcı kontrolü
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    
    if (currentUser) {
        // Kullanıcı giriş yapmış, isim modal'ını atla
        if (currentUser.isAnonymous) {
            gameState.playerName = 'Misafir';
        } else {
            gameState.playerName = currentUser.displayName || currentUser.email || 'Oyuncu';
        }
        
        // Direkt oyunu başlat
        gameState.score = 0;
        gameState.streak = 0;
        gameState.correctAnswers = 0;
        gameState.wrongAnswers = 0;
        gameState.totalQuestions = 0;
        gameState.currentDifficulty = 1;
        gameState.askedProverbs = [];
        
        // Oyun moduna göre başlangıç süresi
        if (gameState.currentMode === 'fillBlank') {
            gameState.timeLeft = 180;
        } else {
            gameState.timeLeft = 240;
        }
        
        showScreen('gameScreen');
        updateScoreDisplay();
        updateGameModeBadge();
        nextQuestion();
    } else {
        // Kullanıcı giriş yapmamış, isim sor
        const modal = document.getElementById('nameModal');
        modal.classList.add('show');
        
        // Input'a focus ver
        setTimeout(() => {
            document.getElementById('playerNameInput').focus();
        }, 400);
        
        // Enter tuşu ile de başlatabilsin
        document.getElementById('playerNameInput').onkeypress = function(e) {
            if (e.key === 'Enter') {
                submitName();
            }
        };
    }
}

// İsmi kaydet ve oyunu başlat
function submitName() {
    const nameInput = document.getElementById('playerNameInput');
    const name = nameInput.value.trim();
    
    if (!name || name === '') {
        // Input'u salla
        nameInput.classList.add('shake');
        setTimeout(() => nameInput.classList.remove('shake'), 500);
        return;
    }
    
    gameState.playerName = name;
    localStorage.setItem('playerName', name);
    
    // Modal'ı kapat
    const modal = document.getElementById('nameModal');
    modal.classList.remove('show');
    
    // Input'u temizle
    nameInput.value = '';
    
    // Oyunu başlat
    gameState.score = 0;
    gameState.streak = 0;
    gameState.correctAnswers = 0;
    gameState.wrongAnswers = 0;
    gameState.totalQuestions = 0;
    gameState.currentDifficulty = 1;
    gameState.askedProverbs = [];
    
    // Oyun moduna göre başlangıç süresi
    if (gameState.currentMode === 'fillBlank') {
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
    const totalScoreEl = document.getElementById('totalScore');
    const levelEl = document.getElementById('level');
    
    if (totalScoreEl) {
        totalScoreEl.textContent = gameState.totalScore;
    }
    if (levelEl) {
        levelEl.textContent = gameState.level;
    }
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
    
    // Panda zamanlayıcısını yeniden başlat
    startMainMenuPandaTimer();
}

// Zamanlayıcı fonksiyonları
function startTimer() {
    // Eğer zaten çalışıyorsa, yeniden başlatma
    if (gameState.timerInterval) {
        return;
    }
    
    updateTimerDisplay();
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();
        
        if (gameState.timeLeft <= 0) {
            stopTimer();
            timeUp();
        }
        
        // Son 10 saniye uyarısı
        if (gameState.timeLeft <= 10) {
            const timerDisplay = document.getElementById('timerDisplay');
            if (timerDisplay) {
                timerDisplay.style.color = '#f44336';
            }
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

function pauseTimer() {
    // Timer'ı duraklat (interval'i temizle ama timeLeft'i koru)
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function resumeTimer() {
    // Timer'ı devam ettir (sadece interval yoksa)
    if (!gameState.timerInterval && gameState.timeLeft > 0) {
        startTimer();
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
    
    // Timer'ı sadece ilk soruda başlat
    if (gameState.totalQuestions === 0) {
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

// Çoktan Seçmeli Oyunu (Atasözleri)
function showMultipleChoiceQuestion() {
    const proverb = gameState.currentProverb;
    
    document.getElementById('questionText').innerHTML = `
        <div style="margin-bottom: 20px;">Bu anlam hangi atasözüne aittir?</div>
        <div style="color: #2D3142; font-size: 1.1em; font-style: italic; line-height: 1.6;">
            "${proverb.meaning}"
        </div>
    `;
    
    // Yanlış cevaplar için rastgele diğer atasözlerini seç
    const wrongOptions = [];
    const otherProverbs = gameState.atasozleri.filter(p => p.id !== proverb.id);
    
    while (wrongOptions.length < 3 && otherProverbs.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherProverbs.length);
        const wrongOption = otherProverbs[randomIndex].text;
        if (!wrongOptions.includes(wrongOption)) {
            wrongOptions.push(wrongOption);
        }
        otherProverbs.splice(randomIndex, 1);
    }
    
    const options = [proverb.text, ...wrongOptions];
    options.sort(() => Math.random() - 0.5);
    
    showOptions(options, proverb.text);
}

// Eşleştirme Oyunu (Deyimler)
function showMatchingQuestion() {
    const proverb = gameState.currentProverb;
    
    document.getElementById('questionText').innerHTML = `
        <div style="color: #2D3142; font-size: 1.3em; font-weight: bold; margin-bottom: 20px;">
            "${proverb.text}"
        </div>
        <div>Bu deyimin anlamı nedir?</div>
    `;
    
    // Yanlış cevaplar için rastgele diğer deyimlerin anlamlarını seç
    const wrongOptions = [];
    const otherProverbs = gameState.deyimler.filter(p => p.id !== proverb.id);
    
    while (wrongOptions.length < 3 && otherProverbs.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherProverbs.length);
        const wrongOption = otherProverbs[randomIndex].meaning;
        if (!wrongOptions.includes(wrongOption) && wrongOption !== proverb.meaning) {
            wrongOptions.push(wrongOption);
        }
        otherProverbs.splice(randomIndex, 1);
    }
    
    const options = [proverb.meaning, ...wrongOptions];
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
        btn.disabled = false; // Butonları aktif et
        btn.onclick = () => {
            if (typeof soundEffects !== 'undefined') soundEffects.playClick();
            checkAnswer(option, correctAnswer, btn);
        };
        container.appendChild(btn);
    });
    
    // Soru numarasını güncelle
    document.getElementById('questionNumber').textContent = gameState.totalQuestions + 1;
}

// Cevabı kontrol et
function checkAnswer(selected, correct, button) {
    // Timer devam etsin, durdurma
    
    const gameCard = document.getElementById('gameCard');
    const successOverlay = document.getElementById('successOverlay');
    const errorOverlay = document.getElementById('errorOverlay');
    const gamePanda = document.getElementById('gamePanda');
    
    gameState.totalQuestions++;
    
    const allButtons = document.querySelectorAll('.option-btn');
    allButtons.forEach(btn => btn.disabled = true);
    
    // Kart zıplama animasyonu
    gameCard.classList.add('jump');
    setTimeout(() => gameCard.classList.remove('jump'), 120);
    
    if (selected === correct) {
        button.classList.add('correct');
        gameState.correctAnswers++;
        gameState.streak++;
        
        // Doğru cevap - mutlu panda
        if (gamePanda) {
            gamePanda.src = 'panda-mutlu.png';
        }
        
        // Başarı overlay'i göster
        successOverlay.classList.add('show');
        
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
            successOverlay.classList.remove('show');
            if (gamePanda) {
                gamePanda.src = 'panda-normal.png';
            }
            nextQuestion();
        }, 1000);
        
    } else {
        button.classList.add('wrong');
        gameState.streak = 0;
        gameState.wrongAnswers++;
        
        // Yanlış cevap - üzgün panda
        if (gamePanda) {
            gamePanda.src = 'panda-uzgun.png';
        }
        
        // Hata overlay'i göster ve kartı salla
        errorOverlay.classList.add('show');
        gameCard.classList.add('shake');
        
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
                errorOverlay.classList.remove('show');
                gameCard.classList.remove('shake');
                if (gamePanda) {
                    gamePanda.src = 'panda-normal.png';
                }
                showGameOver();
            }, 3000);
            return;
        }
        
        // Yanlış cevap - 3 saniye sonra sıradaki soruya geç (doğru cevabı görmek için)
        setTimeout(() => {
            errorOverlay.classList.remove('show');
            gameCard.classList.remove('shake');
            if (gamePanda) {
                gamePanda.src = 'panda-normal.png';
            }
            nextQuestion();
        }, 3000);
    }
}

// Oyun bitti
function showGameOver() {
    saveScore(gameState.score, gameState.currentMode, gameState.correctAnswers, gameState.totalQuestions);
    showGameOverModal(false); // false = kaybetti
}

// Sonuçları göster
function showResults() {
    saveScore(gameState.score, gameState.currentMode, gameState.correctAnswers, gameState.totalQuestions);
    showGameOverModal(true); // true = kazandı (süre doldu ama oyunu tamamladı)
}

// Modern oyun bitişi modal'ını göster
function showGameOverModal(isWin) {
    const modal = document.getElementById('gameOverModal');
    const title = document.getElementById('resultTitle');
    const message = document.getElementById('resultMessage');
    const mascot = document.getElementById('resultMascot');
    
    // Başarı durumuna göre mesaj ve panda
    if (isWin) {
        title.textContent = 'Tebrikler!';
        message.textContent = `Harika bir performans ${gameState.playerName}!`;
        mascot.src = 'panda-mutlu.png';
        mascot.style.animation = 'float 3s ease-in-out infinite';
        createConfetti();
    } else if (gameState.wrongAnswers >= 5) {
        title.textContent = 'Oyun Bitti';
        message.textContent = '5 yanlış yaptın. Tekrar dene!';
        mascot.src = 'panda-uzgun.png';
        mascot.style.animation = 'float 3s ease-in-out infinite';
    } else {
        title.textContent = 'Süre Doldu';
        message.textContent = 'Zamanın bitti! Tekrar dene!';
        mascot.src = 'panda-uzgun.png';
        mascot.style.animation = 'float 3s ease-in-out infinite';
    }
    
    // İstatistikleri göster
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('finalCorrect').textContent = gameState.correctAnswers;
    document.getElementById('finalWrong').textContent = gameState.wrongAnswers;
    document.getElementById('finalStreak').textContent = gameState.streak;
    
    // Modal'ı göster
    modal.classList.add('show');
}

// Konfeti oluştur
function createConfetti() {
    const confettiContainer = document.getElementById('confetti');
    confettiContainer.innerHTML = '';
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        confettiContainer.appendChild(confetti);
    }
}

// Oyunu tekrar başlat
function restartGame() {
    const modal = document.getElementById('gameOverModal');
    modal.classList.remove('show');
    
    // İsim zaten kayıtlı, direkt oyunu başlat
    gameState.score = 0;
    gameState.streak = 0;
    gameState.correctAnswers = 0;
    gameState.wrongAnswers = 0;
    gameState.totalQuestions = 0;
    gameState.currentDifficulty = 1;
    gameState.askedProverbs = [];
    
    // Oyun moduna göre başlangıç süresi
    if (gameState.currentMode === 'fillBlank') {
        gameState.timeLeft = 180;
    } else {
        gameState.timeLeft = 240;
    }
    
    showScreen('gameScreen');
    updateScoreDisplay();
    nextQuestion();
}

// Ana menüye dön
function closeGameOver() {
    const modal = document.getElementById('gameOverModal');
    modal.classList.remove('show');
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
    // İlk tab'ı programatik olarak aktif et
    const firstTab = document.querySelector('.tab-btn');
    if (firstTab) {
        await showLeaderboardTab(null, 'all', firstTab);
    }
}

async function showLeaderboardTab(evt, tab, targetButton = null) {
    // Tüm tab'ları pasif yap
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Tıklanan tab'ı aktif yap (Safari-safe)
    let activeButton = targetButton;
    if (!activeButton && evt) {
        activeButton = evt.currentTarget || evt.target;
    }
    
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
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
    
    // En iyi 20 kişiyi göster
    const topScores = scores.slice(0, 20);
    
    topScores.forEach((score, index) => {
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
    
    // Toplam skor sayısını göster
    if (scores.length > 20) {
        const moreInfo = document.createElement('div');
        moreInfo.style.textAlign = 'center';
        moreInfo.style.padding = '15px';
        moreInfo.style.color = '#9094A6';
        moreInfo.style.fontSize = '0.9em';
        moreInfo.innerHTML = `En iyi 20 oyuncu gösteriliyor (Toplam: ${scores.length})`;
        container.appendChild(moreInfo);
    }
}

// ✅ Yardımcı: Rastgele soru getir (oyun moduna göre)
function getRandomProverb() {
    // Oyun moduna göre doğru veri setini seç
    let dataSource;
    if (gameState.currentMode === 'multipleChoice') {
        dataSource = gameState.atasozleri; // Çoktan seçmeli için atasözleri
    } else {
        dataSource = gameState.deyimler; // Eksik kelime ve eşleştirme için deyimler
    }
    
    if (dataSource.length === 0) return null;
    
    // Daha önce sorulmamış soruları filtrele
    let availableProverbs = dataSource.filter(p => !gameState.askedProverbs.includes(p.id));
    
    // Eğer tüm sorular sorulduysa, listeyi sıfırla
    if (availableProverbs.length === 0) {
        gameState.askedProverbs = [];
        availableProverbs = dataSource;
    }
    
    const index = Math.floor(Math.random() * availableProverbs.length);
    const selectedProverb = availableProverbs[index];
    
    // Sorulan soruları kaydet
    gameState.askedProverbs.push(selectedProverb.id);
    
    return selectedProverb;
}


// Maskot animasyonları
document.addEventListener('DOMContentLoaded', function() {
    const panda = document.getElementById('pandaAvatar');
    
    if (panda) {
        // Tıklandığında bounce animasyonu
        panda.addEventListener('click', function() {
            // Mevcut animasyonu durdur
            this.style.animation = 'none';
            void this.offsetWidth; // Reflow trick
            
            // Bounce animasyonu ekle
            this.style.animation = 'pandaBounce 0.6s ease';
            
            if (typeof soundEffects !== 'undefined') {
                soundEffects.playClick();
            }
            
            // Animasyon bitince normal pulse'a dön
            setTimeout(() => {
                this.style.animation = 'pandaPulse 1.8s ease-in-out infinite';
            }, 600);
        });
    }
});

// Yardım göster
function showHelp() {
    alert('💡 İpucu: Atasözlerini dikkatle oku ve en uygun kelimeyi seç!');
}

// Oyun modu badge'ini güncelle
function updateGameModeBadge() {
    const badge = document.getElementById('gameModeBadge');
    const modeNames = {
        'fillBlank': '📝 Eksik Kelime',
        'multipleChoice': '✅ Çoktan Seçmeli',
        'matching': '🔗 Eşleştirme'
    };
    if (badge) {
        badge.textContent = modeNames[gameState.currentMode] || 'Oyun';
    }
}

// Bilgi sayfası
function showInfo() {
    const modal = document.getElementById('infoModal');
    if (modal) {
        modal.classList.add('show');
    }
}

function closeInfo() {
    const modal = document.getElementById('infoModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Toggle switch
function toggleSwitch() {
    const toggle = document.getElementById('mainToggle');
    toggle.classList.toggle('active');
}


// ==================== PANDA YÖNETİMİ ====================

let pandaTimer = null;
let pandaState = 'mutlu'; // mutlu, normal, uzgun

// Panda resmini değiştir
function changePanda(state) {
    const panda = document.getElementById('pandaAvatar');
    const gamePanda = document.getElementById('gamePanda');
    
    pandaState = state;
    
    if (panda) {
        panda.src = `panda-${state}.png`;
    }
    if (gamePanda) {
        gamePanda.src = `panda-${state}.png`;
    }
}

// Ana ekran panda zamanlayıcısı
function startMainMenuPandaTimer() {
    // İlk 20 saniye mutlu
    changePanda('mutlu');
    
    // 20 saniye sonra normal
    setTimeout(() => {
        if (document.getElementById('mainMenu').classList.contains('active')) {
            changePanda('normal');
        }
    }, 20000);
    
    // 60 saniye sonra üzgün
    pandaTimer = setTimeout(() => {
        if (document.getElementById('mainMenu').classList.contains('active')) {
            changePanda('uzgun');
        }
    }, 60000);
}

// Panda zamanlayıcısını durdur
function stopMainMenuPandaTimer() {
    if (pandaTimer) {
        clearTimeout(pandaTimer);
        pandaTimer = null;
    }
}

// Sayfa yüklendiğinde panda zamanlayıcısını başlat
document.addEventListener('DOMContentLoaded', function() {
    startMainMenuPandaTimer();
    
    // Panda tıklama animasyonu
    const panda = document.getElementById('pandaAvatar');
    if (panda) {
        panda.addEventListener('click', function() {
            this.style.animation = 'none';
            void this.offsetWidth;
            this.style.animation = 'float 3s ease-in-out infinite';
            
            if (typeof soundEffects !== 'undefined') {
                soundEffects.playClick();
            }
        });
    }
});


// ==================== GİRİŞ SİSTEMİ ====================

// Giriş modal'ını göster
function showLogin() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('show');
    }
}

// Giriş modal'ını kapat
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Kullanıcı menüsünü göster
function showUserMenu() {
    const modal = document.getElementById('userMenuModal');
    const user = window.getCurrentUser ? window.getCurrentUser() : null;
    
    if (modal && user) {
        const title = document.getElementById('userMenuTitle');
        const email = document.getElementById('userMenuEmail');
        
        if (user.isAnonymous) {
            title.textContent = 'Misafir Kullanıcı';
            email.textContent = 'Skorlarınız cihazınızda saklanır';
        } else {
            title.textContent = user.displayName || 'Kullanıcı';
            email.textContent = user.email || '';
        }
        
        modal.classList.add('show');
    }
}

// Kullanıcı menüsünü kapat
function closeUserMenu() {
    const modal = document.getElementById('userMenuModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Çıkış yap ve UI'yi güncelle
async function handleSignOut() {
    if (window.signOutUser) {
        await window.signOutUser();
    }
    closeUserMenu();
}

// Global fonksiyonlar
window.showLogin = showLogin;
window.closeLoginModal = closeLoginModal;
window.showUserMenu = showUserMenu;
window.closeUserMenu = closeUserMenu;
window.handleSignOut = handleSignOut;
