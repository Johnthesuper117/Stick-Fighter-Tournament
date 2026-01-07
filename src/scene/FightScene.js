import Fighter from '../entities/Fighter.js';
import InputManager from '../managers/InputManager.js';
import ComboManager from '../managers/ComboManager.js';
import betaData from '../data/beta.json' assert { type: "json" };

export default class FightScene extends Phaser.Scene {
    constructor() { super('FightScene'); }

    create(data) {
        this.inputs = new InputManager(this);
        this.inputs.setupKeys();

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
            if (projectile.owner !== enemy) {
                enemy.takeDamage(projectile.damage, 20, {x: 100, y: -100}, projectile.owner);
                projectile.destroy();
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
    }

    update(time, delta) {
        // Get inputs and pass to Player 1
        const cmds = this.inputs.getInputs(time);
        this.p1.update(cmds, delta);
        
        // Update Dummy with AI behavior based on mode
        const dummyCommands = this.getDummyCommands();
        this.p2.update(dummyCommands, delta);

        // Update HUD
        this.updateHUD();
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
        console.log(`Dummy Mode: ${this.dummyMode}`);
    }

    createHitbox(attacker, move) {
        // Create an invisible box in front of the player
        const offsetX = attacker.facingRight ? 50 : -50;
        const hitbox = this.add.rectangle(attacker.x + offsetX, attacker.y, 60, 60, 0xff0000, 0.5);
        this.physics.add.existing(hitbox);
        
        // Physics check
        this.physics.add.overlap(hitbox, this.p2, () => {
            this.handleHit(attacker, this.p2, move);
            hitbox.destroy(); // Destroy immediately on hit (or keep for active frames)
        }, null, this);

        // Destroy hitbox after 'active' frames
        this.time.delayedCall(move.active * 16, () => hitbox.destroy());
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
        this.cameras.main.shake(50, 0.005);
        this.time.timeScale = 0.1;
        this.time.delayedCall(50, () => { this.time.timeScale = 1; });

        // 6. Show damage number above victim
        this.showDamageNumber(victim, finalDamage);
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