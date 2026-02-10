// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, OAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyC4Y6lo3UlQSu86m05QzyPxtCvV_UcyDSQ",
    authDomain: "atasozleri-oyunu-59b84.firebaseapp.com",
    projectId: "atasozleri-oyunu-59b84",
    storageBucket: "atasozleri-oyunu-59b84.firebasestorage.app",
    messagingSenderId: "229552708072",
    appId: "1:229552708072:web:4823d888fdfbfa75ab2c5d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Auth Providers
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

// Kullanıcı Durumu
let currentUser = null;

// Auth State Listener
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        console.log("Kullanıcı giriş yaptı:", user.displayName || user.email);
        // Kullanıcı bilgilerini localStorage'a kaydet
        localStorage.setItem('playerName', user.displayName || user.email.split('@')[0]);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userPhoto', user.photoURL || '');
        localStorage.setItem('userId', user.uid);
        
        // UI'ı güncelle
        if (typeof updateUserUI === 'function') {
            updateUserUI(user);
        }
    } else {
        console.log("Kullanıcı çıkış yaptı");
        // Kullanıcı bilgilerini temizle (isim hariç - oyun için gerekli)
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPhoto');
        localStorage.removeItem('userId');
        
        // UI'ı güncelle
        if (typeof updateUserUI === 'function') {
            updateUserUI(null);
        }
    }
});

// Google ile Giriş
export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        console.log("Google ile giriş başarılı:", user.displayName);
        return { success: true, user };
    } catch (error) {
        console.error("Google giriş hatası:", error);
        return { success: false, error: error.message };
    }
}

// Apple ile Giriş
export async function signInWithApple() {
    try {
        const result = await signInWithPopup(auth, appleProvider);
        const user = result.user;
        console.log("Apple ile giriş başarılı:", user.displayName || user.email);
        return { success: true, user };
    } catch (error) {
        console.error("Apple giriş hatası:", error);
        return { success: false, error: error.message };
    }
}

// Çıkış Yap
export async function signOutUser() {
    try {
        await signOut(auth);
        console.log("Çıkış başarılı");
        return { success: true };
    } catch (error) {
        console.error("Çıkış hatası:", error);
        return { success: false, error: error.message };
    }
}

// Mevcut Kullanıcıyı Al
export function getCurrentUser() {
    return currentUser;
}

// Global Skor Kaydetme
export async function saveScoreToFirebase(name, score, mode, correct, total) {
    try {
        const scoreData = {
            name: name,
            score: score,
            mode: mode,
            correct: correct,
            total: total,
            timestamp: Date.now(),
            date: new Date().toISOString()
        };
        
        // Eğer kullanıcı giriş yaptıysa, userId'yi de ekle
        if (currentUser) {
            scoreData.userId = currentUser.uid;
            scoreData.userEmail = currentUser.email;
        }
        
        await addDoc(collection(db, "scores"), scoreData);
        console.log("Skor Firebase'e kaydedildi!");
        return true;
    } catch (error) {
        console.error("Firebase kayıt hatası:", error);
        return false;
    }
}

// Global Skorları Getirme
export async function getScoresFromFirebase(filterType = 'all') {
    try {
        let q;
        const scoresRef = collection(db, "scores");
        
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;
        
        if (filterType === 'today') {
            q = query(scoresRef, 
                where("timestamp", ">", now - oneDay),
                orderBy("timestamp", "desc"),
                orderBy("score", "desc"),
                limit(100)
            );
        } else if (filterType === 'week') {
            q = query(scoresRef,
                where("timestamp", ">", now - oneWeek),
                orderBy("timestamp", "desc"),
                orderBy("score", "desc"),
                limit(100)
            );
        } else {
            q = query(scoresRef,
                orderBy("score", "desc"),
                limit(100)
            );
        }
        
        const querySnapshot = await getDocs(q);
        const scores = [];
        
        querySnapshot.forEach((doc) => {
            scores.push(doc.data());
        });
        
        // Skora göre sırala
        scores.sort((a, b) => b.score - a.score);
        
        console.log(`${scores.length} skor Firebase'den alındı!`);
        return scores;
    } catch (error) {
        console.error("Firebase okuma hatası:", error);
        return [];
    }
}
