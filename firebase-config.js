// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInAnonymously, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, where, Timestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase yapılandırması
const firebaseConfig = {
    apiKey: "AIzaSyC4Y6lo3UlQSu86m05QzyPxtCvV_UcyDSQ",
    authDomain: "atasozleri-oyunu-59b84.firebaseapp.com",
    projectId: "atasozleri-oyunu-59b84",
    storageBucket: "atasozleri-oyunu-59b84.firebasestorage.app",
    messagingSenderId: "229552708072",
    appId: "1:229552708072:web:4823d888fdfbfa75ab2c5d",
    measurementId: "G-45VDGFDW5F"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Google Provider
const googleProvider = new GoogleAuthProvider();

// Kullanıcı durumu
let currentUser = null;

// Auth durumunu dinle
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    updateUIForUser(user);
});

// UI'yi kullanıcıya göre güncelle
function updateUIForUser(user) {
    const loginBtns = document.querySelectorAll('.btn-outlined');
    let loginBtn = null;
    
    // "Giriş Yap" butonunu bul
    loginBtns.forEach(btn => {
        if (btn.textContent.includes('Giriş Yap') || btn.textContent.includes('👤') || btn.textContent.includes('🔒')) {
            loginBtn = btn;
        }
    });
    
    if (user) {
        // Kullanıcı giriş yapmış
        if (loginBtn) {
            if (user.isAnonymous) {
                loginBtn.textContent = '👤 Misafir';
            } else {
                const displayName = user.displayName || user.email || 'Kullanıcı';
                loginBtn.textContent = `👤 ${displayName.split(' ')[0]}`;
            }
            loginBtn.onclick = () => window.showUserMenu();
        }
    } else {
        // Kullanıcı giriş yapmamış
        if (loginBtn) {
            loginBtn.textContent = '🔒 Giriş Yap';
            loginBtn.onclick = () => window.showLogin();
        }
    }
}

// Google ile giriş
async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        console.log('Google ile giriş başarılı:', user.displayName);
        closeLoginModal();
        
        // Start game after successful login
        if (window.app && window.app.selectedMode) {
            const playerName = user.displayName || user.email || 'Oyuncu';
            window.app.startGameWithName(window.app.selectedMode, playerName);
        }
        
        return user;
    } catch (error) {
        console.error('Google giriş hatası:', error);
        
        // Popup iptal edildi veya kapatıldı - sessizce geç
        if (error.code === 'auth/cancelled-popup-request' || 
            error.code === 'auth/popup-closed-by-user') {
            console.log('Giriş iptal edildi');
            return;
        }
        
        // Diğer hatalar için kullanıcıya bilgi ver
        if (error.code === 'auth/popup-blocked') {
            alert('Popup engellendi! Lütfen tarayıcınızın popup engelleyicisini kapatın.');
        } else if (error.code === 'auth/unauthorized-domain') {
            alert('Bu domain Firebase\'de yetkilendirilmemiş. Firebase Console → Authentication → Settings → Authorized domains bölümünden ekleyin.');
        } else {
            alert('Google ile giriş yapılamadı. Lütfen tekrar deneyin.');
        }
    }
}

// Misafir olarak giriş (isimsiz)
async function signInAsGuest() {
    console.log('Misafir girişi başlatılıyor...');
    try {
        console.log('signInAnonymously çağrılıyor...');
        const result = await signInAnonymously(auth);
        const user = result.user;
        console.log('Misafir girişi başarılı:', user.uid);
        closeLoginModal();
        
        // Start game after successful login
        if (window.app && window.app.selectedMode) {
            console.log('Oyun başlatılıyor, mod:', window.app.selectedMode);
            window.app.startGameWithName(window.app.selectedMode, 'Misafir');
        } else {
            console.warn('window.app veya selectedMode bulunamadı');
        }
        
        return user;
    } catch (error) {
        console.error('Misafir giriş hatası:', error);
        console.error('Hata kodu:', error.code);
        console.error('Hata mesajı:', error.message);
        
        if (error.code === 'auth/operation-not-allowed') {
            alert('Misafir girişi Firebase Console\'da etkinleştirilmemiş. Lütfen Firebase Console → Authentication → Sign-in method → Anonymous\'u etkinleştirin.');
        } else {
            alert('Misafir girişi yapılamadı: ' + error.message);
        }
    }
}

// Çıkış yap
async function signOutUser() {
    try {
        await signOut(auth);
        console.log('Çıkış yapıldı');
    } catch (error) {
        console.error('Çıkış hatası:', error);
    }
}

// Skor kaydet (Firebase)
async function saveScoreToFirebase(playerName, score, mode, correct, total) {
    console.log('saveScoreToFirebase çağrıldı:', { playerName, score, mode, correct, total });
    
    if (!currentUser) {
        console.log('Kullanıcı giriş yapmamış, skor kaydedilmedi');
        return;
    }

    try {
        // Kullanıcı adını belirle
        let userName = playerName;
        
        console.log('Gelen playerName:', playerName);
        console.log('currentUser:', currentUser);
        
        if (!userName || userName === '' || userName === 'undefined') {
            if (currentUser.isAnonymous) {
                userName = 'Misafir';
            } else {
                userName = currentUser.displayName || currentUser.email || 'Anonim';
            }
        }
        
        console.log('Kaydedilecek userName:', userName);
        
        const scoreData = {
            userId: currentUser.uid,
            userName: userName,
            userEmail: currentUser.email || null,
            score: score,
            mode: mode,
            correct: correct,
            total: total,
            date: Timestamp.now(),
            timestamp: Date.now()
        };

        await addDoc(collection(db, 'scores'), scoreData);
        console.log('Skor Firebase\'e kaydedildi:', scoreData);
    } catch (error) {
        console.error('Skor kaydetme hatası:', error);
    }
}

// Skorları getir (Firebase)
async function getScoresFromFirebase(timeFilter = 'all') {
    try {
        let q;
        
        // Zaman filtresi
        if (timeFilter === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            q = query(
                collection(db, 'scores'),
                where('timestamp', '>=', today.getTime()),
                orderBy('timestamp', 'desc'),
                limit(100)
            );
        } else if (timeFilter === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            weekAgo.setHours(0, 0, 0, 0);
            q = query(
                collection(db, 'scores'),
                where('timestamp', '>=', weekAgo.getTime()),
                orderBy('timestamp', 'desc'),
                limit(100)
            );
        } else {
            // Tüm zamanlar - sadece score'a göre sırala
            q = query(
                collection(db, 'scores'),
                orderBy('score', 'desc'),
                limit(100)
            );
        }

        const querySnapshot = await getDocs(q);
        const scores = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Tarih dönüşümü - Timestamp veya string olabilir
            let dateString;
            if (data.date && typeof data.date.toDate === 'function') {
                // Firestore Timestamp
                dateString = data.date.toDate().toISOString();
            } else if (data.date) {
                // String veya başka format
                dateString = data.date;
            } else {
                // Tarih yoksa timestamp'ten oluştur
                dateString = new Date(data.timestamp || Date.now()).toISOString();
            }
            
            scores.push({
                name: data.userName || 'Anonim',
                score: data.score || 0,
                mode: data.mode || 'unknown',
                correct: data.correct || 0,
                total: data.total || 0,
                date: dateString,
                timestamp: data.timestamp || Date.now()
            });
        });
        
        // Client-side sıralama (bugün ve bu hafta için)
        if (timeFilter === 'today' || timeFilter === 'week') {
            scores.sort((a, b) => b.score - a.score);
        }

        return scores;
    } catch (error) {
        console.error('Skorları getirme hatası:', error);
        return [];
    }
}

// Global fonksiyonlar
window.signInWithGoogle = signInWithGoogle;
window.signInAsGuest = signInAsGuest;
window.signOutUser = signOutUser;
window.saveScoreToFirebase = saveScoreToFirebase;
window.getScoresFromFirebase = getScoresFromFirebase;
window.getCurrentUser = () => currentUser;

export { signInWithGoogle, signInAsGuest, signOutUser, saveScoreToFirebase, getScoresFromFirebase };
