# Multiplayer Guide

## How Multiplayer Works

This game uses a **host-client architecture** where one player (the host) controls the game state and the other player (client) joins their game.

### Player Roles

**Host (Mädchen - Girl):**
- Creates the room automatically when loading the game
- Controls all game logic (goblins, arrows, game state)
- Starts the game for both players
- Pink bike frame, pink shirt, brown hair

**Client (Junge - Boy):**
- Joins an existing room using a 3-letter code  
- Cannot start the game (waits for host to start)
- Blue bike frame, blue shirt, black hair
- Receives game state updates from host

## How to Play Multiplayer

### Setup
1. Open the game in your browser (`index.html`)
2. You'll see a 3-letter room code displayed (e.g., "123")
3. This code is automatically generated when you load the page

### Connecting Players

**Option 1: Host waits for client**
- Player 1 (Host) opens the game and sees their room code (e.g., "456")
- Player 2 (Client) opens the game in another browser/tab/computer
- Player 2 enters Player 1's room code ("456") and clicks "Beitreten"
- Client will see "Verbunden mit Raum 456 (Du bist Junge)"
- Host will see "Spieler verbunden! Du bist Host (Mädchen)"
- **Host selects difficulty** and starts the game
- Game automatically starts for both players!

**Important:**
- Only the host can start the game by selecting difficulty
- Once client joins, their difficulty buttons are disabled
- Client must wait for host to start

### What Gets Synchronized

The host sends the complete game state to the client 10 times per second, including:

- **All player positions** - Both host and client positions are synced
- **Goblin positions and states** - Position, health, alive/dead, chasing behavior
- **Guardian arrows** - All arrow positions
- **Host's bullets** - Black projectiles from host player
- **Game state** - Bridge repair status, materials collected, win/death states
- **Both players can shoot** - Cyan bullets from client are visible to host

### Goblin AI

Goblins will chase **whichever player is closer**:
- They check distance to both players
- Chase the nearest target
- Can switch targets as players move around
- This creates cooperative gameplay dynamics!

### Visual Differences

**Host (Girl):**
- Pink bicycle frame
- Pink shirt  
- Brown hair
- Yellow direction cone
- Black bullets

**Client (Boy):**
- Blue bicycle frame
- Blue shirt
- Black hair
- Cyan direction cone
- Cyan bullets

### Connection Status

Watch the "Multiplayer" section for status messages:
- "Spieler verbunden! Du bist Host (Mädchen)." - Someone joined your room, you're the host
- "Verbunden mit Raum XXX (Du bist Junge)" - You joined someone's room as client
- "Verbindungsfehler" - Connection problem
- "Verbindung getrennt" - Connection lost

### Testing Locally

To test multiplayer on your own computer:
1. Open `index.html` in one browser window (e.g., Chrome) - This is the **host**
2. Note the room code displayed
3. Open `index.html` in another window/tab or different browser (e.g., Firefox) - This is the **client**
4. In the client window, enter the host's room code and click "Beitreten"
5. **In the host window**, select difficulty (Easy or Hard) to start the game
6. Both windows will start playing simultaneously
7. Goblins will chase whichever player is closer!

### Cooperative Gameplay Tips

- **Stick together** early on to handle goblin groups
- **Split up** to collect materials faster
- **Communicate** who's repairing the bridge
- **Share goblin aggro** by staying on opposite sides
- Both players need to survive - if one dies, coordinate restart

### Technical Details

- Uses PeerJS for WebRTC peer-to-peer connections
- Room codes are 3-digit numbers (100-999)
- Host sends full game state at 10 Hz (every 100ms)
- Client sends their position at 60 Hz
- Connection is peer-to-peer after initial handshake
- Works across different computers/networks

## Troubleshooting

**"Konnte nicht verbinden"**
- Make sure the room code is correct (3 digits)
- Check if the host's game is still open
- Try refreshing both pages and reconnecting

**Can't see other player**
- Make sure both players have started the game (host selected difficulty)
- Check the multiplayer status message
- The host must start the game for both players

**Only host can start the game**
- This is intentional! The client cannot select difficulty
- Client must wait for the host to start
- If you want to start, open your own room as host

**Lag or delayed movement**
- This is normal for peer-to-peer connections
- Network quality affects synchronization  
- Local testing (same computer) should be very smooth
- Host controls game logic, so their connection quality matters most

**Goblins not chasing me (client)**
- Goblins will chase the closest player
- If host is closer, they'll chase the host
- This is working as intended for cooperative play
