// Web Audio API ile ses efektleri
class SoundEffects {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.initAudio();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API desteklenmiyor');
            this.enabled = false;
        }
    }

    // Doğru cevap sesi - Neşeli melodi
    playCorrect() {
        if (!this.enabled) return;
        
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Yükselen melodi: Do - Mi - Sol
        oscillator.frequency.setValueAtTime(523.25, now); // Do
        oscillator.frequency.setValueAtTime(659.25, now + 0.1); // Mi
        oscillator.frequency.setValueAtTime(783.99, now + 0.2); // Sol
        
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        
        oscillator.start(now);
        oscillator.stop(now + 0.4);
    }

    // Yanlış cevap sesi - Düşük ton
    playWrong() {
        if (!this.enabled) return;
        
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Düşen ton
        oscillator.frequency.setValueAtTime(300, now);
        oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.3);
        
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        oscillator.start(now);
        oscillator.stop(now + 0.3);
    }

    // Seviye atlama sesi - Zafer fanfarı
    playLevelUp() {
        if (!this.enabled) return;
        
        const now = this.audioContext.currentTime;
        
        // Üç nota çal
        const notes = [523.25, 659.25, 783.99, 1046.50]; // Do Mi Sol Do
        
        notes.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, now + index * 0.15);
            oscillator.type = 'triangle';
            
            gainNode.gain.setValueAtTime(0.3, now + index * 0.15);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.15 + 0.3);
            
            oscillator.start(now + index * 0.15);
            oscillator.stop(now + index * 0.15 + 0.3);
        });
    }

    // Buton tıklama sesi
    playClick() {
        if (!this.enabled) return;
        
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        oscillator.start(now);
        oscillator.stop(now + 0.05);
    }

    // Sesleri aç/kapat
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// Global ses efektleri nesnesi
const soundEffects = new SoundEffects();
