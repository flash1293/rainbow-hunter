// Multiplayer system using PeerJS

class MultiplayerManager {
    constructor(predefinedRoomCode = null) {
        this.myRoomCode = predefinedRoomCode || Math.floor(100 + Math.random() * 900).toString();
        // For splitscreen, host uses the room code, client uses room code + "-client"
        const urlParams = new URLSearchParams(window.location.search);
        this.isSplitscreenClient = urlParams.get('splitscreen') === 'client';
        const peerId = this.isSplitscreenClient ? `fahrrad-abenteuer-${this.myRoomCode}-client` : `fahrrad-abenteuer-${this.myRoomCode}`;
        
        this.peer = new Peer(peerId);
        this.conn = null;
        this.isHost = false;
        this.isClient = false;
        this.otherPlayers = new Map(); // Map of peerId -> player data
        this.updateCallbacks = [];
        this.syncInterval = null;
        
        this.setupPeer();
        this.displayRoomCode();
    }
    
    setupPeer() {
        this.peer.on('open', (id) => {
            // In splitscreen mode, client should not be host
            if (!this.isSplitscreenClient) {
                this.isHost = true; // By default, you're a host until you join someone
            }
        });
        
        this.peer.on('connection', (conn) => {
            this.conn = conn;
            this.isHost = true;
            this.isClient = false;
            this.setupConnection(conn);
            this.updateStatus('Spieler verbunden! Du bist Host (Mädchen).');
            
            // Notify callbacks that client connected
            this.updateCallbacks.forEach(callback => {
                callback('clientConnected', {});
            });
        });
        
        this.peer.on('error', (err) => {
            this.updateStatus('Verbindungsfehler: ' + err.type);
        });
    }
    
    displayRoomCode() {
        const codeEl = document.getElementById('my-room-code');
        if (codeEl) {
            codeEl.textContent = this.myRoomCode;
        }
    }
    
    joinRoom(roomCode) {
        if (!roomCode || roomCode.length !== 3) {
            this.updateStatus('Bitte 3-stelligen Raum-Code eingeben');
            return;
        }
        
        this.conn = this.peer.connect(`fahrrad-abenteuer-${roomCode}`);
        this.isHost = false;
        this.isClient = true;
        
        this.conn.on('open', () => {
            this.setupConnection(this.conn);
            this.updateStatus('Verbunden mit Raum ' + roomCode + ' (Du bist Junge)');
            
            // Disable difficulty selection for client
            const easyBtn = document.getElementById('easy-btn');
            const hardBtn = document.getElementById('hard-btn');
            if (easyBtn) easyBtn.disabled = true;
            if (hardBtn) hardBtn.disabled = true;
            
            // Notify that we're now a client
            this.updateCallbacks.forEach(callback => {
                callback('becameClient', {});
            });
        });
        
        this.conn.on('error', (err) => {
            this.updateStatus('Konnte nicht verbinden');
        });
    }
    
    setupConnection(conn) {
        conn.on('data', (data) => {
            this.handleData(data);
        });
        
        conn.on('close', () => {
            this.updateStatus('Verbindung getrennt');
            this.conn = null;
            
            // Re-enable difficulty selection if we were client
            if (this.isClient) {
                const easyBtn = document.getElementById('easy-btn');
                const hardBtn = document.getElementById('hard-btn');
                if (easyBtn) easyBtn.disabled = false;
                if (hardBtn) hardBtn.disabled = false;
            }
            
            this.isClient = false;
            this.isHost = true;
        });
    }
    
    updateStatus(message) {
        const statusEl = document.getElementById('multiplayer-status');
        if (statusEl) {
            statusEl.textContent = message;
        }
    }
    
    // Host: Start syncing game state
    startHostSync(getSyncDataCallback) {
        if (!this.isHost) return;
        
        // Send full game state every 50ms (20 Hz)
        this.syncInterval = setInterval(() => {
            if (this.conn && this.conn.open && getSyncDataCallback) {
                const syncData = getSyncDataCallback();
                this.conn.send({
                    type: 'fullSync',
                    data: syncData
                });
            }
        }, 50);
    }
    
    stopHostSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }
    
    // Host: Send game start command
    sendGameStart(difficulty) {
        if (this.isHost && this.conn && this.conn.open) {
            this.conn.send({
                type: 'gameStart',
                difficulty: difficulty
            });
        }
    }
    
    // Send player position and state (client to host)
    sendPlayerState(playerData) {
        if (this.conn && this.conn.open) {
            this.conn.send({
                type: 'playerState',
                data: {
                    position: {
                        x: playerData.position.x,
                        y: playerData.position.y,
                        z: playerData.position.z
                    },
                    rotation: playerData.rotation,
                    health: playerData.health,
                    isGliding: playerData.isGliding,
                    glideLiftProgress: playerData.glideLiftProgress,
                    timestamp: Date.now()
                }
            });
        }
    }
    
    // Send bullet/projectile data
    sendBullet(bulletData) {
        if (this.conn && this.conn.open) {
            this.conn.send({
                type: 'bullet',
                data: bulletData
            });
        }
    }
    
    // Send game events (goblin death, material collected, etc.)
    sendGameEvent(eventType, eventData) {
        if (this.conn && this.conn.open) {
            this.conn.send({
                type: 'gameEvent',
                eventType: eventType,
                data: eventData
            });
        }
    }
    
    // Handle incoming data
    handleData(data) {
        switch(data.type) {
            case 'fullSync':
                // Client receives full game state from host
                this.notifyFullSync(data.data);
                break;
            case 'gameStart':
                // Client receives game start command
                this.notifyGameStart(data.difficulty);
                break;
            case 'playerState':
                // Host receives client player state
                this.updateOtherPlayer(data.data);
                break;
            case 'bullet':
                this.notifyBulletFired(data.data);
                break;
            case 'gameEvent':
                this.notifyGameEvent(data.eventType, data.data);
                break;
        }
    }
    
    notifyFullSync(syncData) {
        this.updateCallbacks.forEach(callback => {
            callback('fullSync', syncData);
        });
    }
    
    notifyGameStart(difficulty) {
        this.updateCallbacks.forEach(callback => {
            callback('gameStart', { difficulty });
        });
    }
    
    updateOtherPlayer(playerData) {
        // Notify all registered update callbacks
        this.updateCallbacks.forEach(callback => {
            callback('playerState', playerData);
        });
    }
    
    notifyBulletFired(bulletData) {
        this.updateCallbacks.forEach(callback => {
            callback('bullet', bulletData);
        });
    }
    
    notifyGameEvent(eventType, eventData) {
        this.updateCallbacks.forEach(callback => {
            callback('gameEvent', { eventType, data: eventData });
        });
    }
    
    // Register callback for receiving updates
    onUpdate(callback) {
        this.updateCallbacks.push(callback);
    }
    
    // Clear all update callbacks (used during level switch)
    clearCallbacks() {
        this.updateCallbacks = [];
    }
    
    isConnected() {
        return this.conn && this.conn.open;
    }
    
    disconnect() {
        this.stopHostSync();
        if (this.conn) {
            this.conn.close();
        }
        if (this.peer) {
            this.peer.destroy();
        }
    }
}
