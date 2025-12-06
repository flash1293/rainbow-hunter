// Audio system for game sound effects and music
const Audio = (function() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Background music state
    let backgroundMusicOscillators = [];
    let backgroundMusicGains = [];
    let backgroundMusicTimeouts = [];

    // Goblin proximity sound state
    let lastGoblinSoundTime = 0;

    // Sound effect functions
    function playShootSound() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    function playExplosionSound() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sawtooth';
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
        
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }

    function playDeathSound() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    function playCollectSound() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.05);
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }

    function playRepairSound() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }

    function playEmptyGunSound() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
    }

    function playStuckSound() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.15);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
    }

    function playBulletImpactSound() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'square';
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, audioContext.currentTime);
        
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.08);
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.08);
    }

    function playGoblinDeathSound() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.4);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
    }

    function playWinSound() {
        const notes = [523, 587, 659, 784, 880];
        notes.forEach((freq, i) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.1);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + i * 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.3);
            
            oscillator.start(audioContext.currentTime + i * 0.1);
            oscillator.stop(audioContext.currentTime + i * 0.1 + 0.3);
        });
    }

    function startBackgroundMusic() {
        const melody = [
            { freq: 523, duration: 0.3 }, { freq: 587, duration: 0.3 }, { freq: 659, duration: 0.3 },
            { freq: 784, duration: 0.6 }, { freq: 659, duration: 0.3 }, { freq: 587, duration: 0.3 },
            { freq: 523, duration: 0.9 }, { freq: 587, duration: 0.3 }, { freq: 659, duration: 0.3 },
            { freq: 784, duration: 0.3 }, { freq: 880, duration: 0.6 }, { freq: 784, duration: 0.3 },
            { freq: 659, duration: 0.9 }, { freq: 659, duration: 0.3 }, { freq: 784, duration: 0.3 },
            { freq: 880, duration: 0.3 }, { freq: 987, duration: 0.6 }, { freq: 880, duration: 0.3 },
            { freq: 784, duration: 0.9 }, { freq: 659, duration: 0.3 }, { freq: 587, duration: 0.3 },
            { freq: 523, duration: 0.6 }, { freq: 587, duration: 0.3 }, { freq: 659, duration: 0.9 },
            { freq: 587, duration: 0.3 }, { freq: 523, duration: 0.3 }, { freq: 440, duration: 0.6 },
            { freq: 494, duration: 0.3 }, { freq: 523, duration: 0.9 }, { freq: 659, duration: 0.3 },
            { freq: 784, duration: 0.3 }, { freq: 659, duration: 0.3 }, { freq: 523, duration: 0.6 },
            { freq: 587, duration: 0.3 }, { freq: 659, duration: 0.9 }, { freq: 784, duration: 0.3 },
            { freq: 880, duration: 0.3 }, { freq: 987, duration: 0.6 }, { freq: 880, duration: 0.3 },
            { freq: 784, duration: 0.9 }
        ];
        
        let currentTime = audioContext.currentTime;
        
        melody.forEach(note => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(note.freq, currentTime);
            gainNode.gain.setValueAtTime(0.04, currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + note.duration);
            
            oscillator.start(currentTime);
            oscillator.stop(currentTime + note.duration);
            
            backgroundMusicOscillators.push(oscillator);
            backgroundMusicGains.push(gainNode);
            
            currentTime += note.duration;
        });
        
        const totalDuration = currentTime - audioContext.currentTime;
        const timeout = setTimeout(() => startBackgroundMusic(), totalDuration * 1000);
        backgroundMusicTimeouts.push(timeout);
    }

    function stopBackgroundMusic() {
        backgroundMusicOscillators.forEach(osc => {
            try {
                osc.frequency.cancelScheduledValues(audioContext.currentTime);
                osc.stop(audioContext.currentTime);
            } catch (e) {
                // Oscillator may already be stopped
            }
        });
        
        backgroundMusicGains.forEach(gain => {
            try {
                gain.gain.cancelScheduledValues(audioContext.currentTime);
            } catch (e) {
                // May already be cancelled
            }
        });
        
        backgroundMusicTimeouts.forEach(timeout => clearTimeout(timeout));
        
        backgroundMusicOscillators = [];
        backgroundMusicGains = [];
        backgroundMusicTimeouts = [];
    }

    function startBikeSound() {
        // Removed - bike sound disabled
    }

    function stopBikeSound() {
        // Removed - bike sound disabled
    }

    function updateGoblinProximitySound(playerPosition, goblins) {
        let closestDist = Infinity;
        
        goblins.forEach(gob => {
            if (gob.alive) {
                const dist = Math.sqrt(
                    Math.pow(playerPosition.x - gob.mesh.position.x, 2) +
                    Math.pow(playerPosition.z - gob.mesh.position.z, 2)
                );
                closestDist = Math.min(closestDist, dist);
            }
        });
        
        const now = Date.now();
        if (closestDist < 20 && now - lastGoblinSoundTime > 800) {
            lastGoblinSoundTime = now;
            
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(audioContext.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(150, audioContext.currentTime);
            
            const volume = Math.max(0, 0.15 * (1 - closestDist / 20));
            gain.gain.setValueAtTime(volume, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
            
            osc.start(audioContext.currentTime);
            osc.stop(audioContext.currentTime + 0.2);
        }
    }

    // Return public API
    return {
        playShootSound,
        playExplosionSound,
        playDeathSound,
        playCollectSound,
        playRepairSound,
        playEmptyGunSound,
        playStuckSound,
        playBulletImpactSound,
        playGoblinDeathSound,
        playWinSound,
        startBackgroundMusic,
        stopBackgroundMusic,
        startBikeSound,
        stopBikeSound,
        updateGoblinProximitySound
    };
})();

