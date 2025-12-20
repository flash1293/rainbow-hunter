// Audio system for game sound effects and music
const Audio = (function() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Check if in splitscreen mode as client (only host plays sounds)
    function shouldPlayAudio() {
        const urlParams = new URLSearchParams(window.location.search);
        const isSplitscreen = urlParams.get('splitscreen');
        // Only play audio if not in splitscreen mode, or if we're the host
        return !isSplitscreen || isSplitscreen === 'host';
    }

    // Background music state
    let backgroundMusicOscillators = [];
    let backgroundMusicGains = [];
    let backgroundMusicTimeouts = [];

    // Goblin proximity sound state
    let lastGoblinSoundTime = 0;
    
    // Giant proximity sound state
    let giantRumbleOscillator = null;
    let giantRumbleGain = null;
    let giantRumbleFilter = null;

    // Sound effect functions
    function playShootSound() {
        if (!shouldPlayAudio()) return;
        
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
        if (!shouldPlayAudio()) return;
        
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

    function playBombExplosionSound() {
        if (!shouldPlayAudio()) return;
        
        // Create a deeper, more intense explosion sound
        const now = audioContext.currentTime;
        
        // Main explosion boom
        const mainOsc = audioContext.createOscillator();
        const mainGain = audioContext.createGain();
        const mainFilter = audioContext.createBiquadFilter();
        
        mainOsc.connect(mainFilter);
        mainFilter.connect(mainGain);
        mainGain.connect(audioContext.destination);
        
        mainOsc.type = 'sawtooth';
        mainFilter.type = 'lowpass';
        mainFilter.frequency.setValueAtTime(3000, now);
        mainFilter.frequency.exponentialRampToValueAtTime(30, now + 0.5);
        
        mainOsc.frequency.setValueAtTime(150, now);
        mainOsc.frequency.exponentialRampToValueAtTime(25, now + 0.5);
        
        mainGain.gain.setValueAtTime(0.7, now);
        mainGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        
        mainOsc.start(now);
        mainOsc.stop(now + 0.5);
        
        // Sub-bass thump
        const subOsc = audioContext.createOscillator();
        const subGain = audioContext.createGain();
        
        subOsc.connect(subGain);
        subGain.connect(audioContext.destination);
        
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(80, now);
        subOsc.frequency.exponentialRampToValueAtTime(20, now + 0.4);
        
        subGain.gain.setValueAtTime(0.6, now);
        subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        
        subOsc.start(now);
        subOsc.stop(now + 0.4);
        
        // Noise burst for texture
        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.3, audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
            noiseData[i] = (Math.random() * 2 - 1) * (1 - i / noiseData.length);
        }
        
        const noiseSource = audioContext.createBufferSource();
        const noiseGain = audioContext.createGain();
        const noiseFilter = audioContext.createBiquadFilter();
        
        noiseSource.buffer = noiseBuffer;
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(audioContext.destination);
        
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(2000, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        
        noiseGain.gain.setValueAtTime(0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        noiseSource.start(now);
    }

    function playDeathSound() {
        if (!shouldPlayAudio()) return;
        
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
        if (!shouldPlayAudio()) return;
        
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
        if (!shouldPlayAudio()) return;
        
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
        if (!shouldPlayAudio()) return;
        
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
        if (!shouldPlayAudio()) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }
    
    function playGiantAttackSound() {
        if (!shouldPlayAudio()) return;
        
        // Deep impact sound with rumble
        const impact = audioContext.createOscillator();
        const impactGain = audioContext.createGain();
        const impactFilter = audioContext.createBiquadFilter();
        
        impact.type = 'sawtooth';
        impact.frequency.setValueAtTime(60, audioContext.currentTime);
        impact.frequency.exponentialRampToValueAtTime(20, audioContext.currentTime + 0.4);
        
        impactFilter.type = 'lowpass';
        impactFilter.frequency.setValueAtTime(200, audioContext.currentTime);
        impactFilter.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 0.4);
        
        impact.connect(impactFilter);
        impactFilter.connect(impactGain);
        impactGain.connect(audioContext.destination);
        
        impactGain.gain.setValueAtTime(0.6, audioContext.currentTime);
        impactGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        impact.start(audioContext.currentTime);
        impact.stop(audioContext.currentTime + 0.5);
        
        // Wind-up whoosh sound
        const whoosh = audioContext.createOscillator();
        const whooshGain = audioContext.createGain();
        const whooshFilter = audioContext.createBiquadFilter();
        
        whoosh.type = 'triangle';
        whoosh.frequency.setValueAtTime(200, audioContext.currentTime);
        whoosh.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.15);
        
        whooshFilter.type = 'bandpass';
        whooshFilter.frequency.setValueAtTime(400, audioContext.currentTime);
        whooshFilter.Q.setValueAtTime(10, audioContext.currentTime);
        
        whoosh.connect(whooshFilter);
        whooshFilter.connect(whooshGain);
        whooshGain.connect(audioContext.destination);
        
        whooshGain.gain.setValueAtTime(0.3, audioContext.currentTime);
        whooshGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        whoosh.start(audioContext.currentTime);
        whoosh.stop(audioContext.currentTime + 0.2);
    }

    function playBulletImpactSound() {
        if (!shouldPlayAudio()) return;
        
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
        if (!shouldPlayAudio()) return;
        
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
        if (!shouldPlayAudio()) return;
        
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

    function playArrowShootSound() {
        if (!shouldPlayAudio()) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.15);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
    }

    let arrowWhooshNodes = [];

    function updateArrowProximitySound(playerPos, arrows) {
        if (!shouldPlayAudio()) return;
        
        // Clean up old arrow sounds
        arrowWhooshNodes = arrowWhooshNodes.filter(node => {
            if (node.stopTime && audioContext.currentTime > node.stopTime) {
                try { node.oscillator.stop(); } catch(e) {}
                return false;
            }
            return true;
        });

        arrows.forEach((arrow, index) => {
            const dist = playerPos.distanceTo(arrow.mesh.position);
            const maxDist = 20;
            
            if (dist < maxDist) {
                let node = arrowWhooshNodes.find(n => n.arrowIndex === index);
                
                if (!node) {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    
                    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                    
                    oscillator.start();
                    
                    node = { oscillator, gainNode, arrowIndex: index };
                    arrowWhooshNodes.push(node);
                }
                
                const volume = Math.max(0, (maxDist - dist) / maxDist) * 0.2;
                node.gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
            }
        });
    }

    function startBackgroundMusic() {
        if (!shouldPlayAudio()) return;
        
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
        if (!shouldPlayAudio()) return;
        
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
    
    function updateGiantProximitySound(playerPosition, goblins) {
        if (!shouldPlayAudio()) return;
        
        // Find closest giant
        let closestGiantDist = Infinity;
        goblins.forEach(gob => {
            if (gob.alive && gob.isGiant) {
                const dist = Math.sqrt(
                    Math.pow(playerPosition.x - gob.mesh.position.x, 2) +
                    Math.pow(playerPosition.z - gob.mesh.position.z, 2)
                );
                closestGiantDist = Math.min(closestGiantDist, dist);
            }
        });
        
        const giantProximityRange = 50;
        
        if (closestGiantDist < giantProximityRange) {
            // Start or update rumble sound
            if (!giantRumbleOscillator) {
                giantRumbleOscillator = audioContext.createOscillator();
                giantRumbleGain = audioContext.createGain();
                giantRumbleFilter = audioContext.createBiquadFilter();
                
                giantRumbleOscillator.type = 'sawtooth';
                giantRumbleOscillator.frequency.setValueAtTime(30, audioContext.currentTime);
                
                giantRumbleFilter.type = 'lowpass';
                giantRumbleFilter.frequency.setValueAtTime(60, audioContext.currentTime);
                giantRumbleFilter.Q.setValueAtTime(8, audioContext.currentTime);
                
                giantRumbleOscillator.connect(giantRumbleFilter);
                giantRumbleFilter.connect(giantRumbleGain);
                giantRumbleGain.connect(audioContext.destination);
                
                giantRumbleOscillator.start(audioContext.currentTime);
            }
            
            // Adjust volume based on distance
            const volume = Math.max(0, 0.4 * (1 - closestGiantDist / giantProximityRange));
            giantRumbleGain.gain.setTargetAtTime(volume, audioContext.currentTime, 0.1);
            
            // Modulate frequency more dramatically for menacing effect
            const freqModulation = 30 + Math.sin(audioContext.currentTime * 3) * 10;
            giantRumbleOscillator.frequency.setTargetAtTime(freqModulation, audioContext.currentTime, 0.05);
        } else {
            // Stop rumble sound if too far
            if (giantRumbleOscillator) {
                giantRumbleGain.gain.setTargetAtTime(0, audioContext.currentTime, 0.2);
                setTimeout(() => {
                    if (giantRumbleOscillator) {
                        giantRumbleOscillator.stop();
                        giantRumbleOscillator = null;
                        giantRumbleGain = null;
                        giantRumbleFilter = null;
                    }
                }, 300);
            }
        }
    }

    // Return public API
    return {
        playShootSound,
        playExplosionSound,
        playBombExplosionSound,
        playDeathSound,
        playCollectSound,
        playRepairSound,
        playEmptyGunSound,
        playStuckSound,
        playGiantAttackSound,
        playBulletImpactSound,
        playGoblinDeathSound,
        playWinSound,
        startBackgroundMusic,
        stopBackgroundMusic,
        startBikeSound,
        stopBikeSound,
        updateGoblinProximitySound,
        updateGiantProximitySound,
        playArrowShootSound,
        updateArrowProximitySound
    };
})();

