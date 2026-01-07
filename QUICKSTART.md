# Quick Start Guide

## Getting Started (2 Minutes)

### Step 1: Launch the Game
Open your browser to `http://localhost:8000`

### Step 2: Select Your Character
- Use **Arrow Keys** (← / →) to choose between Alpha or Beta
- Press **Enter** to confirm your selection

### Step 3: Start Fighting!
- **W/A/S/D**: Move around and jump
- **J**: Light attacks
- **K**: Heavy attacks
- **L**: Special attacks
- Press attack buttons while holding directions for different moves

## First Combo (30 seconds)

Try this basic combo:

1. **Get close** to the opponent (move with A/D)
2. **Press J** (Light Attack) → Light Punch connects
3. **Press J again** → Light Kick connects
4. **Press K** (Heavy Attack) → Heavy Uppercut launches opponent
5. **Watch combo counter** increase in the middle of the screen!

## Meter Building (1 minute)

Super Meter (yellow bar below your health) unlocks super moves:

1. **Keep attacking** with Light and Heavy attacks
2. **Yellow bar fills** - each attack adds 10-25 points
3. **When bar has 1/3 fill** (yellow indicator shows "Level: 1"), you can use a super!

## Your First Super Move (Alpha)

Once you have 1 level of super meter:

1. **Execute the motion**: Down, Down-Right, Right (press S, then S+D, then D)
2. **Press J** (Light Button) **quickly after** (within 1 second)
3. **Massive fireball** shoots across the screen! (200 damage vs normal 60)

**Quick Input Guide**:
- Press **S** (down) → Release
- Press **S + D** (down-right) → Release  
- Press **D** (right) → Release
- Press **J** (light attack) before hitstun ends

## Fight Tips

### Build Momentum
- Start with Light attacks (jabs and kicks)
- Link them into Heavy attacks
- Finish with a Special for big damage

### Managing Meter
- Heavy attacks build more meter than light attacks
- Use meter wisely - don't waste supers early!
- You can store up to 3 super levels for big moments

### Defense
- **Move back** with A key to create distance
- **Jump** with W to avoid sweeps
- **Wait for opponent** to finish recovery before attacking

### Opponent AI
- The dummy stands still and doesn't block
- Perfect for practicing combos!
- Try hitting it with different move combinations

## Alpha vs Beta

### Alpha - Balanced & Healing
- **Strength**: Projectiles (fireball special)
- **Special**: Heals during long combos (5+ hits)
- **Super**: Massive fireball attack
- **Play Style**: Ranged zoning + rushdown

### Beta - Fast & Aggressive  
- **Strength**: Fastest fighter, dash attacks
- **Special**: Rising Slash (QCB motion)
- **Super**: Inferno Uppercut (powerful launcher)
- **Play Style**: Aggressive combos, mobility

## Common Questions

**Q: My combo keeps breaking!**
A: You might be too far away. Move closer before attacking. Also check if opponent is still stunned (white flash).

**Q: How do I do command inputs?**
A: Think of it as drawing a pattern with the stick. Down-Right-Right is like drawing a "/" shape with your keys.

**Q: The super didn't work!**
A: You need 100 meter (1 level) and must complete the motion within 1 second of the last direction input.

**Q: Why does my damage get lower in combos?**
A: Damage scaling! Each hit in a combo does slightly less damage (95%, 90%, 85%... minimum 10%). This prevents infinite damage.

**Q: Can I change the controls?**
A: Yes! Go to Menu → Settings and click on any control to rebind it.

## Next Steps

Once you master the basics:

1. **Learn Combos**: Practice hitting different attack combinations
2. **Command Inputs**: Master the special move motions (QCF, QCB, DP)
3. **Meter Management**: Know when to save meter vs when to spend it
4. **Spacing**: Learn attack ranges and when moves are safe
5. **Defense**: Practice moving, jumping, and recovery timing

## Troubleshooting

**Game won't load?**
- Check browser console (F12) for errors
- Make sure Python server is running: `python3 -m http.server 8000`
- Try `http://localhost:8000/index.html`

**Inputs not registering?**
- Make sure you're holding keys down (not tapping)
- Check if game window has focus
- Try remapping your keys in Settings

**Framerate is choppy?**
- Close other browser tabs
- Lower browser zoom level
- Try a different browser (Chrome is fastest)

## Advanced Learning

Once you're comfortable, read:
- **CONTROLS_GUIDE.md** - Full move list and combos
- **GAME_GUIDE.md** - Detailed game systems
- **ARCHITECTURE.md** - How the game is built (for modders)

## Have Fun!

This is a fighting game - the best way to learn is **to play**! Experiment with different combos, learn your character's unique abilities, and master the timing of your attacks.

Good luck, fighter! 🥊
