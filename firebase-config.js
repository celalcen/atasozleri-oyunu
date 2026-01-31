// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// Global Skor Kaydetme
export async function saveScoreToFirebase(name, score, mode, correct, total) {
    try {
        await addDoc(collection(db, "scores"), {
            name: name,
            score: score,
            mode: mode,
            correct: correct,
            total: total,
            timestamp: Date.now(),
            date: new Date().toISOString()
        });
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
