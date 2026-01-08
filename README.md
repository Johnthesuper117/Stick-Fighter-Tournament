# Stick-Fighter-Tournament

## Prompts

I want the game to be kinda like Tough Love Arena, a fun web fighting game, but I want this game, The Stick Fighter Tournament, to be more fast paced as explained below: 

I want you to watch these YouTube videos so you get an idea of what I want the stickman combat, fighting system, combos, moves, etc. to look like:

KJ full saga:
https://www.youtube.com/watch?v=upNZZBLgN7c

Combat Gods 1 and 2:
https://www.youtube.com/watch?v=d_qGO4GrbQM
https://www.youtube.com/watch?v=XEtHpGSSTOU

Alan Becker's Animation Vs., there are too many to list but you get the idea. 

When you finish, I would like the game updated a good bit so it's capable of a similar combat feel.

Add a menu, a training dummy, which will act as player 2 in "Training Mode", which can take knock back and hitstun just like a player

Add settings to the menu, allowing players control over keybinds and volume

It needs to be modular and modifiable, with settings, a menu, and use JSON for static character editing. Each character should have light, heavy, and special attacks for neutral, forward, up, down, backward, and command inputs for them. Use animation frameworks and include projectiles. And a system to keep track of combos, as in who is comboing, how many hits, and it ends when the player getting comboed escapes (when they aren't stunned for enough frames to complete an action)

The First 2 Characters will be Alpha and Beta. Make a select fighter menu at the start. Alpha needs to have basic combos, projectiles, a special mechanic (as he combos, past 5 hits, he starts healing a little each hit), a super,  air combos, a super combo (a combo of 5+ hits that leads into a super), you get the idea. A little of everything. And Beta will be his rival, and so have similar moves to rival, but with enough variation to make him unique. Also, I want a good background to start with. 

## Move Tuning Parameters ⚙️

You can tune how moves affect player control and animation via per-move fields in the `src/data/*.json` files.

- `moveControlFactor` (number 0.0–1.0) — how much horizontal control the player keeps while the move is executing (1.0 full control, 0.0 no control).
- `lockMovement` (boolean) — if true, horizontal movement is fully blocked during the move.
- `poseStartup`, `poseActive`, `poseRecovery` (optional pose objects) — small `{ x, y }` offsets blended into the stick renderer during respective phases.

You can tweak these values live in the in-game Debug UI (press F1) which exposes sliders for smoothing and global moveControlFactor and allows applying values to both fighters for quick tuning.

Changes made in the repo:
- Added `moveControlFactor` and `lockMovement` to Alpha and Beta move definitions with sensible defaults.
- Implemented a Debug UI (`src/ui/DebugUI.js`) to tweak renderer smoothing and move control live (toggle with F1).
- Added `tests/move_config.js` and an npm `test` script that validates move config fields.
