/**
 * AudioManager - Handles all sound effects with iOS support
 */
import { GAME_CONFIG } from './GameConfig.js';

export class AudioManager {
    constructor() {
        this.enabled = localStorage.getItem(GAME_CONFIG.STORAGE.SOUND_ENABLED) !== 'false';
        this.audioContext = null;
        this.masterGain = null;
        this.initialized = false;
        this.lastPlayTime = {};
        this.minTimeBetweenSounds = GAME_CONFIG.AUDIO.MIN_TIME_BETWEEN_SOUNDS;
        
        // Load saved volume or use default
        const savedVolume = localStorage.getItem(GAME_CONFIG.STORAGE.SOUND_VOLUME);
        this.volume = savedVolume !== null ? parseFloat(savedVolume) : GAME_CONFIG.AUDIO.DEFAULT_VOLUME;
        
        // Try to initialize on construction (will be resumed on first interaction)
        this.initAudioContext();
    }

    initAudioContext() {
        if (this.audioContext) return;
        
        if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
            console.warn('AudioContext not supported');
            return;
        }
        
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContextClass();
            
            // Create master gain node for volume control
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.volume;
            
            this.initialized = true;
            
            // Detect iOS
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            
            // Log initial state
            console.log('AudioContext initialized');
            console.log('- State:', this.audioContext.state);
            console.log('- iOS:', isIOS);
            console.log('- Sample Rate:', this.audioContext.sampleRate);
            
            // iOS requires user interaction to start audio
            if (isIOS && this.audioContext.state === 'suspended') {
                console.log('iOS detected: AudioContext will resume on first user interaction');
            }
        } catch (error) {
            console.error('Failed to initialize AudioContext:', error);
        }
    }

    async resumeAudioContext() {
        if (!this.audioContext) {
            this.initAudioContext();
        }
        
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.log('AudioContext resumed, state:', this.audioContext.state);
            } catch (error) {
                console.warn('Failed to resume AudioContext:', error);
            }
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem(GAME_CONFIG.STORAGE.SOUND_ENABLED, this.enabled);
        
        // Resume audio context on toggle if enabling
        if (this.enabled) {
            this.resumeAudioContext();
        }
        
        return this.enabled;
    }

    canPlaySound(type) {
        if (!this.enabled || !this.initialized) return false;
        
        const now = Date.now();
        const lastTime = this.lastPlayTime[type] || 0;
        
        // Prevent spam
        if (now - lastTime < this.minTimeBetweenSounds) {
            return false;
        }
        
        return true;
    }

    playCorrect() {
        if (!this.canPlaySound('correct')) return;
        this.playSound(
            'correct', 
            GAME_CONFIG.AUDIO.CORRECT_FREQUENCY, 
            GAME_CONFIG.AUDIO.CORRECT_DURATION
        );
    }

    playWrong() {
        if (!this.canPlaySound('wrong')) return;
        this.playSweepTone(
            'wrong',
            GAME_CONFIG.AUDIO.WRONG_FREQUENCY,
            GAME_CONFIG.AUDIO.WRONG_FREQUENCY_END,
            GAME_CONFIG.AUDIO.WRONG_DURATION
        );
    }

    playClick() {
        if (!this.canPlaySound('click')) return;
        this.playSound(
            'click', 
            GAME_CONFIG.AUDIO.CLICK_FREQUENCY, 
            GAME_CONFIG.AUDIO.CLICK_DURATION
        );
    }

    async playSound(type, frequency, duration) {
        if (!this.audioContext || !this.masterGain) {
            console.warn('AudioContext not initialized');
            return;
        }
        
        // Resume context if suspended (iOS requirement)
        if (this.audioContext.state === 'suspended') {
            await this.resumeAudioContext();
        }
        
        // Check if context is running
        if (this.audioContext.state !== 'running') {
            console.warn('AudioContext not running, state:', this.audioContext.state);
            return;
        }
        
        try {
            // Update last play time
            this.lastPlayTime[type] = Date.now();
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // Connect through master gain
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            // Improved envelope with configurable attack/release
            const now = this.audioContext.currentTime;
            const attackTime = GAME_CONFIG.AUDIO.ATTACK_TIME;
            const releaseTime = GAME_CONFIG.AUDIO.RELEASE_TIME;
            
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(1, now + attackTime);
            gainNode.gain.setValueAtTime(1, now + duration - releaseTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            oscillator.start(now);
            oscillator.stop(now + duration);
            
            // Clean up after sound finishes
            oscillator.onended = () => {
                try {
                    oscillator.disconnect();
                    gainNode.disconnect();
                } catch (e) {
                    // Already disconnected, ignore
                }
            };
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }

    // Sweep tone for wrong answer (descending pitch)
    async playSweepTone(type, startFreq, endFreq, duration) {
        if (!this.audioContext || !this.masterGain) {
            console.warn('AudioContext not initialized');
            return;
        }
        
        // Resume context if suspended (iOS requirement)
        if (this.audioContext.state === 'suspended') {
            await this.resumeAudioContext();
        }
        
        // Check if context is running
        if (this.audioContext.state !== 'running') {
            console.warn('AudioContext not running, state:', this.audioContext.state);
            return;
        }
        
        try {
            // Update last play time
            this.lastPlayTime[type] = Date.now();
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // Connect through master gain
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.type = 'sine';
            
            // Frequency sweep from start to end
            const now = this.audioContext.currentTime;
            oscillator.frequency.setValueAtTime(startFreq, now);
            oscillator.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
            
            // Improved envelope
            const attackTime = GAME_CONFIG.AUDIO.ATTACK_TIME;
            const releaseTime = GAME_CONFIG.AUDIO.RELEASE_TIME;
            
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.8, now + attackTime);
            gainNode.gain.setValueAtTime(0.8, now + duration - releaseTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            oscillator.start(now);
            oscillator.stop(now + duration);
            
            // Clean up after sound finishes
            oscillator.onended = () => {
                try {
                    oscillator.disconnect();
                    gainNode.disconnect();
                } catch (e) {
                    // Already disconnected, ignore
                }
            };
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }

    // Test audio system
    async testAudio() {
        console.log('Testing audio system...');
        console.log('State:', this.getState());
        
        if (!this.initialized) {
            console.error('Audio not initialized');
            return false;
        }
        
        await this.resumeAudioContext();
        
        if (this.audioContext.state !== 'running') {
            console.error('AudioContext not running');
            return false;
        }
        
        try {
            // Play a test tone
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.frequency.value = 440; // A4 note
            oscillator.type = 'sine';
            
            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            
            oscillator.start(now);
            oscillator.stop(now + 0.2);
            
            console.log('Audio test successful');
            return true;
        } catch (error) {
            console.error('Audio test failed:', error);
            return false;
        }
    }

    setVolume(volume) {
        // Clamp volume between min and max
        this.volume = Math.max(
            GAME_CONFIG.AUDIO.MIN_VOLUME, 
            Math.min(GAME_CONFIG.AUDIO.MAX_VOLUME, volume)
        );
        
        // Update master gain if initialized
        if (this.masterGain) {
            // Smooth volume change
            const now = this.audioContext.currentTime;
            this.masterGain.gain.cancelScheduledValues(now);
            this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
            this.masterGain.gain.linearRampToValueAtTime(this.volume, now + 0.05);
        }
        
        // Save to localStorage
        localStorage.setItem(GAME_CONFIG.STORAGE.SOUND_VOLUME, this.volume.toString());
    }

    getVolume() {
        return this.volume;
    }

    isEnabled() {
        return this.enabled;
    }

    getState() {
        return {
            enabled: this.enabled,
            initialized: this.initialized,
            contextState: this.audioContext ? this.audioContext.state : 'not-initialized',
            volume: this.volume
        };
    }
}

