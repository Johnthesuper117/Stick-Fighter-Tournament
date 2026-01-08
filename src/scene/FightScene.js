import Fighter from '../entities/Fighter.js';
import InputManager from '../managers/InputManager.js';
import ComboManager from '../managers/ComboManager.js';

export default class FightScene extends Phaser.Scene {
    constructor() { super('FightScene'); }

    async create(data) {
        this.inputs = new InputManager(this);
        this.inputs.setupKeys();

        // Load Beta data at runtime to avoid import assertion compatibility issues
        let betaData;
        try {
            const resp = await fetch('/src/data/beta.json');
            betaData = await resp.json();
        } catch (err) {
            console.error('Failed to load Beta data, using fallback', err);
            betaData = { name: 'Beta', color: '0xff3333', stats: { walkSpeed: 420, jumpForce: -700, gravity: 1200, maxHealth: 900, maxSuperMeter: 300 }, moves: {} };
        }

        // Environment
        this.createEnvironment();

        // Get selected character (or default to Alpha)
        const selectedCharacter = data.selectedCharacter || { name: 'Alpha', color: '0x3399ff', stats: { walkSpeed: 350, jumpForce: -650, gravity: 1200, maxHealth: 1000 }, moves: {} };

        // Spawn Characters
        // Player 1 (Selected Character)
        this.p1 = new Fighter(this, 200, 400, selectedCharacter, false);
        // Player 2 (Dummy - Beta)
        this.p2 = new Fighter(this, 600, 400, betaData, true);

        this.physics.add.collider([this.p1, this.p2], this.ground);

        // Active hitboxes so we can update their position to follow the attacker
        this.activeHitboxes = [];

        // Helper to safely disable physics-enabled game objects or bodies
        this._disablePhysicsObject = (obj) => {
            if (!obj) return;
            try {
                if (typeof obj.disableBody === 'function') {
                    obj.disableBody(true, true);
                    return;
                }
                if (obj.body) {
                    // Prefer setEnable if available
                    if (typeof obj.body.setEnable === 'function') obj.body.setEnable(false);
                    else obj.body.enable = false;

                    // Stop movement
                    if (typeof obj.body.stop === 'function') obj.body.stop();
                }
                if (typeof obj.setActive === 'function') obj.setActive(false);
                if (typeof obj.setVisible === 'function') obj.setVisible(false);
            } catch (e) {
                console.error('Failed to disable physics object', e);
            }
        };

        // Combat Collision
        // Instead of simple overlap, we create a Hitbox when an attack starts
        this.events.on('attack_start', (attacker, move) => {
            this.createHitbox(attacker, move);
        });

        // HUD
        this.createHUD();

        // Training Mode Dummy Controls
        this.dummyMode = 'stand'; // 'stand', 'crouch', 'block', 'jump', 'random'
        this.setupDummyControls();

        this.projectiles = this.physics.add.group();

        this.physics.add.overlap(this.projectiles, this.p2, (projectile, enemy) => {
            // Arcade overlap can pass either GameObjects or Bodies. Resolve to the game object if needed.
            const proj = projectile.gameObject || projectile;
            const target = enemy.gameObject || enemy;

            // Ensure target has takeDamage and is not the owner
            if (target && typeof target.takeDamage === 'function' && proj.owner !== target) {
                try {
                    target.takeDamage(proj.damage, 20, { x: 100, y: -100 }, proj.owner);
                } catch (err) {
                    console.error('Error applying projectile damage', err);
                }
                // Destroy/disable projectile immediately to prevent multiple hits
                this._disablePhysicsObject(proj);
            }
        });
        
        this.comboManager = new ComboManager(this);

        // Combo event listeners
        this.events.on('fighter_recover', (attacker) => {
            this.comboManager.resetCombo(attacker);
        });

        // Combo visual effects
        this.events.on('combo_milestone', (data) => {
            this.playComboMilestoneEffect(data.count, data.fighter);
        });

        // For combo counter animation
        this.comboCounterScale = 1.0;

        // Debug UI (toggle with F1) - load only if DOM available
        try {
            const DebugUI = (await import('../ui/DebugUI.js')).default;
            this.debugUI = new DebugUI(this);
            // Expose a console shortcut
            window.toggleDebugUI = () => this.debugUI.toggle();
        } catch (e) {
            // Ignore in non-browser / test env
        }
    }

    createHUD() {
        // Player 1 Health Bar
        this.hud = {
            p1HealthBg: this.add.rectangle(100, 30, 150, 20, 0x333333),
            p1HealthBar: this.add.rectangle(100, 30, 150, 20, 0x00ff00),
            p1Name: this.add.text(20, 10, this.p1.name, { fontSize: '20px', color: '#fff' }),
            
            // Player 1 Super Meter
            p1SuperBg: this.add.rectangle(100, 55, 150, 15, 0x1a1a1a),
            p1SuperBar: this.add.rectangle(100, 55, 0, 15, 0xffff00),
            p1SuperLevelText: this.add.text(20, 50, 'Level: 0', { fontSize: '14px', color: '#ffff00' }),
            
            // Player 2 Health Bar
            p2HealthBg: this.add.rectangle(700, 30, 150, 20, 0x333333),
            p2HealthBar: this.add.rectangle(700, 30, 150, 20, 0xff0000),
            p2Name: this.add.text(620, 10, this.p2.name, { fontSize: '20px', color: '#fff' }),
            
            // Player 2 Super Meter
            p2SuperBg: this.add.rectangle(700, 55, 150, 15, 0x1a1a1a),
            p2SuperBar: this.add.rectangle(700, 55, 0, 15, 0xffff00),
            p2SuperLevelText: this.add.text(620, 50, 'Level: 0', { fontSize: '14px', color: '#ffff00' }),
            
            // Combo Counter
            comboText: this.add.text(400, 10, 'Combo: 0', { fontSize: '32px', color: '#fff' }).setOrigin(0.5),
            
            // Debug text for input buffer and dummy controls
            debugText: this.add.text(400, 150, '', { fontSize: '12px', color: '#aaa' }).setOrigin(0.5),
            
            // Training Mode Instructions
            trainingText: this.add.text(400, 580, 'Press D to cycle Dummy Mode | R to reset Dummy HP', 
                { fontSize: '14px', color: '#888' }).setOrigin(0.5)
        };
    }

    createEnvironment() {
        // "Good background" - A dark gradient with a floor
        this.add.rectangle(400, 300, 800, 600, 0x222222);
        this.ground = this.add.rectangle(400, 580, 800, 40, 0x888888);
        this.physics.add.existing(this.ground, true);

        // Hitstop counters
        this._hitstopCount = 0;
        this._prevTimeScale = this.time.timeScale || 1;
    }

    applyHitstop(actors, durationMs = 60) {
        // actors: array of Fighter instances to pause
        if (!Array.isArray(actors)) actors = [actors];

        // Increase scene hitstop counter
        this._hitstopCount = (this._hitstopCount || 0) + 1;
        if (this._hitstopCount === 1) {
            this._prevTimeScale = this.time.timeScale || 1;
            this.time.timeScale = 0.2;
        }

        // For each actor, pause them and save velocities
        actors.forEach(a => {
            if (!a) return;
            a._hitstopCount = (a._hitstopCount || 0) + 1;
            if (a._hitstopCount === 1) {
                // Save velocity
                a._savedVel = { x: a.body ? a.body.velocity.x : 0, y: a.body ? a.body.velocity.y : 0 };
                // Pause the fighter's actions
                a.paused = true;
                // Stop motion
                a.setVelocity(0, 0);
            }
        });

        // Restore after duration (note: delayedCall is affected by timeScale)
        this.time.delayedCall(durationMs, () => {
            // Restore actors
            actors.forEach(a => {
                if (!a) return;
                a._hitstopCount = Math.max(0, (a._hitstopCount || 1) - 1);
                if (a._hitstopCount === 0) {
                    // Restore velocity
                    if (a._savedVel) {
                        a.setVelocity(a._savedVel.x, a._savedVel.y);
                        delete a._savedVel;
                    }
                    a.paused = false;
                }
            });

            this._hitstopCount = Math.max(0, (this._hitstopCount || 1) - 1);
            if (this._hitstopCount === 0) {
                // Restore time scale
                this.time.timeScale = this._prevTimeScale || 1;
            }
        });
    }

    update(time, delta) {
        // Scene may be partially initialized (create is async) so guard against missing objects
        if (!this.p1 || !this.p2) return;

        // Get inputs and pass to Player 1
        const cmds = this.inputs.getInputs(time);
        if (this.p1 && typeof this.p1.update === 'function') this.p1.update(cmds, delta);
        
        // Update Dummy with AI behavior based on mode
        const dummyCommands = this.getDummyCommands();
        if (this.p2 && typeof this.p2.update === 'function') this.p2.update(dummyCommands, delta);

        // Update active hitboxes to follow their owners
        if (this.activeHitboxes && this.activeHitboxes.length) {
            for (let i = this.activeHitboxes.length - 1; i >= 0; i--) {
                const hb = this.activeHitboxes[i];
                if (!hb || !hb._owner || !hb._owner.active) {
                    if (hb) this._disablePhysicsObject(hb);
                    if (hb) hb.destroy();
                    this.activeHitboxes.splice(i, 1);
                    continue;
                }

                const owner = hb._owner;
                const sideOffset = owner.facingRight ? Math.abs(hb._localOffsetX) : -Math.abs(hb._localOffsetX);
                const newX = owner.x + sideOffset;
                const newY = owner.y + (hb._offsetY || 0);
                hb.setPosition(newX, newY);

                if (hb.body) {
                    // Make sure physics body follows
                    hb.body.x = hb.x - hb.width / 2;
                    hb.body.y = hb.y - hb.height / 2;
                    if (hb.body.velocity) {
                        hb.body.velocity.x = 0;
                        hb.body.velocity.y = 0;
                    }
                }
            }
        }

        // Update HUD
        if (typeof this.updateHUD === 'function') this.updateHUD();
    }

    getDummyCommands() {
        // Dummy AI based on mode
        const cmds = {};

        switch (this.dummyMode) {
            case 'stand':
                // Just stand there
                return {};

            case 'crouch':
                // Crouch down
                cmds.down = true;
                return cmds;

            case 'block':
                // Hold back (move away from attacker)
                cmds.left = true;
                return cmds;

            case 'jump':
                // Periodically jump
                if (Math.random() < 0.02) {
                    cmds.jump = true;
                }
                return cmds;

            case 'random':
                // Random movement and attacks
                const rand = Math.random();
                if (rand < 0.05) cmds.jump = true;
                else if (rand < 0.1) cmds.left = true;
                else if (rand < 0.15) cmds.right = true;
                else if (rand < 0.25) cmds.light = true;
                return cmds;

            default:
                return {};
        }
    }

    updateHUD() {
        // Guard for incomplete initialization
        if (!this.hud || !this.p1 || !this.p2 || !this.comboManager) return;

        // Update health bars
        const p1HealthPercent = (this.p1.hp / this.p1.data.stats.maxHealth) * 150;
        const p2HealthPercent = (this.p2.hp / this.p2.data.stats.maxHealth) * 150;
        
        this.hud.p1HealthBar.setDisplaySize(Math.max(0, p1HealthPercent), 20);
        this.hud.p2HealthBar.setDisplaySize(Math.max(0, p2HealthPercent), 20);

        // Update super meter bars
        const p1SuperPercent = (this.p1.superMeter / this.p1.superMeterMax) * 150;
        const p2SuperPercent = (this.p2.superMeter / this.p2.superMeterMax) * 150;
        
        this.hud.p1SuperBar.setDisplaySize(Math.max(0, p1SuperPercent), 15);
        this.hud.p2SuperBar.setDisplaySize(Math.max(0, p2SuperPercent), 15);

        // Update super level text
        this.hud.p1SuperLevelText.setText(`Level: ${this.p1.superLevel}`);
        this.hud.p2SuperLevelText.setText(`Level: ${this.p2.superLevel}`);

        // Update combo counter with animation
        const comboData = this.comboManager.combos.get(this.p1);
        const comboCount = comboData ? comboData.count : 0;
        
        let comboText = `Combo: ${comboCount}`;
        if (comboData && comboData.isAirCombo) {
            comboText += ' (AIR!)';
        }
        this.hud.comboText.setText(comboText);

        // Combo counter pulse effect
        if (comboCount > 0) {
            this.comboCounterScale = 1.1; // Pulse on new hit
            this.time.delayedCall(50, () => {
                this.comboCounterScale = 1.0;
            });
        }
        this.hud.comboText.setScale(this.comboCounterScale);

        // Debug text (show recent inputs)
        this.hud.debugText.setText(`Inputs: ${this.p1.inputBuffer.getLastInputs(6)}\nDummy: ${this.dummyMode}`);
    }

    setupDummyControls() {
        // Keyboard controls for dummy behavior
        this.input.keyboard.on('keydown-D', () => this.cycleDummyMode());
        this.input.keyboard.on('keydown-R', () => this.p2.hp = this.p2.data.stats.maxHealth); // Reset dummy HP
    }

    cycleDummyMode() {
        const modes = ['stand', 'crouch', 'block', 'jump', 'random'];
        const currentIndex = modes.indexOf(this.dummyMode);
        this.dummyMode = modes[(currentIndex + 1) % modes.length];
        if (console && typeof console.debug === 'function') console.debug(`Dummy Mode: ${this.dummyMode}`);
    }

    createHitbox(attacker, move) {
        // Create a hitbox that follows the attacker for the duration of the active frames
        const width = move.hitboxWidth || 60;
        const height = move.hitboxHeight || 60;
        const localOffsetX = move.offsetX || 50;
        const offsetY = move.offsetY || 0;
        const initialOffset = attacker.facingRight ? Math.abs(localOffsetX) : -Math.abs(localOffsetX);

        const hitbox = this.add.rectangle(attacker.x + initialOffset, attacker.y + offsetY, width, height, 0xff0000, 0);
        this.physics.add.existing(hitbox);

        if (hitbox.body) {
            // Make sure the hitbox doesn't fall or get pushed around
            if (typeof hitbox.body.setAllowGravity === 'function') hitbox.body.setAllowGravity(false);
            hitbox.body.allowGravity = false;
            hitbox.body.immovable = true;
            // Enable the body so overlaps fire, but make it non-moving
            if (typeof hitbox.body.setEnable === 'function') hitbox.body.setEnable(true);
            hitbox.body.moves = false;
        }

        hitbox._owner = attacker;
        hitbox._localOffsetX = localOffsetX;
        hitbox._offsetY = offsetY;
        hitbox._move = move;

        // Keep track to update position each frame
        this.activeHitboxes.push(hitbox);

        // Overlap with both players, but ignore the owner
        this.physics.add.overlap(hitbox, [this.p1, this.p2], (hb, target) => {
            const victim = target.gameObject || target;
            if (!victim || victim === attacker) return;
            if (typeof victim.takeDamage === 'function') {
                this.handleHit(attacker, victim, move);
                // Destroy/disable hitbox after it connects
                // Use safe disable helper
                this._disablePhysicsObject(hb);

                const idx = this.activeHitboxes.indexOf(hb);
                if (idx >= 0) this.activeHitboxes.splice(idx, 1);
            }
        });

        // Destroy hitbox after 'active' frames
        const duration = (move.active || 4) * 16;
        this.time.delayedCall(duration, () => {
            if (hitbox && hitbox.active) {
                this._disablePhysicsObject(hitbox);
            }
            const idx = this.activeHitboxes.indexOf(hitbox);
            if (idx >= 0) this.activeHitboxes.splice(idx, 1);
        });
    }

    handleHit(attacker, victim, move) {
        // 1. Calculate Scaled Damage
        const finalDamage = this.comboManager.registerHit(attacker, victim, move.damage);

        // 2. Gain super meter on hit
        const superGain = move.superGain || 10;
        attacker.gainSuperMeter(superGain);

        // 3. Apply to Victim
        victim.takeDamage(finalDamage, move.hitStun, move.knockback, attacker);

        // 4. Alpha's Passive (Heal on 5+ hits)
        // We check the internal combo count from the manager
        const comboData = this.comboManager.combos.get(attacker);
        if (attacker.name === "Alpha" && comboData && comboData.count >= 5) {
            attacker.hp = Math.min(attacker.hp + 2, attacker.data.stats.maxHealth);
            // Visual Heal Effect (Green Tint briefly)
            attacker.setTint(0x00ff00);
            this.time.delayedCall(100, () => attacker.setTint(parseInt(attacker.data.color)));
        }

        // 5. Hitstop & Shake
        const hitstopMs = move.hitStop || 60; // default 60ms
        // Scale shake with hitstop duration
        const shakeIntensity = 0.005 + (hitstopMs / 1000) * 0.01; // stronger shake for longer hitstop
        this.cameras.main.shake(hitstopMs, shakeIntensity);

        this.applyHitstop([attacker, victim], hitstopMs);

        // If this move is cancelable, allow attacker a small cancel window
        if (move.cancelable) {
            const cancelWindowMs = (move.cancelWindowFrames || 5) * 16.6; // align with Fighter default cancel window
            attacker.cancelWindowUntil = Date.now() + cancelWindowMs;
        }

        // 6. Show damage number above victim
        this.showDamageNumber(victim, finalDamage);

        // 7. Hit spark and brief tint
        const spark = this.add.circle(victim.x, victim.y - 20, 8, 0xffff00, 1);
        this.tweens.add({ targets: spark, scale: 2, alpha: 0, duration: 300, ease: 'Cubic.easeOut', onComplete: () => spark.destroy() });
        victim.setTint(0xff6666);
        this.time.delayedCall(120, () => victim.setTint(parseInt(victim.data.color)));
    }

    showDamageNumber(fighter, damage) {
        const damageText = this.add.text(fighter.x, fighter.y - 50, `-${damage}`, {
            fontSize: '24px',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Floating up and fade out
        this.tweens.add({
            targets: damageText,
            y: damageText.y - 50,
            alpha: 0,
            duration: 800,
            ease: 'Cubic.easeOut',
            onComplete: () => damageText.destroy()
        });
    }

    playComboMilestoneEffect(count, fighter) {
        // Visual effect at combo milestones (3, 5, 10, 15, 20 hits)
        const x = fighter === this.p1 ? 200 : 600;
        const y = 100;

        const milestoneText = this.add.text(x, y, `${count}-HIT COMBO!`, {
            fontSize: '28px',
            color: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Scale and fade out effect
        this.tweens.add({
            targets: milestoneText,
            scale: 1.5,
            alpha: 0,
            duration: 1200,
            ease: 'Quad.easeOut',
            onComplete: () => milestoneText.destroy()
        });
    }
}