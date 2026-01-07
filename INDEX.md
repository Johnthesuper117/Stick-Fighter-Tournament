# Documentation Index

Welcome to Stick Fighter Tournament! Here's a guide to all our documentation.

## 📖 Getting Started (Start Here!)

### [QUICKSTART.md](QUICKSTART.md)
**For**: New players who want to get playing in 2 minutes
- How to launch the game
- Your first combo
- Your first super move
- Tips for beginners
- Troubleshooting

## 🎮 Playing the Game

### [CONTROLS_GUIDE.md](CONTROLS_GUIDE.md)
**For**: Players who want to master combat
- Complete move lists for both characters
- Command input notations and patterns
- Super move execution guide
- Combo strings and strategies
- Understanding the super meter
- Advanced techniques

### [GAME_GUIDE.md](GAME_GUIDE.md)
**For**: Players who want to understand game systems
- Game features overview
- Control scheme
- Attack system explanation
- Command input system
- Super meter mechanics
- Character data and movesets
- How to customize the game

## 👨‍💻 For Developers

### [ARCHITECTURE.md](ARCHITECTURE.md)
**For**: Developers extending the game
- System overview and architecture
- Detailed explanation of each subsystem:
  - Input System (InputManager, InputBuffer, CommandInputManager)
  - Fighter System (core game logic)
  - Rendering System (stick figure animation)
  - Combat System (hits, damage, combos)
  - Data System (JSON structure)
  - Scene Management
- How to add new features:
  - New characters
  - New command inputs
  - New attack types
- Performance considerations
- Debugging tips
- Common patterns

### [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
**For**: Understanding what's been built
- Features implemented checklist
- Move set details
- Files created and modified
- Performance metrics
- How to test each feature
- What's not yet implemented

## 📊 Project Overview

### [PROJECT_STATUS.md](PROJECT_STATUS.md)
**For**: High-level project overview
- Project status (fully operational!)
- What was implemented
- Technical implementation details
- How to play
- Combat system breakdown
- Testing checklist
- Future enhancements

### [README.md](README.md)
**For**: Project description and vision
- Game features
- Inspiration sources
- Design goals

---

## 🗂️ Quick Navigation

### By Role

**🎮 Players**: Read in this order
1. QUICKSTART.md (2 min)
2. CONTROLS_GUIDE.md (5 min)
3. GAME_GUIDE.md (10 min)

**👨‍💻 Developers**: Read in this order
1. PROJECT_STATUS.md (overview)
2. ARCHITECTURE.md (deep dive)
3. IMPLEMENTATION_SUMMARY.md (checklist)
4. Code comments in src/ files

**🎯 Designers**: Read in this order
1. PROJECT_STATUS.md
2. GAME_GUIDE.md
3. CONTROLS_GUIDE.md

---

## 📋 File Locations

### Documentation Files
```
QUICKSTART.md              ← Start here if new!
CONTROLS_GUIDE.md          ← All move lists and combos
GAME_GUIDE.md              ← Game systems explained
ARCHITECTURE.md            ← Technical architecture
IMPLEMENTATION_SUMMARY.md  ← Feature checklist
PROJECT_STATUS.md          ← Complete project overview
README.md                  ← Original project description
INDEX.md                   ← This file!
```

### Game Source Code
```
src/
├── main.js                  ← Game entry point
├── managers/
│   ├── InputManager.js      ← Key handling
│   ├── InputBuffer.js       ← Input history & patterns
│   ├── CommandInputManager.js ← Command definitions
│   └── ComboManager.js      ← Combo tracking & damage
├── entities/
│   ├── Fighter.js           ← Character logic
│   ├── StickRenderer.js     ← Drawing stick figures
│   └── Projectile.js        ← Projectile behavior
├── scene/
│   ├── MenuScene.js         ← Main menu
│   ├── SelectScene.js       ← Character selection
│   ├── SettingsScene.js     ← Keybind settings
│   └── FightScene.js        ← Main fighting scene
└── data/
    ├── alpha.json           ← Alpha's stats & moves
    └── beta.json            ← Beta's stats & moves
```

---

## 🔍 Find What You Need

### I want to...

**...play the game**
→ Start with QUICKSTART.md

**...learn all the moves**
→ Read CONTROLS_GUIDE.md

**...understand how combos work**
→ Check GAME_GUIDE.md (Combo System section)

**...execute command inputs**
→ See CONTROLS_GUIDE.md (Command Input System)

**...understand the super meter**
→ GAME_GUIDE.md or CONTROLS_GUIDE.md

**...add a new character**
→ ARCHITECTURE.md (Adding New Features section)

**...add a new move**
→ ARCHITECTURE.md (Adding New Features section)

**...add a new command input**
→ ARCHITECTURE.md (Adding New Command Input)

**...understand the code structure**
→ ARCHITECTURE.md (full technical breakdown)

**...see what features exist**
→ PROJECT_STATUS.md or IMPLEMENTATION_SUMMARY.md

**...troubleshoot issues**
→ QUICKSTART.md (Troubleshooting section)

---

## 💡 Tips

- **Lost?** Start with QUICKSTART.md - it's designed to get you going fast
- **Need details?** Each documentation file is comprehensive and self-contained
- **Code help?** ARCHITECTURE.md has code examples and patterns
- **Want more moves?** CONTROLS_GUIDE.md has complete moveset documentation

---

## 📞 Quick Questions Answered

**Q: Where do I start?**
A: Read QUICKSTART.md first (2 minutes), then play!

**Q: How do I execute a super move?**
A: CONTROLS_GUIDE.md has step-by-step instructions

**Q: How do I add a new character?**
A: ARCHITECTURE.md has a "Add a New Character" section with examples

**Q: What moves do the characters have?**
A: CONTROLS_GUIDE.md has complete move lists for Alpha and Beta

**Q: How does the combo system work?**
A: GAME_GUIDE.md explains it, with ARCHITECTURE.md showing the code

**Q: Can I customize keybinds?**
A: Yes! Menu → Settings, or read GAME_GUIDE.md

**Q: Is the game finished?**
A: Yes! It's fully playable. See PROJECT_STATUS.md for what's implemented

---

**Last Updated**: January 7, 2026
**Game Version**: 1.0 - Command Inputs & Super Meter Release
