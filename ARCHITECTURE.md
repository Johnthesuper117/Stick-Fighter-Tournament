# Technical Architecture & Developer Guide

## System Overview

Stick Fighter Tournament is built on **Phaser 3** with a modular, data-driven architecture that separates game logic, rendering, and data.

### Core Philosophy

1. **Data-Driven**: Character moves are defined in JSON, not hardcoded
2. **Modular**: Each system (Input, Combat, Rendering) is independent
3. **Extensible**: Add new characters and mechanics without touching core code
4. **Performant**: Procedural rendering, efficient collision detection

## Architecture Layers

```
┌─────────────────────────────────────┐
│        Phaser 3 Framework            │
├─────────────────────────────────────┤
│        Scene Management              │
│  (MenuScene, SelectScene, FightScene)│
├─────────────────────────────────────┤
│       Entities & Managers            │
│ (Fighter, InputManager, ComboManager)│
├─────────────────────────────────────┤
│      Game Data (JSON)                │
│    (alpha.json, beta.json)           │
└─────────────────────────────────────┘
```

## Key Systems

### 1. Input System

**Files**: `InputManager.js`, `InputBuffer.js`, `CommandInputManager.js`

**Responsibility**: Capture player input and recognize command patterns

#### InputManager
- Tracks all active keys
- Converts keys to directional input (neutral, up, left, right, etc.)
- Records directional changes in InputBuffer
- Supports remapping via localStorage

**Key Methods**:
```javascript
setupKeys()           // Initialize keybinds from localStorage
getInputs(time)       // Get current input state + directions
remapKey(action, key) // Change a keybind
```

#### InputBuffer
- Stores recent directional inputs with timestamps
- Recognizes command sequences
- Cleans old inputs (1 second max age)

**Key Methods**:
```javascript
recordInput(direction, time)    // Add input to buffer
checkCommand(pattern, time)     // Check if pattern was executed
clear()                         // Clear buffer after executing move
getLastInputs(count)            // Debug: show recent inputs
```

#### CommandInputManager
- Defines standard fighting game commands (QCF, QCB, DP, etc.)
- Maps command names to directional sequences

**Available Commands**:
- `QCF`: Quarter Circle Forward (Down → Down-Right → Right)
- `QCB`: Quarter Circle Back (Down → Down-Left → Left)
- `HCF`: Half Circle Forward
- `HCB`: Half Circle Back
- `DP`: Dragon Punch (Right → Down → Down-Right)
- `RDP`: Reverse Dragon Punch (Left → Down → Down-Left)

### 2. Fighter System

**File**: `entities/Fighter.js`

**Responsibility**: Core character logic, state management, move execution

#### Fighter States
```javascript
'IDLE'      // Standing, can move/attack
'RUN'       // Walking
'JUMP'      // Airborne
'ATTACK'    // Executing an attack
'HITSTUN'   // Just got hit, stunned
```

#### Key Properties
```javascript
hp              // Current health
state           // Current state (IDLE, ATTACK, etc.)
superMeter      // Current super meter (0-300)
superLevel      // Visual level indicator (0-3)
stunTimer       // Time remaining in hitstun
busyTimer       // Time locked in recovery
facingRight     // Direction character is facing
isDummy         // Is this an AI character?
lastAttacker    // Who hit us last (for combo reset)
inputBuffer     // For detecting command inputs
```

#### Key Methods
```javascript
update(inputs, delta)           // Main update loop
handleMovement(inputs)          // Process walk/jump
handleAttacks(inputs)           // Process attack input
executeMove(key, currentTime)   // Execute a move by key
takeDamage(amount, stun, kb, attacker) // Take damage
gainSuperMeter(amount)          // Add to super meter
updateSuperLevel()              // Recalculate visual level
checkCommandMoves(inputs, time) // Check for super moves
```

### 3. Rendering System

**File**: `entities/StickRenderer.js`

**Responsibility**: Procedural animation based on state and velocity

#### Joints
Each stick figure is built from joints:
- Head, Neck, Pelvis (body)
- LeftHand, RightHand (arms)
- LeftFoot, RightFoot (legs)

#### Animation Logic
- **RUN**: Limbs swing side to side, legs lift
- **IDLE**: Breathing effect
- **ATTACK**: Implied by state changes (can be extended)
- **Lean**: Body leans based on velocity

**Can be extended for**:
- Attack animation frames
- Jump arcs
- Hurt knockback visuals
- Custom animations per character

### 4. Combat System

**Files**: `scene/FightScene.js`, `managers/ComboManager.js`

**Responsibility**: Detect hits, apply damage, track combos, manage effects

#### Combo Manager
Tracks consecutive hits and applies damage scaling:

```javascript
registerHit(attacker, victim, baseDamage)
  ↓
  - Increment combo count
  - Calculate damage scale: max(0.1, 1.0 - count * 0.05)
  - Return scaled damage

resetCombo(attacker)
  ↓
  - Check if combo > 1
  - Emit 'combo_end' event
  - Clear combo data
```

#### Hit Detection
1. Attack starts → emit `attack_start` event
2. FightScene creates hitbox graphic at attacker position
3. Physics overlap between hitbox and opponent's body
4. If overlap → `handleHit()` is called

#### Damage Application
```
baseDamage (from move JSON)
    ↓
comboManager.registerHit() [applies scaling]
    ↓
victim.takeDamage() [applies knockback + hitstun]
    ↓
Meter gained: attacker gains move's superGain value
              victim gains 50% of final damage taken
```

### 5. Data System

**Files**: `data/alpha.json`, `data/beta.json`

**Structure**:
```json
{
  "name": "Character Name",
  "color": "0xRRGGBB",
  "stats": {
    "walkSpeed": 350,
    "jumpForce": -650,
    "gravity": 1200,
    "maxHealth": 1000,
    "maxSuperMeter": 300
  },
  "moves": {
    "MOVE_KEY": {
      "damage": 50,
      "startup": 5,
      "active": 3,
      "recovery": 10,
      "hitStun": 20,
      "knockback": { "x": 100, "y": 0 },
      "superGain": 10,
      "cancelable": true
    }
  }
}
```

#### Frame Data Explained
- **startup**: Frames before hitbox appears (player can't be hit)
- **active**: Frames hitbox is active (can hit opponent)
- **recovery**: Frames after hitbox disappears (player recovering)
- **hitStun**: Frames opponent is stunned if hit
- **knockback**: Velocity applied to opponent on hit
- **superGain**: Meter points awarded for landing this move
- **cancelable**: Can be canceled into another move

### 6. Scene Management

#### MenuScene
- Title and buttons
- Navigation to SelectScene or SettingsScene

#### SelectScene
- Display available characters
- Allow selection with arrow keys + Enter
- Pass selected character to FightScene

#### SettingsScene
- List keybinds (W, A, S, D, J, K, L)
- Click to rebind
- Save to localStorage
- ESC to return

#### FightScene
- Manage fighters (P1 and P2/dummy)
- Input polling loop
- Physics updates
- Combat resolution (hits, damage, knockback)
- HUD updates (health, super meter, combo counter)

## Adding New Features

### Add a New Character

1. **Create data file** (`src/data/zeta.json`):
```json
{
  "name": "Zeta",
  "color": "0x00ff00",
  "stats": { ... },
  "moves": {
    "LIGHT_NEUTRAL": { ... },
    ...
  }
}
```

2. **Add to SelectScene** (`src/scene/SelectScene.js`):
```javascript
import zetaData from '../data/zeta.json';

this.characters = [
  { name: 'Alpha', data: alphaData, x: 250 },
  { name: 'Beta', data: betaData, x: 550 },
  { name: 'Zeta', data: zetaData, x: 850 } // New!
];
```

### Add a New Command Input

1. **Define in CommandInputManager** (`src/managers/CommandInputManager.js`):
```javascript
this.commands = {
  // ...existing...
  'SPD': ['left', 'left', 'left'], // Spindash motion
};
```

2. **Reference in character JSON**:
```json
"SPECIAL_SPD": {
  "command": "SPD",
  "type": "dash_attack",
  "damage": 150,
  ...
}
```

3. **Fighter automatically handles it** in `checkCommandMoves()`

### Add a New Attack Type

If you want moves that behave differently (e.g., grab, beam):

1. **Add to move JSON**:
```json
"SPECIAL_GRAB": {
  "type": "grab",
  "damage": 80,
  ...
}
```

2. **Handle in Fighter.executeMove()**:
```javascript
if (move.type === 'grab') {
  this.fireGrabAttack(move);
  return;
}
```

3. **Implement new method** (fireGrabAttack, etc.)

## Performance Considerations

1. **Procedural Rendering**: No sprite loading required
2. **Efficient Physics**: Using Arcade physics (not Matter.js)
3. **Input Buffering**: Stores max 20 inputs, old ones discarded
4. **Object Pooling**: Projectiles destroyed after timeout
5. **No Garbage**: Minimize allocations in update loops

## Debugging

### Console Output
- Combo finishes: `"Combo Finished! 10 hits, 850 dmg"`
- Input buffer visible at bottom of screen: `"Inputs: down -> down-right -> right"`

### Useful Console Commands
```javascript
// Get fighter state
scene.p1.state           // Current state
scene.p1.superMeter      // Current meter (0-300)
scene.p1.inputBuffer.buffer // All recorded inputs

// Manually give meter
scene.p1.gainSuperMeter(300) // Max out

// Check if command recognized
scene.p1.inputBuffer.checkCommand(
  scene.p1.commandInputManager.getCommand('QCF'),
  Date.now()
)
```

## Common Patterns

### Movement Lockout During Attack
```javascript
if (this.state === 'ATTACK') return; // Can't move
```

### Stun Recovery & Combo Reset
```javascript
if (this.stunTimer <= 0) {
  // Tell ComboManager to reset
  this.scene.events.emit('fighter_recover', this.lastAttacker);
}
```

### Damage with Scaling
```javascript
const finalDamage = this.comboManager.registerHit(
  attacker, victim, baseMove.damage
);
victim.takeDamage(finalDamage, ...);
```

## Testing Checklist

- [ ] New attacks execute with correct startup/recovery
- [ ] Damage scaling applies correctly to combos
- [ ] Hitstun duration matches frame data
- [ ] Knockback applies in correct direction
- [ ] Super meter gains/spends work
- [ ] Command inputs recognized within 1 second window
- [ ] Combo resets when opponent recovers
- [ ] Health bars update correctly
- [ ] Character selection works
- [ ] Keybind remapping saves to localStorage
