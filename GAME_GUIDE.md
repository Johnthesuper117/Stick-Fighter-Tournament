# Stick Fighter Tournament - Complete Game Guide

A fast-paced, high-octane stick figure fighting game inspired by Alan Becker's animations and games like Tough Love Arena and Combat Gods.

## Game Features

### Core Mechanics
- **Directional Attacks**: Light and Heavy attacks in 8 directions (Neutral, Forward, Back, Up, Down, and diagonals)
- **Combo System**: Consecutive hits build combos with damage scaling
- **Hitstun & Knockback**: Realistic hit reactions with physics-based movement
- **Air Combos**: Extended combo potential when both fighters are airborne
- **Procedural Stick Figure Animation**: Characters animate based on velocity and state

### Advanced Combat
- **Command Inputs**: Quarter-Circle Forward (QCF), Quarter-Circle Back (QCB), Dragon Punch (DP), and other fighting game motions
- **Super Meter**: 3-level meter system that builds on damage dealt and received
- **Super Moves**: High-damage special attacks that consume super meter levels (100 points per super)
- **Special Attacks**: Character-specific abilities with startup/active/recovery frames
- **Input Buffering**: Automatic recognition of command sequences within 1 second window

### Game Modes
- **Training Mode**: Fight against an AI dummy to practice combos and moves
- **Character Selection**: Choose between Alpha and Beta with unique mechanics
- **Settings**: Fully customizable keybinds with localStorage persistence

---

## Controls

### Default Keybinds
- **W**: Jump (Up)
- **A**: Move Left
- **D**: Move Right
- **S**: Crouch (Down)
- **J**: Light Attack
- **K**: Heavy Attack
- **L**: Special Attack

### Attack Directions

You can perform attacks in 8 different directions by holding a direction and pressing an attack button:

- **Neutral**: Press attack with no direction held
- **Forward**: Hold **D** (right) while pressing attack
- **Back**: Hold **A** (left) while pressing attack
- **Down**: Hold **S** while pressing attack
- **Up/Jump**: Press attack while jumping (W)
- **Down-Right**: Hold **S + D** while pressing attack
- **Down-Left**: Hold **S + A** while pressing attack
- **Up-Right/Up-Left**: Jump and attack diagonally

---

## Command Input System

### How Command Inputs Work

Command inputs detect a **sequence** of directional inputs followed by a button press. This is how you execute special moves and supers.

1. Execute a directional motion (e.g., Down → Down-Right → Right)
2. Within 1 second of completing the motion, press the attack button
3. If the game recognizes the pattern, the special move will execute

### Input Notations & Key Mappings

- **↓ (Down)** = Press **S** key
- **→ (Right)** = Press **D** key
- **↑ (Up)** = Press **W** key
- **← (Left)** = Press **A** key
- **↘ (Down-Right)** = Press **S+D** keys together
- **↙ (Down-Left)** = Press **S+A** keys together
- **↗ (Up-Right)** = Press **W+D** keys together
- **↖ (Up-Left)** = Press **W+A** keys together

### Standard Command Patterns

- **QCF** (Quarter Circle Forward): ↓ → ↘ (Down → Right → Down-Right)
- **QCB** (Quarter Circle Back): ↓ ← ↙ (Down → Left → Down-Left)
- **DP** (Dragon Punch): → ↓ ↘ (Right → Down → Down-Right)
- **HCF** (Half Circle Forward): ← ↓ ↙ ↓ ↘ → (Full rotational motion)
- **HCB** (Half Circle Back): → ↓ ↗ ↓ ↙ ← (Full rotational motion back)

### Visual Input Feedback

At the bottom center of the screen, you'll see your recent inputs displayed. This helps you learn command patterns:
```
Inputs: down -> down-right -> right
```

---

## Alpha - The Balanced All-Rounder

**Character Specialties**:
- Projectile attacks for ranged combat
- Healing mechanic on long combos
- Balanced speed and damage
- Command input special moves

### Alpha's Complete Move List

#### Light Attacks (Press J)
- **Neutral**: Punch (40 dmg, 20 stun)
  - Fast and safe, good for starting combos
- **Forward (D+J)**: Kick (50 dmg, 25 stun)
  - Slightly more reach and damage
- **Down (S+J)**: Crouch Punch (35 dmg, 18 stun)
  - Low attack, good for groundwork
- **Up/Jump (W+J)**: Jump Kick (45 dmg, 22 stun)
  - Aerial attack, continues combos in air

#### Heavy Attacks (Press K)
- **Neutral (K)**: Uppercut Launcher (90 dmg, 40 stun, knockback y: -500)
  - **Launches opponent into air** - great for air combos!
  - Startup: 10 frames, Recovery: 20 frames
- **Forward (D+K)**: Heavy Slash (110 dmg, 45 stun)
  - Strong mid-range attack
  - Startup: 12 frames, Recovery: 18 frames
- **Down (S+K)**: Sweep (75 dmg, 35 stun, knockdown)
  - Knocks opponent down
  - Startup: 13 frames, Recovery: 16 frames
- **Up/Jump (W+K)**: Jump Slam (120 dmg, 50 stun)
  - Powerful aerial attack
  - Great for extending air combos

#### Special Attacks (Press L)
- **Neutral (L)**: Basic Fireball (60 dmg, projectile)
  - Standard ranged attack
  - Startup: 12 frames, Recovery: 30 frames

#### Command Input Attacks (DP + Button)
- **↓ → ↘ + L (QCF)**: Hadoken Projectile (80 dmg)
  - Enhanced version of basic fireball
  - More damage and faster travel
  - Startup: 15 frames, Recovery: 25 frames

#### Super Moves (Command + 100+ Meter)
- **↓ → ↘ + L (QCF) + Super Meter**: Shun Goku Satsu (200 dmg, massive projectile)
  - Requires: 100 super meter (1 level minimum)
  - Cost: 100 points per use
  - Startup: 20 frames, Recovery: 30 frames
  - Effect: Large projectile with 400 knockback

### Alpha's Passive Ability: Combo Healing

- **Activation**: Starting at 5 consecutive hits
- **Effect**: Heals **2 HP per hit** during combo
- **Visual Feedback**: Brief green tint when healing occurs
- **Strategy**: Encourages longer combos - build momentum and heal!

### Alpha's Meter Gain

- **Light attacks**: +10-12 meter per hit
- **Heavy attacks**: +20-22 meter per hit
- **Special attacks**: +15-25 meter per hit
- **On damage taken**: +50% of damage taken (e.g., 40 dmg = 20 meter)

### Alpha Combo Example

```
1. Light Punch (J) → 40 dmg, +10 meter
2. Light Kick (D+J) → 47 dmg (95% scaling), +12 meter  
3. Heavy Uppercut (K) → 85 dmg (90% scaling), LAUNCHES
4. Jump Slam (W+K) → 110 dmg (85% scaling)
5. Land and execute QCF → Hadoken fires (80 dmg)
Combo Total: 362 damage + meter built
```

---

## Beta - The Aggressive Rival

**Character Specialties**:
- Fastest movement speed (420 vs Alpha's 350)
- Dash-based special attacks
- Quick combo potential
- Rising slash and uppercut command moves

### Beta's Complete Move List

#### Light Attacks (Press J)
- **Neutral**: Jab (25 dmg, 15 stun)
  - Fastest light attack, minimal recovery
- **Forward (D+J)**: Combo (35 dmg, 18 stun)
  - Quick forward attack, good footsies
- **Down (S+J)**: Low Jab (20 dmg, 12 stun)
  - Low attack, minimal damage but quick
- **Up/Jump (W+J)**: Jump Kick (40 dmg, 20 stun)
  - Aerial attack for air combos

#### Heavy Attacks (Press K)
- **Neutral (K)**: Slam (80 dmg, 45 stun)
  - Downward strike with spike effect
  - Startup: 15 frames, Recovery: 20 frames
- **Forward (D+K)**: Power Hit (105 dmg, 48 stun)
  - Strong forward attack with knockback
  - Startup: 16 frames, Recovery: 22 frames
- **Down (S+K)**: Sweep (70 dmg, 40 stun)
  - Low sweep attack
  - Startup: 14 frames, Recovery: 18 frames
- **Up/Jump (W+K)**: Anti-Air (110 dmg, 50 stun)
  - Defensive upward attack for anti-air
  - Great for stopping jump-ins

#### Special Attacks (Press L)
- **Neutral (L)**: Dash Attack (100 dmg, dash_attack)
  - Fast dash forward with attack
  - Covers ground quickly
  - Startup: 8 frames, Recovery: 25 frames
  - Velocity: 800 forward

#### Command Input Attacks (DP + Button)
- **↓ ← ↙ + L (QCB)**: Rising Slash (120 dmg, dash upward)
  - Rising diagonal slash
  - Can link into air combos
  - Startup: 12 frames, Recovery: 20 frames
  - Knockback: 150 x, -600 y (upward)

#### Super Moves (Command + 100+ Meter)
- **→ ↓ ↘ + K (DP) + Super Meter**: Inferno Uppercut (250 dmg)
  - Requires: 100 super meter (1 level minimum)
  - Cost: 100 points per use
  - Startup: 18 frames, Recovery: 25 frames
  - Effect: Rising attack with massive knockback (200 x, -800 y)
  - Can launch into extended combos if they don't escape

### Beta's Aggression Style

- **Speed Advantage**: 420 walk speed vs Alpha's 350
- **Combo Pressure**: Quick recovery times enable rapid combo pressure
- **Dash Offense**: Dash attacks allow stage control
- **Gap Closer**: Rising Slash serves as both offense and mobility

### Beta's Meter Gain

- **Light attacks**: +10 meter per hit
- **Heavy attacks**: +20-23 meter per hit
- **Special attacks**: +25 meter per hit (Dash Attack)
- **Rising Slash**: +25 meter per hit
- **On damage taken**: +50% of damage taken

### Beta Combo Example

```
1. Jab (J) → 25 dmg, +10 meter
2. Jab (J) → 23 dmg (95%), +10 meter [Quick!!]
3. Power Hit (D+K) → 99 dmg (90%), +23 meter
4. Anti-Air (W+K) → 99 dmg (85%)
5. Land and execute DP → Inferno Uppercut
Combo Total: 246 damage + super used
```

---

## Super Meter System (3 Levels)

### Meter Mechanics

**Capacity**:
- Maximum: 300 points
- Divided into 3 levels of 100 points each
- Visual bar fills progressively

**Gaining Meter**:
- **On Offense**: Land attacks (varies by move)
  - Light attacks grant 10-12 points
  - Heavy attacks grant 20-25 points
  - Special attacks grant 15-25 points
- **On Defense**: Take damage (50% of damage as meter)
  - Example: Take 40 damage → gain 20 meter
  - Encourages defensive play

**Spending Meter**:
- **Super Cost**: 100 points per super move
- **Visual Cost**: 1 level drop per super executed
- **Limitation**: Cannot execute super without minimum 100 meter (1 level)

### Super Meter Levels Explained

| Level | Meter Points | Visual | Can Use Supers? |
|-------|--------------|--------|-----------------|
| 0 | 0-99 | Empty | ❌ No |
| 1 | 100-199 | 1/3 Full | ✅ Yes (1) |
| 2 | 200-299 | 2/3 Full | ✅ Yes (1-2) |
| 3 | 300 | Full | ✅ Yes (1-3) |

### Strategic Meter Usage

**Early Game**:
- Focus on building meter with safe hits
- Use light attacks for chip damage + meter
- Avoid spending meter early

**Mid Game**:
- At 100 meter, have super option available
- Use threat of super to control opponent
- Land more hits to build additional levels

**Late Game**:
- Use supers for momentum swings
- Save meter for come-back opportunities
- Multiple levels allow devastating combo finishes

---

## Combo System

### Building Combos

A combo is a sequence of consecutive hits without the opponent escaping hitstun.

**Hitstun**: The duration an opponent is stunned after being hit. While stunned, they cannot move or attack.

### Damage Scaling Formula

Each consecutive hit in a combo deals progressively less damage:

```
Final Damage = Base Damage × Scale
Scale = max(0.1, 1.0 - comboCount × 0.05)

Example with 40 base damage:
Hit 1: 40 damage (100%)
Hit 2: 38 damage (95%)
Hit 3: 36 damage (90%)
Hit 4: 34 damage (85%)
...
Hit 18+: 4 damage (10% minimum)
```

**Why Scaling?**: Prevents infinite combo damage while rewarding execution skill.

### Resetting Combos

The combo counter resets when:
- The opponent recovers from hitstun (stun timer expires)
- You get hit by the opponent
- Too much time passes between hits

### Ending Combos

The combo display shows current hit count:
- **Combo: 0** = No active combo
- **Combo: 5** = 5 consecutive hits landed
- **Combo: 15** = Extended combo (good execution)
- **Combo: 25+** = Impressive combo (excellent execution)

### Combo Tips

**Starter Combos**:
- Light → Light → Heavy (launcher)
- Light → Light → Special (meter builder)
- Heavy (alone) → setup for next combo

**Intermediate Combos**:
- Light → Light → Heavy Launcher → Jump Heavy
- Heavy Forward → Heavy Neutral → Special
- Crouch Light → Standing Light → Heavy

**Advanced Combos**:
- Light Punch → Light Kick → Heavy Uppercut (launcher) → Air Heavy Slam → Land → Command Special → Super Move
- Chain multiple air attacks into ground combo
- Use command inputs mid-combo for enhanced damage

---

## Character Data & Customization

### File Structure

Each character is defined by a JSON file containing:

```
src/data/
├── alpha.json
└── beta.json
```

### Character JSON Structure

```json
{
  "name": "Alpha",
  "color": "0x3399ff",
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

### Frame Data Explained

- **startup**: Frames before hitbox appears (player invulnerable)
- **active**: Frames hitbox is active (can hit opponent)
- **recovery**: Frames after hitbox disappears (player recovering)
- **hitStun**: Frames opponent is stunned if hit
- **knockback**: Velocity applied to opponent on hit (x, y values)
- **superGain**: Meter points awarded for landing this move
- **type**: Move type (normal, projectile, dash_attack, super_projectile, etc.)
- **cancelable**: Can this move be canceled into another move?

---

## How to Run the Game

### Starting the Game

1. Open a terminal in the game directory:
   ```bash
   cd /workspaces/Stick-Fighter-Tournament
   ```

2. Start a local HTTP server:
   ```bash
   python3 -m http.server 8000
   ```

3. Open your browser to `http://localhost:8000`

### Game Flow

1. **Menu**: Title screen with navigation
2. **Character Select**: Choose Alpha or Beta (arrow keys + enter)
3. **Training Mode**: Fight the dummy to practice
4. **Battle**: Land hits, build meter, execute supers!

---

## Customization

### Adding New Attacks

1. Edit `src/data/[character].json`
2. Add a new move object with frame data:
   ```json
   "NEW_MOVE_KEY": {
     "damage": 60,
     "startup": 8,
     "active": 4,
     "recovery": 12,
     "hitStun": 25,
     "knockback": { "x": 120, "y": 0 },
     "superGain": 15
   }
   ```
3. The attack is immediately available in-game!

### Adding New Characters

1. Create `src/data/newchar.json` with character stats and moves
2. Edit `src/scene/SelectScene.js`:
   ```javascript
   import newcharData from '../data/newchar.json';
   
   this.characters = [
     { name: 'Alpha', data: alphaData, x: 250 },
     { name: 'Beta', data: betaData, x: 550 },
     { name: 'NewChar', data: newcharData, x: 850 } // Add this
   ];
   ```
3. Character automatically inherits all combat systems!

### Adding New Command Inputs

1. Edit `src/managers/CommandInputManager.js`:
   ```javascript
   this.commands = {
     'QCF': ['down', 'down-right', 'right'],
     'CUSTOM': ['left', 'left', 'down'] // Add new
   };
   ```
2. Reference in character JSON:
   ```json
   "SPECIAL_CUSTOM": {
     "command": "CUSTOM",
     "damage": 100
   }
   ```
3. The move automatically works!

---

## Game Systems Details

### Hit Detection & Physics

- Hitboxes are created at attack startup
- Overlap checked every frame during active window
- On hit: damage calculated, knockback applied, hitstun inflicted
- Knockback includes both x (horizontal) and y (vertical) components

### Hitstun & Recovery Mechanics

- **Hitstun**: Opponent flashes white, cannot act
- **Recovery**: Upon hitstun expiration, opponent returns to idle
- **Combo Reset**: When opponent recovers, combo counter resets
- **Movement Lockout**: Cannot move during hitstun or attack recovery

### Procedural Animation

- Stick figures are drawn based on state and velocity
- Limbs animate procedurally (no sprite sheets needed)
- Lean based on movement direction
- Breathing effect when idle

---

## Tips & Strategies

### Beginner Tips

1. **Start with Light Attacks**: Safe and build meter
2. **Learn Basic Combos**: Punch → Kick → Heavy
3. **Practice Command Inputs**: Get timing down in Training Mode
4. **Use Super Moves**: When meter reaches 100, try your super!

### Intermediate Strategies

1. **Footsies**: Use jabs to control space
2. **Launcher Combos**: Heavy Neutral launches → air combos
3. **Meter Management**: Know when to save vs spend
4. **Spacing**: Understand attack ranges

### Advanced Techniques

1. **Damage Optimization**: Maximize scaling in long combos
2. **Command Input Chaining**: Link commands into supers
3. **Pressure Strings**: Rapid safe hits that build meter
4. **Defensive Play**: Gain meter while taking damage

---

## Inspiration

Inspired by:
- **KJ Full Saga** (YouTube animation)
- **Combat Gods 1 & 2** (YouTube animation)
- **Alan Becker's Animation Vs.** Series
- **Tough Love Arena** (Web fighting game)

The goal is to capture the fast-paced, high-octane feel of stick figure combat with realistic physics and combo-heavy gameplay.

---

## Future Features

- [ ] Block mechanics & guard damage
- [ ] Guard breaks & chip damage
- [ ] More elaborate animations
- [ ] Particle effects and visual feedback
- [ ] Sound effects and music
- [ ] Network multiplayer
- [ ] Tournament bracket modes
- [ ] Additional characters with unique mechanics
- [ ] Advanced techniques (cancels, tech rolls, etc.)

---

## Quick Reference

### Controls Quick Ref
| Key | Action |
|-----|--------|
| W | Jump |
| A | Left |
| D | Right |
| S | Crouch |
| J | Light |
| K | Heavy |
| L | Special |

### Damage Scaling Quick Ref
| Hit # | Scale | Damage (Base 40) |
|-------|-------|-----------------|
| 1 | 100% | 40 |
| 2 | 95% | 38 |
| 3 | 90% | 36 |
| 4 | 85% | 34 |
| 5 | 80% | 32 |

### Command Reference
| Command | Motion | Alpha Use | Beta Use |
|---------|--------|-----------|----------|
| QCF | ↓→↘ | Hadoken | - |
| QCB | ↓←↙ | - | Rising Slash |
| DP | →↓↘ | - | Inferno Uppercut |

---

**Last Updated**: January 7, 2026
**Version**: 1.0 - Command Inputs & Super Meter

