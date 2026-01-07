# Stick-Fighter-Tournament

A fast-paced, high-octane stick figure fighting game inspired by Alan Becker's animations and games like Tough Love Arena and Combat Gods.

## Game Features

### Core Mechanics
- **Directional Attacks**: Light and Heavy attacks in 8 directions (Neutral, Forward, Back, Up, Down, and diagonals)
- **Combo System**: Consecutive hits build combos with damage scaling
- **Hitstun & Knockback**: Realistic hit reactions with physics-based movement
- **Air Combos**: Extended combo potential when both fighters are airborne
- **Procedural Stick Figure Animation**: Characters animate based on velocity and state

### Advanced Combat
- **Command Inputs**: Quarter-Circle Forward (QCF) and other fighting game motions
- **Super Meter**: 3-level meter system that builds on damage dealt and received
- **Super Moves**: High-damage special attacks that consume super meter levels
- **Special Attacks**: Character-specific abilities with startup/active/recovery frames

### Game Modes
- **Training Mode**: Fight against an AI dummy to practice combos and moves
- **Character Selection**: Choose between Alpha and Beta
- **Settings**: Fully customizable keybinds with localStorage persistence

## Controls

### Default Keybinds
- **W/A/S/D**: Move (Up/Left/Down/Right)
- **J**: Light Attack
- **K**: Heavy Attack  
- **L**: Special Attack

### Advanced Controls

#### Alpha
- **Down → Down-Right → Right + Light**: Hadoken (QCF projectile)
- **Down → Down-Right → Right + Light (with Super Meter)**: Shun Goku Satsu (Super)

#### Beta
- **Down → Down-Left → Left + Special**: Rising Slash (QCB dash attack)
- **Right → Down → Down-Right + Heavy (with Super Meter)**: Inferno Uppercut (Super)

## Game Systems

### Super Meter
- **Max Level**: 300 points (3 levels)
- **Meter Gain**: Gain meter by hitting opponents (move's `superGain` value)
- **Meter Gain (Victim)**: Gain meter from taking damage (50% of damage dealt)
- **Super Cost**: 100 points per super level (1 level = ~30 damage at max)

### Combo System
- **Damage Scaling**: Each consecutive hit deals slightly less damage
- **Minimum Damage**: Capped at 10% of original move damage
- **Combo Reset**: Combo resets when opponent recovers from hitstun

### Alpha's Passive
- **Heal on Combo**: Starting at 5 consecutive hits, Alpha gains 2 HP per hit landed

## Character Data

Each character is defined by JSON files containing:
- **Stats**: Walk speed, jump force, gravity, max health, max super meter
- **Moves**: Complete frame data including startup, active, recovery frames, damage, hitstun, knockback
- **Abilities**: Special mechanics and super moves

### Alpha (The All-Rounder)
- **Health**: 1000 HP
- **Speed**: Balanced
- **Specialty**: Projectiles and healing mechanic
- **Super**: Shun Goku Satsu (massive projectile)

### Beta (The Aggressive Rival)
- **Health**: 900 HP
- **Speed**: Fastest walker (420 speed)
- **Specialty**: Fast combos and dash attacks
- **Super**: Inferno Uppercut (rising slash with knockback)

## File Structure

```
src/
├── main.js                 # Game entry point
├── managers/
│   ├── InputManager.js     # Keybind and input handling
│   ├── InputBuffer.js      # Command input buffering
│   ├── CommandInputManager.js  # Command pattern recognition
│   └── ComboManager.js     # Combo tracking and scaling
├── entities/
│   ├── Fighter.js          # Core fighter logic
│   ├── StickRenderer.js    # Procedural animation
│   └── Projectile.js       # Projectile objects
├── scene/
│   ├── MenuScene.js        # Main menu
│   ├── SelectScene.js      # Character selection
│   ├── SettingsScene.js    # Settings and keybinds
│   └── FightScene.js       # Main fighting scene
└── data/
    ├── alpha.json          # Alpha's stats and moves
    └── beta.json           # Beta's stats and moves
```

## How to Run

1. Start a local HTTP server:
   ```bash
   python3 -m http.server 8000
   ```

2. Open your browser to `http://localhost:8000`

3. Select a character and fight!

## Inspiration

Inspired by:
- **KJ Full Saga** (YouTube animation)
- **Combat Gods 1 & 2** (YouTube animation)
- **Alan Becker's Animation Vs.** Series
- **Tough Love Arena** (Web fighting game)

The goal is to capture the fast-paced, high-octane feel of stick figure combat with realistic physics and combo-heavy gameplay.

## Customization

### Adding New Attacks
1. Edit `src/data/[character].json`
2. Add a new move object with frame data
3. Update Fighter's `handleAttacks()` method if needed for new directions

### Adding New Characters
1. Create `src/data/[name].json` with character stats and moves
2. Add character to SelectScene's character array
3. Character automatically inherits all combat systems

### Adding New Command Inputs
1. Edit `src/managers/CommandInputManager.js`
2. Add pattern to the `commands` object
3. Reference in character JSON moves with `"command": "COMMAND_NAME"`

## Future Features

- [ ] Block mechanics
- [ ] Guard breaks
- [ ] More elaborate animations
- [ ] Particle effects and visual feedback
- [ ] Sound effects and music
- [ ] Network multiplayer
- [ ] Tournament modes
- [ ] Additional characters and mechanics
