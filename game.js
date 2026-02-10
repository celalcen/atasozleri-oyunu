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
    checkUserAuth();
};

// Kullanıcı kimlik doğrulamasını kontrol et
function checkUserAuth() {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('playerName');
    const userPhoto = localStorage.getItem('userPhoto');
    
    if (userId && userName) {
        // Kullanıcı giriş yapmış
        updateUserUI({
            displayName: userName,
            photoURL: userPhoto,
            uid: userId
        });
    } else {
        // Misafir kullanıcı
        updateUserUI(null);
    }
}

// Kullanıcı UI'ını güncelle
window.updateUserUI = function(user) {
    const userProfile = document.getElementById('userProfile');
    const guestProfile = document.getElementById('guestProfile');
    
    if (user) {
        // Giriş yapmış kullanıcı
        document.getElementById('userName').textContent = user.displayName || 'Kullanıcı';
        
        const userPhoto = document.getElementById('userPhoto');
        if (user.photoURL) {
            userPhoto.src = user.photoURL;
            userPhoto.style.display = 'block';
        } else {
            userPhoto.style.display = 'none';
        }
        
        userProfile.style.display = 'flex';
        guestProfile.style.display = 'none';
    } else {
        // Misafir kullanıcı
        userProfile.style.display = 'none';
        guestProfile.style.display = 'flex';
    }
}

// Giriş modalını göster
window.showLoginModal = function() {
    const modal = document.getElementById('loginModal');
    modal.classList.add('show');
}

// Giriş modalını kapat
window.closeLoginModal = function() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('show');
}

// Google ile giriş
window.loginWithGoogle = async function() {
    if (typeof signInWithGoogle === 'undefined') {
        alert('Firebase Authentication yüklenmedi!');
        return;
    }
    
    const result = await signInWithGoogle();
    if (result.success) {
        closeLoginModal();
        if (typeof soundEffects !== 'undefined') soundEffects.playCorrect();
    } else {
        alert('Giriş başarısız: ' + result.error);
    }
}

// Apple ile giriş
window.loginWithApple = async function() {
    if (typeof signInWithApple === 'undefined') {
        alert('Firebase Authentication yüklenmedi!');
        return;
    }
    
    const result = await signInWithApple();
    if (result.success) {
        closeLoginModal();
        if (typeof soundEffects !== 'undefined') soundEffects.playCorrect();
    } else {
        alert('Giriş başarısız: ' + result.error);
    }
}

// Misafir olarak devam et
window.continueAsGuest = function() {
    closeLoginModal();
    // İsim girişi modalını göster
    const nameModal = document.getElementById('nameModal');
    nameModal.classList.add('show');
    setTimeout(() => {
        document.getElementById('playerNameInput').focus();
    }, 400);
}

// Çıkış yap
window.logout = async function() {
    if (typeof signOutUser === 'undefined') {
        alert('Firebase Authentication yüklenmedi!');
        return;
    }
    
    const result = await signOutUser();
    if (result.success) {
        // Oyun verilerini temizle
        gameState.playerName = '';
        localStorage.removeItem('playerName');
        updateUserUI(null);
        if (typeof soundEffects !== 'undefined') soundEffects.playClick();
    } else {
        alert('Çıkış başarısız: ' + result.error);
    }
}

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
window.startGame = function(mode) {
    gameState.currentMode = mode;
    
    // Eğer kullanıcı giriş yapmışsa veya ismi varsa direkt başlat
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('playerName');
    
    if (userName) {
        // İsim varsa (giriş yapmış veya misafir)
        gameState.playerName = userName;
        startGameSession();
    } else {
        // İsim yoksa, isim girişi modalını göster
        const nameModal = document.getElementById('nameModal');
        nameModal.classList.add('show');
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

// Oyun oturumunu başlat
function startGameSession() {
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

// İsmi kaydet ve oyunu başlat
window.submitName = function() {
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
    startGameSession();
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
window.backToMenu = function() {
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
window.toggleSound = function() {
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
    // Zamanlayıcıyı durdur
    stopTimer();
    
    const gameCard = document.getElementById('gameCard');
    const successOverlay = document.getElementById('successOverlay');
    const errorOverlay = document.getElementById('errorOverlay');
    
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
            nextQuestion();
        }, 1000);
        
    } else {
        button.classList.add('wrong');
        gameState.streak = 0;
        gameState.wrongAnswers++;
        
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
                showGameOver();
            }, 3000);
            return;
        }
        
        // Yanlış cevap - 3 saniye sonra sıradaki soruya geç (doğru cevabı görmek için)
        setTimeout(() => {
            errorOverlay.classList.remove('show');
            gameCard.classList.remove('shake');
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
    
    // Başarı durumuna göre mesaj
    if (isWin) {
        title.textContent = '🎉 Tebrikler!';
        message.textContent = `Harika bir performans ${gameState.playerName}!`;
        mascot.style.animation = 'bounce 0.6s ease 3';
        createConfetti();
    } else if (gameState.wrongAnswers >= 5) {
        title.textContent = '😔 Oyun Bitti';
        message.textContent = '5 yanlış yaptın. Tekrar dene!';
        mascot.style.animation = 'shake 0.5s ease';
    } else {
        title.textContent = '⏰ Süre Doldu';
        message.textContent = 'Zamanın bitti! Tekrar dene!';
        mascot.style.animation = 'shake 0.5s ease';
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
window.restartGame = function() {
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
window.closeGameOver = function() {
    const modal = document.getElementById('gameOverModal');
    modal.classList.remove('show');
    backToMenu();
}

// Skor Tablosu Fonksiyonları
window.saveScore = async function(score, mode, correctAnswers, totalQuestions) {
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

window.showLeaderboard = async function() {
    showScreen('leaderboardScreen');
    await showLeaderboardTab('all');
}

window.showLeaderboardTab = async function(tab) {
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


// Yardım göster
window.showHelp = function() {
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

// Oyun başladığında badge'i güncelle
const originalStartGame = startGame;
startGame = function(mode) {
    originalStartGame(mode);
    updateGameModeBadge();
};
